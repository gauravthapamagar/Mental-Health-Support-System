from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q

from accounts.permissions import IsTherapist, IsPatient
from .session_reports import SessionReport
from .models import Appointment
from .session_report_serializers import (
    SessionReportCreateSerializer,
    SessionReportListSerializer,
    SessionReportDetailSerializer,
    SessionReportUpdateSerializer,
    PatientSessionSummarySerializer,
)


# ============ PAGINATION ============
class SessionReportPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class AppointmentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


# ============ THERAPIST VIEWS ============

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTherapist])
def create_session_report(request):
    """
    Create a new session report for a completed appointment.
    Therapist fills out structured form with progress data.
    
    POST /booking/session-reports/create/
    """
    serializer = SessionReportCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        report = serializer.save()
        # Return with detail serializer so therapist sees all their entered data
        return Response(
            {
                'message': 'Session report created successfully',
                'report': SessionReportDetailSerializer(report).data
            },
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTherapist])
def get_therapist_session_reports(request):
    """
    Get all session reports written by therapist.
    Can filter by patient, date range, session outcome.
    
    GET /booking/session-reports/
    
    Query Parameters:
    - patient_id: Filter by patient ID
    - session_outcome: Filter by outcome (productive, breakthrough, needs_follow_up, blocked)
    - start_date: Filter from date (YYYY-MM-DD)
    - end_date: Filter to date (YYYY-MM-DD)
    - page: Page number (default 1)
    """
    # Get all reports for this therapist
    reports = SessionReport.objects.filter(
        therapist=request.user
    ).select_related('patient', 'therapist', 'appointment').order_by('-created_at')
    
    # Filter by patient
    patient_id = request.query_params.get('patient_id')
    if patient_id:
        reports = reports.filter(patient_id=patient_id)
    
    # Filter by session outcome
    outcome = request.query_params.get('session_outcome')
    if outcome:
        reports = reports.filter(session_outcome=outcome)
    
    # Filter by date range
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    if start_date:
        reports = reports.filter(created_at__date__gte=start_date)
    if end_date:
        reports = reports.filter(created_at__date__lte=end_date)
    
    # Paginate results
    paginator = SessionReportPagination()
    paginated_reports = paginator.paginate_queryset(reports, request)
    serializer = SessionReportListSerializer(paginated_reports, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTherapist])
def get_session_report_detail(request, report_id):
    """
    Get detailed view of a specific session report with ALL fields.
    Therapist can only view their own reports.
    
    GET /booking/session-reports/{report_id}/
    """
    report = get_object_or_404(SessionReport, id=report_id)
    
    # Check permission
    if report.therapist != request.user:
        return Response(
            {'error': 'You do not have permission to view this report'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Return full detail with all fields
    serializer = SessionReportDetailSerializer(report)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsTherapist])
def update_session_report(request, report_id):
    """
    Update an existing session report.
    Therapist can only update their own reports.
    
    PATCH /booking/session-reports/{report_id}/update/
    """
    report = get_object_or_404(SessionReport, id=report_id)
    
    # Check permission
    if report.therapist != request.user:
        return Response(
            {'error': 'You do not have permission to edit this report'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = SessionReportUpdateSerializer(
        report,
        data=request.data,
        partial=True,
        context={'request': request}
    )
    
    if serializer.is_valid():
        report = serializer.save()
        # Return with detail serializer so therapist sees all their data
        return Response(
            {
                'message': 'Session report updated successfully',
                'report': SessionReportDetailSerializer(report).data
            },
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsTherapist])
def delete_session_report(request, report_id):
    """
    Delete a session report (only if not shared with patient).
    
    DELETE /booking/session-reports/{report_id}/delete/
    """
    report = get_object_or_404(SessionReport, id=report_id)
    
    # Check permission
    if report.therapist != request.user:
        return Response(
            {'error': 'You do not have permission to delete this report'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Don't allow deletion if patient can see it
    if report.patient_visible:
        return Response(
            {'error': 'Cannot delete a report that is visible to the patient'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    report.delete()
    return Response(
        {'message': 'Session report deleted successfully'},
        status=status.HTTP_204_NO_CONTENT
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTherapist])
def get_completed_appointments_for_reports(request):
    """
    Get list of completed appointments that don't have reports yet.
    Used in the "Write Report" flow - shows which sessions need reports.
    
    GET /booking/appointments/completed-for-reports/
    """
    # Get completed appointments for this therapist that don't have reports
    appointments = Appointment.objects.filter(
        therapist=request.user,
        status='completed'
    ).exclude(
        session_report__isnull=False
    ).select_related('patient').order_by('-appointment_date', '-start_time')
    
    # Paginate
    paginator = AppointmentPagination()
    paginated = paginator.paginate_queryset(appointments, request)
    
    # Simple serialization with key info
    data = [{
        'id': apt.id,
        'patient_name': apt.patient.full_name,
        'patient_id': apt.patient.id,
        'appointment_date': apt.appointment_date,
        'start_time': apt.start_time,
        'end_time': apt.end_time,
        'reason_for_visit': getattr(apt, 'reason_for_visit', ''),
        'session_mode': getattr(apt, 'session_mode', ''),
    } for apt in paginated]
    
    return paginator.get_paginated_response(data)


# ============ PATIENT VIEWS ============

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPatient])
def get_patient_session_progress(request):
    """
    Get visible session reports/progress summaries for patient.
    Only returns reports where therapist has enabled patient_visible=True
    
    GET /booking/patient/progress/
    """
    # Get only visible reports for this patient
    reports = SessionReport.objects.filter(
        patient=request.user,
        patient_visible=True
    ).select_related('therapist', 'appointment').order_by('-created_at')
    
    # Paginate
    paginator = SessionReportPagination()
    paginated_reports = paginator.paginate_queryset(reports, request)
    serializer = PatientSessionSummarySerializer(paginated_reports, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPatient])
def get_patient_progress_analytics(request):
    """
    Get analytics dashboard data for patient progress tracking.
    Shows mood trends, symptom improvements, achievements over time.
    
    GET /booking/patient/progress-analytics/
    """
    # Get all visible reports for this patient
    reports = SessionReport.objects.filter(
        patient=request.user,
        patient_visible=True
    ).select_related('appointment').order_by('created_at')
    
    if not reports.exists():
        return Response({
            'message': 'No session reports available yet',
            'mood_trend': [],
            'symptom_trends': {},
            'latest_session': None,
            'total_sessions': 0,
            'average_mood': 0,
        }, status=status.HTTP_200_OK)
    
    # Build mood trend
    mood_trend = [
        {
            'date': report.appointment_date,
            'mood': report.mood_rating
        }
        for report in reports
    ]
    
    # Build symptom trends
    symptom_trends = {}
    for report in reports:
        if report.symptom_improvement:
            for symptom, score in report.symptom_improvement.items():
                if symptom not in symptom_trends:
                    symptom_trends[symptom] = []
                symptom_trends[symptom].append({
                    'date': report.appointment_date,
                    'score': score
                })
    
    # Get latest session
    latest_report = reports.last()
    
    # Calculate average mood
    average_mood = sum(r.mood_rating for r in reports) / reports.count()
    
    return Response({
        'mood_trend': mood_trend,
        'symptom_trends': symptom_trends,
        'latest_session': PatientSessionSummarySerializer(latest_report).data if latest_report else None,
        'total_sessions': reports.count(),
        'average_mood': round(average_mood, 2),
    }, status=status.HTTP_200_OK)