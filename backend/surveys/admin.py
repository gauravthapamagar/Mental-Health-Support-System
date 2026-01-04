from django.contrib import admin
from .models import Survey, Question, Response, DynamicQuestionHistory


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'status', 'risk_level', 'started_at', 'completed_at']
    list_filter = ['status', 'risk_level', 'started_at']
    search_fields = ['patient__email', 'patient__full_name']
    readonly_fields = ['started_at', 'completed_at']
    
    fieldsets = (
        ('Survey Info', {
            'fields': ('patient', 'status', 'started_at', 'completed_at')
        }),
        ('Analysis', {
            'fields': ('analysis_summary', 'risk_level')
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'question_type', 'response_type', 'is_active', 'question_text_short']
    list_filter = ['question_type', 'response_type', 'is_active']
    search_fields = ['question_text']
    ordering = ['order']
    
    def question_text_short(self, obj):
        return obj.question_text[:50] + '...' if len(obj.question_text) > 50 else obj.question_text
    question_text_short.short_description = 'Question'


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ['id', 'survey', 'question_order', 'question_short', 'answer_short', 'created_at']
    list_filter = ['created_at', 'question__question_type']
    search_fields = ['survey__patient__email', 'answer']
    readonly_fields = ['created_at']
    
    def question_order(self, obj):
        return obj.question.order
    question_order.short_description = 'Q#'
    
    def question_short(self, obj):
        return obj.question.question_text[:40] + '...'
    question_short.short_description = 'Question'
    
    def answer_short(self, obj):
        return obj.answer[:50] + '...' if len(obj.answer) > 50 else obj.answer
    answer_short.short_description = 'Answer'


@admin.register(DynamicQuestionHistory)
class DynamicQuestionHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'survey', 'question_short', 'answer_short', 'created_at']
    list_filter = ['created_at']
    search_fields = ['survey__patient__email', 'question_text', 'answer']
    readonly_fields = ['created_at']
    
    def question_short(self, obj):
        return obj.question_text[:50] + '...'
    question_short.short_description = 'Dynamic Question'
    
    def answer_short(self, obj):
        return obj.answer[:50] + '...' if len(obj.answer) > 50 else obj.answer
    answer_short.short_description = 'Answer'