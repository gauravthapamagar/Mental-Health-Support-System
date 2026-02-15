from django.urls import path
from . import session_report_views

"""
Session Report URL Configuration

All endpoints are properly namespaced under /booking/ prefix
and use consistent naming with the API client.
"""

urlpatterns = [
    # ============ THERAPIST ENDPOINTS ============
    
    # Create new session report
    # POST /booking/session-reports/create/
    path('session-reports/create/', session_report_views.create_session_report, name='create-session-report'),
    
    # List all reports for therapist (with filtering & pagination)
    # GET /booking/session-reports/
    # Query params: patient_id, session_outcome, start_date, end_date, page
    path('session-reports/', session_report_views.get_therapist_session_reports, name='list-session-reports'),
    
    # Get single report with full details
    # GET /booking/session-reports/<int:report_id>/
    path('session-reports/<int:report_id>/', session_report_views.get_session_report_detail, name='session-report-detail'),
    
    # Update existing report
    # PATCH /booking/session-reports/<int:report_id>/update/
    path('session-reports/<int:report_id>/update/', session_report_views.update_session_report, name='update-session-report'),
    
    # Delete report
    # DELETE /booking/session-reports/<int:report_id>/delete/
    path('session-reports/<int:report_id>/delete/', session_report_views.delete_session_report, name='delete-session-report'),
    
    # Get completed appointments needing reports
    # GET /booking/appointments/completed-for-reports/
    path('appointments/completed-for-reports/', session_report_views.get_completed_appointments_for_reports, name='completed-appointments-for-reports'),
    
    # ============ PATIENT ENDPOINTS ============
    
    # Get patient's visible session progress
    # GET /booking/patient/progress/
    path('patient/progress/', session_report_views.get_patient_session_progress, name='patient-progress'),
    
    # Get patient's progress analytics (mood trends, etc.)
    # GET /booking/patient/progress-analytics/
    path('patient/progress-analytics/', session_report_views.get_patient_progress_analytics, name='patient-progress-analytics'),
]