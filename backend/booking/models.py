from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from accounts.models import User
from datetime import datetime, timedelta

def assessment_file_path(instance, filename):
    # e.g. assessments/patient_123/2026-03-07_assessment.pdf
    return f'assessments/patient_{instance.patient.id}/{instance.appointment_date}_{filename}'

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

def assessment_upload_path(instance, filename):
    """Generate upload path for assessment files"""
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')
    patient_id = instance.patient.id
    return f'assessments/patient_{patient_id}/{timestamp}_{filename}'

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('awaiting_payment', 'Awaiting Payment'),
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
    
    survey_response = models.ForeignKey(
        'surveys.SurveyResponse',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments',
        help_text='Patient assessment attached to this appointment'
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
    
    assessment_file = models.FileField(
        upload_to=assessment_upload_path,
        null=True,
        blank=True,
        help_text='Patient assessment file (PDF, TXT, DOCX)'
    )
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
    
    
    

class Payment(models.Model):
    """Track Khalti payments for online appointments"""

    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('expired', 'Expired'),
    ]

    appointment = models.OneToOneField(
        'Appointment',
        on_delete=models.CASCADE,
        related_name='payment'
    )
    patient = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='payments',
        limit_choices_to={'role': 'patient'}
    )

    # Khalti fields
    khalti_pidx = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text="Khalti payment identifier (pidx)"
    )
    khalti_transaction_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Khalti transaction ID after successful payment"
    )

    # Amount in paisa (Khalti uses paisa: 1 NPR = 100 paisa)
    amount = models.IntegerField(
        help_text="Amount in paisa (e.g., 100000 = Rs. 1000)"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='initiated'
    )

    # Khalti response data
    khalti_response = models.JSONField(
        null=True,
        blank=True,
        help_text="Full JSON response from Khalti API"
    )

    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-initiated_at']

    def __str__(self):
        return f"Payment for Appointment #{self.appointment.id} - {self.get_status_display()}"

    @property
    def amount_in_rupees(self):
        """Convert paisa to NPR"""
        return self.amount / 100
    
    
from django.core.validators import MinValueValidator, MaxValueValidator
class AppointmentReview(models.Model):
    """
    Model to store reviews from both patient and therapist after appointment completion.
    Both can leave a 1-10 rating and written review about their experience.
    """
    REVIEWER_CHOICES = [
        ('patient', 'Patient'),
        ('therapist', 'Therapist'),
    ]

    appointment = models.ForeignKey(
        'Appointment',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    
    # Who is leaving the review
    reviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews_written'
    )
    reviewer_type = models.CharField(
        max_length=10,
        choices=REVIEWER_CHOICES,
        help_text="Whether the review is from patient or therapist"
    )
    
    # The person being reviewed (opposite party)
    reviewed_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews_received'
    )
    
    # Rating from 1-10
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Rating from 1 (poor match/experience) to 10 (excellent match/experience)"
    )
    
    # Written review/feedback
    review_text = models.TextField(
        help_text="Detailed feedback about the appointment and match quality"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('appointment', 'reviewer')  # Each person can only review once per appointment
        ordering = ['-created_at']
        verbose_name = "Appointment Review"
        verbose_name_plural = "Appointment Reviews"
        indexes = [
            models.Index(fields=['appointment', 'reviewer_type']),
            models.Index(fields=['reviewed_user', 'reviewer_type']),
        ]
    
    def __str__(self):
        return f"Review by {self.reviewer.get_full_name()} for appointment {self.appointment.id}"
    
    @property
    def other_user_review(self):
        """Get the review from the other party (if it exists)"""
        return self.appointment.reviews.exclude(id=self.id).first()
    
    @property
    def is_bidirectional_review_complete(self):
        """Check if both parties have left reviews"""
        return self.appointment.reviews.count() >= 2