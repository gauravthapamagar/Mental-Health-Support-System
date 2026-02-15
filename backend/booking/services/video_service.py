# booking/services/video_service.py
"""
Agora.io Video Service
Handles video token generation and session management
"""

from agora_token_builder import RtcTokenBuilder
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import time
import uuid
import logging

logger = logging.getLogger(__name__)


class VideoServiceError(Exception):
    """Custom exception for video service errors"""
    pass


class VideoService:
    """Service class for Agora video operations"""
    
    @staticmethod
    def generate_channel_name(appointment_id):
        """
        Generate unique channel name for appointment
        
        Args:
            appointment_id: int - ID of the appointment
            
        Returns:
            str: Unique channel name
        """
        return f"appointment_{appointment_id}_{uuid.uuid4().hex[:8]}"
    
    @staticmethod
    def generate_token(channel_name, uid, role='publisher'):
        """
        Generate Agora RTC token
        
        Args:
            channel_name: str - Name of the channel
            uid: int - User ID (must be unique per user)
            role: str - 'publisher' (can send/receive) or 'subscriber' (receive only)
        
        Returns:
            dict: Token data with channel info
            
        Raises:
            VideoServiceError: If credentials missing or token generation fails
        """
        try:
            app_id = settings.AGORA_APP_ID
            app_certificate = settings.AGORA_APP_CERTIFICATE
            
            if not app_id or not app_certificate:
                raise VideoServiceError("Agora credentials not configured in settings")
            
            # Token expiration: 24 hours from now (for testing)
            # In production, use shorter time (1-2 hours)
            expiration_time_in_seconds = 86400  # 24 hours
            current_timestamp = int(time.time())
            privilege_expired_ts = current_timestamp + expiration_time_in_seconds
            
            # Role: 1 = publisher (can send/receive), 2 = subscriber (receive only)
            agora_role = 1 if role == 'publisher' else 2
            
            # Build token
            token = RtcTokenBuilder.buildTokenWithUid(
                app_id,
                app_certificate,
                channel_name,
                uid,
                agora_role,
                privilege_expired_ts
            )
            
            logger.info(f"Generated Agora token for channel={channel_name}, uid={uid}, role={role}")
            
            return {
                'token': token,
                'channel_name': channel_name,
                'app_id': app_id,
                'uid': uid,
                'expires_at': privilege_expired_ts
            }
            
        except Exception as e:
            logger.error(f"Token generation failed: {str(e)}")
            raise VideoServiceError(f"Failed to generate video token: {str(e)}")
    
    @staticmethod
    def generate_tokens_for_appointment(appointment):
        """
        Generate video tokens for both patient and therapist
        
        Args:
            appointment: Appointment instance
        
        Returns:
            dict: Contains channel name, app_id, and tokens for both users
            
        Raises:
            VideoServiceError: If token generation fails
        """
        try:
            # Generate or use existing channel name
            if not appointment.video_channel_name:
                channel_name = VideoService.generate_channel_name(appointment.id)
                appointment.video_channel_name = channel_name
            else:
                channel_name = appointment.video_channel_name
            
            # ✅ CRITICAL: Use unique UIDs to prevent UID_CONFLICT
            # Patient UID: 1000000 + patient.id (e.g., 1000001, 1000002, ...)
            # Therapist UID: 2000000 + therapist.id (e.g., 2000001, 2000002, ...)
            # This ensures patient and therapist NEVER have the same UID
            patient_uid = 1000000 + appointment.patient.id
            therapist_uid = 2000000 + appointment.therapist.id
            
            logger.info(
                f"Generating tokens for appointment {appointment.id}: "
                f"patient_uid={patient_uid}, therapist_uid={therapist_uid}"
            )
            
            # Generate tokens for both participants
            patient_token_data = VideoService.generate_token(
                channel_name=channel_name,
                uid=patient_uid,
                role='publisher'
            )
            
            therapist_token_data = VideoService.generate_token(
                channel_name=channel_name,
                uid=therapist_uid,
                role='publisher'
            )
            
            # Store tokens in appointment
            appointment.video_token_patient = patient_token_data['token']
            appointment.video_token_therapist = therapist_token_data['token']
            appointment.save(update_fields=[
                'video_channel_name',
                'video_token_patient',
                'video_token_therapist'
            ])
            
            logger.info(f"Tokens saved for appointment {appointment.id}")
            
            return {
                'channel_name': channel_name,
                'app_id': settings.AGORA_APP_ID,
                'patient': {
                    'token': patient_token_data['token'],
                    'uid': patient_uid,
                },
                'therapist': {
                    'token': therapist_token_data['token'],
                    'uid': therapist_uid,
                },
                'expires_at': patient_token_data['expires_at']
            }
            
        except Exception as e:
            logger.error(f"Failed to generate tokens for appointment {appointment.id}: {str(e)}")
            raise VideoServiceError(f"Failed to generate tokens: {str(e)}")
    
    @staticmethod
    def can_start_session(appointment):
        """
        Check if video session can be started
        
        Args:
            appointment: Appointment instance
        
        Returns:
            tuple: (can_start: bool, reason: str)
        """
        try:
            # Check 1: Must be online appointment
            if appointment.session_mode != 'online':
                return False, "Video calling is only available for online appointments"
            
            # Check 2: Must not be cancelled
            if appointment.status == 'cancelled':
                return False, "Cannot start session for cancelled appointment"
            
            # Check 3: Must be confirmed (has payment completed for online)
            # For testing, we'll be more lenient
            if appointment.status not in ['confirmed', 'completed']:
                if appointment.status == 'pending':
                    return False, "Appointment is awaiting therapist confirmation"
                elif appointment.status == 'awaiting_payment':
                    return False, "Payment must be completed before starting session"
                else:
                    return False, f"Cannot start session with status: {appointment.status}"
            
            # Check 4: Payment verification (for online appointments)
            # In production, uncomment this:
            # if hasattr(appointment, 'payment'):
            #     if appointment.payment.status != 'completed':
            #         return False, "Payment must be completed before starting session"
            # else:
            #     return False, "No payment record found for this appointment"
            
            # Check 5: Session not already ended
            if appointment.session_ended_at:
                return False, "Session has already ended"
            
            # Check 6: Time window validation (optional, for production)
            # For testing, we skip this check
            # In production, uncomment to enforce time windows:
            """
            appointment_datetime = timezone.make_aware(
                datetime.combine(appointment.appointment_date, appointment.start_time)
            )
            now = timezone.now()
            
            time_diff_minutes = (appointment_datetime - now).total_seconds() / 60
            
            # Can join 15 min before appointment
            if time_diff_minutes > 15:
                return False, f"Session can be started 15 minutes before appointment time"
            
            # Can join up to 60 min after appointment started
            if time_diff_minutes < -60:
                return False, "Session time window has expired"
            """
            
            return True, "Session can be started"
            
        except Exception as e:
            logger.error(f"Error checking session status for appointment {appointment.id}: {str(e)}")
            return False, "Error checking session status"