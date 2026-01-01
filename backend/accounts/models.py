from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import RegexValidator


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


class PatientProfile(models.Model):
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


class TherapistProfile(models.Model):
    PROFESSION_CHOICES = [
        ('psychologist', 'Psychologist'),
        ('psychiatrist', 'Psychiatrist'),
        ('counselor', 'Counselor'),
        ('social_worker', 'Social Worker'),
        ('therapist', 'Therapist'),
        ('other', 'Other'),
    ]
    
    CONSULTATION_MODE_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('both', 'Both'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='therapist_profile')
    
    # Basic fields (filled during registration)
    profession_type = models.CharField(max_length=50, choices=PROFESSION_CHOICES)
    license_id = models.CharField(max_length=100, blank=True, null=True)
    years_of_experience = models.IntegerField(blank=True, null=True)
    
    # Profile completion fields
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
    bio = models.TextField(blank=True, null=True)
    
    # Profile completion status
    profile_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Therapist Profile: {self.user.full_name}"

    class Meta:
        db_table = 'therapist_profiles'