from django.db import models
from accounts.models import User


class Survey(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    patient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='surveys',
        limit_choices_to={'role': 'patient'}
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Store analysis summary
    analysis_summary = models.TextField(null=True, blank=True)
    risk_level = models.CharField(max_length=20, null=True, blank=True)  # low, medium, high
    
    class Meta:
        db_table = 'surveys'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Survey #{self.id} - {self.patient.full_name} ({self.status})"


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('static', 'Static'),
        ('dynamic', 'Dynamic'),
    ]
    
    RESPONSE_TYPE_CHOICES = [
        ('single_choice', 'Single Choice'),
        ('multiple_choice', 'Multiple Choice'),
        ('scale', 'Scale (1-10)'),
        ('text', 'Text'),
    ]
    
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPE_CHOICES)
    response_type = models.CharField(max_length=20, choices=RESPONSE_TYPE_CHOICES)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # Store options as JSON for single/multiple choice
    # Format: ["Option 1", "Option 2", "Option 3"]
    options = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'questions'
        ordering = ['order']
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class Response(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    
    # Store answer based on question type
    # For single choice: store the selected option
    # For multiple choice: store JSON array of selected options
    # For scale: store the numeric value
    # For text: store the text response
    answer = models.TextField()
    
    # For dynamic questions, store the AI-generated question
    dynamic_question_text = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'responses'
        unique_together = ['survey', 'question']
    
    def __str__(self):
        return f"Response to Q{self.question.order} - Survey #{self.survey.id}"


class DynamicQuestionHistory(models.Model):
    """Track all dynamic questions generated for analysis"""
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='dynamic_questions')
    question_text = models.TextField()
    answer = models.TextField()
    context_used = models.TextField(help_text="Previous responses used as context")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dynamic_question_history'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Dynamic Q for Survey #{self.survey.id}"