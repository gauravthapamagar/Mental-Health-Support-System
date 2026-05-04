# from google import genai
# from google.genai import types
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_http_methods
# import json
# import os
# import traceback

# # Configure Gemini API
# API_KEY = os.environ.get('GEMINI_API_KEY')
# print(f"🔑 API Key loaded: {'Yes' if API_KEY else 'No'}")
# print(f"🔑 API Key length: {len(API_KEY) if API_KEY else 0}")

# if not API_KEY:
#     print("❌ WARNING: GEMINI_API_KEY not found in environment variables!")

# # System prompt for mental health chatbot
# SYSTEM_PROMPT = """You are a compassionate mental health support chatbot. Your role is to:
# - Provide empathetic, supportive responses
# - Keep responses concise (2-4 sentences maximum)
# - Offer practical coping strategies when appropriate
# - Encourage professional help for serious concerns
# - Never diagnose or replace professional therapy
# - Be warm, non-judgmental, and validating
# - Ask clarifying questions when needed

# Remember: You're here to support, not to cure. Always prioritize user safety."""

# @csrf_exempt
# @require_http_methods(["POST"])
# def chat(request):
#     print("🔵 Chat endpoint called")
#     try:
#         # Parse request body
#         data = json.loads(request.body)
#         user_message = data.get('message', '')
#         conversation_history = data.get('history', [])
        
        
#         if not user_message:
#             return JsonResponse({'error': 'Message is required'}, status=400)
        
#         # Check if API key is configured
#         if not API_KEY:
            
#             return JsonResponse({
#                 'error': 'API key not configured. Please add GEMINI_API_KEY to .env file',
#                 'success': False
#             }, status=500)
        
#         # Initialize the client
        
#         client = genai.Client(api_key=API_KEY)
        
#         # Build conversation contents
#         contents = []
        
#         # Add system instruction as first message
#         contents.append(types.Content(
#             role="user",
#             parts=[types.Part(text=SYSTEM_PROMPT)]
#         ))
#         contents.append(types.Content(
#             role="model",
#             parts=[types.Part(text="I understand. I will provide empathetic, concise mental health support.")]
#         ))
        
#         # Add conversation history
#         for msg in conversation_history[-6:]:
#             role = "user" if msg['role'] == 'user' else "model"
#             contents.append(types.Content(
#                 role=role,
#                 parts=[types.Part(text=msg['content'])]
#             ))
        
#         # Add current user message
#         contents.append(types.Content(
#             role="user",
#             parts=[types.Part(text=user_message)]
#         ))
        
        
#         # Generate response
#         response = client.models.generate_content(
#             model='models/gemini-2.5-flash',
#             contents=contents,
#             config=types.GenerateContentConfig(
#                 temperature=0.7,
#                 top_p=0.95,
#                 top_k=40,
#                 max_output_tokens=500,
#             )
#         )
        
#         response_text = response.text
        
#         return JsonResponse({
#             'response': response_text,
#             'success': True
#         })
        
#     except json.JSONDecodeError as e:
#         print(f"❌ JSON Error: {str(e)}")
#         return JsonResponse({
#             'error': f'Invalid JSON: {str(e)}',
#             'success': False
#         }, status=400)
        
#     except Exception as e:
#         print(f"❌ ERROR: {str(e)}")
#         print(f"📋 Traceback:\n{traceback.format_exc()}")
#         return JsonResponse({
#             'error': str(e),
#             'success': False
#         }, status=500)


# @csrf_exempt
# @require_http_methods(["POST"])
# def check_crisis(request):
#     """Check if message contains crisis keywords"""
#     print("🔴 Crisis check endpoint called")
#     try:
#         data = json.loads(request.body)
#         message = data.get('message', '').lower()
        
#         crisis_keywords = [
#             'suicide', 'kill myself', 'end my life', 'want to die',
#             'self-harm', 'hurt myself', 'no reason to live'
#         ]
        
#         is_crisis = any(keyword in message for keyword in crisis_keywords)
        
        
#         return JsonResponse({
#             'is_crisis': is_crisis,
#             'helpline': '100' if is_crisis else None,
#             'message': 'Please reach out to a crisis helpline immediately.' if is_crisis else None
#         })
        
#     except Exception as e:
#         print(f"❌ Crisis check error: {str(e)}")
#         return JsonResponse({'error': str(e)}, status=500)




"""
Mental health chatbot views using rule-based response system.
No external LLM or API calls - all responses are predefined and matched locally.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import traceback

# Import the rule-based matching system
from .intent_matcher import generate_response, check_crisis_keywords


@csrf_exempt
@require_http_methods(["POST"])
def chat(request):
    """
    Main chat endpoint using rule-based response matching.
    Matches user intent to predefined responses - no external LLM needed.
    """
    print("🔵 Chat endpoint called")
    try:
        # Parse request
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        print(f"📝 User message: {user_message[:100]}")
        
        # Generate response using rule-based system
        result = generate_response(user_message)
        
        # Log response details
        print(f"✅ Intent matched: {result['intent']}")
        print(f"📊 Confidence: {result['confidence']:.2f}")
        
        if result['is_crisis']:
            print("🚨 CRISIS KEYWORDS DETECTED - Crisis response sent")
        
        return JsonResponse({
            'response': result['response'],
            'success': True,
            'is_crisis': result['is_crisis'],
            'intent': result['intent'],
            'confidence': round(result['confidence'], 2)
        })
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error: {str(e)}")
        return JsonResponse({
            'error': f'Invalid JSON: {str(e)}',
            'success': False
        }, status=400)
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print(f"📋 Traceback:\n{traceback.format_exc()}")
        return JsonResponse({
            'error': str(e),
            'success': False
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def check_crisis(request):
    """
    Dedicated crisis detection endpoint.
    Checks for crisis keywords and returns appropriate guidance.
    """
    print("🔴 Crisis check endpoint called")
    try:
        data = json.loads(request.body)
        message = data.get('message', '')
        
        is_crisis = check_crisis_keywords(message)
        
        response_data = {
            'is_crisis': is_crisis,
        }
        
        if is_crisis:
            response_data.update({
                'helpline': 'Please contact: 988 (Suicide & Crisis Lifeline) or text HELLO to 741741',
                'message': 'Your safety is important. Please reach out for immediate help.',
                'urgent': True
            })
        
        return JsonResponse(response_data)
        
    except Exception as e:
        print(f"❌ Crisis check error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
