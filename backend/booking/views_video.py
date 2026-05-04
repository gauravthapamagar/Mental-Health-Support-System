# booking/views_video.py
"""
FIXED VERSION - Allows multiple users to join active sessions
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
import logging

from .models import Appointment, AppointmentHistory
from .services.video_service import VideoService, VideoServiceError

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_video_token(request, appointment_id):
    """
    Generate Agora video token - ALLOWS JOINING ACTIVE SESSIONS
    """
    try:
        appointment = get_object_or_404(Appointment, id=appointment_id)
        
        # Check permissions
        if request.user not in [appointment.patient, appointment.therapist]:
            return Response({
                'error': 'You are not a participant in this appointment',
                'can_start': False
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if session can be started
        can_start, reason = VideoService.can_start_session(appointment)
        
        if not can_start:
            return Response({
                'error': reason,
                'can_start': False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ✅ FIX: ALWAYS regenerate tokens, even if session already started
        # This allows both users to join at different times
        logger.info(f"Generating fresh tokens for appointment {appointment_id}")
        
        # Clear and regenerate tokens
        appointment.video_channel_name = None
        appointment.video_token_patient = None
        appointment.video_token_therapist = None
        appointment.save(update_fields=[
            'video_channel_name',
            'video_token_patient',
            'video_token_therapist'
        ])
        
        # Generate fresh tokens
        try:
            tokens_data = VideoService.generate_tokens_for_appointment(appointment)
        except VideoServiceError as e:
            logger.error(f"Token generation failed: {str(e)}")
            return Response({
                'error': str(e),
                'can_start': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Return correct token based on user role
        is_patient = request.user == appointment.patient
        user_token_data = tokens_data['patient'] if is_patient else tokens_data['therapist']
        
        logger.info(
            f"Token generated for appointment {appointment_id}, "
            f"user={request.user.id}, uid={user_token_data['uid']}"
        )
        
        return Response({
            'token': user_token_data['token'],
            'channel_name': tokens_data['channel_name'],
            'app_id': tokens_data['app_id'],
            'uid': user_token_data['uid'],
            'expires_at': tokens_data['expires_at'],
            'can_start': True,
            'message': 'Token generated successfully',
            'role': 'patient' if is_patient else 'therapist',
            'other_participant': {
                'name': appointment.therapist.full_name if is_patient else appointment.patient.full_name,
                'role': 'therapist' if is_patient else 'patient'
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.exception(f"Unexpected error: {str(e)}")
        return Response({
            'error': 'An unexpected error occurred',
            'can_start': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_video_session(request, appointment_id):
    """
    Mark session as started - allows multiple calls (for rejoining)
    """
    try:
        appointment = get_object_or_404(Appointment, id=appointment_id)
        
        if request.user not in [appointment.patient, appointment.therapist]:
            return Response({
                'error': 'You are not a participant in this appointment'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Mark session as started (only once)
        if not appointment.session_started_at:
            with transaction.atomic():
                appointment.session_started_at = timezone.now()
                appointment.save(update_fields=['session_started_at'])
                
                AppointmentHistory.objects.create(
                    appointment=appointment,
                    changed_by=request.user,
                    action='session_started',
                    notes=f'Video session started by {request.user.full_name}'
                )
                
                logger.info(f"Session started for appointment {appointment_id}")
        else:
            logger.info(f"User {request.user.id} rejoining active session {appointment_id}")
        
        return Response({
            'message': 'Session started successfully',
            'session_started_at': appointment.session_started_at
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.exception(f"Error starting session: {str(e)}")
        return Response({
            'error': 'An unexpected error occurred'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_video_session(request, appointment_id):
    """
    Mark session as ended
    """
    try:
        appointment = get_object_or_404(Appointment, id=appointment_id)
        
        if request.user not in [appointment.patient, appointment.therapist]:
            return Response({
                'error': 'You are not a participant in this appointment'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not appointment.session_started_at:
            return Response({
                'error': 'Session has not been started yet'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not appointment.session_ended_at:
            with transaction.atomic():
                appointment.session_ended_at = timezone.now()
                
                duration = appointment.session_ended_at - appointment.session_started_at
                appointment.session_duration_minutes = int(duration.total_seconds() / 60)
                
                recording_sid = request.data.get('recording_sid')
                if recording_sid:
                    appointment.recording_sid = recording_sid
                
                if appointment.status != 'completed':
                    appointment.status = 'completed'
                
                appointment.save(update_fields=[
                    'session_ended_at',
                    'session_duration_minutes',
                    'recording_sid',
                    'status'
                ])
                
                AppointmentHistory.objects.create(
                    appointment=appointment,
                    changed_by=request.user,
                    action='session_completed',
                    notes=f'Video session ended. Duration: {appointment.session_duration_minutes} min'
                )
                
                logger.info(f"Session ended for appointment {appointment_id}")
        
        return Response({
            'message': 'Session ended successfully',
            'session_ended_at': appointment.session_ended_at,
            'duration_minutes': appointment.session_duration_minutes
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.exception(f"Error ending session: {str(e)}")
        return Response({
            'error': 'An unexpected error occurred'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_video_session_status(request, appointment_id):
    """
    Get session status
    """
    try:
        appointment = get_object_or_404(Appointment, id=appointment_id)
        
        if request.user not in [appointment.patient, appointment.therapist]:
            return Response({
                'error': 'You are not a participant in this appointment'
            }, status=status.HTTP_403_FORBIDDEN)
        
        can_start, reason = VideoService.can_start_session(appointment)
        
        is_active = (
            appointment.session_started_at is not None and 
            appointment.session_ended_at is None
        )
        
        return Response({
            'is_active': is_active,
            'can_start': can_start,
            'can_start_reason': reason,
            'session_started_at': appointment.session_started_at,
            'session_ended_at': appointment.session_ended_at,
            'duration_minutes': appointment.session_duration_minutes,
            'appointment_date': str(appointment.appointment_date),
            'start_time': str(appointment.start_time),
            'session_mode': appointment.session_mode,
            'status': appointment.status
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.exception(f"Error getting status: {str(e)}")
        return Response({
            'error': 'An unexpected error occurred'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)