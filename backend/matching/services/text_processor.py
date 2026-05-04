import re
from typing import List, Dict
import json


class TextProcessor:
    """
    Handles text preprocessing for matching algorithm.
    """
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean and normalize text.
        """
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    @staticmethod
    def extract_keywords(text: str, top_n: int = 20) -> List[str]:
        """
        Extract important keywords from text.
        Simple approach: words that appear multiple times.
        """
        words = text.lower().split()
        
        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has',
            'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may',
            'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
            'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its',
            'our', 'their', 'me', 'him', 'us', 'them'
        }
        
        # Count word frequency
        word_freq = {}
        for word in words:
            if word not in stop_words and len(word) > 2:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency and return top N
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:top_n]]
    
    @staticmethod
    def build_patient_text(survey_responses: List[Dict]) -> str:
        """
        Build text representation from survey responses.
        """
        text_parts = []
        
        for response in survey_responses:
            question = response.get('question', '')
            answer = response.get('answer', '')
            
            # Add question context for better matching
            text_parts.append(f"{question} {answer}")
        
        return ' '.join(text_parts)
    
    @staticmethod
    def build_therapist_text(therapist_profile, blogs=None) -> str:
        """
        Build text representation from therapist profile and blogs.
        """
        text_parts = []
        
        # Add specializations (give more weight by repeating)
        if therapist_profile.specialization_tags:
            specializations = ' '.join(therapist_profile.specialization_tags)
            text_parts.append(specializations * 3)  # Repeat 3 times for emphasis
        
        # Add profession type
        text_parts.append(therapist_profile.profession_type * 2)
        
        # Add bio
        if therapist_profile.bio:
            text_parts.append(therapist_profile.bio)
        
        # Add languages
        if therapist_profile.languages_spoken:
            languages = ' '.join(therapist_profile.languages_spoken)
            text_parts.append(languages)
        
        # Add consultation mode
        if therapist_profile.consultation_mode:
            text_parts.append(therapist_profile.consultation_mode)
        
        # Add blog content (first 500 words from each blog)
        if blogs:
            for blog in blogs:
                blog_text = blog.content[:2000]  # First 2000 chars
                text_parts.append(blog_text)
        
        return ' '.join(text_parts)