from cryptography.fernet import Fernet
import os

def get_cipher():
    """Get cipher instance from environment variable"""
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        raise ValueError("ENCRYPTION_KEY not set in environment")
    return Fernet(key.encode())

def encrypt_file(file_path):
    """Encrypt file and return encrypted path"""
    cipher = get_cipher()
    with open(file_path, 'rb') as f:
        file_data = f.read()
    encrypted_data = cipher.encrypt(file_data)
    
    encrypted_path = file_path + '.encrypted'
    with open(encrypted_path, 'wb') as f:
        f.write(encrypted_data)
    
    os.remove(file_path)
    return encrypted_path

def decrypt_file(encrypted_path, output_path=None):
    """Decrypt file"""
    cipher = get_cipher()
    with open(encrypted_path, 'rb') as f:
        encrypted_data = f.read()
    decrypted_data = cipher.decrypt(encrypted_data)
    
    if output_path:
        with open(output_path, 'wb') as f:
            f.write(decrypted_data)
        return output_path
    
    return decrypted_data