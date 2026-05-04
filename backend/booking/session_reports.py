from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from accounts.models import User
from .models import Appointment


class SessionReport(models.Model):
    """
    Therapist's structured session report after appointment completion.
    Captures progress, mood, symptoms, treatment goals, and notes.
    """
    
    SESSION_OUTCOME_CHOICES = [
        ('productive', 'Productive Session'),
        ('breakthrough', 'Breakthrough Moment'),
        ('needs_follow_up', 'Needs Follow-Up'),
        ('blocked', 'Blocked/Stuck'),
    ]
    
    # Core relationships
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='session_report',
        help_text='The appointment this report is for'
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='session_reports_written',
        limit_choices_to={'role': 'therapist'}
    )
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='session_reports_received',
        limit_choices_to={'role': 'patient'}
    )
    
    # Session Summary
    session_summary = models.TextField(
        help_text='What was discussed in this session'
    )
    
    # Progress Indicators (1-10 scale)
    mood_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Patient mood/emotional state during session (1=very negative, 10=very positive)'
    )
    symptom_improvement = models.JSONField(
        default=dict,
        blank=True,
        help_text='Tracking symptom improvements: {"anxiety": 7, "depression": 5, ...}'
    )
    
    # Treatment Goals
    treatment_goals_addressed = models.JSONField(
        default=list,
        blank=True,
        help_text='List of treatment goals addressed in this session'
    )
    
    # Session Outcome
    session_outcome = models.CharField(
        max_length=20,
        choices=SESSION_OUTCOME_CHOICES,
        default='productive',
        help_text='Overall outcome of the session'
    )
    
    # Homework & Next Steps
    homework_assigned = models.TextField(
        blank=True,
        help_text='Assignments or homework for patient to complete before next session'
    )
    triggers_identified = models.TextField(
        blank=True,
        help_text='Triggers or patterns identified during session'
    )
    notes_for_next_session = models.TextField(
        blank=True,
        help_text='Topics, focus areas, or notes for the next session'
    )
    
    # Additional Notes
    clinical_observations = models.TextField(
        blank=True,
        help_text='Clinical observations or progress notes from therapist'
    )
    
    # Patient Visibility
    patient_visible = models.BooleanField(
        default=False,
        help_text='If True, patient can see anonymized summary of this report'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'session_reports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['therapist', 'created_at']),
            models.Index(fields=['patient', 'created_at']),
            models.Index(fields=['appointment']),
        ]
    
    def __str__(self):
        return f"Session Report: {self.patient.full_name} by {self.therapist.full_name} on {self.created_at.date()}"
    
    @property
    def appointment_date(self):
        """Get appointment date for easy reference"""
        return self.appointment.appointment_date
    
    @property
    def summary_for_patient(self):
        """Return anonymized summary for patient view"""
        if not self.patient_visible:
            return None
        
        return {
            'date': self.appointment_date,
            'mood_rating': self.mood_rating,
            'session_outcome': self.get_session_outcome_display(),
            'symptom_improvement': self.symptom_improvement,
            'homework_assigned': self.homework_assigned,
            'goals_addressed': self.treatment_goals_addressed,
        }
