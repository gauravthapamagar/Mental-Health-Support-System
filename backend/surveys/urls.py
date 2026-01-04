from django.urls import path
from . import views

urlpatterns = [
    # Survey management
    path('start/', views.start_survey, name='start-survey'),
    path('history/', views.get_survey_history, name='survey-history'),
    path('detail/<int:survey_id>/', views.get_survey_detail, name='survey-detail'),
    
    # Static questions
    path('questions/static/', views.get_static_questions, name='get-static-questions'),
    path('responses/static/', views.submit_static_responses, name='submit-static-responses'),
    
    # Dynamic questions
    path('questions/dynamic/', views.get_next_dynamic_question, name='get-dynamic-question'),
    path('responses/dynamic/', views.submit_dynamic_answer, name='submit-dynamic-answer'),
    
    # Complete survey
    path('complete/', views.complete_survey, name='complete-survey'),
]