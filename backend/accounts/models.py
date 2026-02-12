from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('therapist', 'Therapist'),
        ('admin', 'Admin'),
    ]
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]

    email = models.EmailField(unique=True, max_length=255)
    full_name = models.CharField(max_length=255)
    
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'role']

    def __str__(self):
        return f"{self.full_name} ({self.role})"

    class Meta:
        db_table = 'users'


class AddressMixin(models.Model):
    address_line_1 = models.CharField(max_length=255, blank=True, null=True)
    address_line_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        abstract = True


class PatientProfile(AddressMixin, models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    emergency_contact_name = models.CharField(max_length=255)
    emergency_contact_phone = models.CharField(max_length=17)
    basic_health_info = models.TextField(blank=True, null=True)
    terms_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Patient Profile: {self.user.full_name}"

    class Meta:
        db_table = 'patient_profiles'


class TherapistProfile(AddressMixin, models.Model):
    PROFESSION_CHOICES = [
        ('psychologist', 'Psychologist'),
        ('psychiatrist', 'Psychiatrist'),
        ('counselor', 'Counselor'),
        ('social_worker', 'Social Worker'),
        ('therapist', 'Therapist'),
        ('other', 'Other'),
    ]
    profile_picture = models.ImageField(
        upload_to='therapist_profiles/', 
        null=True, 
        blank=True
    )
    
    CONSULTATION_MODE_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('both', 'Both'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='therapist_profile')
    phone_number = models.CharField(max_length=17, default="0000000000")
    profession_type = models.CharField(max_length=50, choices=PROFESSION_CHOICES)
    license_id = models.CharField(max_length=100, blank=True, null=True)
    years_of_experience = models.IntegerField(blank=True, null=True)
    
    specialization_tags = models.JSONField(blank=True, null=True, help_text="List of specializations")
    languages_spoken = models.JSONField(blank=True, null=True, help_text="List of languages")
    consultation_mode = models.CharField(
        max_length=10, 
        choices=CONSULTATION_MODE_CHOICES, 
        blank=True, 
        null=True
    )
    consultation_fees = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True
    )
    availability_slots = models.JSONField(
        blank=True, 
        null=True, 
        help_text="Availability schedule structure"
    )
    
    booked_slots = models.JSONField(
        default=list,
        blank=True,
        null=True,
        help_text="List of booked slots: [{'date': '2026-02-10', 'start_time': '09:00', 'end_time': '10:00'}]"
    )
    
    bio = models.TextField(blank=True, null=True)
    
    profile_completed = models.BooleanField(default=False)
    
    is_verified = models.BooleanField(
        default=False,
        help_text="Auto-verified when all required documents are verified"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_therapists',
        limit_choices_to={'role': 'admin'}
    )
    
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def check_verification_status(self):
        """Check if all required documents are verified"""
        required_types = ['citizenship', 'license', 'education']
        verified_docs = self.verification_documents.filter(
            document_type__in=required_types,
            is_verified=True
        ).values_list('document_type', flat=True)
        
        if len(verified_docs) == len(required_types):
            self.is_verified = True
            self.verified_at = timezone.now()
            self.save()
            return True
        return False

    def __str__(self):
        return f"Therapist Profile: {self.user.full_name}"

    class Meta:
        db_table = 'therapist_profiles'
        
        
from django.contrib.postgres.fields import ArrayField
import os
from cryptography.fernet import Fernet

class VerificationDocument(models.Model):
    DOCUMENT_TYPES = [
        ('citizenship', 'Citizenship/ID'),
        ('license', 'Professional License'),
        ('education', 'Educational Certificate'),
        ('other', 'Other'),
    ]
    
    therapist_profile = models.ForeignKey(
        TherapistProfile, 
        on_delete=models.CASCADE, 
        related_name='verification_documents'
    )
    document_type = models.CharField(
        max_length=20, 
        choices=DOCUMENT_TYPES
    )
    document_file = models.FileField(
        upload_to='verification_documents/',
        null=True,
        blank=True
    )
    encrypted_file_path = models.TextField(
        null=True,
        blank=True,
        help_text="Encrypted file path"
    )
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents',
        limit_choices_to={'role': 'admin'}
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('therapist_profile', 'document_type')
    
    def __str__(self):
        return f"{self.therapist_profile.user.full_name} - {self.get_document_type_display()}"     
