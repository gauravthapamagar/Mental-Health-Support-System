from django.test import TestCase
from django.contrib.auth import get_user_model
from surveys.models import Survey, SurveyResponse
from .algorithm import TherapistMatcher
from .models import TherapistMatch

User = get_user_model()


class TherapistMatcherTestCase(TestCase):
    """Test the matching algorithm"""
    
    def setUp(self):
        """Set up test data"""
        # Create a test patient
        self.patient = User.objects.create_user(
            username='testpatient',
            password='testpass123',
            role='patient'
        )
        
        # Create test therapists
        self.therapist1 = User.objects.create_user(
            username='therapist1',
            password='testpass123',
            role='therapist'
        )
        
        # Create a test survey
        self.survey = Survey.objects.create(
            title='Test Therapist Matching Survey',
            description='Test Survey',
            assessment_type='custom',
            is_active=True
        )
        
        # Create a survey response
        self.response = SurveyResponse.objects.create(
            patient=self.patient,
            survey=self.survey,
            status='submitted'
        )
    
    def test_matcher_initialization(self):
        """Test that matcher initializes correctly"""
        matcher = TherapistMatcher(self.response)
        self.assertEqual(matcher.patient, self.patient)
        self.assertEqual(matcher.survey_response, self.response)
    
    def test_find_best_matches(self):
        """Test finding best matches"""
        matcher = TherapistMatcher(self.response)
        matches = matcher.find_best_matches(top_n=3)
        self.assertIsInstance(matches, list)
