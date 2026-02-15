# check_current_state.py
# Run: python manage.py shell < check_current_state.py

from booking.models import Appointment
from booking.services.video_service import VideoService

print("=" * 80)
print("CHECKING CURRENT STATE")
print("=" * 80)

# Find your appointment
apt = Appointment.objects.filter(session_mode='online', status='confirmed').first()

if not apt:
    print("❌ No confirmed online appointment found")
    exit()

print(f"\nAppointment #{apt.id}")
print(f"Patient: {apt.patient.full_name} (ID: {apt.patient.id})")
print(f"Therapist: {apt.therapist.full_name} (ID: {apt.therapist.id})")
print(f"Status: {apt.status}")

# Clear tokens
print("\nClearing old tokens...")
apt.video_channel_name = None
apt.video_token_patient = None
apt.video_token_therapist = None
apt.save()

# Generate new tokens
print("Generating new tokens...")
tokens = VideoService.generate_tokens_for_appointment(apt)

print("\n" + "=" * 80)
print("RESULTS:")
print("=" * 80)
print(f"Patient UID:   {tokens['patient']['uid']}")
print(f"Therapist UID: {tokens['therapist']['uid']}")
print(f"Channel Name:  {tokens['channel_name']}")
print(f"App ID:        {tokens['app_id'][:20]}...")

# Check for conflict
if tokens['patient']['uid'] == tokens['therapist']['uid']:
    print("\n❌ UID CONFLICT - Both have same UID!")
    print("FIX: Update booking/services/video_service.py")
else:
    print("\n✅ UIDs are UNIQUE - No conflict")
    
    expected_patient = 1000000 + apt.patient.id
    expected_therapist = 2000000 + apt.therapist.id
    
    if tokens['patient']['uid'] == expected_patient:
        print(f"✅ Patient UID correct (1000000 + {apt.patient.id} = {expected_patient})")
    else:
        print(f"❌ Patient UID wrong (expected {expected_patient})")
    
    if tokens['therapist']['uid'] == expected_therapist:
        print(f"✅ Therapist UID correct (2000000 + {apt.therapist.id} = {expected_therapist})")
    else:
        print(f"❌ Therapist UID wrong (expected {expected_therapist})")

print("\n" + "=" * 80)
print("NEXT STEPS:")
print("=" * 80)
print("1. Restart Django")
print("2. Close ALL browser tabs")
print("3. Open therapist in Chrome - check console for:")
print(f"   [Video] UID: {tokens['therapist']['uid']}")
print("4. Open patient in different browser - check console for:")
print(f"   [Video] UID: {tokens['patient']['uid']}")
print("5. UIDs MUST be different!")
print("=" * 80)