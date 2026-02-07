from typing import Optional
from django.utils import timezone

from accounts.models import User, TherapistProfile
from surveys.models import Survey, Response
from matching.models import PatientMatchProfile, TherapistMatchProfile
from matching.services.text_processor import TextProcessor


class ProfileBuilder:
    """
    Builds match profiles from user data.
    """
    
    def __init__(self):
        self.text_processor = TextProcessor()
    
    def build_patient_profile(self, patient: User) -> PatientMatchProfile:
        """
        Build patient match profile from latest survey.
        """
        # Get latest completed survey
        try:
            survey = Survey.objects.filter(
                patient=patient,
                status='completed'
            ).latest('completed_at')
        except Survey.DoesNotExist:
            raise ValueError("Patient has no completed survey")
        
        # Get all responses
        responses = Response.objects.filter(survey=survey).select_related('question')
        
        # Build text representation
        response_texts = []
        presenting_issues = []
        preferred_languages = []
        preferred_approach = None
        consultation_pref = None
        
        for response in responses:
            question_text = response.question.question_text.lower()
            answer = response.answer
            
            # Add to general text
            response_texts.append(f"{response.question.question_text} {answer}")
            
            # Extract specific preferences
            if 'issue' in question_text or 'problem' in question_text or 'concern' in question_text:
                if isinstance(answer, str):
                    presenting_issues.extend([item.strip() for item in answer.split(',')])
            
            if 'language' in question_text:
                if isinstance(answer, str):
                    preferred_languages.extend([lang.strip() for lang in answer.split(',')])
            
            if 'approach' in question_text or 'style' in question_text:
                preferred_approach = answer
            
            if 'consultation' in question_text or 'session' in question_text:
                if 'online' in answer.lower():
                    consultation_pref = 'online'
                elif 'offline' in answer.lower() or 'person' in answer.lower():
                    consultation_pref = 'offline'
                elif 'both' in answer.lower():
                    consultation_pref = 'both'
        
        # Build combined text
        needs_text = self.text_processor.clean_text(' '.join(response_texts))
        
        # Create or update profile
        profile, created = PatientMatchProfile.objects.update_or_create(
            patient=patient,
            survey=survey,
            defaults={
                'needs_text': needs_text,
                'presenting_issues': presenting_issues if presenting_issues else None,
                'preferred_therapy_approach': preferred_approach,
                'preferred_languages': preferred_languages if preferred_languages else None,
                'consultation_preference': consultation_pref,
            }
        )
        
        return profile
    
    def build_therapist_profile(
        self, 
        therapist_profile: TherapistProfile,
        force_rebuild: bool = False
    ) -> TherapistMatchProfile:
        """
        Build therapist match profile from profile data and blogs.
        """
        # Check if profile exists and is recent
        try:
            match_profile = TherapistMatchProfile.objects.get(
                therapist=therapist_profile
            )
            if not force_rebuild:
                # Only rebuild if profile updated or new blogs
                if match_profile.updated_at >= therapist_profile.updated_at:
                    return match_profile
        except TherapistMatchProfile.DoesNotExist:
            match_profile = None
        
        # Get blogs if blog app exists
        blogs = []
        try:
            from blogs.models import BlogPost  # Assuming you'll have a blog app
            blogs = BlogPost.objects.filter(
                author=therapist_profile.user,
                status='published'
            )[:5]  # Latest 5 blogs
        except ImportError:
            pass
        
        # Build text representation
        profile_text = self.text_processor.build_therapist_text(
            therapist_profile,
            blogs
        )
        
        # Clean text
        profile_text = self.text_processor.clean_text(profile_text)
        
        # Extract blog themes (simple keyword extraction)
        blog_themes = []
        if blogs:
            all_blog_text = ' '.join([blog.content for blog in blogs])
            blog_themes = self.text_processor.extract_keywords(all_blog_text, top_n=15)
        
        # Create or update profile
        if match_profile:
            match_profile.profile_text = profile_text
            match_profile.blog_themes = blog_themes if blog_themes else None
            match_profile.last_blog_processed = timezone.now()
            match_profile.save()
        else:
            match_profile = TherapistMatchProfile.objects.create(
                therapist=therapist_profile,
                profile_text=profile_text,
                blog_themes=blog_themes if blog_themes else None,
                last_blog_processed=timezone.now()
            )
        
        return match_profile
    
    def rebuild_all_therapist_profiles(self):
        """
        Rebuild all therapist match profiles.
        Useful for batch updates or algorithm improvements.
        """
        therapists = TherapistProfile.objects.filter(
            profile_completed=True,
            is_verified=True
        )
        
        count = 0
        for therapist in therapists:
            self.build_therapist_profile(therapist, force_rebuild=True)
            count += 1
        
        return count