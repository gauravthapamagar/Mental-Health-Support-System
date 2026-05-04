from django.contrib import admin
from .models import Survey, SurveyQuestion, SurveyQuestionOption, SurveyResponse, SurveyAnswer


class SurveyQuestionOptionInline(admin.TabularInline):
    model = SurveyQuestionOption
    extra = 1
    fields = ['option_text', 'option_value', 'order', 'score']


class SurveyQuestionInline(admin.TabularInline):
    model = SurveyQuestion
    extra = 1
    fields = ['question_text', 'question_type', 'order', 'is_required']


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ['title', 'assessment_type', 'is_active', 'created']
    list_filter = ['assessment_type', 'is_active', 'created']
    search_fields = ['title', 'description']
    inlines = [SurveyQuestionInline]
    date_hierarchy = 'created'


@admin.register(SurveyQuestion)
class SurveyQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'survey', 'question_type', 'order', 'is_required']
    list_filter = ['survey', 'question_type', 'is_required']
    search_fields = ['question_text', 'survey__title']
    inlines = [SurveyQuestionOptionInline]
    ordering = ['survey', 'order']


@admin.register(SurveyQuestionOption)
class SurveyQuestionOptionAdmin(admin.ModelAdmin):
    list_display = ['option_text', 'question', 'order', 'score']
    list_filter = ['question__survey', 'question']
    search_fields = ['option_text', 'question__question_text']
    ordering = ['question', 'order']


@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = ['patient', 'survey', 'status', 'created', 'completed_at', 'total_score']
    list_filter = ['survey', 'status', 'created']
    search_fields = ['patient__username', 'patient__email', 'survey__title']
    readonly_fields = ['patient', 'survey', 'created', 'total_score']
    date_hierarchy = 'created'
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(SurveyAnswer)
class SurveyAnswerAdmin(admin.ModelAdmin):
    list_display = ['response', 'question', 'answer_summary']
    list_filter = ['response__survey', 'question__question_type', 'response__created']
    search_fields = ['response__patient__username', 'question__question_text']
    readonly_fields = ['response', 'question']
    date_hierarchy = 'created'
    
    def answer_summary(self, obj):
        if obj.answer_text:
            return obj.answer_text[:50]
        elif obj.answer_option:
            return obj.answer_option.option_text
        elif obj.answer_rating is not None:
            return f"Rating: {obj.answer_rating}"
        elif obj.answer_yes_no is not None:
            return "Yes" if obj.answer_yes_no else "No"
        return "-"
    answer_summary.short_description = "Answer"
    
    def has_add_permission(self, request):
        return False
