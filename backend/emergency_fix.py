# emergency_fix.py
# Run: python manage.py shell < emergency_fix.py

from booking.models import Appointment
from booking.services.video_service import VideoService
import inspect

print("=" * 80)
print("EMERGENCY VIDEO FIX")
print("=" * 80)

# Step 1: Clear ALL video tokens
print("\n1. Clearing all video tokens...")
count = Appointment.objects.filter(session_mode='online').update(
    video_channel_name=None,
    video_token_patient=None,
    video_token_therapist=None,
    session_started_at=None,
    session_ended_at=None,
    session_duration_minutes=None
)
print(f"   ✅ Cleared {count} appointments")

# Step 2: Verify backend code
print("\n2. Checking video_service.py code...")
source = inspect.getsource(VideoService.generate_tokens_for_appointment)

if "1000000 + appointment.patient.id" in source and "2000000 + appointment.therapist.id" in source:
    print("   ✅ Backend code is CORRECT")
else:
    print("   ❌ Backend code is WRONG!")
    print("   You need to update booking/services/video_service.py")
    exit()

# Step 3: Test with first online appointment
print("\n3. Testing token generation...")
apt = Appointment.objects.filter(session_mode='online', status='confirmed').first()

if not apt:
    print("   ⚠️ No confirmed online appointment found")
    print("   Create one first!")
    exit()

print(f"   Appointment: #{apt.id}")
print(f"   Patient: {apt.patient.full_name} (ID: {apt.patient.id})")
print(f"   Therapist: {apt.therapist.full_name} (ID: {apt.therapist.id})")

# Generate tokens
tokens = VideoService.generate_tokens_for_appointment(apt)

patient_uid = tokens['patient']['uid']
therapist_uid = tokens['therapist']['uid']

print(f"\n   Patient UID:   {patient_uid}")
print(f"   Therapist UID: {therapist_uid}")

# Check for conflict
if patient_uid == therapist_uid:
    print("\n   ❌ UID CONFLICT!")
    print("   Both have same UID:", patient_uid)
    print("\n   FIX: Update booking/services/video_service.py")
else:
    print("\n   ✅ UIDs are UNIQUE - No conflict!")
    
    # Verify format
    expected_patient = 1000000 + apt.patient.id
    expected_therapist = 2000000 + apt.therapist.id
    
    if patient_uid == expected_patient and therapist_uid == expected_therapist:
        print("   ✅ UIDs are in CORRECT format!")
        print("\n" + "=" * 80)
        print("BACKEND IS READY!")
        print("=" * 80)
        print("\nNext steps:")
        print("1. Restart Django server")
        print("2. Hard refresh browser (Ctrl+Shift+R)")
        print("3. Close ALL browser tabs with video call")
        print("4. Try joining again")
        print("\nExpected UIDs when you test:")
        print(f"  Patient should get:  {expected_patient}")
        print(f"  Therapist should get: {expected_therapist}")
    else:
        print(f"   ⚠️ UIDs wrong format!")
        print(f"   Expected patient:  {expected_patient}")
        print(f"   Expected therapist: {expected_therapist}")

print("=" * 80)