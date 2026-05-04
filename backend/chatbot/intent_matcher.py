"""
Advanced intent matcher for rule-based chatbot.
Uses multiple matching strategies with strict thresholds to ensure accuracy.
"""

import random
from difflib import SequenceMatcher
from .responses import RESPONSES

# Crisis keywords that require immediate priority response
CRISIS_KEYWORDS = [
    'suicide', 'suicidal', 'kill myself', 'kill myself', 'end my life', 'want to die',
    'hurt myself', 'self-harm', 'cutting', 'overdose', 'can\'t take it', 'not worth living',
    'no point living', 'better off dead', 'life threatening', 'emergency'
]


def calculate_similarity(text1, text2):
    """Calculate similarity between two strings using sequence matching."""
    return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()


def extract_keywords(text):
    """Extract meaningful keywords from user input by removing common stop words."""
    # Common words that don't add meaning
    stop_words = {
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'and', 'or', 'but', 'not', 'no',
        'yes', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
        'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our',
        'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
        'to', 'in', 'on', 'at', 'by', 'for', 'of', 'with', 'from', 'as'
    }
    
    words = text.lower().split()
    keywords = {word for word in words if word not in stop_words and len(word) > 2}
    return keywords


def check_crisis_keywords(user_message):
    """
    Check if message contains crisis-related keywords.
    Returns True if crisis keywords detected.
    """
    user_text = user_message.lower()
    
    for keyword in CRISIS_KEYWORDS:
        if keyword.lower() in user_text:
            return True
    
    return False


def find_intent_match(user_message):
    """
    Find the best matching intent for a user message.
    Uses multiple matching strategies with strict priority ordering.
    """
    
    user_text = user_message.lower().strip()
    user_keywords = extract_keywords(user_message)
    
    best_match = {
        'intent': 'not_understood',
        'confidence': 0,
        'response': None
    }
    
    # Try to match each intent
    for intent_name, intent_data in RESPONSES.items():
        intent_keywords = intent_data.get('keywords', [])
        responses = intent_data.get('responses', [])
        
        if not responses or not intent_keywords:
            continue
        
        confidence = 0
        matched_phrase = None
        
        # PRIORITY 1: Exact multi-word phrase match (highest specificity)
        # Look for longer phrases first to catch specific intents
        sorted_keywords = sorted(intent_keywords, key=len, reverse=True)
        
        for keyword in sorted_keywords:
            keyword_lower = keyword.lower().strip()
            # Check if the exact phrase appears in user message
            if keyword_lower in user_text:
                # Longer matches are more specific and confident
                phrase_words = len(keyword.split())
                confidence = 0.98 if phrase_words >= 3 else 0.95
                matched_phrase = keyword
                break
        
        # PRIORITY 2: Single word exact match (only for common terms)
        # Only if no multi-word match found
        if confidence == 0:
            for keyword in intent_keywords:
                keyword_lower = keyword.lower().strip()
                # For single-word keywords, check for exact word boundaries
                if len(keyword.split()) == 1:
                    # Check if it appears as a whole word
                    word_boundary = f" {keyword_lower} "
                    user_with_spaces = f" {user_text} "
                    if word_boundary in user_with_spaces or user_text.startswith(keyword_lower):
                        confidence = 0.92
                        matched_phrase = keyword
                        break
        
        # PRIORITY 3: Very high similarity fuzzy match (0.80+ only)
        # Only if no exact match found
        if confidence == 0:
            best_similarity = 0
            for keyword in sorted_keywords:
                similarity = calculate_similarity(user_text, keyword.lower())
                if similarity > best_similarity:
                    best_similarity = similarity
                    matched_phrase = keyword
            
            # Very strict fuzzy matching - only match if very similar (0.80+)
            if best_similarity > 0.80:
                confidence = best_similarity * 0.90
        
        # PRIORITY 4: Multi-keyword match (only as strict fallback)
        # Require many keywords to match to avoid false positives
        if confidence == 0:
            intent_keyword_words = set()
            for keyword in intent_keywords:
                # Split multi-word keywords into individual words
                intent_keyword_words.update(keyword.lower().split())
            
            # Find matching keywords
            matched_keywords = user_keywords & intent_keyword_words
            
            # Only match if we have significant overlap (4+ matching words)
            # This prevents false matches from accidental word overlap
            if len(matched_keywords) >= 4:
                confidence = min(0.70, len(matched_keywords) * 0.10)
        
        # Update best match if this is better
        if confidence > best_match['confidence']:
            best_match = {
                'intent': intent_name,
                'confidence': confidence,
                'response': random.choice(responses),
                'matched_phrase': matched_phrase
            }
    
    # Very strict threshold - only return a match if we're confident
    # If below 0.65 confidence, it's likely a misunderstanding
    if best_match['confidence'] < 0.65:
        fallback_responses = RESPONSES['not_understood']['responses']
        best_match = {
            'intent': 'not_understood',
            'confidence': 0,
            'response': random.choice(fallback_responses)
        }
    
    return best_match


def generate_response(user_message):
    """
    Main function to generate chatbot response.
    
    Args:
        user_message: User's input text
    
    Returns:
        dict with response, is_crisis, intent, and confidence
    """
    
    if not user_message or not user_message.strip():
        return {
            'response': "I'm here to support you. What's on your mind?",
            'is_crisis': False,
            'intent': 'greeting',
            'confidence': 0
        }
    
    try:
        # Check for crisis first (highest priority)
        is_crisis = check_crisis_keywords(user_message)
        
        if is_crisis:
            crisis_response = random.choice(RESPONSES['suicidal_thoughts']['responses'])
            return {
                'response': crisis_response,
                'is_crisis': True,
                'intent': 'suicidal_thoughts',
                'confidence': 1.0
            }
        
        # Find best matching intent
        match = find_intent_match(user_message)
        
        print(f"✅ Intent matched: {match['intent']}")
        print(f"📊 Confidence: {match['confidence']:.2f}")
        
        return {
            'response': match['response'],
            'is_crisis': False,
            'intent': match['intent'],
            'confidence': match['confidence']
        }
        
    except Exception as e:
        print(f"❌ ERROR in response generation: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'response': "I encountered an issue processing your request. Please try again.",
            'is_crisis': False,
            'intent': 'error',
            'confidence': 0
        }
