from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta, time
from django.db import models
from .models import (
    TherapistAvailability, TimeOffPeriod, Appointment, 
    AppointmentHistory, AppointmentFeedback
)
from accounts.models import User


class TherapistAvailabilitySerializer(serializers.ModelSerializer):
    day_label = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = TherapistAvailability
        fields = [
            'id', 'day_of_week', 'day_label', 'start_time', 
            'end_time', 'is_active'
        ]


class TimeOffPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeOffPeriod
        fields = ['id', 'start_date', 'end_date', 'reason']


class TherapistMinimalSerializer(serializers.ModelSerializer):
    """Minimal therapist info for appointment display"""
    profession = serializers.CharField(source='therapist_profile.profession_type', read_only=True)
    is_verified = serializers.BooleanField(source='therapist_profile.is_verified', read_only=True)
    consultation_fees = serializers.DecimalField(
        source='therapist_profile.consultation_fees',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'profession', 'is_verified', 'consultation_fees']


class PatientMinimalSerializer(serializers.ModelSerializer):
    """Minimal patient info for appointment display"""
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone_number']


class AppointmentListSerializer(serializers.ModelSerializer):
    """Serializer for listing appointments"""
    therapist = TherapistMinimalSerializer(read_only=True)
    patient = PatientMinimalSerializer(read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    appointment_type_label = serializers.CharField(source='get_appointment_type_display', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'therapist', 'appointment_date', 'start_time',
            'end_time', 'duration_minutes', 'appointment_type', 
            'appointment_type_label', 'status', 'status_label', 'session_mode',
            'is_upcoming', 'can_cancel', 'created_at'
        ]


class AppointmentDetailSerializer(serializers.ModelSerializer):
    """Detailed appointment information"""
    therapist = TherapistMinimalSerializer(read_only=True)
    patient = PatientMinimalSerializer(read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    appointment_type_label = serializers.CharField(source='get_appointment_type_display', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    cancelled_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'therapist', 'appointment_date', 'start_time',
            'end_time', 'duration_minutes', 'appointment_type', 
            'appointment_type_label', 'status', 'status_label',
            'reason_for_visit', 'patient_notes', 'contact_phone', 
            'contact_email', 'session_mode', 'meeting_link', 'meeting_id',
            'therapist_notes', 'cancelled_by', 'cancelled_by_name',
            'cancellation_reason', 'cancelled_at', 'is_upcoming', 'is_past',
            'can_cancel', 'created_at', 'updated_at', 'confirmed_at'
        ]
    
    def get_cancelled_by_name(self, obj):
        if obj.cancelled_by:
            return obj.cancelled_by.full_name
        return None


class CreateAppointmentSerializer(serializers.ModelSerializer):
    """Serializer for creating new appointments"""
    
    class Meta:
        model = Appointment
        fields = [
            'therapist', 'appointment_date', 'start_time', 'duration_minutes',
            'appointment_type', 'reason_for_visit', 'patient_notes',
            'contact_phone', 'contact_email', 'session_mode'
        ]
        # Make contact info optional in request, we fill it from user profile if missing
        extra_kwargs = {
            'contact_phone': {'required': False},
            'contact_email': {'required': False}
        }

    def validate_appointment_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Cannot book appointments in the past")
        return value

    def validate_therapist(self, value):
        if value.role != 'therapist':
            raise serializers.ValidationError("Selected user is not a therapist")
        if not hasattr(value, 'therapist_profile'):
            raise serializers.ValidationError("Therapist profile not found")
        return value

    def validate(self, attrs):
        therapist = attrs['therapist']
        appointment_date = attrs['appointment_date']
        start_time = attrs['start_time']
        duration = attrs.get('duration_minutes', 60)
        
        # 1. Calculate end time
        start_datetime = datetime.combine(appointment_date, start_time)
        end_datetime = start_datetime + timedelta(minutes=duration)
        end_time = end_datetime.time()
        
        # 2. Check Availability from JSON (Source used by the Slot Generator)
        day_name = appointment_date.strftime('%A') # e.g., "Monday"
        profile = therapist.therapist_profile
        availability_json = profile.availability_slots or {}
        
        is_available = False
        
        # Check if the day exists in JSON
        if day_name in availability_json:
            time_ranges = availability_json[day_name]
            for time_range in time_ranges:
                try:
                    range_start_str, range_end_str = time_range.split(' - ')
                    range_start = datetime.strptime(range_start_str.strip(), '%H:%M').time()
                    range_end = datetime.strptime(range_end_str.strip(), '%H:%M').time()
                    
                    if start_time >= range_start and end_time <= range_end:
                        is_available = True
                        break
                except:
                    continue

        # If not found in JSON, fallback check in the database Table (lowercase day)
        if not is_available:
            is_available = TherapistAvailability.objects.filter(
                therapist=therapist,
                day_of_week=day_name.lower(),
                is_active=True,
                start_time__lte=start_time,
                end_time__gte=end_time
            ).exists()

        if not is_available:
            raise serializers.ValidationError({
                'start_time': f"Therapist is not available at {start_time} on {day_name}."
            })

        # 3. Check for Time-Off
        time_off = TimeOffPeriod.objects.filter(
            therapist=therapist,
            start_date__lte=appointment_date,
            end_date__gte=appointment_date
        ).exists()
        
        if time_off:
            raise serializers.ValidationError({'appointment_date': "Therapist is on leave."})

        # 4. Check for Conflicts
        conflicting = Appointment.objects.filter(
            therapist=therapist,
            appointment_date=appointment_date,
            status__in=['pending', 'confirmed']
        ).filter(
            models.Q(start_time__lt=end_time, end_time__gt=start_time)
        ).exists()
        
        if conflicting:
            raise serializers.ValidationError({'start_time': "This time slot is already booked."})
        
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        
        # Auto-fill missing fields
        validated_data['patient'] = user
        if not validated_data.get('contact_phone'):
            validated_data['contact_phone'] = user.phone_number or "0000000000"
        if not validated_data.get('contact_email'):
            validated_data['contact_email'] = user.email

        # Calculate end_time for database storage
        start_datetime = datetime.combine(validated_data['appointment_date'], validated_data['start_time'])
        end_datetime = start_datetime + timedelta(minutes=validated_data.get('duration_minutes', 60))
        validated_data['end_time'] = end_datetime.time()

        appointment = Appointment.objects.create(**validated_data)

        # Log History
        AppointmentHistory.objects.create(
            appointment=appointment,
            changed_by=user,
            action='created',
            new_status='pending',
            notes='Appointment created by patient'
        )
        return appointment


class CancelAppointmentSerializer(serializers.Serializer):
    """Serializer for cancelling appointments"""
    cancellation_reason = serializers.CharField(required=True, max_length=500)
    
    def validate_cancellation_reason(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Cancellation reason must be at least 10 characters"
            )
        return value


class RescheduleAppointmentSerializer(serializers.Serializer):
    """Serializer for rescheduling appointments"""
    new_date = serializers.DateField(required=True)
    new_start_time = serializers.TimeField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate_new_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Cannot reschedule to a past date")
        return value


class ConfirmAppointmentSerializer(serializers.Serializer):
    """Serializer for therapist to confirm appointments"""
    meeting_link = serializers.URLField(required=False, allow_blank=True)
    therapist_notes = serializers.CharField(required=False, allow_blank=True)


class AppointmentFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentFeedback
        fields = ['rating', 'feedback_text', 'would_recommend', 'created_at']
        read_only_fields = ['created_at']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer for available time slots"""
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    is_available = serializers.BooleanField()


class TherapistListSerializer(serializers.ModelSerializer):
    """Serializer for listing therapists for booking"""
    profession = serializers.CharField(source='therapist_profile.profession_type', read_only=True)
    specialization = serializers.JSONField(source='therapist_profile.specialization_tags', read_only=True)
    languages = serializers.JSONField(source='therapist_profile.languages_spoken', read_only=True)
    consultation_mode = serializers.CharField(source='therapist_profile.consultation_mode', read_only=True)
    consultation_fees = serializers.DecimalField(
        source='therapist_profile.consultation_fees',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    is_verified = serializers.BooleanField(source='therapist_profile.is_verified', read_only=True)
    years_of_experience = serializers.IntegerField(source='therapist_profile.years_of_experience', read_only=True)
    bio = serializers.CharField(source='therapist_profile.bio', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'profession', 'specialization',
            'languages', 'consultation_mode', 'consultation_fees',
            'is_verified', 'years_of_experience', 'bio'
        ]

