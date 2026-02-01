# utils.py  (or email_utils.py)
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from threading import Thread

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