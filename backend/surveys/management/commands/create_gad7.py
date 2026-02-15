"""
GAD-7 (Generalized Anxiety Disorder-7)
VALIDATED clinical instrument for anxiety screening

Scoring:
0-4: Minimal anxiety
5-9: Mild anxiety
10-14: Moderate anxiety
15-21: Severe anxiety
"""

from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyQuestion, SurveyQuestionOption


class Command(BaseCommand):
    help = 'Create GAD-7 Anxiety Screening Survey (Validated Clinical Instrument)'

    def handle(self, *args, **options):
        # Create GAD-7 survey
        survey, created = Survey.objects.get_or_create(
            title='GAD-7: Anxiety Screening',
            defaults={
                'description': 'Over the last 2 weeks, how often have you been bothered by the following problems?',
                'assessment_type': 'standard',
                'clinical_instrument': 'gad7',
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

        # GAD-7 questions (EXACT clinical wording)
        gad7_questions = [
            'Feeling nervous, anxious, or on edge',
            'Not being able to stop or control worrying',
            'Worrying too much about different things',
            'Trouble relaxing',
            'Being so restless that it\'s hard to sit still',
            'Becoming easily annoyed or irritable',
            'Feeling afraid as if something awful might happen',
        ]

        # Likert scale options (STANDARD GAD-7 scoring)
        likert_options = [
            {'text': 'Not at all', 'value': 'not_at_all', 'clinical_score': 0},
            {'text': 'Several days', 'value': 'several_days', 'clinical_score': 1},
            {'text': 'More than half the days', 'value': 'more_than_half', 'clinical_score': 2},
            {'text': 'Nearly every day', 'value': 'nearly_every_day', 'clinical_score': 3},
        ]

        # Create all 7 questions
        for idx, question_text in enumerate(gad7_questions, start=1):
            question = SurveyQuestion.objects.create(
                survey=survey,
                order=idx,
                question_text=question_text,
                question_type='likert',
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
                    clinical_score=opt_data['clinical_score'],  # Used for GAD-7 total
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully created GAD-7 Anxiety Screening with 7 questions'
            )
        )
        self.stdout.write(
            self.style.WARNING(
                '\nScoring Guide:'
                '\n  0-4:  Minimal anxiety'
                '\n  5-9:  Mild anxiety'
                '\n  10-14: Moderate anxiety'
                '\n  15-21: Severe anxiety'
            )
        )