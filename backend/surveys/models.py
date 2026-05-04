from django.db import models
from django.contrib.auth.models import User
from django_extensions.db.models import TimeStampedModel


class Survey(TimeStampedModel):
    """Represents a therapist matching assessment template"""
    ASSESSMENT_TYPES = [
        ('standard', 'Standard Mental Health Assessment'),
        ('custom', 'Custom Therapist Matching Assessment'),
        ('both', 'Combined Assessment'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    assessment_type = models.CharField(
        max_length=20, 
        choices=ASSESSMENT_TYPES,
        default='custom'
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created']
        verbose_name = 'Survey'
        verbose_name_plural = 'Surveys'
    
    def __str__(self):
        return self.title


class SurveyQuestion(TimeStampedModel):
    """Represents individual questions in a survey with branching logic"""
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice (Radio Buttons)'),
        ('rating', 'Rating Scale'),
        ('yes_no', 'Yes/No Question'),
        ('text', 'Text Input'),
    ]
    
    QUESTION_LEVELS = [
        ('static', 'Static Question'),
        ('dynamic', 'Dynamic/Conditional Question'),
    ]
    
    survey = models.ForeignKey(
        Survey, 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    question_level = models.CharField(
        max_length=20,
        choices=QUESTION_LEVELS,
        default='static',
        help_text="Static questions always shown; dynamic appear based on answers"
    )
    order = models.PositiveIntegerField(default=0)
    is_required = models.BooleanField(default=True)
    help_text = models.CharField(max_length=255, blank=True)
    
    # For rating scale
    rating_min = models.PositiveIntegerField(null=True, blank=True)
    rating_max = models.PositiveIntegerField(null=True, blank=True)
    rating_min_label = models.CharField(max_length=100, blank=True)
    rating_max_label = models.CharField(max_length=100, blank=True)
    
    # Branching logic
    parent_question = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='child_questions',
        help_text="The question whose answer triggers this question"
    )
    trigger_condition = models.CharField(
        max_length=255,
        blank=True,
        help_text="The answer value that triggers this question"
    )
    
    class Meta:
        ordering = ['survey', 'order']
        verbose_name = 'Survey Question'
        verbose_name_plural = 'Survey Questions'
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class SurveyQuestionOption(TimeStampedModel):
    """Options for multiple choice and yes/no questions"""
    question = models.ForeignKey(
        SurveyQuestion,
        on_delete=models.CASCADE,
        related_name='options'
    )
    option_text = models.CharField(max_length=255)
    option_value = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    score = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['question', 'order']
        verbose_name = 'Survey Question Option'
        verbose_name_plural = 'Survey Question Options'
    
    def __str__(self):
        return f"{self.question.question_text[:30]} - {self.option_text}"

from django.conf import settings
class SurveyResponse(TimeStampedModel):
    """Stores patient survey responses with retake support"""
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed by Therapist'),
    ]
    
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='survey_responses'
    )
    survey = models.ForeignKey(
        Survey,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='in_progress'
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    total_score = models.PositiveIntegerField(null=True, blank=True)
    
    # Retake tracking
    is_latest = models.BooleanField(
        default=True,
        help_text="Whether this is the patient's latest response"
    )
    retake_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of times this patient has retaken this survey"
    )
    
    class Meta:
        ordering = ['-created']
        verbose_name = 'Survey Response'
        verbose_name_plural = 'Survey Responses'
        indexes = [
            models.Index(fields=['patient', 'survey', 'is_latest']),
            models.Index(fields=['patient', 'is_latest']),
        ]
    
    def __str__(self):
        return f"{self.patient.email} - {self.survey.title} (v{self.retake_count})"


class SurveyAnswer(TimeStampedModel):
    """Individual answers to survey questions"""
    response = models.ForeignKey(
        SurveyResponse,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        SurveyQuestion,
        on_delete=models.CASCADE
    )
    
    # Different answer types
    answer_text = models.TextField(blank=True)
    answer_option = models.ForeignKey(
        SurveyQuestionOption,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    answer_rating = models.PositiveIntegerField(null=True, blank=True)
    answer_yes_no = models.BooleanField(null=True, blank=True)
    
    class Meta:
        ordering = ['response', 'question__order']
        unique_together = ('response', 'question')
        verbose_name = 'Survey Answer'
        verbose_name_plural = 'Survey Answers'
    
    def __str__(self):
        return f"{self.response.patient.username} - Q{self.question.order}"
