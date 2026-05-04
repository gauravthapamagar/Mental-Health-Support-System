# clear_video_tokens.py
# Run this with: python manage.py shell < clear_video_tokens.py

from booking.models import Appointment

print("=" * 60)
print("CLEARING ALL VIDEO TOKENS")
print("=" * 60)

# Get all online appointments
online_appointments = Appointment.objects.filter(session_mode='online')
count = online_appointments.count()

print(f"Found {count} online appointments")
print("")

# Clear video tokens for all
updated = online_appointments.update(
    video_channel_name=None,
    video_token_patient=None,
    video_token_therapist=None,
    session_started_at=None,
    session_ended_at=None,
    session_duration_minutes=None
)

print(f"✅ Cleared video data for {updated} appointments")
print("")
print("Next steps:")
print("1. Restart your Django server")
print("2. Click 'Start Video Session' button again")
print("3. New tokens will be generated with correct UIDs")
print("")
print("Expected UIDs:")
print("  Patient: 1000000 + patient_id")
print("  Therapist: 2000000 + therapist_id")
print("=" * 60)