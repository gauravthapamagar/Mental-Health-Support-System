from typing import List, Dict, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from django.utils import timezone
from datetime import datetime

from accounts.models import TherapistProfile, User
from matching.models import (
    PatientMatchProfile,
    TherapistMatchProfile,
    TherapistMatch,
    MatchingLog
)
from matching.services.text_processor import TextProcessor


class MatchingEngine:
    """
    Core matching algorithm using TF-IDF and Cosine Similarity.
    """
    
    def __init__(self):
        self.text_processor = TextProcessor()
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            stop_words='english',
            ngram_range=(1, 2),  # Consider single words and bigrams
            min_df=1,
            max_df=0.8
        )
    
    def generate_matches(
        self, 
        patient: User, 
        top_n: int = 10
    ) -> List[TherapistMatch]:
        """
        Main method to generate therapist matches for a patient.
        """
        start_time = datetime.now()
        
        # Get patient's match profile
        try:
            patient_profile = PatientMatchProfile.objects.get(patient=patient)
        except PatientMatchProfile.DoesNotExist:
            raise ValueError("Patient must complete survey before matching")
        
        # Step 1: Apply hard filters
        eligible_therapists = self._apply_hard_filters(patient_profile)
        
        if not eligible_therapists:
            return []
        
        # Step 2: Get or create therapist match profiles
        therapist_profiles = []
        for therapist in eligible_therapists:
            profile, created = TherapistMatchProfile.objects.get_or_create(
                therapist=therapist
            )
            therapist_profiles.append(profile)
        
        # Step 3: Calculate similarity scores
        matches_data = self._calculate_similarities(
            patient_profile,
            therapist_profiles
        )
        
        # Step 4: Apply weighted scoring
        final_matches = self._apply_weighted_scoring(matches_data)
        
        # Step 5: Generate explanations and save matches
        saved_matches = self._save_matches(
            patient,
            final_matches[:top_n]
        )
        
        # Log the matching request
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds() * 1000
        
        self._log_matching_request(
            patient=patient,
            eligible_count=len(eligible_therapists),
            matches_count=len(saved_matches),
            processing_time=processing_time,
            filters=self._get_applied_filters(patient_profile)
        )
        
        return saved_matches
    
    def _apply_hard_filters(
        self, 
        patient_profile: PatientMatchProfile
    ) -> List[TherapistProfile]:
        """
        Apply rule-based filters to get eligible therapists.
        """
        # Start with all completed, verified profiles
        queryset = TherapistProfile.objects.filter(
            profile_completed=True,
            is_verified=True
        )
        
        # Filter by language if specified
        if patient_profile.preferred_languages:
            # At least one language must match
            queryset = queryset.filter(
                languages_spoken__overlap=patient_profile.preferred_languages
            )
        
        # Filter by consultation mode if specified
        if patient_profile.consultation_preference:
            pref = patient_profile.consultation_preference
            if pref in ['online', 'offline']:
                queryset = queryset.filter(
                    consultation_mode__in=[pref, 'both']
                )
        
        return list(queryset)
    
    def _calculate_similarities(
        self,
        patient_profile: PatientMatchProfile,
        therapist_profiles: List[TherapistMatchProfile]
    ) -> List[Dict]:
        """
        Calculate TF-IDF cosine similarity between patient and therapists.
        """
        # Prepare documents
        documents = [patient_profile.needs_text]
        documents.extend([tp.profile_text for tp in therapist_profiles])
        
        # Generate TF-IDF vectors
        try:
            tfidf_matrix = self.vectorizer.fit_transform(documents)
        except Exception as e:
            print(f"Error in vectorization: {e}")
            return []
        
        # Patient vector is the first one
        patient_vector = tfidf_matrix[0:1]
        
        # Therapist vectors are the rest
        therapist_vectors = tfidf_matrix[1:]
        
        # Calculate cosine similarities
        similarities = cosine_similarity(patient_vector, therapist_vectors)[0]
        
        # Combine with therapist data
        matches_data = []
        for idx, therapist_profile in enumerate(therapist_profiles):
            matches_data.append({
                'therapist_profile': therapist_profile,
                'similarity_score': float(similarities[idx]),
                'therapist': therapist_profile.therapist
            })
        
        return matches_data
    
    def _calculate_specialty_match(
        self,
        patient_issues: List[str],
        therapist_specializations: List[str]
    ) -> float:
        """
        Calculate how well therapist specializations match patient issues.
        """
        if not patient_issues or not therapist_specializations:
            return 0.0
        
        # Convert to lowercase for comparison
        patient_issues_lower = [issue.lower() for issue in patient_issues]
        therapist_spec_lower = [spec.lower() for spec in therapist_specializations]
        
        # Count matches
        matches = 0
        for issue in patient_issues_lower:
            for spec in therapist_spec_lower:
                if issue in spec or spec in issue:
                    matches += 1
                    break
        
        # Normalize by number of patient issues
        return matches / len(patient_issues) if patient_issues else 0.0
    
    def _apply_weighted_scoring(
        self,
        matches_data: List[Dict]
    ) -> List[Dict]:
        """
        Apply weighted combination of different scores.
        """
        for match in matches_data:
            therapist = match['therapist']
            
            # Calculate specialty match score
            specialty_score = self._calculate_specialty_match(
                patient_issues=match.get('patient_issues', []),
                therapist_specializations=therapist.specialization_tags or []
            )
            
            match['specialty_match_score'] = specialty_score
            
            # Weighted final score
            # 60% TF-IDF similarity, 40% specialty match
            final_score = (
                0.6 * match['similarity_score'] +
                0.4 * specialty_score
            )
            
            match['final_score'] = final_score
        
        # Sort by final score
        matches_data.sort(key=lambda x: x['final_score'], reverse=True)
        
        return matches_data
    
    def _generate_explanation(
        self,
        match_data: Dict,
        patient_profile: PatientMatchProfile
    ) -> str:
        """
        Generate human-readable explanation for the match.
        """
        therapist = match_data['therapist']
        reasons = []
        
        # Specialization match
        if match_data['specialty_match_score'] > 0.3:
            specializations = ', '.join(therapist.specialization_tags[:3])
            reasons.append(
                f"Specializes in {specializations} which aligns with your needs"
            )
        
        # Experience
        if therapist.years_of_experience and therapist.years_of_experience >= 5:
            reasons.append(
                f"Has {therapist.years_of_experience} years of experience"
            )
        
        # Consultation mode
        if therapist.consultation_mode == 'both':
            reasons.append("Offers both online and offline consultations")
        elif therapist.consultation_mode:
            reasons.append(f"Provides {therapist.consultation_mode} consultations")
        
        # Language match
        if patient_profile.preferred_languages and therapist.languages_spoken:
            common_langs = set(patient_profile.preferred_languages) & set(therapist.languages_spoken)
            if common_langs:
                reasons.append(f"Speaks {', '.join(common_langs)}")
        
        # Overall match quality
        if match_data['similarity_score'] > 0.7:
            reasons.append("Strong overall compatibility based on your responses")
        
        if not reasons:
            reasons.append("Good general match based on your survey responses")
        
        return ". ".join(reasons) + "."
    
    def _save_matches(
        self,
        patient: User,
        matches_data: List[Dict]
    ) -> List[TherapistMatch]:
        """
        Save matches to database.
        """
        # Delete old matches for this patient
        TherapistMatch.objects.filter(patient=patient).delete()
        
        saved_matches = []
        patient_profile = PatientMatchProfile.objects.get(patient=patient)
        
        for rank, match_data in enumerate(matches_data, start=1):
            explanation = self._generate_explanation(match_data, patient_profile)
            
            match = TherapistMatch.objects.create(
                patient=patient,
                therapist=match_data['therapist'],
                similarity_score=match_data['similarity_score'],
                specialty_match_score=match_data.get('specialty_match_score', 0.0),
                final_score=match_data['final_score'],
                match_reasoning=explanation,
                rank=rank
            )
            saved_matches.append(match)
        
        return saved_matches
    
    def _log_matching_request(
        self,
        patient: User,
        eligible_count: int,
        matches_count: int,
        processing_time: float,
        filters: Dict
    ):
        """
        Log matching request for analytics.
        """
        MatchingLog.objects.create(
            patient=patient,
            eligible_therapists_count=eligible_count,
            matches_generated=matches_count,
            processing_time_ms=int(processing_time),
            filters_applied=filters
        )
    
    def _get_applied_filters(self, patient_profile: PatientMatchProfile) -> Dict:
        """
        Get dictionary of applied filters for logging.
        """
        return {
            'languages': patient_profile.preferred_languages,
            'consultation_mode': patient_profile.consultation_preference,
        }