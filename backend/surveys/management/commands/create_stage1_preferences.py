"""
Stage 1: Basic Preferences Survey
Creates the initial static questions about therapist preferences

This runs FIRST before any clinical assessment
"""

from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyQuestion, SurveyQuestionOption


class Command(BaseCommand):
    help = 'Create Stage 1: Basic Preferences Survey (Gender, Mode, Language, etc.)'

    def handle(self, *args, **options):
        # Create Stage 1 survey
        survey, created = Survey.objects.get_or_create(
            title='Stage 1: Basic Preferences',
            defaults={
                'description': 'Let\'s start by understanding your preferences for therapy',
                'assessment_type': 'custom',
                'stage': 'preferences',
                'stage_order': 1,
                'is_active': True,
                'is_conditional': False,  # Always shown
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created survey: {survey.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Survey already exists: {survey.title}'))
            # Clear existing questions for fresh start
            survey.questions.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing questions'))

        # Define Stage 1 questions (all static)
        questions = [
            {
                'order': 1,
                'text': 'What is your preferred gender for a therapist?',
                'type': 'multiple_choice',
                'help_text': 'This helps us match you with a therapist you\'ll feel comfortable with',
                'options': [
                    {'text': 'No preference', 'value': 'no_preference', 'score': 0},
                    {'text': 'Female therapist', 'value': 'female', 'score': 0},
                    {'text': 'Male therapist', 'value': 'male', 'score': 0},
                    {'text': 'Non-binary therapist', 'value': 'non_binary', 'score': 0},
                ]
            },
            {
                'order': 2,
                'text': 'How would you prefer to attend therapy sessions?',
                'type': 'multiple_choice',
                'help_text': 'We offer both online and in-person options',
                'options': [
                    {'text': 'Online (video call)', 'value': 'online', 'score': 0},
                    {'text': 'In-person at office', 'value': 'offline', 'score': 0},
                    {'text': 'Either online or in-person', 'value': 'both', 'score': 0},
                    {'text': 'No preference', 'value': 'no_preference', 'score': 0},
                ]
            },
            {
                'order': 3,
                'text': 'What language(s) do you prefer for therapy?',
                'type': 'text',
                'help_text': 'You can list multiple languages separated by commas (e.g., English, Spanish)',
            },
            {
                'order': 4,
                'text': 'How often would you like to meet with a therapist?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'Once a week', 'value': 'weekly', 'score': 0},
                    {'text': 'Twice a week', 'value': 'biweekly', 'score': 0},
                    {'text': 'Every two weeks', 'value': 'every_2weeks', 'score': 0},
                    {'text': 'Once a month', 'value': 'monthly', 'score': 0},
                    {'text': 'As needed / Not sure yet', 'value': 'as_needed', 'score': 0},
                ]
            },
            {
                'order': 5,
                'text': 'What is your approximate budget for therapy sessions?',
                'type': 'multiple_choice',
                'help_text': 'This helps us find therapists within your budget',
                'options': [
                    {'text': 'Under $50 per session', 'value': 'under_50', 'score': 0},
                    {'text': '$50-100 per session', 'value': '50_100', 'score': 0},
                    {'text': '$100-150 per session', 'value': '100_150', 'score': 0},
                    {'text': '$150-200 per session', 'value': '150_200', 'score': 0},
                    {'text': 'Over $200 per session', 'value': 'over_200', 'score': 0},
                    {'text': 'I have insurance coverage', 'value': 'insurance', 'score': 0},
                ]
            },
        ]

        # Create questions
        for q_data in questions:
            question = SurveyQuestion.objects.create(
                survey=survey,
                order=q_data['order'],
                question_text=q_data['text'],
                question_type=q_data['type'],
                question_level='static',  # All are static in Stage 1
                is_required=True,
                help_text=q_data.get('help_text', ''),
            )

            self.stdout.write(self.style.SUCCESS(f'  Created Q{q_data["order"]}: {q_data["text"][:50]}...'))

            # Create options for multiple choice
            if 'options' in q_data:
                for opt_data in q_data['options']:
                    SurveyQuestionOption.objects.create(
                        question=question,
                        option_text=opt_data['text'],
                        option_value=opt_data['value'],
                        order=q_data['options'].index(opt_data),
                        score=opt_data.get('score', 0),
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully created Stage 1: Basic Preferences with {len(questions)} questions'
            )
        )