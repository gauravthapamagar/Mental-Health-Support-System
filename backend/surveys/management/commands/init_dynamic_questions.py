from django.core.management.base import BaseCommand
from surveys.models import Question


class Command(BaseCommand):
    help = 'Initialize dynamic follow-up questions based on static question responses'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating dynamic follow-up questions...')
        
        dynamic_questions_data = [
            # Follow-ups for Q1: Primary reason for therapy
            {
                'order': 101,  # Use 100+ for dynamic questions
                'question_type': 'dynamic',
                'parent_question_order': 1,
                'question_text': 'How long ago did this traumatic experience occur?',
                'response_type': 'single_choice',
                'options': [
                    'Within the past month',
                    '1-6 months ago',
                    '6 months - 2 years ago',
                    '2-5 years ago',
                    'More than 5 years ago'
                ],
                'trigger_condition': {
                    'answer_equals': 'Trauma or past experiences'
                },
                'priority': 1,
                'category': 'trauma_assessment'
            },
            {
                'order': 102,
                'question_type': 'dynamic',
                'parent_question_order': 1,
                'question_text': 'Are you experiencing any of these trauma-related symptoms? (Select all that apply)',
                'response_type': 'multiple_choice',
                'options': [
                    'Flashbacks or intrusive memories',
                    'Nightmares',
                    'Avoidance of reminders',
                    'Hypervigilance or being easily startled',
                    'Emotional numbness',
                    'Difficulty trusting others',
                    'None of the above'
                ],
                'trigger_condition': {
                    'answer_equals': 'Trauma or past experiences'
                },
                'priority': 2,
                'category': 'trauma_assessment'
            },
            
            # Follow-ups for Q1: Depression
            {
                'order': 103,
                'question_type': 'dynamic',
                'parent_question_order': 1,
                'question_text': 'Over the last 2 weeks, how often have you felt down, depressed, or hopeless?',
                'response_type': 'single_choice',
                'options': [
                    'Not at all',
                    'Several days',
                    'More than half the days',
                    'Nearly every day'
                ],
                'trigger_condition': {
                    'answer_equals': 'Depression or persistent sadness'
                },
                'priority': 1,
                'category': 'depression_phq9'
            },
            {
                'order': 104,
                'question_type': 'dynamic',
                'parent_question_order': 1,
                'question_text': 'Over the last 2 weeks, how often have you had little interest or pleasure in doing things?',
                'response_type': 'single_choice',
                'options': [
                    'Not at all',
                    'Several days',
                    'More than half the days',
                    'Nearly every day'
                ],
                'trigger_condition': {
                    'answer_equals': 'Depression or persistent sadness'
                },
                'priority': 2,
                'category': 'depression_phq9'
            },
            
            # Follow-ups for Q1: Anxiety
            {
                'order': 105,
                'question_type': 'dynamic',
                'parent_question_order': 1,
                'question_text': 'What type of anxiety concerns you most?',
                'response_type': 'single_choice',
                'options': [
                    'General worry about many things',
                    'Panic attacks',
                    'Social situations',
                    'Specific phobias',
                    'Health anxiety',
                    'Obsessive thoughts or compulsive behaviors'
                ],
                'trigger_condition': {
                    'answer_equals': 'Anxiety, worry, or panic'
                },
                'priority': 1,
                'category': 'anxiety_assessment'
            },
            
            # Follow-ups for Q1: Substance use
            {
                'order': 106,
                'question_type': 'dynamic',
                'parent_question_order': 1,
                'question_text': 'What substance(s) are you concerned about?',
                'response_type': 'multiple_choice',
                'options': [
                    'Alcohol',
                    'Cannabis/Marijuana',
                    'Prescription medications',
                    'Stimulants (cocaine, amphetamines)',
                    'Opioids',
                    'Other substances',
                    'Prefer not to say'
                ],
                'trigger_condition': {
                    'answer_equals': 'Substance use concerns'
                },
                'priority': 1,
                'category': 'substance_assessment'
            },
            
            # Follow-up for Q2: High distress
            {
                'order': 107,
                'question_type': 'dynamic',
                'parent_question_order': 2,
                'question_text': 'Have you had thoughts of harming yourself or that you would be better off dead?',
                'response_type': 'single_choice',
                'options': [
                    'Not at all',
                    'Several days in the past 2 weeks',
                    'More than half the days',
                    'Nearly every day',
                    'Prefer not to answer'
                ],
                'trigger_condition': {
                    'answer_in': [
                        'Very distressed - struggling significantly',
                        'Quite difficult - having a hard time'
                    ]
                },
                'priority': 1,
                'category': 'crisis_assessment'
            },
            
            # Follow-up for Q4: Previous therapy
            {
                'order': 108,
                'question_type': 'dynamic',
                'parent_question_order': 4,
                'question_text': 'What worked well in your previous therapy?',
                'response_type': 'text',
                'options': None,
                'trigger_condition': {
                    'answer_not_equals': 'No, this is my first time'
                },
                'priority': 1,
                'category': 'therapy_history'
            },
            {
                'order': 109,
                'question_type': 'dynamic',
                'parent_question_order': 4,
                'question_text': 'What didn\'t work or what would you like to be different this time?',
                'response_type': 'text',
                'options': None,
                'trigger_condition': {
                    'answer_not_equals': 'No, this is my first time'
                },
                'priority': 2,
                'category': 'therapy_history'
            },
            
            # Follow-up for Q6: Gender preference with specific reason
            {
                'order': 110,
                'question_type': 'dynamic',
                'parent_question_order': 6,
                'question_text': 'Is your gender preference related to the concerns you want to address in therapy?',
                'response_type': 'single_choice',
                'options': [
                    'Yes, it\'s important for my specific concerns',
                    'Partially - it would make me more comfortable',
                    'No, it\'s just a personal preference',
                    'Prefer not to say'
                ],
                'trigger_condition': {
                    'answer_in': ['Female therapist', 'Male therapist', 'Non-binary therapist']
                },
                'priority': 1,
                'category': 'preference_clarification'
            },
            
            # Follow-up for Q14: Cultural/spiritual importance
            {
                'order': 111,
                'question_type': 'dynamic',
                'parent_question_order': 14,
                'question_text': 'Please briefly describe the cultural, religious, or spiritual aspects that are important to you in therapy:',
                'response_type': 'text',
                'options': None,
                'trigger_condition': {
                    'answer_in': [
                        'Very important - essential for my comfort',
                        'Somewhat important - would be helpful'
                    ]
                },
                'priority': 1,
                'category': 'cultural_considerations'
            },
        ]
        
        created_count = 0
        
        for q_data in dynamic_questions_data:
            # Get parent question
            parent = Question.objects.filter(
                order=q_data['parent_question_order'],
                question_type='static'
            ).first()
            
            if not parent:
                self.stdout.write(
                    self.style.ERROR(f'Parent question with order {q_data["parent_question_order"]} not found')
                )
                continue
            
            question, created = Question.objects.update_or_create(
                order=q_data['order'],
                question_type='dynamic',
                defaults={
                    'question_text': q_data['question_text'],
                    'response_type': q_data['response_type'],
                    'options': q_data['options'],
                    'parent_question': parent,
                    'trigger_condition': q_data['trigger_condition'],
                    'priority': q_data['priority'],
                    'category': q_data.get('category'),
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created: {question.question_text[:60]}...')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated: {question.question_text[:60]}...')
                )
        
        total_dynamic = Question.objects.filter(question_type='dynamic').count()
        
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} new dynamic questions'))
        self.stdout.write(self.style.SUCCESS(f'📊 Total dynamic questions: {total_dynamic}'))
        self.stdout.write('='*70)