from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class JournalEntry(models.Model):
    MOOD_CHOICES = [
        ('happy', 'Happy'),
        ('excited', 'Excited'),
        ('calm', 'Calm'),
        ('sad', 'Sad'),
        ('anxious', 'Anxious'),
        ('angry', 'Angry'),
        ('neutral', 'Neutral'),
        ('grateful', 'Grateful'),
    ]

    patient = models.ForeignKey(
        'accounts.PatientProfile',  # Adjust based on your patient model
        on_delete=models.CASCADE,
        related_name='journal_entries'
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    mood = models.CharField(
        max_length=20,
        choices=MOOD_CHOICES,
        default='neutral'
    )
    mood_intensity = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=5,
        help_text="Mood intensity from 1-10"
    )
    tags = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Journal Entries"
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['patient', '-created_at']),
        ]

    def __str__(self):
        return f"{self.patient.user.full_name} - {self.title} ({self.created_at.date()})"