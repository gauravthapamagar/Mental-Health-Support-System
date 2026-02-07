from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyQuestion, SurveyQuestionOption, SurveyResponse, SurveyAnswer


class Command(BaseCommand):
    help = 'Clean up old survey data from the database'

    def handle(self, *args, **options):
        # Delete old surveys (PHQ-9, GAD-7, etc.) - keep only Therapist Matching Assessment
        surveys_to_delete = Survey.objects.exclude(
            title='Therapist Matching Assessment'
        )
        
        count = surveys_to_delete.count()
        if count > 0:
            surveys_to_delete.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully deleted {count} old survey(s)')
            )
        else:
            self.stdout.write(
                self.style.WARNING('No old surveys found to delete')
            )
        
        # Verify Therapist Matching Assessment exists
        therapist_assessment = Survey.objects.filter(
            title='Therapist Matching Assessment'
        ).first()
        
        if therapist_assessment:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Therapist Matching Assessment is active with '
                    f'{therapist_assessment.questions.count()} questions'
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    'Warning: Therapist Matching Assessment not found. '
                    'Please run create_therapist_matching_survey command.'
                )
            )
