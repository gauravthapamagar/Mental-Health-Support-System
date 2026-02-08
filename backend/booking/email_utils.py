# utils.py  (or email_utils.py)
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from threading import Thread
from django.template.loader import render_to_string
from django.utils.html import strip_tags
def send_email_async(
    subject: str,
    message: str,                # plain text version (required fallback)
    recipient_list: list,
    html_message: str = None,    # ← new optional parameter
):
    """Send email in a separate thread – supports HTML + plain text fallback"""
    def send():
        try:
            if html_message:
                # Use EmailMultiAlternatives for multipart (HTML + text)
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=message,                    # plain text
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=recipient_list,
                )
                email.attach_alternative(html_message, "text/html")
                email.send()
            else:
                # Plain text only (old behavior)
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=recipient_list,
                )
        except Exception as e:
            print(f"Failed to send email: {e}")   # ← consider logging instead

    Thread(target=send).start()
    
from django.utils import timezone
from datetime import datetime
    
def send_confirmation_emails(appointment):
    """Send confirmation emails to both patient and therapist"""
    
    # Prepare common data
    appointment_datetime = timezone.localtime(
        timezone.make_aware(
            datetime.combine(appointment.appointment_date, appointment.start_time)
        )
    )
    
    dt_str = appointment_datetime.strftime("%A, %B %d, %Y at %I:%M %p")
    tz_name = appointment_datetime.tzname() or "local time"
    
    common_context = {
        'appointment_datetime': dt_str,
        'timezone': tz_name,
        'therapist_name': appointment.therapist.full_name,
        'patient_name': appointment.patient.full_name,
        'meeting_link': appointment.meeting_link or "To be provided / check platform",
        'system_name': "Your Therapy Platform",
        'support_email': settings.DEFAULT_FROM_EMAIL,
        'platform_url': "https://yourdomain.com/dashboard/appointments",
    }

    # ── Email to PATIENT ────────────────────────────────────────
    patient_context = {
        **common_context,
        'greeting_name': appointment.patient.full_name,
        'other_party_name': appointment.therapist.full_name,
        'other_party_role': "therapist",
    }
    
    html_patient = render_to_string(
        'emails/appointment_confirmed_patient.html',
        patient_context
    )
    plain_patient = strip_tags(html_patient)
    
    send_email_async(
        subject=f"Your Appointment is Confirmed with {appointment.therapist.full_name}",
        message=plain_patient,
        html_message=html_patient,
        recipient_list=[appointment.patient.email],
    )

    # ── Email to THERAPIST ──────────────────────────────────────
    therapist_context = {
        **common_context,
        'greeting_name': appointment.therapist.full_name,
        'other_party_name': appointment.patient.full_name,
        'other_party_role': "patient",
    }
    
    html_therapist = render_to_string(
        'emails/appointment_confirmed_therapist.html',
        therapist_context
    )
    plain_therapist = strip_tags(html_therapist)
    
    send_email_async(
        subject=f"Appointment Confirmed with {appointment.patient.full_name}",
        message=plain_therapist,
        html_message=html_therapist,
        recipient_list=[appointment.therapist.email],
    )
