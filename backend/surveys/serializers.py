from rest_framework import serializers
from .models import Survey, Question, Response, DynamicQuestionHistory


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'response_type', 'order', 'options']


class ResponseSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    
    class Meta:
        model = Response
        fields = ['id', 'question', 'question_text', 'question_type', 'answer', 'dynamic_question_text', 'created_at']
        read_only_fields = ['created_at']


class ResponseCreateSerializer(serializers.Serializer):
    question_id = serializers.IntegerField(required=True)
    answer = serializers.CharField(required=True, allow_blank=False)
    
    def validate_answer(self, value):
        # Basic validation - can be extended based on question type
        if not value or value.strip() == '':
            raise serializers.ValidationError("Answer cannot be empty")
        return value


class SurveySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    responses = ResponseSerializer(many=True, read_only=True)
    total_responses = serializers.SerializerMethodField()
    
    class Meta:
        model = Survey
        fields = [
            'id', 'patient', 'patient_name', 'status', 'started_at', 
            'completed_at', 'analysis_summary', 'risk_level', 
            'responses', 'total_responses'
        ]
        read_only_fields = ['patient', 'started_at', 'completed_at', 'analysis_summary', 'risk_level']
    
    def get_total_responses(self, obj):
        return obj.responses.count()


class SurveyListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    total_responses = serializers.SerializerMethodField()
    
    class Meta:
        model = Survey
        fields = [
            'id', 'patient', 'patient_name', 'status', 'started_at', 
            'completed_at', 'risk_level', 'total_responses'
        ]
    
    def get_total_responses(self, obj):
        return obj.responses.count()


class DynamicQuestionRequestSerializer(serializers.Serializer):
    """Serializer for requesting next dynamic question"""
    survey_id = serializers.IntegerField(required=True)
    
    def validate_survey_id(self, value):
        try:
            survey = Survey.objects.get(id=value)
            if survey.status == 'completed':
                raise serializers.ValidationError("Survey is already completed")
        except Survey.DoesNotExist:
            raise serializers.ValidationError("Survey not found")
        return value


class DynamicQuestionResponseSerializer(serializers.Serializer):
    """Serializer for dynamic question response"""
    question_text = serializers.CharField(read_only=True)
    question_id = serializers.IntegerField(read_only=True)
    is_final = serializers.BooleanField(read_only=True)
    

class SubmitDynamicAnswerSerializer(serializers.Serializer):
    """Serializer for submitting answer to dynamic question"""
    survey_id = serializers.IntegerField(required=True)
    answer = serializers.CharField(required=True, allow_blank=False)
    
    def validate_answer(self, value):
        if not value or value.strip() == '':
            raise serializers.ValidationError("Answer cannot be empty")
        return value


class CompleteSurveySerializer(serializers.Serializer):
    """Serializer for completing a survey"""
    survey_id = serializers.IntegerField(required=True)
    
    def validate_survey_id(self, value):
        try:
            survey = Survey.objects.get(id=value)
            if survey.status == 'completed':
                raise serializers.ValidationError("Survey is already completed")
        except Survey.DoesNotExist:
            raise serializers.ValidationError("Survey not found")
        return value


class DynamicQuestionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicQuestionHistory
        fields = ['id', 'question_text', 'answer', 'created_at']