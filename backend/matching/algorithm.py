# """
# 3-Layer Therapist Matching Algorithm

# Layer 1: Hard Rules (Non-negotiable)
# - Gender preference
# - Consultation mode (online/offline)
# - Language requirements

# Layer 2: AI Semantic Matching
# - Survey responses vs therapist bio
# - Survey responses vs blog content
# - Specialization tag matching

# Layer 3: Collaborative Filtering
# - Learn from past successful matches
# - Similar patient patterns
# """
# from django.contrib.auth import get_user_model
# from django.db.models import Q, Count
# from surveys.models import SurveyResponse, SurveyAnswer
# from blogs.models import BlogPost
# from accounts.models import TherapistProfile
# import numpy as np
# from typing import List, Dict, Tuple, Optional, TYPE_CHECKING
# import logging

# logger = logging.getLogger(__name__)

# if TYPE_CHECKING:
#     from django.contrib.auth.models import AbstractBaseUser
#     User = AbstractBaseUser
# else:
#     User = get_user_model()

# # Sentence Transformers for semantic matching
# try:
#     from sentence_transformers import SentenceTransformer
#     from sklearn.metrics.pairwise import cosine_similarity
#     EMBEDDINGS_AVAILABLE = True
# except ImportError:
#     EMBEDDINGS_AVAILABLE = False
#     print("Warning: sentence-transformers not installed. Install with: pip install sentence-transformers scikit-learn")

# User = get_user_model()

# # Load model once at module level for efficiency
# _EMBEDDING_MODEL = None

# def get_embedding_model():
#     """Lazy load the embedding model"""
#     global _EMBEDDING_MODEL
#     if _EMBEDDING_MODEL is None and EMBEDDINGS_AVAILABLE:
#         _EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
#     return _EMBEDDING_MODEL


# class TherapistMatcher:
#     """
#     Main class for matching patients with therapists using 3-layer approach
#     """
    
#     # Weights for each layer
#     WEIGHTS = {
#         'layer1_hard_rules': 0.0,  # Pass/Fail, not weighted
#         'layer2_semantic': 0.60,    # AI matching
#         'layer3_collaborative': 0.15,  # Past matches
#         'specialization': 0.25,     # Direct tag matching
#     }
    
#     def __init__(self, survey_response: SurveyResponse):
#         self.survey_response = survey_response
#         self.patient = survey_response.patient
#         self.answers = self._parse_answers()
#         self.patient_text = self._build_patient_context_text()
#         self.patient_embedding = None
        
#         # Pre-compute patient embedding
#         if EMBEDDINGS_AVAILABLE and self.patient_text:
#             model = get_embedding_model()
#             if model:
#                 self.patient_embedding = model.encode([self.patient_text])[0]
    
#     def _parse_answers(self) -> Dict:
#         """Parse survey answers into a structured format"""
#         answers_dict = {}
#         for answer in self.survey_response.answers.select_related('question', 'answer_option').all():
#             question = answer.question
#             answers_dict[question.id] = {
#                 'question_text': question.question_text,
#                 'question_type': question.question_type,
#                 'answer_text': answer.answer_text or '',
#                 'answer_option_id': answer.answer_option_id,
#                 'answer_option_text': answer.answer_option.option_text if answer.answer_option else '',
#                 'answer_rating': answer.answer_rating,
#                 'answer_yes_no': answer.answer_yes_no,
#             }
#         return answers_dict
    
#     def _build_patient_context_text(self) -> str:
#         """Build a combined text from all patient answers for embedding"""
#         text_parts = []
        
#         for qid, answer in self.answers.items():
#             # Add question context
#             q_text = answer.get('question_text', '')
            
#             # Add the answer
#             if answer.get('answer_text'):
#                 text_parts.append(f"{q_text}: {answer['answer_text']}")
#             elif answer.get('answer_option_text'):
#                 text_parts.append(f"{q_text}: {answer['answer_option_text']}")
#             elif answer.get('answer_rating') is not None:
#                 text_parts.append(f"{q_text}: rating {answer['answer_rating']}")
        
#         return ' '.join(text_parts)
    
#     def find_best_matches(self, top_n: int = 3) -> List[Tuple[User, float, Dict]]:
#         """
#         Find top N matching therapists for the patient
#         Returns list of (therapist, score, score_breakdown) tuples
#         """
#         # Extract hard rule preferences from survey
#         preferences = self._extract_preferences()
#         logger.info(f"[MATCHING] Patient {self.patient.id} preferences: {preferences}")
        
#         # Start with all active therapists
#         available_therapists = User.objects.filter(
#             role='therapist',
#             is_active=True
#         ).select_related('therapist_profile').prefetch_related(
#             'blog_posts'
#         ).exclude(id=self.patient.id)
        
#         matches = []
        
#         for therapist in available_therapists:
#             # Layer 1: Hard Rules (Pass/Fail)
#             layer1_result = self._layer1_hard_rules(therapist, preferences)
            
#             therapist_display = getattr(therapist, 'email', f"ID:{therapist.id}")
#             if not layer1_result['passed']:
#                 logger.info(f"[MATCHING] Therapist {therapist.id} ({therapist_display}) failed hard rules: {layer1_result['failed_rules']}")
#                 continue  # Skip therapists who don't pass hard rules
            
#             logger.info(f"[MATCHING] Therapist {therapist.id} ({therapist_display}) passed hard rules")
            
#             # Layer 2: Semantic Matching
#             layer2_result = self._layer2_semantic_matching(therapist)
            
#             # Layer 3: Collaborative Filtering
#             layer3_result = self._layer3_collaborative_filtering(therapist)
            
#             # Specialization matching
#             spec_score = self._calculate_specialization_match(therapist)
            
#             # Calculate final weighted score
#             final_score = (
#                 self.WEIGHTS['layer2_semantic'] * layer2_result['score'] +
#                 self.WEIGHTS['layer3_collaborative'] * layer3_result['score'] +
#                 self.WEIGHTS['specialization'] * spec_score
#             )
            
#             score_breakdown = {
#                 'layer1_hard_rules': layer1_result,
#                 'layer2_semantic': layer2_result,
#                 'layer3_collaborative': layer3_result,
#                 'specialization_score': spec_score,
#                 'final_score': final_score,
#             }
            
#             matches.append((therapist, final_score, score_breakdown))
        
#         # Sort by final score descending
#         matches.sort(key=lambda x: x[1], reverse=True)
        
#         return matches[:top_n]
    
#     def _extract_preferences(self) -> Dict:
#         """Extract patient's hard preferences from survey answers"""
#         preferences = {
#             'gender': None,
#             'consultation_mode': None,
#             'languages': [],
#         }
        
#         for qid, answer in self.answers.items():
#             q_text = answer.get('question_text', '').lower()
#             option_text = answer.get('answer_option_text', '').lower()
#             answer_text = answer.get('answer_text', '').lower()
            
#             # Gender preference detection - prioritize option_text, then answer_text
#             if any(word in q_text for word in ['gender', 'prefer']) and 'therapist' in q_text:
#                 # Check option_text first (most reliable for multiple choice)
#                 if option_text:
#                     if 'female' in option_text or 'woman' in option_text or 'woman therapist' in option_text:
#                         preferences['gender'] = 'female'
#                     elif 'male' in option_text or 'man' in option_text or 'man therapist' in option_text:
#                         preferences['gender'] = 'male'
#                     elif 'no preference' in option_text or 'either' in option_text or 'any' in option_text or 'no preference' in option_text:
#                         preferences['gender'] = None
#                 # Fall back to answer_text if no option selected
#                 elif answer_text:
#                     if 'female' in answer_text or 'woman' in answer_text:
#                         preferences['gender'] = 'female'
#                     elif 'male' in answer_text or 'man' in answer_text:
#                         preferences['gender'] = 'male'
#                     else:
#                         preferences['gender'] = None
            
#             # Consultation mode detection
#             if any(word in q_text for word in ['session', 'format', 'online', 'in-person', 'virtual']):
#                 if 'online' in option_text or 'virtual' in option_text or 'video' in option_text:
#                     preferences['consultation_mode'] = 'online'
#                 elif 'in-person' in option_text or 'office' in option_text or 'face' in option_text:
#                     preferences['consultation_mode'] = 'offline'
#                 elif 'both' in option_text or 'either' in option_text:
#                     preferences['consultation_mode'] = 'both'
            
#             # Language preference detection
#             if 'language' in q_text:
#                 if answer_text:
#                     preferences['languages'] = [lang.strip() for lang in answer_text.split(',')]
#                 elif option_text:
#                     preferences['languages'] = [option_text]
        
#         return preferences
    
#     def _layer1_hard_rules(self, therapist: User, preferences: Dict) -> Dict:
#         """
#         Layer 1: Check non-negotiable compatibility factors
#         Returns dict with 'passed' boolean and individual rule results
#         """
#         result = {
#             'passed': True,
#             'gender_match': True,
#             'consultation_mode_match': True,
#             'language_match': True,
#             'failed_rules': [],
#         }
        
#         profile = getattr(therapist, 'therapist_profile', None)
        
#         # Gender preference check - MANDATORY if patient specified a preference
#         required_gender = preferences.get('gender')
#         if required_gender:  # Only check if patient has a preference (not None or empty)
#             therapist_gender = (therapist.gender or '').lower().strip()
#             required_gender_lower = required_gender.lower().strip()
            
#             # If therapist gender is empty/missing, they don't pass
#             if not therapist_gender:
#                 result['gender_match'] = False
#                 result['failed_rules'].append('gender')
#             # If genders don't match exactly, they don't pass
#             elif therapist_gender != required_gender_lower:
#                 result['gender_match'] = False
#                 result['failed_rules'].append('gender')
        
#         # Consultation mode check
#         if preferences.get('consultation_mode') and profile:
#             therapist_mode = profile.consultation_mode
#             patient_mode = preferences['consultation_mode']
            
#             if therapist_mode and patient_mode:
#                 # 'both' accepts anything
#                 if therapist_mode != 'both' and patient_mode != 'both':
#                     if therapist_mode != patient_mode:
#                         result['consultation_mode_match'] = False
#                         result['failed_rules'].append('consultation_mode')
        
#         # Language check
#         if preferences.get('languages') and profile:
#             therapist_languages = profile.languages_spoken or []
#             patient_languages = preferences['languages']
            
#             if therapist_languages and patient_languages:
#                 # Check if there's at least one common language
#                 therapist_langs_lower = [l.lower() for l in therapist_languages]
#                 patient_langs_lower = [l.lower() for l in patient_languages]
                
#                 if not set(therapist_langs_lower) & set(patient_langs_lower):
#                     result['language_match'] = False
#                     result['failed_rules'].append('language')
        
#         # Determine if passed (gender is mandatory, others are soft)
#         if not result['gender_match']:
#             result['passed'] = False
        
#         return result
    
#     def _layer2_semantic_matching(self, therapist: User) -> Dict:
#         """
#         Layer 2: AI-powered semantic similarity matching
#         Compares patient's survey responses with therapist's bio and blog content
#         """
#         result = {
#             'score': 0.5,  # Default neutral score
#             'bio_similarity': 0.0,
#             'blog_similarity': 0.0,
#             'matching_topics': [],
#         }
        
#         if not EMBEDDINGS_AVAILABLE or self.patient_embedding is None:
#             return result
        
#         model = get_embedding_model()
#         profile = getattr(therapist, 'therapist_profile', None)
        
#         # Bio similarity
#         if profile and profile.bio:
#             bio_embedding = model.encode([profile.bio])[0]
#             result['bio_similarity'] = float(cosine_similarity(
#                 [self.patient_embedding], [bio_embedding]
#             )[0][0])
        
#         # Blog content similarity
#         blog_posts = list(therapist.blog_posts.filter(status='published'))
#         if blog_posts:
#             blog_texts = []
#             for post in blog_posts:
#                 blog_text = f"{post.title}. {post.excerpt}. {post.content[:1000]}"
#                 blog_texts.append(blog_text)
            
#             blog_embeddings = model.encode(blog_texts)
#             similarities = cosine_similarity([self.patient_embedding], blog_embeddings)[0]
            
#             # Use max similarity (best matching blog)
#             result['blog_similarity'] = float(np.max(similarities))
            
#             # Get top matching topics from blog titles
#             top_indices = np.argsort(similarities)[-3:][::-1]
#             for idx in top_indices:
#                 if similarities[idx] > 0.25:
#                     post = blog_posts[idx]
#                     result['matching_topics'].append({
#                         'title': post.title,
#                         'category': post.category,
#                         'similarity': float(similarities[idx])
#                     })
        
#         # Calculate combined semantic score
#         # Weight bio more if no blogs, and vice versa
#         if result['bio_similarity'] > 0 and result['blog_similarity'] > 0:
#             result['score'] = (result['bio_similarity'] * 0.4 + result['blog_similarity'] * 0.6)
#         elif result['bio_similarity'] > 0:
#             result['score'] = result['bio_similarity']
#         elif result['blog_similarity'] > 0:
#             result['score'] = result['blog_similarity']
        
#         # Normalize to 0-1 and boost mid-range scores
#         result['score'] = min(1.0, max(0.0, result['score'] * 1.3))
        
#         return result
    
#     def _layer3_collaborative_filtering(self, therapist: User) -> Dict:
#         """
#         Layer 3: Learn from past successful matches
#         Looks at how often this therapist appears in top matches for similar patients
#         """
#         from .models import TherapistMatch
        
#         result = {
#             'score': 0.5,  # Default neutral score
#             'match_frequency': 0,
#             'first_choice_rate': 0.0,
#             'similar_patients_matched': 0,
#         }
        
#         # Count how often this therapist appears in matches
#         total_matches = TherapistMatch.objects.filter(
#             Q(top_match_1=therapist) |
#             Q(top_match_2=therapist) |
#             Q(top_match_3=therapist)
#         ).count()
        
#         first_choice_matches = TherapistMatch.objects.filter(
#             top_match_1=therapist
#         ).count()
        
#         result['match_frequency'] = total_matches
        
#         if total_matches > 0:
#             result['first_choice_rate'] = first_choice_matches / total_matches
#             result['similar_patients_matched'] = total_matches
            
#             # Score based on frequency and first-choice rate
#             # More matches and higher first-choice rate = better score
#             frequency_score = min(1.0, total_matches / 20)  # Cap at 20 matches
#             first_choice_score = result['first_choice_rate']
            
#             result['score'] = 0.3 + (frequency_score * 0.3) + (first_choice_score * 0.4)
        
#         return result
    
#     def _calculate_specialization_match(self, therapist: User) -> float:
#         """
#         Direct tag matching between patient issues and therapist specializations
#         """
#         profile = getattr(therapist, 'therapist_profile', None)
#         if not profile or not profile.specialization_tags:
#             return 0.3  # Base score for therapists without tags
        
#         therapist_tags = [tag.lower() for tag in profile.specialization_tags]
#         patient_issues = self._extract_patient_issues()
        
#         if not patient_issues:
#             return 0.5
        
#         # Count matches
#         matches = 0
#         for issue in patient_issues:
#             issue_lower = issue.lower()
#             for tag in therapist_tags:
#                 if issue_lower in tag or tag in issue_lower:
#                     matches += 1
#                     break
        
#         # Calculate match percentage
#         max_possible = max(len(patient_issues), len(therapist_tags))
#         score = matches / max_possible if max_possible > 0 else 0.5
        
#         return min(1.0, score * 1.2)  # Slight boost
    
#     def _extract_patient_issues(self) -> List[str]:
#         """Extract patient's main issues/concerns from survey"""
#         issues = []
        
#         # Keywords that indicate issue-related questions
#         issue_keywords = ['struggle', 'concern', 'help', 'issue', 'problem', 'reason', 
#                          'experiencing', 'feeling', 'symptom', 'challenge', 'difficult']
        
#         for qid, answer in self.answers.items():
#             q_text = answer.get('question_text', '').lower()
            
#             # Check if this is an issue-related question
#             if any(keyword in q_text for keyword in issue_keywords):
#                 if answer.get('answer_option_text'):
#                     issues.append(answer['answer_option_text'])
#                 elif answer.get('answer_text'):
#                     issues.append(answer['answer_text'])
        
#         # Also extract from mapped keywords
#         issue_mapping = {
#             'anxiety': ['anxiety', 'anxious', 'worried', 'panic', 'nervous'],
#             'depression': ['depression', 'depressed', 'sad', 'hopeless', 'low mood'],
#             'trauma': ['trauma', 'ptsd', 'abuse', 'accident', 'violence'],
#             'stress': ['stress', 'overwhelmed', 'burnout', 'pressure'],
#             'relationship': ['relationship', 'partner', 'marriage', 'divorce', 'dating'],
#             'grief': ['grief', 'loss', 'death', 'bereavement', 'mourning'],
#             'self-esteem': ['self-esteem', 'confidence', 'self-worth', 'insecurity'],
#             'anger': ['anger', 'rage', 'irritable', 'frustration'],
#             'addiction': ['addiction', 'substance', 'alcohol', 'drugs', 'gambling'],
#             'eating': ['eating', 'food', 'weight', 'body image', 'anorexia', 'bulimia'],
#             'sleep': ['sleep', 'insomnia', 'nightmare', 'tired'],
#             'ocd': ['ocd', 'obsessive', 'compulsive', 'intrusive thoughts'],
#         }
        
#         # Check all answers for mapped issues
#         all_text = ' '.join([
#             f"{a.get('answer_text', '')} {a.get('answer_option_text', '')}"
#             for a in self.answers.values()
#         ]).lower()
        
#         for issue, keywords in issue_mapping.items():
#             if any(keyword in all_text for keyword in keywords):
#                 if issue not in [i.lower() for i in issues]:
#                     issues.append(issue)
        
#         return issues
    
#     def generate_match_reasons(self, therapist: User, score_breakdown: Dict) -> List[str]:
#         """Generate human-readable reasons for the match"""
#         reasons = []
#         profile = getattr(therapist, 'therapist_profile', None)
        
#         # Specialization-based reasons
#         if profile and profile.specialization_tags:
#             patient_issues = self._extract_patient_issues()
#             for tag in profile.specialization_tags[:2]:
#                 for issue in patient_issues:
#                     if issue.lower() in tag.lower() or tag.lower() in issue.lower():
#                         reasons.append(f"Specializes in {tag}")
#                         break
        
#         # Semantic matching reasons
#         layer2 = score_breakdown.get('layer2_semantic', {})
#         if layer2.get('matching_topics'):
#             top_topic = layer2['matching_topics'][0]
#             reasons.append(f"Writes about topics relevant to your concerns")
        
#         if layer2.get('bio_similarity', 0) > 0.4:
#             reasons.append("Their approach aligns with your needs")
        
#         # Experience-based reasons
#         if profile and profile.years_of_experience:
#             if profile.years_of_experience >= 10:
#                 reasons.append(f"{profile.years_of_experience}+ years of experience")
#             elif profile.years_of_experience >= 5:
#                 reasons.append("Experienced practitioner")
        
#         # Collaborative filtering reasons
#         layer3 = score_breakdown.get('layer3_collaborative', {})
#         if layer3.get('first_choice_rate', 0) > 0.5:
#             reasons.append("Highly recommended by similar patients")
#         elif layer3.get('match_frequency', 0) > 5:
#             reasons.append("Successfully matched with many patients")
        
#         # Consultation mode
#         if profile and profile.consultation_mode:
#             if profile.consultation_mode == 'both':
#                 reasons.append("Offers both online and in-person sessions")
#             elif profile.consultation_mode == 'online':
#                 reasons.append("Offers online sessions")
        
#         return reasons[:5]  # Return top 5 reasons



"""
3-Layer Therapist Matching Algorithm - IMPROVED VERSION

Layer 1: Hard Rules (Non-negotiable)
- Gender preference
- Consultation mode (online/offline)
- Language requirements

Layer 2: AI Semantic Matching (IMPROVED)
- Survey responses vs therapist bio (full content)
- Survey responses vs blog content (full extraction)
- Specialization tag matching (with synonyms)

Layer 3: Collaborative Filtering (IMPROVED with quality boost)
- Learn from past successful matches
- Boosted with therapist quality score

NO DATABASE CHANGES - Works with existing models
"""

from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from surveys.models import SurveyResponse, SurveyAnswer
from blogs.models import BlogPost
from accounts.models import TherapistProfile
import numpy as np
from typing import List, Dict, Tuple, Optional, TYPE_CHECKING
import logging

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractBaseUser
    User = AbstractBaseUser
else:
    User = get_user_model()

# Sentence Transformers for semantic matching
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False
    print("Warning: sentence-transformers not installed. Install with: pip install sentence-transformers scikit-learn")

# Import improved matching utilities (NEW)
try:
    from .improved_matching import (
        extract_patient_issues_enhanced,
        calculate_semantic_specialization_match,
        extract_therapeutic_sections,
        calculate_therapist_activity_score,
        calculate_composite_score,
    )
    IMPROVED_MATCHING_AVAILABLE = True
except ImportError:
    IMPROVED_MATCHING_AVAILABLE = False
    logger.warning("improved_matching module not available, falling back to original logic")

# Import quality scorer (NEW)
try:
    from .quality_scorer import TherapistQualityScorer
    QUALITY_SCORER_AVAILABLE = True
except ImportError:
    QUALITY_SCORER_AVAILABLE = False
    logger.warning("quality_scorer module not available, falling back to original L3 logic")

User = get_user_model()

# Load model once at module level for efficiency
_EMBEDDING_MODEL = None

def get_embedding_model():
    """Lazy load the embedding model"""
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None and EMBEDDINGS_AVAILABLE:
        _EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    return _EMBEDDING_MODEL


class TherapistMatcher:
    """
    Main class for matching patients with therapists using 3-layer approach
    
    IMPROVEMENTS:
    - Better semantic matching with full blog content extraction
    - Semantic specialization matching with synonyms
    - Quality-boosted L3 score
    - Composite scoring with confidence bonuses
    """
    
    # Weights for each layer
    WEIGHTS = {
        'layer1_hard_rules': 0.0,  # Pass/Fail, not weighted
        'layer2_semantic': 0.60,    # AI matching
        'layer3_collaborative': 0.15,  # Past matches
        'specialization': 0.25,     # Direct tag matching
    }
    
    def __init__(self, survey_response: SurveyResponse):
        self.survey_response = survey_response
        self.patient = survey_response.patient
        self.answers = self._parse_answers()
        self.patient_text = self._build_patient_context_text()
        self.patient_embedding = None
        
        # Pre-compute patient embedding
        if EMBEDDINGS_AVAILABLE and self.patient_text:
            model = get_embedding_model()
            if model:
                self.patient_embedding = model.encode([self.patient_text])[0]
        
        # Initialize quality scorer (NEW)
        if QUALITY_SCORER_AVAILABLE:
            self.quality_scorer = TherapistQualityScorer()
        else:
            self.quality_scorer = None
    
    def _parse_answers(self) -> Dict:
        """Parse survey answers into a structured format"""
        answers_dict = {}
        for answer in self.survey_response.answers.select_related('question', 'answer_option').all():
            question = answer.question
            answers_dict[question.id] = {
                'question_text': question.question_text,
                'question_type': question.question_type,
                'answer_text': answer.answer_text or '',
                'answer_option_id': answer.answer_option_id,
                'answer_option_text': answer.answer_option.option_text if answer.answer_option else '',
                'answer_rating': answer.answer_rating,
                'answer_yes_no': answer.answer_yes_no,
            }
        return answers_dict
    
    def _build_patient_context_text(self) -> str:
        """Build a combined text from all patient answers for embedding"""
        text_parts = []
        
        for qid, answer in self.answers.items():
            # Add question context
            q_text = answer.get('question_text', '')
            
            # Add the answer
            if answer.get('answer_text'):
                text_parts.append(f"{q_text}: {answer['answer_text']}")
            elif answer.get('answer_option_text'):
                text_parts.append(f"{q_text}: {answer['answer_option_text']}")
            elif answer.get('answer_rating') is not None:
                text_parts.append(f"{q_text}: rating {answer['answer_rating']}")
        
        return ' '.join(text_parts)
    
    def find_best_matches(self, top_n: int = 3) -> List[Tuple[User, float, Dict]]:
        """
        Find top N matching therapists for the patient
        Returns list of (therapist, score, score_breakdown) tuples
        
        IMPROVED: Uses enhanced matching logic if available
        """
        # Extract hard rule preferences from survey
        preferences = self._extract_preferences()
        logger.info(f"[MATCHING] Patient {self.patient.id} preferences: {preferences}")
        
        # Start with all active therapists
        available_therapists = User.objects.filter(
            role='therapist',
            is_active=True
        ).select_related('therapist_profile').prefetch_related(
            'blog_posts'
        ).exclude(id=self.patient.id)
        
        matches = []
        
        for therapist in available_therapists:
            # Layer 1: Hard Rules (Pass/Fail)
            layer1_result = self._layer1_hard_rules(therapist, preferences)
            
            therapist_display = getattr(therapist, 'email', f"ID:{therapist.id}")
            if not layer1_result['passed']:
                logger.info(f"[MATCHING] Therapist {therapist.id} ({therapist_display}) failed hard rules: {layer1_result['failed_rules']}")
                continue  # Skip therapists who don't pass hard rules
            
            logger.info(f"[MATCHING] Therapist {therapist.id} ({therapist_display}) passed hard rules")
            
            # Layer 2: Semantic Matching (IMPROVED)
            layer2_result = self._layer2_semantic_matching(therapist)
            
            # Layer 3: Collaborative Filtering (IMPROVED with quality boost)
            layer3_result = self._layer3_collaborative_filtering(therapist)
            
            # Specialization matching (IMPROVED)
            spec_score = self._calculate_specialization_match(therapist)
            
            # Calculate final weighted score (IMPROVED with composite scoring)
            final_score = (
                self.WEIGHTS['layer2_semantic'] * layer2_result['score'] +
                self.WEIGHTS['layer3_collaborative'] * layer3_result['score'] +
                self.WEIGHTS['specialization'] * spec_score
            )
            
            # Apply composite scoring if available (NEW)
            if IMPROVED_MATCHING_AVAILABLE:
                therapist_activity = calculate_therapist_activity_score(therapist)
                survey_completion = len(self.answers) / 20  # Assume ~20 questions
                
                final_score = calculate_composite_score(
                    layer2_score=layer2_result['score'],
                    layer3_score=layer3_result['score'],
                    spec_score=spec_score,
                    therapist_activity=therapist_activity,
                    survey_completion=survey_completion,
                )
                
                layer2_result['therapist_activity'] = therapist_activity
            
            score_breakdown = {
                'layer1_hard_rules': layer1_result,
                'layer2_semantic': layer2_result,
                'layer3_collaborative': layer3_result,
                'specialization_score': spec_score,
                'final_score': final_score,
            }
            
            matches.append((therapist, final_score, score_breakdown))
        
        # Sort by final score descending
        matches.sort(key=lambda x: x[1], reverse=True)
        
        return matches[:top_n]
    
    def _extract_preferences(self) -> Dict:
        """Extract patient's hard preferences from survey answers"""
        preferences = {
            'gender': None,
            'consultation_mode': None,
            'languages': [],
        }
        
        for qid, answer in self.answers.items():
            q_text = answer.get('question_text', '').lower()
            option_text = answer.get('answer_option_text', '').lower()
            answer_text = answer.get('answer_text', '').lower()
            
            # Gender preference detection - prioritize option_text, then answer_text
            if any(word in q_text for word in ['gender', 'prefer']) and 'therapist' in q_text:
                # Check option_text first (most reliable for multiple choice)
                if option_text:
                    if 'female' in option_text or 'woman' in option_text or 'woman therapist' in option_text:
                        preferences['gender'] = 'female'
                    elif 'male' in option_text or 'man' in option_text or 'man therapist' in option_text:
                        preferences['gender'] = 'male'
                    elif 'no preference' in option_text or 'either' in option_text or 'any' in option_text:
                        preferences['gender'] = None
                # Fall back to answer_text if no option selected
                elif answer_text:
                    if 'female' in answer_text or 'woman' in answer_text:
                        preferences['gender'] = 'female'
                    elif 'male' in answer_text or 'man' in answer_text:
                        preferences['gender'] = 'male'
                    else:
                        preferences['gender'] = None
            
            # Consultation mode detection
            if any(word in q_text for word in ['session', 'format', 'online', 'in-person', 'virtual']):
                if 'online' in option_text or 'virtual' in option_text or 'video' in option_text:
                    preferences['consultation_mode'] = 'online'
                elif 'in-person' in option_text or 'office' in option_text or 'face' in option_text:
                    preferences['consultation_mode'] = 'offline'
                elif 'both' in option_text or 'either' in option_text:
                    preferences['consultation_mode'] = 'both'
            
            # Language preference detection
            if 'language' in q_text:
                if answer_text:
                    preferences['languages'] = [lang.strip() for lang in answer_text.split(',')]
                elif option_text:
                    preferences['languages'] = [option_text]
        
        return preferences
    
    def _layer1_hard_rules(self, therapist: User, preferences: Dict) -> Dict:
        """
        Layer 1: Check non-negotiable compatibility factors
        Returns dict with 'passed' boolean and individual rule results
        """
        result = {
            'passed': True,
            'gender_match': True,
            'consultation_mode_match': True,
            'language_match': True,
            'failed_rules': [],
        }
        
        profile = getattr(therapist, 'therapist_profile', None)
        
        # Gender preference check - MANDATORY if patient specified a preference
        required_gender = preferences.get('gender')
        if required_gender:  # Only check if patient has a preference (not None or empty)
            therapist_gender = (therapist.gender or '').lower().strip()
            required_gender_lower = required_gender.lower().strip()
            
            # If therapist gender is empty/missing, they don't pass
            if not therapist_gender:
                result['gender_match'] = False
                result['failed_rules'].append('gender')
            # If genders don't match exactly, they don't pass
            elif therapist_gender != required_gender_lower:
                result['gender_match'] = False
                result['failed_rules'].append('gender')
        
        # Consultation mode check
        if preferences.get('consultation_mode') and profile:
            therapist_mode = profile.consultation_mode
            patient_mode = preferences['consultation_mode']
            
            if therapist_mode and patient_mode:
                # 'both' accepts anything
                if therapist_mode != 'both' and patient_mode != 'both':
                    if therapist_mode != patient_mode:
                        result['consultation_mode_match'] = False
                        result['failed_rules'].append('consultation_mode')
        
        # Language check
        if preferences.get('languages') and profile:
            therapist_languages = profile.languages_spoken or []
            patient_languages = preferences['languages']
            
            if therapist_languages and patient_languages:
                # Check if there's at least one common language
                therapist_langs_lower = [l.lower() for l in therapist_languages]
                patient_langs_lower = [l.lower() for l in patient_languages]
                
                if not set(therapist_langs_lower) & set(patient_langs_lower):
                    result['language_match'] = False
                    result['failed_rules'].append('language')
        
        # Determine if passed (gender is mandatory, others are soft)
        if not result['gender_match']:
            result['passed'] = False
        
        return result
    
    def _layer2_semantic_matching(self, therapist: User) -> Dict:
        """
        Layer 2: AI-powered semantic similarity matching
        
        IMPROVED:
        - Uses full blog content (not truncated to 1000 chars)
        - Extracts therapeutic sections intelligently
        - Better handling of semantic content
        """
        result = {
            'score': 0.5,  # Default neutral score
            'bio_similarity': 0.0,
            'blog_similarity': 0.0,
            'matching_topics': [],
        }
        
        if not EMBEDDINGS_AVAILABLE or self.patient_embedding is None:
            return result
        
        model = get_embedding_model()
        profile = getattr(therapist, 'therapist_profile', None)
        
        # Bio similarity
        if profile and profile.bio:
            bio_embedding = model.encode([profile.bio])[0]
            result['bio_similarity'] = float(cosine_similarity(
                [self.patient_embedding], [bio_embedding]
            )[0][0])
        
        # Blog content similarity (IMPROVED)
        blog_posts = list(therapist.blog_posts.filter(status='published'))
        if blog_posts:
            blog_sections = []
            blog_post_references = []  # Keep track of which post each section came from
            
            for post_idx, post in enumerate(blog_posts):
                # IMPROVED: Use full content, not just first 1000 chars
                full_content = f"{post.title}. {post.excerpt}. {post.content}"
                
                # IMPROVED: Extract therapeutic sections only
                if IMPROVED_MATCHING_AVAILABLE:
                    sections = extract_therapeutic_sections(full_content)
                    for section in sections:
                        blog_sections.append(section)
                        blog_post_references.append(post_idx)
                else:
                    # Fallback: use original approach
                    blog_text = f"{post.title}. {post.excerpt}. {post.content[:1000]}"
                    blog_sections.append(blog_text)
                    blog_post_references.append(post_idx)
            
            if blog_sections:
                blog_embeddings = model.encode(blog_sections)
                similarities = cosine_similarity([self.patient_embedding], blog_embeddings)[0]
                
                # Use max similarity (best matching blog section)
                result['blog_similarity'] = float(np.max(similarities))
                
                # Get top matching topics from blog titles
                top_indices = np.argsort(similarities)[-3:][::-1]
                seen_posts = set()
                
                for idx in top_indices:
                    if similarities[idx] > 0.25:
                        post_idx = blog_post_references[idx]
                        if post_idx not in seen_posts:
                            post = blog_posts[post_idx]
                            result['matching_topics'].append({
                                'title': post.title,
                                'category': getattr(post, 'category', 'General'),
                                'similarity': float(similarities[idx])
                            })
                            seen_posts.add(post_idx)
        
        # Calculate combined semantic score
        # Weight bio more if no blogs, and vice versa
        if result['bio_similarity'] > 0 and result['blog_similarity'] > 0:
            result['score'] = (result['bio_similarity'] * 0.4 + result['blog_similarity'] * 0.6)
        elif result['bio_similarity'] > 0:
            result['score'] = result['bio_similarity']
        elif result['blog_similarity'] > 0:
            result['score'] = result['blog_similarity']
        
        # Normalize to 0-1 and boost mid-range scores
        result['score'] = min(1.0, max(0.0, result['score'] * 1.3))
        
        return result
    
    def _layer3_collaborative_filtering(self, therapist: User) -> Dict:
        """
        Layer 3: Learn from past successful matches
        
        IMPROVED:
        - Quality score is automatically applied in find_best_matches()
        - Uses TherapistQualityScorer for new therapists
        """
        from .models import TherapistMatch
        
        result = {
            'score': 0.5,  # Default neutral score
            'match_frequency': 0,
            'first_choice_rate': 0.0,
            'similar_patients_matched': 0,
        }
        
        # Count how often this therapist appears in matches
        total_matches = TherapistMatch.objects.filter(
            Q(top_match_1=therapist) |
            Q(top_match_2=therapist) |
            Q(top_match_3=therapist)
        ).count()
        
        first_choice_matches = TherapistMatch.objects.filter(
            top_match_1=therapist
        ).count()
        
        result['match_frequency'] = total_matches
        
        if total_matches > 0:
            result['first_choice_rate'] = first_choice_matches / total_matches
            result['similar_patients_matched'] = total_matches
            
            # Score based on frequency and first-choice rate
            # More matches and higher first-choice rate = better score
            frequency_score = min(1.0, total_matches / 20)  # Cap at 20 matches
            first_choice_score = result['first_choice_rate']
            
            result['score'] = 0.3 + (frequency_score * 0.3) + (first_choice_score * 0.4)
        
        # IMPROVED: Boost with quality score if available
        if self.quality_scorer and result['score'] == 0.5:  # No match history
            quality_score = self.quality_scorer.calculate_quality_score(therapist)
            result['score'] = quality_score
            result['quality_boosted'] = True
        
        return result
    
    def _calculate_specialization_match(self, therapist: User) -> float:
        """
        Direct tag matching between patient issues and therapist specializations
        
        IMPROVED:
        - Uses semantic specialization matching with synonyms
        - Handles 'PTSD' matching 'trauma' therapy, etc.
        """
        profile = getattr(therapist, 'therapist_profile', None)
        if not profile or not profile.specialization_tags:
            return 0.3  # Base score for therapists without tags
        
        therapist_tags = profile.specialization_tags if isinstance(profile.specialization_tags, list) else []
        
        # IMPROVED: Use enhanced issue extraction
        if IMPROVED_MATCHING_AVAILABLE:
            patient_issues = extract_patient_issues_enhanced(self.answers)
            return calculate_semantic_specialization_match(patient_issues, therapist_tags)
        else:
            # Fallback to original logic
            patient_issues = self._extract_patient_issues()
            therapist_tags = [tag.lower() for tag in therapist_tags]
            
            if not patient_issues:
                return 0.5
            
            matches = 0
            for issue in patient_issues:
                issue_lower = issue.lower()
                for tag in therapist_tags:
                    if issue_lower in tag or tag in issue_lower:
                        matches += 1
                        break
            
            max_possible = max(len(patient_issues), len(therapist_tags))
            score = matches / max_possible if max_possible > 0 else 0.5
            
            return min(1.0, score * 1.2)
    
    def _extract_patient_issues(self) -> List[str]:
        """
        Extract patient's main issues/concerns from survey
        
        Original method - kept for fallback compatibility
        """
        issues = []
        
        # Keywords that indicate issue-related questions
        issue_keywords = ['struggle', 'concern', 'help', 'issue', 'problem', 'reason', 
                         'experiencing', 'feeling', 'symptom', 'challenge', 'difficult']
        
        for qid, answer in self.answers.items():
            q_text = answer.get('question_text', '').lower()
            
            # Check if this is an issue-related question
            if any(keyword in q_text for keyword in issue_keywords):
                if answer.get('answer_option_text'):
                    issues.append(answer['answer_option_text'])
                elif answer.get('answer_text'):
                    issues.append(answer['answer_text'])
        
        # Also extract from mapped keywords
        issue_mapping = {
            'anxiety': ['anxiety', 'anxious', 'worried', 'panic', 'nervous'],
            'depression': ['depression', 'depressed', 'sad', 'hopeless', 'low mood'],
            'trauma': ['trauma', 'ptsd', 'abuse', 'accident', 'violence'],
            'stress': ['stress', 'overwhelmed', 'burnout', 'pressure'],
            'relationship': ['relationship', 'partner', 'marriage', 'divorce', 'dating'],
            'grief': ['grief', 'loss', 'death', 'bereavement', 'mourning'],
            'self-esteem': ['self-esteem', 'confidence', 'self-worth', 'insecurity'],
            'anger': ['anger', 'rage', 'irritable', 'frustration'],
            'addiction': ['addiction', 'substance', 'alcohol', 'drugs', 'gambling'],
            'eating': ['eating', 'food', 'weight', 'body image', 'anorexia', 'bulimia'],
            'sleep': ['sleep', 'insomnia', 'nightmare', 'tired'],
            'ocd': ['ocd', 'obsessive', 'compulsive', 'intrusive thoughts'],
        }
        
        # Check all answers for mapped issues
        all_text = ' '.join([
            f"{a.get('answer_text', '')} {a.get('answer_option_text', '')}"
            for a in self.answers.values()
        ]).lower()
        
        for issue, keywords in issue_mapping.items():
            if any(keyword in all_text for keyword in keywords):
                if issue not in [i.lower() for i in issues]:
                    issues.append(issue)
        
        return issues
    
    def generate_match_reasons(self, therapist: User, score_breakdown: Dict) -> List[str]:
        """Generate human-readable reasons for the match"""
        reasons = []
        profile = getattr(therapist, 'therapist_profile', None)
        
        # Specialization-based reasons
        if profile and profile.specialization_tags:
            # IMPROVED: Use enhanced issue extraction
            if IMPROVED_MATCHING_AVAILABLE:
                patient_issues = extract_patient_issues_enhanced(self.answers)
            else:
                patient_issues = self._extract_patient_issues()
            
            for tag in profile.specialization_tags[:2]:
                for issue in patient_issues:
                    tag_lower = tag.lower() if isinstance(tag, str) else ''
                    issue_lower = issue.lower()
                    if issue_lower in tag_lower or tag_lower in issue_lower:
                        reasons.append(f"Specializes in {tag}")
                        break
        
        # Semantic matching reasons
        layer2 = score_breakdown.get('layer2_semantic', {})
        if layer2.get('matching_topics'):
            top_topic = layer2['matching_topics'][0]
            reasons.append(f"Writes about topics relevant to your concerns")
        
        if layer2.get('bio_similarity', 0) > 0.4:
            reasons.append("Their approach aligns with your needs")
        
        # Experience-based reasons
        if profile and profile.years_of_experience:
            if profile.years_of_experience >= 10:
                reasons.append(f"{profile.years_of_experience}+ years of experience")
            elif profile.years_of_experience >= 5:
                reasons.append("Experienced practitioner")
        
        # Collaborative filtering reasons
        layer3 = score_breakdown.get('layer3_collaborative', {})
        if layer3.get('first_choice_rate', 0) > 0.5:
            reasons.append("Highly recommended by similar patients")
        elif layer3.get('match_frequency', 0) > 5:
            reasons.append("Successfully matched with many patients")
        
        # Quality-based reasons (IMPROVED)
        if layer3.get('quality_boosted'):
            if profile:
                if profile.profession_type == 'psychologist':
                    reasons.append("Licensed Psychologist")
                elif profile.profession_type == 'psychiatrist':
                    reasons.append("Board-certified Psychiatrist")
                
                if profile.is_verified:
                    reasons.append("Verified by our team")
        
        # Consultation mode
        if profile and profile.consultation_mode:
            if profile.consultation_mode == 'both':
                reasons.append("Offers both online and in-person sessions")
            elif profile.consultation_mode == 'online':
                reasons.append("Offers online sessions")
        
        return reasons[:5]  # Return top 5 reasons