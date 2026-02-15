"""
PHQ-9 (Patient Health Questionnaire-9)
VALIDATED clinical instrument for depression screening

Scoring:
0-4: Minimal depression
5-9: Mild depression
10-14: Moderate depression
15-19: Moderately severe depression
20-27: Severe depression
"""

from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyQuestion, SurveyQuestionOption


class Command(BaseCommand):
    help = 'Create PHQ-9 Depression Screening Survey (Validated Clinical Instrument)'

    def handle(self, *args, **options):
        # Create PHQ-9 survey
        survey, created = Survey.objects.get_or_create(
            title='PHQ-9: Depression Screening',
            defaults={
                'description': 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
                'assessment_type': 'standard',
                'clinical_instrument': 'phq9',
                'stage': 'clinical',
                'stage_order': 3,
                'is_active': True,
                'is_conditional': True,  # Triggered by NLP analysis
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created survey: {survey.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Survey already exists: {survey.title}'))
            survey.questions.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing questions'))

        # PHQ-9 questions (EXACT clinical wording)
        phq9_questions = [
            'Little interest or pleasure in doing things',
            'Feeling down, depressed, or hopeless',
            'Trouble falling or staying asleep, or sleeping too much',
            'Feeling tired or having little energy',
            'Poor appetite or overeating',
            'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
            'Trouble concentrating on things, such as reading the newspaper or watching television',
            'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
            'Thoughts that you would be better off dead, or of hurting yourself in some way',
        ]

        # Likert scale options (STANDARD PHQ-9 scoring)
        likert_options = [
            {'text': 'Not at all', 'value': 'not_at_all', 'clinical_score': 0},
            {'text': 'Several days', 'value': 'several_days', 'clinical_score': 1},
            {'text': 'More than half the days', 'value': 'more_than_half', 'clinical_score': 2},
            {'text': 'Nearly every day', 'value': 'nearly_every_day', 'clinical_score': 3},
        ]

        # Create all 9 questions
        for idx, question_text in enumerate(phq9_questions, start=1):
            question = SurveyQuestion.objects.create(
                survey=survey,
                order=idx,
                question_text=question_text,
                question_type='likert',  # Using Likert type
                question_level='static',
                is_required=True,
                help_text='Select the option that best describes your experience over the last 2 weeks',
                clinical_weight=1,  # Each question worth 0-3 points
            )

            self.stdout.write(self.style.SUCCESS(f'  Created Q{idx}: {question_text[:60]}...'))

            # Create Likert options for this question
            for opt_data in likert_options:
                SurveyQuestionOption.objects.create(
                    question=question,
                    option_text=opt_data['text'],
                    option_value=opt_data['value'],
                    order=likert_options.index(opt_data),
                    score=0,  # Not used for matching
                    clinical_score=opt_data['clinical_score'],  # Used for PHQ-9 total
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully created PHQ-9 Depression Screening with 9 questions'
            )
        )
        self.stdout.write(
            self.style.WARNING(
                '\nScoring Guide:'
                '\n  0-4:   Minimal depression'
                '\n  5-9:   Mild depression'
                '\n  10-14: Moderate depression'
                '\n  15-19: Moderately severe depression'
                '\n  20-27: Severe depression'
                '\n\nQuestion 9 is CRITICAL for suicide risk assessment!'
            )
        )