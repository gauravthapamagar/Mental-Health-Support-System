# backend/accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, TherapistProfile
from django.utils import timezone
from .models import VerificationDocument

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if not created:
        return

    # Only auto-create therapist profile
    if instance.role == 'therapist':
        TherapistProfile.objects.get_or_create(user=instance)



@receiver(post_save, sender=VerificationDocument)
def check_therapist_verification_on_document_save(sender, instance, created, **kwargs):
    """
    Signal to automatically verify a therapist when all required documents are verified.
    This is called whenever a VerificationDocument is saved.
    """
    print(f"[v0] Document saved: {instance.document_type} for {instance.therapist_profile.user.full_name}")
    print(f"[v0] Document is_verified: {instance.is_verified}")
    
    # Only check if the document was marked as verified
    if instance.is_verified:
        print(f"[v0] Document {instance.document_type} is verified. Checking therapist status...")
        
        # Call the check_verification_status method
        therapist_profile = instance.therapist_profile
        all_verified = therapist_profile.check_verification_status()
        
        if all_verified:
            print(f"[v0] Therapist {therapist_profile.user.full_name} is now automatically verified!")
        else:
            print(f"[v0] Not all documents verified yet for {therapist_profile.user.full_name}")


def ready():
    """Import signals when apps are ready"""
    import accounts.signals
