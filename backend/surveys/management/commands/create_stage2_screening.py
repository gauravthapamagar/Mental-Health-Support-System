"""
Stage 2: Initial Screening Survey
The critical "What brings you to therapy?" question + basic screening

This is where NLP analysis happens to determine which clinical instruments to show next
"""

from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyQuestion, SurveyQuestionOption


class Command(BaseCommand):
    help = 'Create Stage 2: Initial Screening Survey (Chief Complaint)'

    def handle(self, *args, **options):
        # Create Stage 2 survey
        survey, created = Survey.objects.get_or_create(
            title='Stage 2: Initial Screening',
            defaults={
                'description': 'Help us understand what brings you to therapy',
                'assessment_type': 'custom',
                'stage': 'screening',
                'stage_order': 2,
                'is_active': True,
                'is_conditional': False,  # Always shown after Stage 1
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created survey: {survey.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Survey already exists: {survey.title}'))
            survey.questions.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing questions'))

        # Define Stage 2 questions
        questions = [
            {
                'order': 1,
                'text': 'In your own words, what brings you to therapy today?',
                'type': 'text',
                'help_text': 'Take your time - there\'s no right or wrong answer. We\'re here to listen and help.',
            },
            {
                'order': 2,
                'text': 'How long have you been experiencing your main concern?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'Less than 1 month', 'value': 'less_1m', 'score': 1},
                    {'text': '1-3 months', 'value': '1_3m', 'score': 2},
                    {'text': '3-6 months', 'value': '3_6m', 'score': 3},
                    {'text': '6-12 months', 'value': '6_12m', 'score': 4},
                    {'text': 'More than 1 year', 'value': 'more_1y', 'score': 5},
                    {'text': 'On and off for years', 'value': 'chronic', 'score': 6},
                ]
            },
            {
                'order': 3,
                'text': 'How is this affecting your daily life?',
                'type': 'text',
                'help_text': 'For example: work, relationships, sleep, self-care, hobbies, etc.',
            },
            {
                'order': 4,
                'text': 'On a scale of 1-10, how much distress are you experiencing right now?',
                'type': 'rating',
                'help_text': '1 = Little to no distress, 10 = Severe distress',
                'rating_min': 1,
                'rating_max': 10,
                'rating_min_label': 'Little distress',
                'rating_max_label': 'Severe distress'
            },
            {
                'order': 5,
                'text': 'Have you been to therapy before?',
                'type': 'yes_no',
            },
        ]

        # Create questions
        for q_data in questions:
            question_data = {
                'survey': survey,
                'order': q_data['order'],
                'question_text': q_data['text'],
                'question_type': q_data['type'],
                'question_level': 'static',
                'is_required': True,
                'help_text': q_data.get('help_text', ''),
            }
            
            # Add rating fields if applicable
            if q_data['type'] == 'rating':
                question_data['rating_min'] = q_data.get('rating_min')
                question_data['rating_max'] = q_data.get('rating_max')
                question_data['rating_min_label'] = q_data.get('rating_min_label', '')
                question_data['rating_max_label'] = q_data.get('rating_max_label', '')
            
            question = SurveyQuestion.objects.create(**question_data)

            self.stdout.write(self.style.SUCCESS(f'  Created Q{q_data["order"]}: {q_data["text"][:60]}...'))

            # Create options for multiple choice and yes/no
            if 'options' in q_data:
                for opt_data in q_data['options']:
                    SurveyQuestionOption.objects.create(
                        question=question,
                        option_text=opt_data['text'],
                        option_value=opt_data['value'],
                        order=q_data['options'].index(opt_data),
                        score=opt_data.get('score', 0),
                    )
            elif q_data['type'] == 'yes_no':
                for idx, (text, value) in enumerate([('Yes', 'yes'), ('No', 'no')]):
                    SurveyQuestionOption.objects.create(
                        question=question,
                        option_value=value,
                        option_text=text,
                        order=idx,
                        score=1 if value == 'yes' else 0,
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully created Stage 2: Initial Screening with {len(questions)} questions'
            )
        )
        self.stdout.write(
            self.style.WARNING(
                '\nNOTE: After patients complete this stage, NLP analysis will determine which'
                '\nclinical instruments (PHQ-9, GAD-7, etc.) to show in Stage 3'
            )
        )