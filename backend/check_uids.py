# check_uids.py
# Run: python manage.py shell < check_uids.py

from booking.models import Appointment
from booking.services.video_service import VideoService

print("=" * 70)
print("CHECKING VIDEO UID GENERATION")
print("=" * 70)

# Find an online appointment
apt = Appointment.objects.filter(session_mode='online').first()

if not apt:
    print("❌ No online appointments found")
    exit()

print(f"Testing Appointment #{apt.id}")
print(f"  Patient: {apt.patient.full_name} (DB ID: {apt.patient.id})")
print(f"  Therapist: {apt.therapist.full_name} (DB ID: {apt.therapist.id})")
print("")

# Clear tokens first
apt.video_channel_name = None
apt.video_token_patient = None
apt.video_token_therapist = None
apt.save()

print("🔄 Generating tokens...")
tokens = VideoService.generate_tokens_for_appointment(apt)

print("")
print("=" * 70)
print("RESULTS:")
print("=" * 70)

patient_uid = tokens['patient']['uid']
therapist_uid = tokens['therapist']['uid']

print(f"Patient UID:   {patient_uid}")
print(f"Therapist UID: {therapist_uid}")
print("")

# Check for conflicts
if patient_uid == therapist_uid:
    print("❌ UID CONFLICT DETECTED!")
    print(f"   Both UIDs are: {patient_uid}")
    print("")
    print("🔧 FIX NEEDED:")
    print("   Your booking/services/video_service.py file is NOT updated")
    print("   The code is still using appointment.patient.id directly")
    print("")
    print("   It should be:")
    print("   patient_uid = 1000000 + appointment.patient.id")
    print("   therapist_uid = 2000000 + appointment.therapist.id")
else:
    print("✅ UIDs are UNIQUE - No conflict!")
    print("")
    
    # Verify they're using the million prefix
    expected_patient = 1000000 + apt.patient.id
    expected_therapist = 2000000 + apt.therapist.id
    
    if patient_uid == expected_patient and therapist_uid == expected_therapist:
        print("✅ UIDs are using the correct 1000000/2000000 prefix!")
        print("   The fix is properly applied.")
    else:
        print("⚠️ UIDs are unique but not using expected format:")
        print(f"   Expected Patient UID:   {expected_patient}")
        print(f"   Expected Therapist UID: {expected_therapist}")
        print(f"   Actual Patient UID:     {patient_uid}")
        print(f"   Actual Therapist UID:   {therapist_uid}")

print("=" * 70)