from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
User = get_user_model()


class TherapistMatch(models.Model):
    """
    Stores therapist match results for a patient's survey response
    """
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='therapist_matches'
    )
    survey_response = models.OneToOneField(
        'surveys.SurveyResponse',
        on_delete=models.CASCADE,
        related_name='therapist_match'
    )
    
    # Top 3 matches
    top_match_1 = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='matches_as_first',
        limit_choices_to={'role': 'therapist'}
    )
    top_match_1_score = models.FloatField(default=0.0)
    
    top_match_2 = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='matches_as_second',
        limit_choices_to={'role': 'therapist'}
    )
    top_match_2_score = models.FloatField(default=0.0)
    
    top_match_3 = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='matches_as_third',
        limit_choices_to={'role': 'therapist'}
    )
    top_match_3_score = models.FloatField(default=0.0)
    
    matched_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Therapist Match'
        verbose_name_plural = 'Therapist Matches'
    
    def __str__(self):
        return f"{self.patient.username} - Top Match: {self.top_match_1.username if self.top_match_1 else 'None'}"
    
    def get_matches_with_scores(self):
        """Return list of matches with scores"""
        matches = []
        if self.top_match_1:
            matches.append({
                'therapist': self.top_match_1,
                'score': self.top_match_1_score,
                'rank': 1
            })
        if self.top_match_2:
            matches.append({
                'therapist': self.top_match_2,
                'score': self.top_match_2_score,
                'rank': 2
            })
        if self.top_match_3:
            matches.append({
                'therapist': self.top_match_3,
                'score': self.top_match_3_score,
                'rank': 3
            })
        # Add this field after top_match_3_score
        match_reasons = models.JSONField(
        default=dict,
        blank=True,
        help_text="Stores match reasons for each therapist"
        )
        return matches
