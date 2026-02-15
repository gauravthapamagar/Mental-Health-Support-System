"""
Stage 4: Safety and Risk Assessment
CRITICAL safety questions - ALWAYS shown regardless of NLP analysis

Based on Columbia-Suicide Severity Rating Scale (C-SSRS) principles
"""

from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyQuestion, SurveyQuestionOption


class Command(BaseCommand):
    help = 'Create Stage 4: Safety and Risk Assessment (Always shown)'

    def handle(self, *args, **options):
        # Create Stage 4 survey
        survey, created = Survey.objects.get_or_create(
            title='Stage 4: Safety Screening',
            defaults={
                'description': 'Your safety is our top priority. Please answer these important questions honestly.',
                'assessment_type': 'standard',
                'stage': 'functional',
                'stage_order': 4,
                'is_active': True,
                'is_conditional': False,  # ALWAYS shown
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created survey: {survey.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Survey already exists: {survey.title}'))
            survey.questions.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing questions'))

        # Safety questions (based on C-SSRS)
        questions = [
            {
                'order': 1,
                'text': 'In the past month, have you wished you were dead or wished you could go to sleep and not wake up?',
                'type': 'yes_no',
                'help_text': 'This is called "passive suicidal ideation"',
            },
            {
                'order': 2,
                'text': 'In the past month, have you had actual thoughts of killing yourself?',
                'type': 'yes_no',
                'help_text': 'If yes, please know that help is available',
            },
            {
                'order': 3,
                'text': 'Have you thought about how you might do this?',
                'type': 'yes_no',
                'help_text': 'This asks about having a plan',
                'parent_order': 2,  # Only show if Q2 = yes
                'trigger_value': 'yes',
            },
            {
                'order': 4,
                'text': 'Have you had these thoughts and had some intention of acting on them?',
                'type': 'yes_no',
                'parent_order': 2,
                'trigger_value': 'yes',
            },
            {
                'order': 5,
                'text': 'In the past 3 months, have you done anything, started to do anything, or prepared to do anything to end your life?',
                'type': 'yes_no',
                'help_text': 'Examples: collecting pills, obtaining a weapon, giving away possessions',
                'parent_order': 2,
                'trigger_value': 'yes',
            },
            {
                'order': 6,
                'text': 'In the past month, have you had thoughts of harming yourself (but not killing yourself)?',
                'type': 'yes_no',
                'help_text': 'Examples: cutting, burning, hitting yourself',
            },
            {
                'order': 7,
                'text': 'Do you have someone you can call in a crisis?',
                'type': 'yes_no',
                'help_text': 'A trusted friend, family member, or crisis line',
            },
            {
                'order': 8,
                'text': 'Do you feel safe in your current living situation?',
                'type': 'yes_no',
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
                'is_required': True,
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

            # Create yes/no options
            if q_data['type'] == 'yes_no':
                for idx, (text, value) in enumerate([('Yes', 'yes'), ('No', 'no')]):
                    SurveyQuestionOption.objects.create(
                        question=question,
                        option_value=value,
                        option_text=text,
                        order=idx,
                        score=1 if value == 'yes' else 0,
                        clinical_score=10 if value == 'yes' and q_data['order'] <= 5 else 0,  # High risk scoring
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully created Stage 4: Safety Screening with {len(questions)} questions'
            )
        )
        self.stdout.write(
            self.style.ERROR(
                '\n⚠️  CRITICAL: Any "yes" answer to questions 1-5 should trigger immediate crisis protocol!'
                '\n\nCrisis Resources:'
                '\n  • National Suicide Prevention Lifeline: 988'
                '\n  • Crisis Text Line: Text HOME to 741741'
                '\n  • International: findahelpline.com'
            )
        )