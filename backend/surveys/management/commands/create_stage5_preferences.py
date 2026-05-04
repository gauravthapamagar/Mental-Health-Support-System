"""
Stage 5: Treatment Preferences and Goals
Final stage before therapist matching

Asks about therapy history, preferences, and what success looks like
"""

from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyQuestion, SurveyQuestionOption


class Command(BaseCommand):
    help = 'Create Stage 5: Treatment Preferences and Goals'

    def handle(self, *args, **options):
        # Create Stage 5 survey
        survey, created = Survey.objects.get_or_create(
            title='Stage 5: Treatment Preferences',
            defaults={
                'description': 'Finally, let\'s understand your therapy preferences and goals',
                'assessment_type': 'custom',
                'stage': 'matching',
                'stage_order': 5,
                'is_active': True,
                'is_conditional': False,  # Always shown
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created survey: {survey.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Survey already exists: {survey.title}'))
            survey.questions.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing questions'))

        # Define questions
        questions = [
            {
                'order': 1,
                'text': 'What type of therapy approach appeals to you most?',
                'type': 'multiple_choice',
                'help_text': 'Don\'t worry if you\'re not familiar with these - we can explain more later',
                'options': [
                    {'text': 'Cognitive Behavioral Therapy (CBT) - Focus on thoughts and behaviors', 'value': 'cbt', 'score': 0},
                    {'text': 'Psychodynamic Therapy - Explore unconscious patterns and past experiences', 'value': 'psychodynamic', 'score': 0},
                    {'text': 'Humanistic/Person-Centered - Focus on personal growth and self-actualization', 'value': 'humanistic', 'score': 0},
                    {'text': 'Dialectical Behavior Therapy (DBT) - Skills for emotion regulation', 'value': 'dbt', 'score': 0},
                    {'text': 'Acceptance and Commitment Therapy (ACT) - Mindfulness and values', 'value': 'act', 'score': 0},
                    {'text': 'I\'m not sure / Open to recommendations', 'value': 'not_sure', 'score': 0},
                ]
            },
            {
                'order': 2,
                'text': 'If you\'ve been to therapy before, what worked well?',
                'type': 'text',
                'help_text': 'If you haven\'t been to therapy, you can skip this or write "N/A"',
            },
            {
                'order': 3,
                'text': 'If you\'ve been to therapy before, what didn\'t work well?',
                'type': 'text',
                'help_text': 'This helps us avoid approaches that haven\'t been helpful for you',
            },
            {
                'order': 4,
                'text': 'Are you currently taking any psychiatric medications?',
                'type': 'yes_no',
            },
            {
                'order': 5,
                'text': 'If yes, which medications?',
                'type': 'text',
                'help_text': 'You can list multiple medications separated by commas',
                'parent_order': 4,
                'trigger_value': 'yes',
            },
            {
                'order': 6,
                'text': 'Do you have any current mental health diagnoses?',
                'type': 'text',
                'help_text': 'You can list multiple diagnoses separated by commas, or write "None" if not applicable',
            },
            {
                'order': 7,
                'text': 'Do you have any cultural or religious considerations we should know about?',
                'type': 'text',
                'help_text': 'E.g., Cultural background, religious beliefs, specific values that are important to you',
            },
            {
                'order': 8,
                'text': 'What outcomes are you hoping therapy will achieve?',
                'type': 'text',
                'help_text': 'E.g., Better emotional regulation, improved relationships, reduced anxiety, etc.',
            },
            {
                'order': 9,
                'text': 'What coping mechanisms do you currently use?',
                'type': 'text',
                'help_text': 'E.g., Exercise, meditation, journaling, talking to friends, etc.',
            },
            {
                'order': 10,
                'text': 'Is there anything else you\'d like your therapist to know?',
                'type': 'text',
                'help_text': 'This is optional, but can help us make a better match',
            },
        ]

        # Track parent questions for conditional logic
        created_questions = {}

        # Create questions
        for q_data in questions:
            question_data = {
                'survey': survey,
                'order': q_data['order'],
                'question_text': q_data['text'],
                'question_type': q_data['type'],
                'question_level': 'dynamic' if 'parent_order' in q_data else 'static',
                'is_required': q_data['order'] <= 8,  # First 8 required, last 2 optional
                'help_text': q_data.get('help_text', ''),
            }
            
            # Set up conditional branching if applicable
            if 'parent_order' in q_data:
                parent_q = created_questions.get(q_data['parent_order'])
                if parent_q:
                    question_data['parent_question'] = parent_q
                    question_data['trigger_condition'] = q_data.get('trigger_value', '')
            
            question = SurveyQuestion.objects.create(**question_data)
            created_questions[q_data['order']] = question

            level_indicator = " [CONDITIONAL]" if 'parent_order' in q_data else ""
            self.stdout.write(self.style.SUCCESS(f'  Created Q{q_data["order"]}: {q_data["text"][:60]}...{level_indicator}'))

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
                f'\n✓ Successfully created Stage 5: Treatment Preferences with {len(questions)} questions'
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                '\n✅ ALL ASSESSMENT STAGES COMPLETE!'
                '\n\nAssessment Flow:'
                '\n  Stage 1: Basic Preferences (5 questions)'
                '\n  Stage 2: Initial Screening (5 questions) → Triggers NLP analysis'
                '\n  Stage 3: Clinical Instruments (PHQ-9 and/or GAD-7 if triggered) (7-16 questions)'
                '\n  Stage 4: Safety Screening (8 questions)'
                '\n  Stage 5: Treatment Preferences (10 questions)'
                '\n\nTotal: 35-44 questions depending on NLP triggers and conditional branching'
            )
        )