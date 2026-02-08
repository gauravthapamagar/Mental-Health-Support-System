# backend/accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, TherapistProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if not created:
        return

    # Only auto-create therapist profile
    if instance.role == 'therapist':
        TherapistProfile.objects.get_or_create(user=instance)
