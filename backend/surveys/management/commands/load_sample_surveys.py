from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyQuestion, SurveyQuestionOption


class Command(BaseCommand):
    help = 'Load sample mental health assessment surveys'

    def handle(self, *args, **options):
        # Check if surveys already exist
        if Survey.objects.exists():
            self.stdout.write(self.style.WARNING('Surveys already exist. Skipping...'))
            return

        # Create PHQ-9 Depression Assessment Survey
        phq9_survey = Survey.objects.create(
            title='PHQ-9 Depression Assessment',
            description='Patient Health Questionnaire-9: Standard mental health depression screening assessment',
            assessment_type='standard',
            is_active=True
        )

        phq9_questions = [
            {
                'text': 'Little interest or pleasure in doing things',
                'type': 'rating',
                'min': 0,
                'max': 3,
                'min_label': 'Not at all',
                'max_label': 'Nearly every day'
            },
            {
                'text': 'Feeling down, depressed, or hopeless',
                'type': 'rating',
                'min': 0,
                'max': 3,
                'min_label': 'Not at all',
                'max_label': 'Nearly every day'
            },
            {
                'text': 'Trouble falling or staying asleep, or sleeping too much',
                'type': 'rating',
                'min': 0,
                'max': 3,
                'min_label': 'Not at all',
                'max_label': 'Nearly every day'
            },
            {
                'text': 'Feeling tired or having little energy',
                'type': 'rating',
                'min': 0,
                'max': 3,
                'min_label': 'Not at all',
                'max_label': 'Nearly every day'
            },
            {
                'text': 'Poor appetite or overeating',
                'type': 'rating',
                'min': 0,
                'max': 3,
                'min_label': 'Not at all',
                'max_label': 'Nearly every day'
            },
            {
                'text': 'Feeling bad about yourself or that you are a failure',
                'type': 'rating',
                'min': 0,
                'max': 3,
                'min_label': 'Not at all',
                'max_label': 'Nearly every day'
            },
            {
                'text': 'Trouble concentrating on things',
                'type': 'rating',
                'min': 0,
                'max': 3,
                'min_label': 'Not at all',
                'max_label': 'Nearly every day'
            },
            {
                'text': 'Moving or speaking so slowly that others have noticed, or opposite - too fast/fidgety',
                'type': 'rating',
                'min': 0,
                'max': 3,
                'min_label': 'Not at all',
                'max_label': 'Nearly every day'
            },
            {
                'text': 'Thoughts that you would be better off dead or hurting yourself',
                'type': 'rating',
                'min': 0,
                'max': 3,
                'min_label': 'Not at all',
                'max_label': 'Nearly every day'
            },
        ]

        for idx, q_data in enumerate(phq9_questions, 1):
            SurveyQuestion.objects.create(
                survey=phq9_survey,
                question_text=q_data['text'],
                question_type=q_data['type'],
                order=idx,
                is_required=True,
                rating_min=q_data['min'],
                rating_max=q_data['max'],
                rating_min_label=q_data['min_label'],
                rating_max_label=q_data['max_label']
            )

        # Create GAD-7 Anxiety Assessment Survey
        gad7_survey = Survey.objects.create(
            title='GAD-7 Anxiety Assessment',
            description='Generalized Anxiety Disorder-7: Standard mental health anxiety screening assessment',
            assessment_type='standard',
            is_active=True
        )

        gad7_questions = [
            'Feeling nervous, anxious, or on edge',
            'Not being able to stop or control worrying',
            'Worrying too much about different things',
            'Trouble relaxing',
            'Being so restless that it is hard to sit still',
            'Becoming easily annoyed or irritable',
            'Feeling afraid as if something awful might happen',
        ]

        for idx, question_text in enumerate(gad7_questions, 1):
            SurveyQuestion.objects.create(
                survey=gad7_survey,
                question_text=question_text,
                question_type='rating',
                order=idx,
                is_required=True,
                rating_min=0,
                rating_max=3,
                rating_min_label='Not at all',
                rating_max_label='Nearly every day'
            )

        # Create Therapist Matching Survey
        matching_survey = Survey.objects.create(
            title='Therapist Matching Assessment',
            description='Help us match you with the perfect therapist based on your needs and preferences',
            assessment_type='custom',
            is_active=True
        )

        # Question 1: Primary concern
        q1 = SurveyQuestion.objects.create(
            survey=matching_survey,
            question_text='What is your primary reason for seeking therapy?',
            question_type='multiple_choice',
            order=1,
            is_required=True,
        )
        options_q1 = [
            ('Depression', 'depression', 1),
            ('Anxiety', 'anxiety', 1),
            ('Relationship Issues', 'relationship', 2),
            ('Work/Career Stress', 'work_stress', 1),
            ('Grief/Loss', 'grief', 2),
            ('Trauma/PTSD', 'trauma', 3),
            ('Self-Esteem/Confidence', 'self_esteem', 1),
            ('Other', 'other', 0),
        ]
        for text, value, score in options_q1:
            SurveyQuestionOption.objects.create(
                question=q1,
                option_text=text,
                option_value=value,
                score=score,
                order=options_q1.index((text, value, score)) + 1
            )

        # Question 2: Preferred therapy approach
        q2 = SurveyQuestion.objects.create(
            survey=matching_survey,
            question_text='Which therapy approach sounds most appealing to you?',
            question_type='multiple_choice',
            order=2,
            is_required=True,
        )
        options_q2 = [
            ('Cognitive Behavioral Therapy (CBT)', 'cbt', 2),
            ('Psychodynamic/Insight-oriented', 'psychodynamic', 1),
            ('Humanistic/Person-centered', 'humanistic', 1),
            ('Acceptance & Commitment Therapy', 'act', 1),
            ('Mindfulness-based', 'mindfulness', 1),
            ('No preference', 'no_preference', 0),
        ]
        for text, value, score in options_q2:
            SurveyQuestionOption.objects.create(
                question=q2,
                option_text=text,
                option_value=value,
                score=score,
                order=options_q2.index((text, value, score)) + 1
            )

        # Question 3: Therapy experience
        q3 = SurveyQuestion.objects.create(
            survey=matching_survey,
            question_text='Have you been in therapy before?',
            question_type='yes_no',
            order=3,
            is_required=True,
        )

        # Question 4: Session preference
        q4 = SurveyQuestion.objects.create(
            survey=matching_survey,
            question_text='Do you prefer in-person or online sessions?',
            question_type='multiple_choice',
            order=4,
            is_required=True,
        )
        options_q4 = [
            ('In-person only', 'in_person', 1),
            ('Online only', 'online', 1),
            ('No preference', 'no_preference', 0),
        ]
        for text, value, score in options_q4:
            SurveyQuestionOption.objects.create(
                question=q4,
                option_text=text,
                option_value=value,
                score=score,
                order=options_q4.index((text, value, score)) + 1
            )

        # Question 5: Additional notes
        q5 = SurveyQuestion.objects.create(
            survey=matching_survey,
            question_text='Is there anything else you would like your therapist to know about you?',
            question_type='text',
            order=5,
            is_required=False,
        )

        # Create Combined Assessment
        combined_survey = Survey.objects.create(
            title='Complete Mental Health Assessment',
            description='Comprehensive assessment combining depression, anxiety, and therapist matching',
            assessment_type='both',
            is_active=True
        )

        # Add quick screening questions
        q_combined_1 = SurveyQuestion.objects.create(
            survey=combined_survey,
            question_text='How would you rate your overall mental health?',
            question_type='rating',
            order=1,
            is_required=True,
            rating_min=1,
            rating_max=5,
            rating_min_label='Poor',
            rating_max_label='Excellent'
        )

        q_combined_2 = SurveyQuestion.objects.create(
            survey=combined_survey,
            question_text='Have you experienced any major life changes recently?',
            question_type='yes_no',
            order=2,
            is_required=True,
        )

        q_combined_3 = SurveyQuestion.objects.create(
            survey=combined_survey,
            question_text='What is your main concern?',
            question_type='text',
            order=3,
            is_required=True,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully loaded 4 surveys with {SurveyQuestion.objects.count()} questions'
            )
        )
