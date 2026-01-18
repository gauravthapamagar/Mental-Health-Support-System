from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from accounts.models import User
from datetime import datetime, timedelta


class TherapistAvailability(models.Model):
    """Therapist's weekly availability schedule"""
    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='availability_slots',
        limit_choices_to={'role': 'therapist'}
    )
    
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'therapist_availability'
        ordering = ['day_of_week', 'start_time']
        unique_together = ['therapist', 'day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.therapist.full_name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class TimeOffPeriod(models.Model):
    """Therapist time-off periods (vacations, holidays, etc.)"""
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='time_off_periods',
        limit_choices_to={'role': 'therapist'}
    )
    
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'time_off_periods'
        ordering = ['start_date']
    
    def __str__(self):
        return f"{self.therapist.full_name} - Off from {self.start_date} to {self.end_date}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
    ]
    
    APPOINTMENT_TYPE_CHOICES = [
        ('initial', 'Initial Consultation'),
        ('followup', 'Follow-up Session'),
        ('emergency', 'Emergency Session'),
    ]
    
    # Participants
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='patient_appointments',
        limit_choices_to={'role': 'patient'}
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='therapist_appointments',
        limit_choices_to={'role': 'therapist'}
    )
    
    # Appointment details
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField(default=60)
    
    # Type and status
    appointment_type = models.CharField(
        max_length=20,
        choices=APPOINTMENT_TYPE_CHOICES,
        default='initial'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Booking information
    reason_for_visit = models.TextField(help_text="Patient's reason for booking")
    patient_notes = models.TextField(blank=True, help_text="Additional notes from patient")
    
    # Contact information
    contact_phone = models.CharField(max_length=17)
    contact_email = models.EmailField()
    
    # Session mode
    session_mode = models.CharField(
        max_length=10,
        choices=[('online', 'Online'), ('offline', 'In-Person')],
        default='online'
    )
    
    # Meeting details (for online sessions)
    meeting_link = models.URLField(blank=True, null=True)
    meeting_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Therapist notes
    therapist_notes = models.TextField(blank=True, help_text="Notes from therapist")
    
    # Cancellation details
    cancelled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_appointments'
    )
    cancellation_reason = models.TextField(blank=True, null=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Reminders
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'appointments'
        ordering = ['-appointment_date', '-start_time']
        indexes = [
            models.Index(fields=['patient', 'appointment_date']),
            models.Index(fields=['therapist', 'appointment_date']),
            models.Index(fields=['status', 'appointment_date']),
        ]
    
    def __str__(self):
        return f"{self.patient.full_name} with {self.therapist.full_name} on {self.appointment_date} at {self.start_time}"
    
    @property
    def is_upcoming(self):
        """Check if appointment is in the future"""
        appointment_datetime = datetime.combine(self.appointment_date, self.start_time)
        return appointment_datetime > datetime.now() and self.status not in ['cancelled', 'completed']
    
    @property
    def is_past(self):
        """Check if appointment is in the past"""
        appointment_datetime = datetime.combine(self.appointment_date, self.start_time)
        return appointment_datetime < datetime.now()
    
    @property
    def can_cancel(self):
        """Check if appointment can be cancelled (at least 24 hours before)"""
        if self.status in ['cancelled', 'completed']:
            return False
        
        appointment_datetime = datetime.combine(self.appointment_date, self.start_time)
        hours_until = (appointment_datetime - datetime.now()).total_seconds() / 3600
        return hours_until >= 24
    
    def calculate_end_time(self):
        """Calculate end time based on start time and duration"""
        start_datetime = datetime.combine(self.appointment_date, self.start_time)
        end_datetime = start_datetime + timedelta(minutes=self.duration_minutes)
        return end_datetime.time()
    
    def save(self, *args, **kwargs):
        # Auto-calculate end time if not set
        if not self.end_time:
            self.end_time = self.calculate_end_time()
        super().save(*args, **kwargs)


class AppointmentHistory(models.Model):
    """Track all changes to appointments"""
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='history'
    )
    
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)  # created, confirmed, cancelled, rescheduled, etc.
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'appointment_history'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.action} - {self.appointment} at {self.created_at}"


class AppointmentFeedback(models.Model):
    """Patient feedback after appointment"""
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    
    rating = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Rating from 1-5"
    )
    
    feedback_text = models.TextField(blank=True)
    would_recommend = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'appointment_feedback'
    
    def __str__(self):
        return f"Feedback for {self.appointment} - {self.rating}/5"