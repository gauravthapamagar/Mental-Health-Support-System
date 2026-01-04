import json
import requests
from typing import Dict, List, Optional
from django.conf import settings


class LlamaService:
    """Service to interact with locally deployed Llama model"""
    
    def __init__(self):
        # Default Ollama local endpoint - adjust if your setup is different
        self.api_url = getattr(settings, 'LLAMA_API_URL', 'http://localhost:11434/api/generate')
        self.model_name = getattr(settings, 'LLAMA_MODEL_NAME', 'llama2')
        self.timeout = getattr(settings, 'LLAMA_TIMEOUT', 30)
    
    def generate_dynamic_question(
        self, 
        static_responses: List[Dict], 
        previous_dynamic_qa: List[Dict] = None,
        question_count: int = 0
    ) -> Optional[str]:
        """
        Generate a dynamic follow-up question based on patient responses
        
        Args:
            static_responses: List of static Q&A pairs
            previous_dynamic_qa: List of previous dynamic Q&A pairs
            question_count: Number of dynamic questions asked so far
            
        Returns:
            Generated question text or None if error
        """
        
        # Build context from responses
        context = self._build_context(static_responses, previous_dynamic_qa)
        
        # Create prompt for Llama
        prompt = self._create_prompt(context, question_count)
        
        try:
            # Call Llama API
            response = self._call_llama_api(prompt)
            
            if response:
                # Clean and validate the question
                question = self._clean_question(response)
                return question
            
            return None
            
        except Exception as e:
            print(f"Error generating dynamic question: {str(e)}")
            return None
    
    def _build_context(
        self, 
        static_responses: List[Dict], 
        previous_dynamic_qa: List[Dict] = None
    ) -> str:
        """Build context string from patient responses"""
        
        context_parts = ["Patient Assessment Responses:\n"]
        
        # Add static responses
        if static_responses:
            context_parts.append("Initial Assessment:")
            for i, resp in enumerate(static_responses, 1):
                q = resp.get('question', '')
                a = resp.get('answer', '')
                context_parts.append(f"{i}. Q: {q}")
                context_parts.append(f"   A: {a}\n")
        
        # Add previous dynamic Q&A
        if previous_dynamic_qa:
            context_parts.append("\nFollow-up Questions:")
            for i, qa in enumerate(previous_dynamic_qa, 1):
                q = qa.get('question', '')
                a = qa.get('answer', '')
                context_parts.append(f"{i}. Q: {q}")
                context_parts.append(f"   A: {a}\n")
        
        return "\n".join(context_parts)
    
    def _create_prompt(self, context: str, question_count: int) -> str:
        """Create prompt for Llama to generate next question"""
        
        max_questions = getattr(settings, 'MAX_DYNAMIC_QUESTIONS', 5)
        
        prompt = f"""You are a compassionate mental health professional conducting a patient assessment. Based on the patient's responses below, generate ONE thoughtful follow-up question to better understand their mental health status.

{context}

Guidelines:
- Ask a specific, empathetic question that explores concerning areas mentioned
- Focus on understanding severity, frequency, or impact of symptoms
- Keep the question clear and under 25 words
- Ask about coping mechanisms, support systems, or specific triggers if relevant
- This is question {question_count + 1} of maximum {max_questions} follow-up questions
- Be sensitive and non-judgmental in tone
- Do not ask multiple questions at once
- Do not repeat questions already asked

Generate only the question text, nothing else:"""
        
        return prompt
    
    def _call_llama_api(self, prompt: str) -> Optional[str]:
        """Make API call to local Llama instance"""
        
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_tokens": 100,
            }
        }
        
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('response', '').strip()
            else:
                print(f"Llama API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Request error: {str(e)}")
            return None
    
    def _clean_question(self, question: str) -> str:
        """Clean and validate the generated question"""
        
        # Remove any extra whitespace
        question = question.strip()
        
        # Remove quotes if present
        if question.startswith('"') and question.endswith('"'):
            question = question[1:-1]
        if question.startswith("'") and question.endswith("'"):
            question = question[1:-1]
        
        # Ensure it ends with a question mark
        if not question.endswith('?'):
            question += '?'
        
        # Limit length
        if len(question) > 200:
            question = question[:197] + "...?"
        
        return question
    
    def generate_summary(self, all_responses: List[Dict]) -> Dict[str, str]:
        """
        Generate a summary and risk assessment based on all responses
        
        Returns:
            Dict with 'summary' and 'risk_level' keys
        """
        
        context = self._build_summary_context(all_responses)
        prompt = self._create_summary_prompt(context)
        
        try:
            response = self._call_llama_api(prompt)
            
            if response:
                # Parse the response to extract summary and risk level
                return self._parse_summary_response(response)
            
            return {
                'summary': 'Unable to generate summary',
                'risk_level': 'medium'
            }
            
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            return {
                'summary': 'Error generating summary',
                'risk_level': 'medium'
            }
    
    def _build_summary_context(self, all_responses: List[Dict]) -> str:
        """Build context for summary generation"""
        
        context_parts = ["Complete Patient Assessment:\n"]
        
        for i, resp in enumerate(all_responses, 1):
            q = resp.get('question', '')
            a = resp.get('answer', '')
            context_parts.append(f"{i}. Q: {q}")
            context_parts.append(f"   A: {a}\n")
        
        return "\n".join(context_parts)
    
    def _create_summary_prompt(self, context: str) -> str:
        """Create prompt for generating summary"""
        
        prompt = f"""You are a mental health professional analyzing a patient assessment. Based on the responses below, provide a brief clinical summary and risk assessment.

{context}

Provide your analysis in the following format:
SUMMARY: [2-3 sentences summarizing key concerns and patient's mental state]
RISK: [low/medium/high]

Guidelines:
- Consider emotional state, sleep, appetite, relationships, and coping mechanisms
- Identify any red flags (suicidal ideation, self-harm, severe symptoms)
- Risk levels:
  * low: Minor concerns, functioning well, good coping
  * medium: Moderate symptoms, some impairment, needs support
  * high: Severe symptoms, significant impairment, safety concerns

Your response:"""
        
        return prompt
    
    def _parse_summary_response(self, response: str) -> Dict[str, str]:
        """Parse Llama's summary response"""
        
        lines = response.strip().split('\n')
        summary = ''
        risk_level = 'medium'
        
        for line in lines:
            if line.startswith('SUMMARY:'):
                summary = line.replace('SUMMARY:', '').strip()
            elif line.startswith('RISK:'):
                risk_text = line.replace('RISK:', '').strip().lower()
                if risk_text in ['low', 'medium', 'high']:
                    risk_level = risk_text
        
        if not summary:
            summary = response.strip()
        
        return {
            'summary': summary,
            'risk_level': risk_level
        }