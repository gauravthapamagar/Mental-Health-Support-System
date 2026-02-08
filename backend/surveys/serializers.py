from rest_framework import serializers
from .models import (
    Survey,
    SurveyQuestion,
    SurveyQuestionOption,
    SurveyResponse,
    SurveyAnswer,
)


class SurveyQuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyQuestionOption
        fields = ['id', 'option_text', 'option_value', 'order', 'score']


class SurveyAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    answer_option_text = serializers.SerializerMethodField()
    
    class Meta:
        model = SurveyAnswer
        fields = [
            'id',
            'question',
            'question_text',
            'question_type',
            'answer_text',
            'answer_option',
            'answer_option_text',
            'answer_rating',
            'answer_yes_no',
        ]
    
    def get_answer_option_text(self, obj):
        """Get option text if answer_option exists"""
        if obj.answer_option:
            return obj.answer_option.option_text
        return None


class SurveyQuestionSerializer(serializers.ModelSerializer):
    options = SurveyQuestionOptionSerializer(many=True, read_only=True)
    child_questions = serializers.SerializerMethodField()
    
    class Meta:
        model = SurveyQuestion
        fields = [
            'id',
            'question_text',
            'question_type',
            'question_level',
            'order',
            'is_required',
            'help_text',
            'rating_min',
            'rating_max',
            'rating_min_label',
            'rating_max_label',
            'options',
            'parent_question',
            'trigger_condition',
            'child_questions',
        ]
    
    def get_child_questions(self, obj):
        """Get all child questions that depend on this question"""
        child_qs = obj.child_questions.all()
        return SurveyQuestionSerializer(child_qs, many=True, read_only=True).data


class SurveyListSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Survey
        fields = [
            'id',
            'title',
            'description',
            'assessment_type',
            'is_active',
            'questions_count',
            'created',
        ]
    
    def get_questions_count(self, obj):
        return obj.questions.filter(question_level='static').count()


class SurveyDetailSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Survey
        fields = [
            'id',
            'title',
            'description',
            'assessment_type',
            'is_active',
            'questions',
            'created',
        ]
    
    def get_questions(self, obj):
        """Get all questions (static and dynamic) ordered by order field"""
        all_questions = obj.questions.all().order_by('order')
        return SurveyQuestionSerializer(all_questions, many=True).data


class SurveyResponseSerializer(serializers.ModelSerializer):
    answers = SurveyAnswerSerializer(many=True, read_only=True)
    survey_title = serializers.CharField(source='survey.title', read_only=True)
    
    class Meta:
        model = SurveyResponse
        fields = [
            'id',
            'survey',
            'survey_title',
            'status',
            'created',
            'completed_at',
            'total_score',
            'retake_count',
            'is_latest',
            'answers',
        ]


class SurveyResponseSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for appointment display"""
    survey_title = serializers.CharField(source='survey.title', read_only=True)
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SurveyResponse
        fields = [
            'id', 'survey', 'survey_title', 'patient_name',
            'status', 'total_score', 'created', 'completed_at', 'is_latest'
        ]
    
    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else "Unknown Patient"
        