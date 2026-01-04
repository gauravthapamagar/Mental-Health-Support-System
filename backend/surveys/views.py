from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
from accounts.permissions import IsPatient
from .models import Survey, Question, Response as SurveyResponse, DynamicQuestionHistory
from .serializers import (
    SurveySerializer,
    SurveyListSerializer,
    QuestionSerializer,
    ResponseCreateSerializer,
    DynamicQuestionRequestSerializer,
    DynamicQuestionResponseSerializer,
    SubmitDynamicAnswerSerializer,
    CompleteSurveySerializer
)
from .llama_service import LlamaService


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPatient])
def start_survey(request):
    """Start a new survey for the patient"""
    
    # Check if patient has an incomplete survey
    existing_survey = Survey.objects.filter(
        patient=request.user,
        status='in_progress'
    ).first()
    
    if existing_survey:
        return Response({
            'message': 'You already have an incomplete survey',
            'survey': SurveySerializer(existing_survey).data
        }, status=status.HTTP_200_OK)
    
    # Create new survey
    survey = Survey.objects.create(patient=request.user)
    
    return Response({
        'message': 'Survey started successfully',
        'survey': SurveySerializer(survey).data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPatient])
def get_static_questions(request):
    """Get all static questions for the survey"""
    
    questions = Question.objects.filter(
        question_type='static',
        is_active=True
    ).order_by('order')
    
    serializer = QuestionSerializer(questions, many=True)
    
    return Response({
        'count': questions.count(),
        'questions': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPatient])
def submit_static_responses(request):
    """Submit responses to static questions"""
    
    survey_id = request.data.get('survey_id')
    responses = request.data.get('responses', [])
    
    if not survey_id:
        return Response({
            'error': 'survey_id is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not responses:
        return Response({
            'error': 'responses are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        survey = Survey.objects.get(id=survey_id, patient=request.user)
    except Survey.DoesNotExist:
        return Response({
            'error': 'Survey not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if survey.status == 'completed':
        return Response({
            'error': 'Survey is already completed'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate and save responses
    saved_responses = []
    errors = []
    
    with transaction.atomic():
        for resp_data in responses:
            serializer = ResponseCreateSerializer(data=resp_data)
            if serializer.is_valid():
                question_id = serializer.validated_data['question_id']
                answer = serializer.validated_data['answer']
                
                try:
                    question = Question.objects.get(id=question_id, question_type='static')
                    
                    # Create or update response
                    response_obj, created = SurveyResponse.objects.update_or_create(
                        survey=survey,
                        question=question,
                        defaults={'answer': answer}
                    )
                    
                    saved_responses.append({
                        'question_id': question_id,
                        'question': question.question_text,
                        'answer': answer
                    })
                    
                except Question.DoesNotExist:
                    errors.append(f"Question {question_id} not found")
            else:
                errors.append(serializer.errors)
    
    if errors:
        return Response({
            'error': 'Some responses could not be saved',
            'details': errors,
            'saved': saved_responses
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'message': 'Static responses submitted successfully',
        'saved_responses': saved_responses,
        'next_step': 'dynamic_questions'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPatient])
def get_next_dynamic_question(request):
    """Get next dynamic question based on previous responses"""
    
    serializer = DynamicQuestionRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    survey_id = serializer.validated_data['survey_id']
    
    try:
        survey = Survey.objects.get(id=survey_id, patient=request.user)
    except Survey.DoesNotExist:
        return Response({
            'error': 'Survey not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check max dynamic questions limit
    max_questions = 5  # Can be moved to settings
    dynamic_count = DynamicQuestionHistory.objects.filter(survey=survey).count()
    
    if dynamic_count >= max_questions:
        return Response({
            'message': 'Maximum dynamic questions reached',
            'is_final': True
        }, status=status.HTTP_200_OK)
    
    # Get all previous responses for context
    static_responses = []
    for resp in survey.responses.filter(question__question_type='static'):
        static_responses.append({
            'question': resp.question.question_text,
            'answer': resp.answer
        })
    
    # Get previous dynamic Q&A
    previous_dynamic = []
    for dyn in survey.dynamic_questions.all():
        previous_dynamic.append({
            'question': dyn.question_text,
            'answer': dyn.answer
        })
    
    # Generate dynamic question using Llama
    llama_service = LlamaService()
    question_text = llama_service.generate_dynamic_question(
        static_responses=static_responses,
        previous_dynamic_qa=previous_dynamic,
        question_count=dynamic_count
    )
    
    if not question_text:
        return Response({
            'error': 'Unable to generate dynamic question. Please try again.',
            'is_final': True
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'question_text': question_text,
        'question_number': dynamic_count + 1,
        'is_final': False
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPatient])
def submit_dynamic_answer(request):
    """Submit answer to a dynamic question"""
    
    serializer = SubmitDynamicAnswerSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    survey_id = serializer.validated_data['survey_id']
    answer = serializer.validated_data['answer']
    question_text = request.data.get('question_text', '')
    
    if not question_text:
        return Response({
            'error': 'question_text is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        survey = Survey.objects.get(id=survey_id, patient=request.user)
    except Survey.DoesNotExist:
        return Response({
            'error': 'Survey not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Build context from previous responses
    context_parts = []
    for resp in survey.responses.all():
        context_parts.append(f"Q: {resp.question.question_text} A: {resp.answer}")
    
    context = "\n".join(context_parts)
    
    # Save dynamic question and answer
    DynamicQuestionHistory.objects.create(
        survey=survey,
        question_text=question_text,
        answer=answer,
        context_used=context
    )
    
    return Response({
        'message': 'Answer submitted successfully'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPatient])
def complete_survey(request):
    """Complete the survey and generate analysis"""
    
    serializer = CompleteSurveySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    survey_id = serializer.validated_data['survey_id']
    
    try:
        survey = Survey.objects.get(id=survey_id, patient=request.user)
    except Survey.DoesNotExist:
        return Response({
            'error': 'Survey not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if survey.status == 'completed':
        return Response({
            'error': 'Survey is already completed'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Gather all responses for analysis
    all_responses = []
    
    # Static responses
    for resp in survey.responses.all():
        all_responses.append({
            'question': resp.question.question_text,
            'answer': resp.answer
        })
    
    # Dynamic responses
    for dyn in survey.dynamic_questions.all():
        all_responses.append({
            'question': dyn.question_text,
            'answer': dyn.answer
        })
    
    # Generate summary using Llama
    llama_service = LlamaService()
    analysis = llama_service.generate_summary(all_responses)
    
    # Update survey
    survey.status = 'completed'
    survey.completed_at = timezone.now()
    survey.analysis_summary = analysis.get('summary', '')
    survey.risk_level = analysis.get('risk_level', 'medium')
    survey.save()
    
    return Response({
        'message': 'Survey completed successfully',
        'survey': SurveySerializer(survey).data,
        'analysis': {
            'summary': survey.analysis_summary,
            'risk_level': survey.risk_level
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPatient])
def get_survey_history(request):
    """Get patient's survey history"""
    
    surveys = Survey.objects.filter(patient=request.user).order_by('-started_at')
    serializer = SurveyListSerializer(surveys, many=True)
    
    return Response({
        'count': surveys.count(),
        'surveys': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPatient])
def get_survey_detail(request, survey_id):
    """Get detailed survey information"""
    
    try:
        survey = Survey.objects.get(id=survey_id, patient=request.user)
    except Survey.DoesNotExist:
        return Response({
            'error': 'Survey not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = SurveySerializer(survey)
    
    return Response(serializer.data, status=status.HTTP_200_OK)