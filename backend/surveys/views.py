from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, F
from .models import Survey, SurveyQuestion, SurveyResponse, SurveyAnswer
from .serializers import (
    SurveyListSerializer,
    SurveyDetailSerializer,
    SurveyResponseSerializer,
    SurveyAnswerSerializer,
)


class SurveyViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for therapist matching survey"""
    queryset = Survey.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SurveyDetailSerializer
        return SurveyListSerializer
    
    @action(detail=False, methods=['get'])
    def active_survey(self, request):
        """Get the active therapist matching survey"""
        survey = self.queryset.first()
        if not survey:
            return Response(
                {'detail': 'No active survey found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SurveyDetailSerializer(survey)
        return Response(serializer.data)


class SurveyResponseViewSet(viewsets.ModelViewSet):
    """ViewSet for patient survey responses"""
    permission_classes = [IsAuthenticated]
    serializer_class = SurveyResponseSerializer
    
    def get_queryset(self):
        """Only return responses for the current user"""
        return SurveyResponse.objects.filter(patient=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()  # this already filters by patient=user
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except SurveyResponse.DoesNotExist:
            return Response(
                {'detail': 'Not found or not owned by you'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Get a specific response by ID (only if it belongs to the user)"""
        try:
            response_obj = SurveyResponse.objects.get(
                id=kwargs.get('pk'),
                patient=request.user
            )
            serializer = self.get_serializer(response_obj)
            return Response(serializer.data)
        except SurveyResponse.DoesNotExist:
            return Response(
                {'detail': 'Response not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def start_assessment(self, request):
        """Start or continue the therapist matching assessment"""
        # Get the active survey
        survey = Survey.objects.filter(is_active=True).first()
        if not survey:
            return Response(
                {'detail': 'No active survey found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if patient has an in-progress response
        response = SurveyResponse.objects.filter(
            patient=request.user,
            survey=survey,
            status='in_progress'
        ).first()
        
        if not response:
            # Mark old responses as not latest
            SurveyResponse.objects.filter(
                patient=request.user,
                survey=survey,
                is_latest=True
            ).update(is_latest=False)
            
            # Get retake count
            retake_count = SurveyResponse.objects.filter(
                patient=request.user,
                survey=survey
            ).count()
            
            # Create new response
            response = SurveyResponse.objects.create(
                patient=request.user,
                survey=survey,
                status='in_progress',
                retake_count=retake_count,
                is_latest=True
            )
        
        serializer = SurveyResponseSerializer(response)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def current_assessment(self, request):
        """Get the current in-progress or latest assessment"""
        survey = Survey.objects.filter(is_active=True).first()
        
        # First, try to get in-progress response
        response = SurveyResponse.objects.filter(
            patient=request.user,
            survey=survey,
            status='in_progress'
        ).first()
        
        # If no in-progress, get the latest completed
        if not response:
            response = SurveyResponse.objects.filter(
                patient=request.user,
                survey=survey,
                is_latest=True
            ).first()
        
        if not response:
            return Response(
                {'detail': 'No assessment found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SurveyResponseSerializer(response)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def assessment_history(self, request):
        """Get all completed assessments for the patient"""
        survey = Survey.objects.filter(is_active=True).first()
        responses = SurveyResponse.objects.filter(
            patient=request.user,
            survey=survey,
            status__in=['submitted', 'reviewed']
        ).order_by('-completed_at')
        
        serializer = SurveyResponseSerializer(responses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def save_answer(self, request):
        """Save a single answer and return any triggered dynamic questions"""
        response_id = request.data.get('response_id')
        question_id = request.data.get('question_id')
        answer_data = request.data.get('answer')
        
        try:
            response = SurveyResponse.objects.get(
                id=response_id,
                patient=request.user,
                status='in_progress'
            )
            question = SurveyQuestion.objects.get(id=question_id)
        except (SurveyResponse.DoesNotExist, SurveyQuestion.DoesNotExist):
            return Response(
                {'detail': 'Invalid response or question'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Save or update the answer
        answer, created = SurveyAnswer.objects.update_or_create(
            response=response,
            question=question,
            defaults={
                'answer_text': answer_data.get('text', ''),
                'answer_option_id': answer_data.get('option_id'),
                'answer_rating': answer_data.get('rating'),
                'answer_yes_no': answer_data.get('yes_no'),
            }
        )
        
        # Find triggered dynamic questions
        triggered_questions = []
        trigger_value = (
            answer_data.get('option_id') or
            answer_data.get('rating') or
            answer_data.get('yes_no')
        )
        
        if trigger_value:
            dynamic_qs = SurveyQuestion.objects.filter(
                parent_question=question,
                trigger_condition=str(trigger_value),
                question_level='dynamic'
            )
            triggered_questions = [
                {
                    'id': q.id,
                    'question_text': q.question_text,
                    'question_type': q.question_type,
                    'is_required': q.is_required,
                    'options': list(q.options.values()) if q.options.exists() else [],
                }
                for q in dynamic_qs
            ]
        
        return Response({
            'status': 'saved',
            'triggered_questions': triggered_questions,
        })
    
    @action(detail=False, methods=['post'])
    def submit_assessment(self, request):
        """Submit the completed assessment"""
        response_id = request.data.get('response_id')
        
        try:
            response = SurveyResponse.objects.get(
                id=response_id,
                patient=request.user,
                status='in_progress'
            )
        except SurveyResponse.DoesNotExist:
            return Response(
                {'detail': 'Assessment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Mark as submitted
        response.status = 'submitted'
        response.completed_at = timezone.now()
        response.is_latest = True
        response.save()
        
        serializer = SurveyResponseSerializer(response)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def can_retake(self, request):
        """Check if patient can retake the assessment"""
        survey = Survey.objects.filter(is_active=True).first()
        
        latest = SurveyResponse.objects.filter(
            patient=request.user,
            survey=survey,
            is_latest=True
        ).first()
        
        return Response({
            'can_retake': True,  # Always allow retakes
            'latest_completed': latest.completed_at if latest else None,
        })
