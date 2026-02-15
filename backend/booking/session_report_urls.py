from django.urls import path
from . import session_report_views

urlpatterns = [
    # Therapist - Write and manage session reports
    path('session-reports/create/', session_report_views.create_session_report, name='create-session-report'),
    path('session-reports/', session_report_views.get_therapist_session_reports, name='list-session-reports'),
    path('session-reports/<int:report_id>/', session_report_views.get_session_report_detail, name='session-report-detail'),
    path('session-reports/<int:report_id>/update/', session_report_views.update_session_report, name='update-session-report'),
    path('session-reports/<int:report_id>/delete/', session_report_views.delete_session_report, name='delete-session-report'),
    
    # Therapist - Get completed appointments needing reports
    path('appointments/completed-for-reports/', session_report_views.get_completed_appointments_for_reports, name='completed-appointments-for-reports'),
    
    # Patient - View progress summaries
    path('patient/progress/', session_report_views.get_patient_session_progress, name='patient-progress'),
    path('patient/progress-analytics/', session_report_views.get_patient_progress_analytics, name='patient-progress-analytics'),
]
