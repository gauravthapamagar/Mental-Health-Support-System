# backend/accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, TherapistProfile, PatientProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'therapist':
            TherapistProfile.objects.get_or_create(user=instance)
        elif instance.role == 'patient':
            PatientProfile.objects.get_or_create(user=instance)