from django.core.management.base import BaseCommand
from surveys.models import Question


class Command(BaseCommand):
    help = 'Initialize static survey questions for therapist-patient matching'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating static survey questions...')
        
        questions_data = [
            # Question 1: Primary reason for seeking therapy
            {
                'order': 1,
                'question_text': 'What is your primary reason for seeking therapy at this time?',
                'response_type': 'single_choice',
                'options': [
                    'Depression or persistent sadness',
                    'Anxiety, worry, or panic',
                    'Relationship or family issues',
                    'Trauma or past experiences',
                    'Grief or loss',
                    'Stress management',
                    'Self-esteem or identity concerns',
                    'Life transitions or adjustment',
                    'Eating or body image concerns',
                    'Substance use concerns',
                    'Other or multiple concerns'
                ]
            },
            
            # Question 2: Emotional state
            {
                'order': 2,
                'question_text': 'How have you been feeling emotionally over the past few weeks?',
                'response_type': 'single_choice',
                'options': [
                    'Very distressed - struggling significantly',
                    'Quite difficult - having a hard time',
                    'Somewhat challenging - ups and downs',
                    'Generally okay - manageable',
                    'Doing well - feeling stable and positive'
                ]
            },
            
            # Question 3: Duration of concerns
            {
                'order': 3,
                'question_text': 'How long have you been experiencing these concerns?',
                'response_type': 'single_choice',
                'options': [
                    'Less than a month',
                    '1-3 months',
                    '3-6 months',
                    '6 months - 1 year',
                    'More than 1 year',
                    'On and off for several years',
                    'Most of my life'
                ]
            },
            
            # Question 4: Previous therapy experience
            {
                'order': 4,
                'question_text': 'Have you been in therapy before?',
                'response_type': 'single_choice',
                'options': [
                    'No, this is my first time',
                    'Yes, briefly (a few sessions)',
                    'Yes, for several months',
                    'Yes, for over a year',
                    'Yes, multiple times over the years'
                ]
            },
            
            # Question 5: Preferred therapeutic approach
            {
                'order': 5,
                'question_text': 'What type of therapeutic approach appeals most to you?',
                'response_type': 'single_choice',
                'options': [
                    'CBT - Cognitive Behavioral (practical, goal-focused, changing thought patterns)',
                    'Psychodynamic - Exploring past experiences and unconscious patterns',
                    'Humanistic - Person-centered, focusing on growth and self-actualization',
                    'DBT - Dialectical Behavioral (mindfulness, emotion regulation, distress tolerance)',
                    'EMDR - Eye Movement therapy for trauma processing',
                    'Solution-Focused - Brief therapy concentrating on solutions',
                    'Integrative - Combination of different approaches',
                    'No preference - open to therapist\'s recommendation'
                ]
            },
            
            # Question 6: Therapist gender preference
            {
                'order': 6,
                'question_text': 'Do you have a preference for your therapist\'s gender?',
                'response_type': 'single_choice',
                'options': [
                    'Female therapist',
                    'Male therapist',
                    'Non-binary therapist',
                    'No preference - gender doesn\'t matter to me'
                ]
            },
            
            # Question 7: Recent life changes
            {
                'order': 7,
                'question_text': 'Have there been any recent changes in your life that feel important to you?',
                'response_type': 'single_choice',
                'options': [
                    'Yes, major life changes (job loss, relationship end, loss, etc.)',
                    'Yes, significant but manageable changes',
                    'Some small changes, nothing major',
                    'No significant changes recently',
                    'Prefer not to say'
                ]
            },
            
            # Question 8: Sleep quality
            {
                'order': 8,
                'question_text': 'How is your sleep lately?',
                'response_type': 'single_choice',
                'options': [
                    'Very poor - severe insomnia or sleeping too much',
                    'Poor - frequently disrupted or unsatisfying',
                    'Fair - some difficulties but getting by',
                    'Good - mostly restful with minor issues',
                    'Excellent - sleeping well and feeling rested'
                ]
            },
            
            # Question 9: Energy levels
            {
                'order': 9,
                'question_text': 'How is your energy level throughout the day?',
                'response_type': 'single_choice',
                'options': [
                    'Exhausted - barely able to function',
                    'Very low - struggling to do daily activities',
                    'Somewhat low - getting through but tired',
                    'Moderate - manageable energy levels',
                    'Good - energetic and capable'
                ]
            },
            
            # Question 10: Social connections
            {
                'order': 10,
                'question_text': 'How are your relationships with friends, family, or people close to you?',
                'response_type': 'single_choice',
                'options': [
                    'Very strained - conflict or isolation',
                    'Difficult - some tension or withdrawal',
                    'Mixed - some good, some challenging',
                    'Generally good - feeling connected',
                    'Strong - supportive and fulfilling'
                ]
            },
            
            # Question 11: Concentration ability
            {
                'order': 11,
                'question_text': 'How is your ability to focus or concentrate on daily tasks?',
                'response_type': 'single_choice',
                'options': [
                    'Unable to focus - severe impairment',
                    'Very difficult - major struggles',
                    'Challenging - noticeable difficulties',
                    'Mostly okay - some issues but manageable',
                    'Good - able to focus well'
                ]
            },
            
            # Question 12: Communication style preference
            {
                'order': 12,
                'question_text': 'What communication style do you prefer in a therapist?',
                'response_type': 'single_choice',
                'options': [
                    'Direct and structured - clear guidance and homework',
                    'Collaborative - working together as a team',
                    'Gentle and supportive - warm and empathetic',
                    'Challenging - pushes me to grow and change',
                    'Flexible - adapts to what I need in the moment'
                ]
            },
            
            # Question 13: Session frequency preference
            {
                'order': 13,
                'question_text': 'How often would you like to attend therapy sessions initially?',
                'response_type': 'single_choice',
                'options': [
                    'Multiple times per week - I need intensive support',
                    'Once a week - regular weekly sessions',
                    'Every two weeks - bi-weekly sessions',
                    'Once a month - monthly check-ins',
                    'Flexible - as needed basis'
                ]
            },
            
            # Question 14: Cultural/spiritual considerations
            {
                'order': 14,
                'question_text': 'How important is it that your therapist understands or shares your cultural, religious, or spiritual background?',
                'response_type': 'single_choice',
                'options': [
                    'Very important - essential for my comfort',
                    'Somewhat important - would be helpful',
                    'Neutral - open but appreciate awareness',
                    'Not important - doesn\'t affect my therapy needs',
                    'Prefer not to say'
                ]
            },
            
            # Question 15: Open-ended meaningful question
            {
                'order': 15,
                'question_text': 'If therapy could help you in one specific way, what would that be? What would be different in your life?',
                'response_type': 'text',
                'options': None
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for q_data in questions_data:
            question, created = Question.objects.update_or_create(
                order=q_data['order'],
                question_type='static',
                defaults={
                    'question_text': q_data['question_text'],
                    'response_type': q_data['response_type'],
                    'options': q_data['options'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {question.question_text[:60]}...'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'↻ Updated: {question.question_text[:60]}...'))
        
        total_questions = Question.objects.filter(question_type='static').count()
        
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully created {created_count} new questions'))
        self.stdout.write(self.style.WARNING(f'↻ Updated {updated_count} existing questions'))
        self.stdout.write(self.style.SUCCESS(f'📊 Total static questions in database: {total_questions}'))
        self.stdout.write('='*70)