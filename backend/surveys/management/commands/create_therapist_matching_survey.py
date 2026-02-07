from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyQuestion, SurveyQuestionOption


class Command(BaseCommand):
    help = 'Create the Therapist Matching Assessment with 15 static questions and dynamic branching'

    def handle(self, *args, **options):
        # Create the main survey
        survey, created = Survey.objects.get_or_create(
            title='Therapist Matching Assessment',
            defaults={
                'description': 'This assessment helps us match you with the right therapist based on your needs, preferences, and therapy goals.',
                'assessment_type': 'custom',
                'is_active': True,
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created survey: {survey.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Survey already exists: {survey.title}'))
            return

        # Define all 15 static questions
        static_questions = [
            {
                'order': 1,
                'text': 'What is your primary reason for seeking therapy?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'Trauma or past experiences', 'value': 'trauma', 'score': 5},
                    {'text': 'Anxiety or panic attacks', 'value': 'anxiety', 'score': 4},
                    {'text': 'Depression or mood issues', 'value': 'depression', 'score': 4},
                    {'text': 'Relationship or family issues', 'value': 'relationships', 'score': 3},
                    {'text': 'Personal growth or life coaching', 'value': 'growth', 'score': 2},
                    {'text': 'Work-related stress', 'value': 'work_stress', 'score': 3},
                    {'text': 'Other', 'value': 'other', 'score': 1},
                ]
            },
            {
                'order': 2,
                'text': 'How long have you been experiencing your main concern?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'Less than 1 month', 'value': 'less_1m', 'score': 2},
                    {'text': '1-3 months', 'value': '1-3m', 'score': 3},
                    {'text': '3-6 months', 'value': '3-6m', 'score': 4},
                    {'text': '6-12 months', 'value': '6-12m', 'score': 5},
                    {'text': 'More than 1 year', 'value': 'more_1y', 'score': 6},
                ]
            },
            {
                'order': 3,
                'text': 'What is your current emotional state?',
                'type': 'rating',
                'help_text': 'Rate your current distress level',
                'rating_min': 1,
                'rating_max': 10,
                'rating_min_label': 'Not distressed',
                'rating_max_label': 'Very distressed'
            },
            {
                'order': 4,
                'text': 'What is your preferred gender for a therapist?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'No preference', 'value': 'no_preference', 'score': 1},
                    {'text': 'Female therapist', 'value': 'female', 'score': 2},
                    {'text': 'Male therapist', 'value': 'male', 'score': 2},
                    {'text': 'Non-binary therapist', 'value': 'non_binary', 'score': 2},
                ]
            },
            {
                'order': 5,
                'text': 'Which therapeutic approach appeals to you most?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'Cognitive Behavioral Therapy (CBT)', 'value': 'cbt', 'score': 3},
                    {'text': 'Psychodynamic/Psychoanalytic', 'value': 'psychodynamic', 'score': 3},
                    {'text': 'Humanistic/Person-centered', 'value': 'humanistic', 'score': 3},
                    {'text': 'Dialectical Behavior Therapy (DBT)', 'value': 'dbt', 'score': 3},
                    {'text': 'Acceptance and Commitment Therapy (ACT)', 'value': 'act', 'score': 3},
                    {'text': 'Somatic/Body-based therapy', 'value': 'somatic', 'score': 3},
                    {'text': 'Not sure', 'value': 'not_sure', 'score': 1},
                ]
            },
            {
                'order': 6,
                'text': 'How comfortable are you with discussing trauma or difficult experiences?',
                'type': 'rating',
                'help_text': 'Rate your comfort level',
                'rating_min': 1,
                'rating_max': 5,
                'rating_min_label': 'Not comfortable',
                'rating_max_label': 'Very comfortable'
            },
            {
                'order': 7,
                'text': 'Have you been to therapy before?',
                'type': 'yes_no',
            },
            {
                'order': 8,
                'text': 'How often would you prefer to meet with a therapist?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'Once a week', 'value': 'weekly', 'score': 3},
                    {'text': 'Twice a week', 'value': 'biweekly', 'score': 4},
                    {'text': 'Every two weeks', 'value': 'every_2weeks', 'score': 2},
                    {'text': 'Once a month', 'value': 'monthly', 'score': 1},
                    {'text': 'As needed', 'value': 'as_needed', 'score': 1},
                ]
            },
            {
                'order': 9,
                'text': 'Do you prefer in-person or online sessions?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'In-person', 'value': 'in_person', 'score': 2},
                    {'text': 'Online (video)', 'value': 'online_video', 'score': 2},
                    {'text': 'Phone/Audio', 'value': 'phone', 'score': 1},
                    {'text': 'No preference', 'value': 'no_preference', 'score': 1},
                ]
            },
            {
                'order': 10,
                'text': 'What is your relationship/family status?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'Single', 'value': 'single', 'score': 1},
                    {'text': 'In a relationship', 'value': 'in_relationship', 'score': 2},
                    {'text': 'Married', 'value': 'married', 'score': 2},
                    {'text': 'Divorced/Separated', 'value': 'divorced', 'score': 2},
                    {'text': 'Prefer not to say', 'value': 'prefer_not_say', 'score': 0},
                ]
            },
            {
                'order': 11,
                'text': 'Are you currently experiencing thoughts of self-harm or suicide?',
                'type': 'yes_no',
                'help_text': 'Your safety is our priority'
            },
            {
                'order': 12,
                'text': 'Do you have any current mental health diagnoses?',
                'type': 'text',
                'help_text': 'You can list multiple diagnoses separated by commas, or write "None" if not applicable'
            },
            {
                'order': 13,
                'text': 'Do you have any cultural or religious considerations we should know about?',
                'type': 'text',
                'help_text': 'E.g., Language preferences, cultural background, religious beliefs'
            },
            {
                'order': 14,
                'text': 'What coping mechanisms do you currently use?',
                'type': 'text',
                'help_text': 'E.g., Exercise, meditation, journaling, talking to friends, etc.'
            },
            {
                'order': 15,
                'text': 'What outcomes are you hoping therapy will achieve?',
                'type': 'text',
                'help_text': 'E.g., Better emotional regulation, improved relationships, reduced anxiety, etc.'
            },
        ]

        # Create all static questions
        created_questions = {}
        for q_data in static_questions:
            question_text = q_data['text']
            question, created = SurveyQuestion.objects.get_or_create(
                survey=survey,
                order=q_data['order'],
                defaults={
                    'question_text': question_text,
                    'question_type': q_data['type'],
                    'question_level': 'static',
                    'is_required': True,
                    'help_text': q_data.get('help_text', ''),
                    'rating_min': q_data.get('rating_min'),
                    'rating_max': q_data.get('rating_max'),
                    'rating_min_label': q_data.get('rating_min_label', ''),
                    'rating_max_label': q_data.get('rating_max_label', ''),
                }
            )
            created_questions[q_data['order']] = question

            if created:
                self.stdout.write(self.style.SUCCESS(f'  Created Q{q_data["order"]}: {question_text[:50]}...'))
            else:
                self.stdout.write(self.style.WARNING(f'  Q{q_data["order"]} already exists'))

            # Create options for multiple choice and yes/no questions
            if q_data['type'] == 'multiple_choice' and 'options' in q_data:
                for opt_data in q_data['options']:
                    option, _ = SurveyQuestionOption.objects.get_or_create(
                        question=question,
                        option_value=opt_data['value'],
                        defaults={
                            'option_text': opt_data['text'],
                            'order': q_data['options'].index(opt_data),
                            'score': opt_data.get('score', 0),
                        }
                    )

            elif q_data['type'] == 'yes_no':
                for idx, (text, value) in enumerate([('Yes', 'yes'), ('No', 'no')]):
                    option, _ = SurveyQuestionOption.objects.get_or_create(
                        question=question,
                        option_value=value,
                        defaults={
                            'option_text': text,
                            'order': idx,
                            'score': 1 if value == 'yes' else 0,
                        }
                    )

        # Now create dynamic/conditional questions based on branching rules
        dynamic_questions = [
            {
                'parent_order': 1,
                'parent_value': 'trauma',
                'question_order': 16,
                'text': 'How long ago did the trauma occur?',
                'type': 'multiple_choice',
                'options': [
                    {'text': 'Less than 6 months ago', 'value': 'recent_trauma', 'score': 5},
                    {'text': '6 months to 1 year ago', 'value': 'recent_trauma_1y', 'score': 4},
                    {'text': '1-5 years ago', 'value': 'past_trauma_5y', 'score': 3},
                    {'text': 'More than 5 years ago', 'value': 'old_trauma', 'score': 2},
                ]
            },
            {
                'parent_order': 1,
                'parent_value': 'trauma',
                'question_order': 17,
                'text': 'Have you experienced flashbacks or nightmares?',
                'type': 'yes_no',
            },
            {
                'parent_order': 3,
                'parent_value': None,  # Triggered if distress rating >= 7
                'question_order': 18,
                'text': 'Have you ever experienced a panic attack?',
                'type': 'yes_no',
                'trigger_value_numeric': 7,
            },
            {
                'parent_order': 4,
                'parent_value': 'female',
                'question_order': 19,
                'text': 'Is your preference for a female therapist related to your therapy concern?',
                'type': 'yes_no',
            },
            {
                'parent_order': 11,
                'parent_value': 'yes',
                'question_order': 20,
                'text': 'Do you have a safety plan in place?',
                'type': 'yes_no',
                'help_text': 'URGENT: Please contact a crisis hotline if you\'re in immediate danger'
            },
        ]

        for d_q in dynamic_questions:
            parent_question = created_questions.get(d_q['parent_order'])
            if not parent_question:
                self.stdout.write(self.style.ERROR(f'  Parent question not found for Q{d_q["question_order"]}'))
                continue

            question, created = SurveyQuestion.objects.get_or_create(
                survey=survey,
                order=d_q['question_order'],
                defaults={
                    'question_text': d_q['text'],
                    'question_type': d_q['type'],
                    'question_level': 'dynamic',
                    'is_required': False,
                    'help_text': d_q.get('help_text', ''),
                    'parent_question': parent_question,
                    'trigger_condition': d_q.get('parent_value', ''),
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'  Created dynamic Q{d_q["question_order"]}: {d_q["text"][:50]}...'))
            else:
                self.stdout.write(self.style.WARNING(f'  Dynamic Q{d_q["question_order"]} already exists'))

            # Create options
            if d_q['type'] == 'multiple_choice' and 'options' in d_q:
                for opt_data in d_q['options']:
                    option, _ = SurveyQuestionOption.objects.get_or_create(
                        question=question,
                        option_value=opt_data['value'],
                        defaults={
                            'option_text': opt_data['text'],
                            'order': d_q['options'].index(opt_data),
                            'score': opt_data.get('score', 0),
                        }
                    )

            elif d_q['type'] == 'yes_no':
                for idx, (text, value) in enumerate([('Yes', 'yes'), ('No', 'no')]):
                    option, _ = SurveyQuestionOption.objects.get_or_create(
                        question=question,
                        option_value=value,
                        defaults={
                            'option_text': text,
                            'order': idx,
                            'score': 1 if value == 'yes' else 0,
                        }
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created Therapist Matching Assessment with 15 static + 5 dynamic questions!'
            )
        )
