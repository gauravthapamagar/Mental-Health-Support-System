"""
Improved Matching Utilities
Semantic matching, issue extraction, and specialization handling
No database changes required - works with existing TherapistProfile model
"""

import re
from typing import List, Dict, Set
import logging

logger = logging.getLogger(__name__)


# Comprehensive issue mapping with keywords and patterns
COMPREHENSIVE_ISSUE_MAPPING = {
    'anxiety': {
        'keywords': ['anxiety', 'anxious', 'worried', 'panic', 'nervous', 'fear', 
                     'phobia', 'stress', 'tension', 'overwhelm', 'worried'],
        'patterns': [
            r'feel.*anxious',
            r'panic.*attack',
            r'worried.*future',
            r'nervous.*social',
        ]
    },
    'depression': {
        'keywords': ['depression', 'depressed', 'sad', 'hopeless', 'numb', 'empty',
                     'low mood', 'unmotivated', 'tired', 'worthless', 'suicidal'],
        'patterns': [
            r'feel.*sad',
            r'nothing.*matter',
            r'no.*point',
            r'feel.*empty',
        ]
    },
    'trauma': {
        'keywords': ['trauma', 'ptsd', 'abuse', 'assault', 'accident', 'violence',
                     'flashback', 'nightmare', 'triggered', 'survived'],
        'patterns': [
            r'was.*abused',
            r'experienced.*violence',
            r'flashback',
            r'trigger.*me',
        ]
    },
    'ptsd': {
        'keywords': ['ptsd', 'post-traumatic', 'trauma', 'combat', 'assault'],
        'patterns': [
            r'ptsd',
            r'post.*traumatic',
            r'combat.*exposure',
        ]
    },
    'relationship': {
        'keywords': ['relationship', 'partner', 'spouse', 'marriage', 'dating', 
                     'divorce', 'breakup', 'communication', 'trust', 'infidelity', 'couples'],
        'patterns': [
            r'relationship.*problem',
            r'my.*partner',
            r'marriage.*issues',
            r'breakup.*struggling',
        ]
    },
    'self_esteem': {
        'keywords': ['self-esteem', 'confidence', 'self-worth', 'insecurity', 
                     'inadequate', 'failure', 'shame', 'embarrassed'],
        'patterns': [
            r'feel.*bad.*myself',
            r'not.*good.*enough',
            r'self-confidence',
            r'feel.*inadequate',
        ]
    },
    'anger': {
        'keywords': ['anger', 'angry', 'rage', 'irritable', 'frustration', 
                     'explosive', 'temper', 'control'],
        'patterns': [
            r'get.*angry',
            r'lose.*control',
            r'rage.*issues',
        ]
    },
    'grief': {
        'keywords': ['grief', 'loss', 'death', 'died', 'mourning', 'bereavement',
                     'miss', 'losing', 'passed away'],
        'patterns': [
            r'lost.*family',
            r'dealing.*death',
            r'grieving',
        ]
    },
    'addiction': {
        'keywords': ['addiction', 'substance abuse', 'alcohol', 'drugs', 'cannabis',
                     'recovery', 'sober', 'addicted'],
        'patterns': [
            r'addicted.*to',
            r'drinking.*problem',
            r'drug.*abuse',
        ]
    },
    'eating': {
        'keywords': ['eating disorder', 'anorexia', 'bulimia', 'binge', 'disordered eating', 'weight'],
        'patterns': [
            r'eating.*disorder',
            r'food.*obsession',
        ]
    },
    'ocd': {
        'keywords': ['ocd', 'obsessive compulsive', 'intrusive thoughts', 'compulsions'],
        'patterns': [
            r'ocd',
            r'obsessive.*compulsive',
            r'intrusive',
        ]
    },
    'sleep': {
        'keywords': ['sleep', 'insomnia', 'nightmare', 'tired', 'sleep disorder'],
        'patterns': [
            r'sleep.*problem',
            r'insomnia',
        ]
    },
}

# Specialization synonyms for better matching
SPECIALIZATION_SYNONYMS = {
    'anxiety': ['anxiety', 'anxious', 'gad', 'panic', 'worry', 'phobia', 'ocd'],
    'depression': ['depression', 'depressive', 'mdd', 'dysthymia', 'low mood'],
    'trauma': ['trauma', 'ptsd', 'complex trauma', 'cptsd', 'abuse', 'emdr'],
    'ptsd': ['ptsd', 'post-traumatic', 'trauma', 'combat'],
    'ocd': ['ocd', 'obsessive compulsive', 'intrusive thoughts', 'compulsion'],
    'relationship': ['relationship', 'couples', 'marriage', 'dating', 'partnership', 'communication'],
    'couples': ['couples', 'marriage', 'relationship', 'partnership'],
    'family': ['family', 'systemic', 'family therapy', 'parenting'],
    'child': ['child', 'kids', 'children', 'play therapy', 'parenting'],
    'adolescent': ['teen', 'adolescent', 'youth', 'young adult', 'teenager'],
    'grief': ['grief', 'loss', 'mourning', 'death', 'bereavement'],
    'anger': ['anger', 'rage', 'irritable', 'aggression', 'impulse control'],
    'addiction': ['addiction', 'substance', 'alcohol', 'recovery', '12-step'],
    'eating': ['eating disorder', 'anorexia', 'bulimia', 'binge', 'weight'],
    'self_esteem': ['self-esteem', 'confidence', 'self-worth', 'imposter'],
    'lgbtq': ['lgbtq', 'transgender', 'gay', 'lesbian', 'queer', 'gender affirming'],
    'bipoc': ['bipoc', 'multicultural', 'culturally sensitive', 'diversity'],
    'cbt': ['cbt', 'cognitive behavioral', 'thought records', 'behavioral activation'],
    'dbt': ['dbt', 'dialectical behavior', 'mindfulness', 'distress tolerance'],
    'psychodynamic': ['psychodynamic', 'psychoanalytic', 'unconscious'],
    'humanistic': ['humanistic', 'person-centered', 'rogerian'],
    'act': ['act', 'acceptance and commitment', 'values-based'],
}

# Profession type scoring (for quality assessment)
PROFESSION_SCORES = {
    'psychologist': 0.90,      # PhD or PsyD required
    'psychiatrist': 0.92,       # MD required
    'counselor': 0.70,          # Master's level typically
    'social_worker': 0.75,      # LCSW typically
    'therapist': 0.65,          # Variable qualification
    'other': 0.50,              # Unknown credentials
}


def extract_patient_issues_enhanced(answers: Dict) -> List[str]:
    """
    Enhanced issue extraction using multiple signals
    
    Args:
        answers: Dictionary of survey answers from TherapistMatcher._parse_answers()
    
    Returns:
        List of detected issues/concerns
    """
    issues_found = set()
    
    # Build full text from answers
    all_text = ' '.join([
        f"{a.get('answer_text', '')} {a.get('answer_option_text', '')}"
        for a in answers.values()
    ]).lower()
    
    # For each issue type, check multiple signals
    for issue_type, issue_config in COMPREHENSIVE_ISSUE_MAPPING.items():
        keyword_matches = 0
        pattern_matches = 0
        
        # Check keywords
        for keyword in issue_config['keywords']:
            if keyword in all_text:
                keyword_matches += 1
        
        # Check regex patterns
        for pattern in issue_config['patterns']:
            if re.search(pattern, all_text):
                pattern_matches += 1
        
        # Score: multiple signals = issue detected
        total_signals = keyword_matches + pattern_matches
        
        # If 2+ signals match, include the issue
        if total_signals >= 2:
            issues_found.add(issue_type)
        # Or if 3+ keywords match
        elif keyword_matches >= 3:
            issues_found.add(issue_type)
    
    return list(issues_found)


def calculate_semantic_specialization_match(
    patient_issues: List[str],
    therapist_tags: List[str]
) -> float:
    """
    Semantic specialization matching with synonym awareness
    
    Handles cases like:
    - Patient has 'PTSD' but therapist specializes in 'trauma' → should match
    - Patient needs 'couples therapy' and therapist does 'relationship counseling' → should match
    
    Args:
        patient_issues: List of detected patient issues
        therapist_tags: List of therapist specialization tags from TherapistProfile
    
    Returns:
        Match score between 0.0 and 1.0
    """
    
    if not therapist_tags:
        return 0.3  # Default score for therapists without specialization tags
    
    if not patient_issues:
        return 0.5  # Neutral score if no issues detected
    
    matches = 0
    matched_issues = set()
    
    for issue in patient_issues:
        issue_lower = issue.lower()
        
        for tag in therapist_tags:
            tag_lower = tag.lower()
            
            # Exact match (case-insensitive)
            if issue_lower == tag_lower:
                if issue not in matched_issues:
                    matches += 1
                    matched_issues.add(issue)
                break
            
            # Substring match (issue in tag or tag in issue)
            if issue_lower in tag_lower or tag_lower in issue_lower:
                if issue not in matched_issues:
                    matches += 1
                    matched_issues.add(issue)
                break
            
            # Semantic synonym matching
            for category, synonyms in SPECIALIZATION_SYNONYMS.items():
                issue_in_synonyms = any(syn in issue_lower for syn in synonyms)
                tag_in_synonyms = any(syn in tag_lower for syn in synonyms)
                
                # If both issue and tag match the same category
                if issue_in_synonyms and tag_in_synonyms:
                    if issue not in matched_issues:
                        matches += 1
                        matched_issues.add(issue)
                    break
    
    # Calculate match percentage
    max_possible = max(len(patient_issues), len(therapist_tags))
    score = matches / max_possible if max_possible > 0 else 0.5
    
    # Slight boost for better matches
    return min(1.0, score * 1.2)


def extract_therapeutic_sections(text: str) -> List[str]:
    """
    Extract only meaningful therapeutic content from blog posts
    
    Filters out non-therapeutic content and returns most relevant sections
    
    Args:
        text: Full blog post content
    
    Returns:
        List of therapeutic sections, sorted by relevance
    """
    # Split into paragraphs
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    # Keywords indicating therapeutic content
    therapeutic_keywords = {
        'therapy_work': ['therapy', 'client', 'patient', 'treatment', 'session', 'therapeutic'],
        'approach': ['approach', 'methodology', 'technique', 'method', 'framework', 'practice'],
        'problems': ['anxiety', 'depression', 'trauma', 'stress', 'ptsd', 'ocd',
                    'anger', 'grief', 'addiction', 'relationship', 'self-esteem', 'eating'],
        'outcomes': ['help', 'improve', 'recover', 'heal', 'reduce', 'manage', 'transform', 'support'],
        'modality': ['cbt', 'dbt', 'psychodynamic', 'humanistic', 'emdr', 'act', 'mindfulness'],
    }
    
    # Score each paragraph
    scored_paragraphs = []
    
    for para in paragraphs:
        para_lower = para.lower()
        score = 0.0
        
        # Count therapeutic keyword matches
        for category, keywords in therapeutic_keywords.items():
            matches = sum(1 for kw in keywords if kw in para_lower)
            # Weight different categories
            if category == 'problems' or category == 'modality':
                score += matches * 0.3
            else:
                score += matches * 0.25
        
        # Only include paragraphs with therapeutic content
        if score > 0:
            scored_paragraphs.append((para, score))
    
    # Sort by relevance score (descending) and return top paragraphs
    scored_paragraphs.sort(key=lambda x: x[1], reverse=True)
    return [para for para, _ in scored_paragraphs[:10]]


def get_profession_quality_score(profession_type: str) -> float:
    """
    Get quality score based on profession type
    
    Uses TherapistProfile.profession_type field
    
    Args:
        profession_type: Value from TherapistProfile.profession_type choices
    
    Returns:
        Quality score between 0.0 and 1.0
    """
    return PROFESSION_SCORES.get(profession_type, 0.5)


def calculate_therapist_activity_score(therapist_user) -> float:
    """
    Calculate how active a therapist is based on recent content
    
    Uses blog post recency and count
    
    Args:
        therapist_user: User object with therapist_profile relation
    
    Returns:
        Activity score between 0.0 and 1.0
    """
    from django.utils import timezone
    from datetime import timedelta
    
    try:
        blogs = therapist_user.blog_posts.filter(status='published')
        
        if not blogs.exists():
            return 0.2  # Inactive
        
        # Get latest blog post
        latest = blogs.order_by('-published_at').first()
        
        if not latest:
            return 0.2
        
        days_ago = (timezone.now() - latest.published_at).days
        
        # Score based on recency
        if days_ago < 30:
            return 1.0  # Very active
        elif days_ago < 90:
            return 0.8
        elif days_ago < 180:
            return 0.5
        elif days_ago < 365:
            return 0.3
        else:
            return 0.1  # Inactive
    
    except Exception as e:
        logger.warning(f"Error calculating therapist activity score: {e}")
        return 0.5


def calculate_verification_bonus(therapist_profile) -> float:
    """
    Calculate verification bonus based on therapist's verification status
    
    Args:
        therapist_profile: TherapistProfile instance
    
    Returns:
        Bonus score between 0.0 and 0.15
    """
    if not therapist_profile:
        return 0.0
    
    bonus = 0.0
    
    # Verified status bonus
    if therapist_profile.is_verified:
        bonus += 0.10
    
    # License ID verification
    if therapist_profile.license_id:
        bonus += 0.05
    
    return min(0.15, bonus)  # Cap at 0.15


def calculate_composite_score(
    layer2_score: float,
    layer3_score: float,
    spec_score: float,
    therapist_activity: float,
    survey_completion: float,
) -> float:
    """
    Calculate composite final score with confidence and activity bonuses
    
    Args:
        layer2_score: Semantic matching score (0-1)
        layer3_score: Collaborative filtering score (0-1)
        spec_score: Specialization matching score (0-1)
        therapist_activity: Activity score (0-1)
        survey_completion: Survey completion percentage (0-1)
    
    Returns:
        Final composite score between 0.0 and 1.0
    """
    # Base weighted score
    base_score = (
        0.60 * layer2_score +
        0.15 * layer3_score +
        0.25 * spec_score
    )
    
    # Confidence boost: if all scores agree, boost the result
    scores = [layer2_score, layer3_score, spec_score]
    score_std = _calculate_std(scores)
    
    if score_std < 0.15:  # Scores are consistent
        confidence_boost = 0.05
    elif score_std > 0.35:  # Scores are very conflicting
        confidence_boost = -0.05
    else:
        confidence_boost = 0.0
    
    # Activity bonus: favor active therapists
    if therapist_activity < 0.3:  # No recent content
        activity_bonus = -0.05
    elif therapist_activity > 0.7:  # Very active
        activity_bonus = 0.03
    else:
        activity_bonus = 0.0
    
    # Survey quality bonus: detailed surveys = better matching
    if survey_completion < 0.5:  # Incomplete survey
        survey_bonus = -0.03
    elif survey_completion > 0.8:  # Detailed survey
        survey_bonus = 0.02
    else:
        survey_bonus = 0.0
    
    # Combine all bonuses
    final_score = base_score + confidence_boost + activity_bonus + survey_bonus
    
    # Ensure score is in valid range
    return min(1.0, max(0.0, final_score))


def _calculate_std(values: List[float]) -> float:
    """
    Calculate standard deviation of a list of values
    
    Args:
        values: List of numeric values
    
    Returns:
        Standard deviation
    """
    if len(values) < 2:
        return 0.0
    
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    
    return variance ** 0.5