"""
Therapist Quality Scorer
Rates therapist quality based on existing profile data (no DB changes)
"""

import logging
from typing import Optional
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class TherapistQualityScorer:
    """
    Score therapist quality from existing TherapistProfile data
    
    Uses:
    - profession_type (Psychologist, Psychiatrist, etc.)
    - years_of_experience
    - is_verified status
    - license_id presence
    - blog activity (post count and recency)
    - specialization_tags count
    
    No ML needed, no database changes required.
    """
    
    # Profession type base scores
    PROFESSION_SCORES = {
        'psychologist': 0.90,
        'psychiatrist': 0.92,
        'counselor': 0.70,
        'social_worker': 0.75,
        'therapist': 0.65,
        'other': 0.50,
    }
    
    def calculate_quality_score(self, therapist_user) -> float:
        """
        Calculate overall quality score for a therapist (0-1)
        
        Factors:
        - Profession type (0-0.30 weight)
        - Years of experience (0-0.25 weight)
        - Verification status (0-0.15 weight)
        - Blog activity (0-0.15 weight)
        - Specialization depth (0-0.15 weight)
        
        Args:
            therapist_user: User object with therapist_profile relation
        
        Returns:
            Quality score between 0.0 and 1.0
        """
        
        profile = getattr(therapist_user, 'therapist_profile', None)
        
        if not profile:
            return 0.3  # Default for incomplete profile
        
        score = 0.2  # Baseline score
        
        # 1. Profession Type Score (0-0.30)
        profession_score = self._get_profession_score(profile.profession_type)
        score += profession_score * 0.30
        
        # 2. Experience Score (0-0.25)
        experience_score = self._get_experience_score(profile.years_of_experience)
        score += experience_score * 0.25
        
        # 3. Verification Score (0-0.15)
        verification_score = self._get_verification_score(profile)
        score += verification_score * 0.15
        
        # 4. Blog Activity Score (0-0.15)
        blog_activity_score = self._get_blog_activity_score(therapist_user)
        score += blog_activity_score * 0.15
        
        # 5. Specialization Depth Score (0-0.15)
        specialization_score = self._get_specialization_score(profile.specialization_tags)
        score += specialization_score * 0.15
        
        # Cap at 1.0
        return min(1.0, score)
    
    def get_quality_boosted_l3_score(
        self, 
        therapist_user, 
        base_l3_score: float
    ) -> float:
        """
        Boost L3 (collaborative filtering) score with quality score
        
        Strategy:
        - If therapist has no match history (L3 = 0.5), use quality score
        - If therapist has history, blend 80% history + 20% quality
        
        Args:
            therapist_user: User object with therapist_profile
            base_l3_score: Base L3 score from collaborative filtering (0-1)
        
        Returns:
            Boosted L3 score (0-1)
        """
        
        quality_score = self.calculate_quality_score(therapist_user)
        
        # If therapist has no match history
        if base_l3_score == 0.5:
            # Use quality score as L3 proxy
            return quality_score
        
        # If therapist has match history, blend
        # More weight on history (80%) than quality (20%)
        # because history is more reliable
        return 0.8 * base_l3_score + 0.2 * quality_score
    
    def _get_profession_score(self, profession_type: Optional[str]) -> float:
        """
        Get score based on profession type
        
        Args:
            profession_type: Value from TherapistProfile.profession_type
        
        Returns:
            Score between 0.0 and 1.0
        """
        if not profession_type:
            return 0.5
        
        return self.PROFESSION_SCORES.get(profession_type.lower(), 0.5)
    
    def _get_experience_score(self, years_of_experience: Optional[int]) -> float:
        """
        Get score based on years of experience
        
        Scoring:
        - 0 years: 0.1
        - 1-2 years: 0.25
        - 2-5 years: 0.50
        - 5-10 years: 0.75
        - 10+ years: 1.0
        
        Args:
            years_of_experience: Years of experience from TherapistProfile
        
        Returns:
            Score between 0.0 and 1.0
        """
        
        if not years_of_experience:
            return 0.1
        
        years = int(years_of_experience)
        
        if years <= 0:
            return 0.1
        elif years < 2:
            return 0.25
        elif years < 5:
            return 0.50
        elif years < 10:
            return 0.75
        else:  # 10+ years
            return 1.0
    
    def _get_verification_score(self, profile) -> float:
        """
        Get score based on verification status
        
        Factors:
        - is_verified: +0.50
        - license_id exists: +0.30
        - verified_at within last 2 years: +0.20
        
        Args:
            profile: TherapistProfile instance
        
        Returns:
            Score between 0.0 and 1.0
        """
        
        score = 0.0
        
        # Verification status (most important)
        if profile.is_verified:
            score += 0.50
        
        # License ID exists
        if profile.license_id:
            score += 0.30
        
        # Verification recency
        if profile.verified_at:
            days_since_verification = (timezone.now() - profile.verified_at).days
            
            if days_since_verification < 365:  # Within 1 year
                score += 0.20
            elif days_since_verification < 730:  # Within 2 years
                score += 0.10
        
        return min(1.0, score)
    
    def _get_blog_activity_score(self, therapist_user) -> float:
        """
        Get score based on blog activity
        
        Factors:
        - Post count (5=0.3, 10=0.6, 20+=1.0)
        - Recency (<30 days=1.0, <90 days=0.8, <180 days=0.5, etc.)
        
        Args:
            therapist_user: User object with blog_posts relation
        
        Returns:
            Score between 0.0 and 1.0
        """
        
        try:
            blogs = therapist_user.blog_posts.filter(status='published')
            
            if not blogs.exists():
                return 0.0  # No blogs
            
            blog_count = blogs.count()
            
            # Post count score
            if blog_count >= 20:
                post_score = 1.0
            elif blog_count >= 10:
                post_score = 0.6
            elif blog_count >= 5:
                post_score = 0.3
            else:
                post_score = 0.1
            
            # Recency score
            latest_blog = blogs.order_by('-published_at').first()
            
            if not latest_blog:
                return 0.0
            
            days_since_post = (timezone.now() - latest_blog.published_at).days
            
            if days_since_post < 30:
                recency_score = 1.0  # Very active
            elif days_since_post < 90:
                recency_score = 0.8
            elif days_since_post < 180:
                recency_score = 0.5
            elif days_since_post < 365:
                recency_score = 0.3
            else:
                recency_score = 0.1  # Inactive
            
            # Combine: weight recency more (60%) than count (40%)
            return (post_score * 0.4) + (recency_score * 0.6)
        
        except Exception as e:
            logger.warning(f"Error calculating blog activity score: {e}")
            return 0.0
    
    def _get_specialization_score(self, specialization_tags) -> float:
        """
        Get score based on specialization depth
        
        More specializations = higher score
        1 tag: 0.2, 3 tags: 0.5, 5+ tags: 1.0
        
        Args:
            specialization_tags: List from TherapistProfile.specialization_tags
        
        Returns:
            Score between 0.0 and 1.0
        """
        
        if not specialization_tags:
            return 0.0
        
        try:
            # Handle JSON field (could be list or None)
            if isinstance(specialization_tags, list):
                tag_count = len(specialization_tags)
            else:
                tag_count = 0
            
            if tag_count == 0:
                return 0.0
            elif tag_count == 1:
                return 0.2
            elif tag_count == 2:
                return 0.4
            elif tag_count == 3:
                return 0.5
            elif tag_count == 4:
                return 0.7
            else:  # 5+
                return 1.0
        
        except Exception as e:
            logger.warning(f"Error calculating specialization score: {e}")
            return 0.0
    
    def get_quality_details(self, therapist_user) -> dict:
        """
        Get detailed breakdown of quality score components
        
        Useful for debugging and transparency
        
        Args:
            therapist_user: User object with therapist_profile
        
        Returns:
            Dictionary with score breakdown
        """
        
        profile = getattr(therapist_user, 'therapist_profile', None)
        
        if not profile:
            return {
                'overall_score': 0.3,
                'components': {},
                'reason': 'No therapist profile found'
            }
        
        profession_score = self._get_profession_score(profile.profession_type)
        experience_score = self._get_experience_score(profile.years_of_experience)
        verification_score = self._get_verification_score(profile)
        blog_activity_score = self._get_blog_activity_score(therapist_user)
        specialization_score = self._get_specialization_score(profile.specialization_tags)
        
        overall = self.calculate_quality_score(therapist_user)
        
        return {
            'overall_score': round(overall, 3),
            'components': {
                'profession': {
                    'score': round(profession_score, 3),
                    'weight': 0.30,
                    'value': profile.profession_type or 'Not specified'
                },
                'experience': {
                    'score': round(experience_score, 3),
                    'weight': 0.25,
                    'value': f'{profile.years_of_experience} years' if profile.years_of_experience else 'Not specified'
                },
                'verification': {
                    'score': round(verification_score, 3),
                    'weight': 0.15,
                    'verified': profile.is_verified,
                    'license_id': bool(profile.license_id)
                },
                'blog_activity': {
                    'score': round(blog_activity_score, 3),
                    'weight': 0.15,
                    'blog_count': therapist_user.blog_posts.filter(status='published').count()
                },
                'specialization': {
                    'score': round(specialization_score, 3),
                    'weight': 0.15,
                    'tag_count': len(profile.specialization_tags) if profile.specialization_tags else 0
                }
            }
        }