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
            print(f"[v0] DEBUG: send_email_async - Sending email to {recipient_list}")
            print(f"[v0] DEBUG: send_email_async - Subject: {subject}")
            if html_message:
                # Use EmailMultiAlternatives for multipart (HTML + text)
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=message,                    # plain text
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=recipient_list,
                )
                email.attach_alternative(html_message, "text/html")
                result = email.send()
                print(f"[v0] DEBUG: send_email_async - Email sent to {recipient_list}, result: {result}")
            else:
                # Plain text only (old behavior)
                result = send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=recipient_list,
                )
                print(f"[v0] DEBUG: send_email_async - Email sent to {recipient_list}, result: {result}")
        except Exception as e:
            import traceback
            print(f"[v0] ERROR: Failed to send email to {recipient_list}: {e}")
            print(f"[v0] ERROR Traceback: {traceback.format_exc()}")

    Thread(target=send).start()
    
from django.utils import timezone
from datetime import datetime
    
def send_confirmation_emails(appointment):
    """
    Send confirmation emails based on appointment type:
    - OFFLINE: Both parties get confirmation
    - ONLINE: Patient gets payment request email
    """
    
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

    if appointment.session_mode == 'offline':
        # ──── OFFLINE: Send confirmation to BOTH parties ────
        
        # Email to PATIENT
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

        # Email to THERAPIST
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
    
    else:
        # ──── ONLINE: Send payment request to PATIENT ONLY ────
        therapist_fee = appointment.therapist.therapist_profile.consultation_fees or 0
        
        patient_context = {
            **common_context,
            'greeting_name': appointment.patient.full_name,
            'therapist_fee': f"Rs. {therapist_fee:.2f}",
            'payment_url': f"https://yourdomain.com/patient/appointments/{appointment.id}/pay",
        }
        
        html_patient = render_to_string(
            'emails/appointment_payment_request.html',
            patient_context
        )
        plain_patient = strip_tags(html_patient)
        
        send_email_async(
            subject=f"Payment Required: Confirm Your Appointment with {appointment.therapist.full_name}",
            message=plain_patient,
            html_message=html_patient,
            recipient_list=[appointment.patient.email],
        )


def send_payment_confirmation_emails(appointment):
    """
    Send confirmation emails to BOTH parties after payment is completed.
    This is called after the patient pays for an online appointment.
    """
    
    print(f"[v0] DEBUG: send_payment_confirmation_emails called for appointment {appointment.id}")
    
    # Prepare common data
    try:
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
        
        print(f"[v0] DEBUG: Prepared common context")

        # ── Email to PATIENT ────────────────────────────────────────
        patient_context = {
            **common_context,
            'greeting_name': appointment.patient.full_name,
            'other_party_name': appointment.therapist.full_name,
            'other_party_role': "therapist",
        }
        
        print(f"[v0] DEBUG: Rendering patient email template")
        html_patient = render_to_string(
            'emails/appointment_confirmed_patient.html',
            patient_context
        )
        plain_patient = strip_tags(html_patient)
        
        print(f"[v0] DEBUG: Sending email to patient: {appointment.patient.email}")
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
        
        print(f"[v0] DEBUG: Rendering therapist email template")
        html_therapist = render_to_string(
            'emails/appointment_confirmed_therapist.html',
            therapist_context
        )
        plain_therapist = strip_tags(html_therapist)
        
        print(f"[v0] DEBUG: Sending email to therapist: {appointment.therapist.email}")
        send_email_async(
            subject=f"Appointment Confirmed with {appointment.patient.full_name}",
            message=plain_therapist,
            html_message=html_therapist,
            recipient_list=[appointment.therapist.email],
        )
        print(f"[v0] DEBUG: Both confirmation emails queued successfully")
        
    except Exception as e:
        import traceback
        print(f"[v0] ERROR in send_payment_confirmation_emails: {e}")
        print(f"[v0] ERROR Traceback: {traceback.format_exc()}")
        raise
