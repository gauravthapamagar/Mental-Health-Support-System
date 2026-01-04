from django.core.management.base import BaseCommand
from surveys.models import Question


class Command(BaseCommand):
    help = 'Initialize static survey questions'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating static survey questions...')
        
        questions_data = [
            {
                'order': 1,
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
            {
                'order': 2,
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
            {
                'order': 3,
                'question_text': 'How is your sleep lately? (falling asleep, staying asleep, waking up)',
                'response_type': 'single_choice',
                'options': [
                    'Very poor - severe insomnia or sleeping too much',
                    'Poor - frequently disrupted or unsatisfying',
                    'Fair - some difficulties but getting by',
                    'Good - mostly restful with minor issues',
                    'Excellent - sleeping well and feeling rested'
                ]
            },
            {
                'order': 4,
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
            {
                'order': 5,
                'question_text': 'How is your appetite and eating pattern these days?',
                'response_type': 'single_choice',
                'options': [
                    'Severely changed - eating much more or much less',
                    'Noticeably changed - definite shifts in appetite',
                    'Somewhat different - minor changes',
                    'Normal - eating as usual',
                    'Healthy - good relationship with food'
                ]
            },
            {
                'order': 6,
                'question_text': 'How are your relationships with friends, family, or people close to you feeling right now?',
                'response_type': 'single_choice',
                'options': [
                    'Very strained - conflict or isolation',
                    'Difficult - some tension or withdrawal',
                    'Mixed - some good, some challenging',
                    'Generally good - feeling connected',
                    'Strong - supportive and fulfilling'
                ]
            },
            {
                'order': 7,
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
            {
                'order': 8,
                'question_text': 'What feels most challenging for you at the moment?',
                'response_type': 'text',
                'options': None
            },
            {
                'order': 9,
                'question_text': 'What are some things that have been helping you cope recently, even a little?',
                'response_type': 'text',
                'options': None
            },
            {
                'order': 10,
                'question_text': 'What would you most like support with right now?',
                'response_type': 'text',
                'options': None
            }
        ]
        
        created_count = 0
        for q_data in questions_data:
            question, created = Question.objects.get_or_create(
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
                self.stdout.write(self.style.SUCCESS(f'Created: {question.question_text[:50]}...'))
            else:
                self.stdout.write(f'Already exists: {question.question_text[:50]}...')
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created {created_count} new questions'))
        self.stdout.write(f'Total static questions: {Question.objects.filter(question_type="static").count()}')