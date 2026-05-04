from rest_framework import serializers
from datetime import datetime
from .session_reports import SessionReport
from accounts.models import User


class TherapistMinimalSerializer(serializers.ModelSerializer):
    """Minimal therapist info for session report"""
    profession = serializers.CharField(source='therapist_profile.profession_type', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'profession']


class PatientMinimalSerializer(serializers.ModelSerializer):
    """Minimal patient info for session report"""
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']


class SessionReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating session reports (Therapist only)"""
    
    class Meta:
        model = SessionReport
        fields = [
            'appointment',
            'session_summary',
            'mood_rating',
            'symptom_improvement',
            'treatment_goals_addressed',
            'session_outcome',
            'homework_assigned',
            'triggers_identified',
            'notes_for_next_session',
            'clinical_observations',
            'patient_visible',
        ]
        extra_kwargs = {
            'session_summary': {'required': True, 'min_length': 10},
            'mood_rating': {'required': True},
            'session_outcome': {'required': True},
            'homework_assigned': {'required': False},
            'triggers_identified': {'required': False},
            'notes_for_next_session': {'required': False},
            'clinical_observations': {'required': False},
        }
    
    def validate_mood_rating(self, value):
        if value < 1 or value > 10:
            raise serializers.ValidationError("Mood rating must be between 1 and 10")
        return value
    
    def validate_session_summary(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Session summary must be at least 10 characters")
        return value
    
    def validate_appointment(self, value):
        """Ensure appointment is completed and doesn't have a report already"""
        if value.status != 'completed':
            raise serializers.ValidationError(
                f"Can only write reports for completed appointments. Current status: {value.get_status_display()}"
            )
        
        if hasattr(value, 'session_report'):
            raise serializers.ValidationError("A report already exists for this appointment")
        
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        appointment = validated_data['appointment']
        
        # Auto-set therapist and patient
        validated_data['therapist'] = request.user
        validated_data['patient'] = appointment.patient
        
        return SessionReport.objects.create(**validated_data)


class SessionReportListSerializer(serializers.ModelSerializer):
    """Serializer for listing session reports - shows summary view"""
    therapist = TherapistMinimalSerializer(read_only=True)
    patient = PatientMinimalSerializer(read_only=True)
    appointment_date = serializers.DateField(source='appointment.appointment_date', read_only=True)
    session_outcome_display = serializers.CharField(source='get_session_outcome_display', read_only=True)
    
    class Meta:
        model = SessionReport
        fields = [
            'id',
            'appointment',
            'appointment_date',
            'therapist',
            'patient',
            'mood_rating',
            'session_outcome',
            'session_outcome_display',
            'homework_assigned',
            'patient_visible',
            'created_at',
        ]
        read_only_fields = fields


class SessionReportDetailSerializer(serializers.ModelSerializer):
    """Detailed session report for therapist view - FULL DETAILS"""
    therapist = TherapistMinimalSerializer(read_only=True)
    patient = PatientMinimalSerializer(read_only=True)
    appointment_date = serializers.DateField(source='appointment.appointment_date', read_only=True)
    session_outcome_display = serializers.CharField(source='get_session_outcome_display', read_only=True)
    
    class Meta:
        model = SessionReport
        fields = [
            'id',
            'appointment',
            'appointment_date',
            'therapist',
            'patient',
            'session_summary',
            'mood_rating',
            'symptom_improvement',
            'treatment_goals_addressed',
            'session_outcome',
            'session_outcome_display',
            'homework_assigned',
            'triggers_identified',
            'notes_for_next_session',
            'clinical_observations',
            'patient_visible',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['therapist', 'patient', 'appointment', 'created_at', 'updated_at', 'appointment_date']


class SessionReportUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating session reports - includes all editable fields"""
    # Include therapist and patient for context (read-only)
    therapist = TherapistMinimalSerializer(read_only=True)
    patient = PatientMinimalSerializer(read_only=True)
    appointment_date = serializers.DateField(source='appointment.appointment_date', read_only=True)
    session_outcome_display = serializers.CharField(source='get_session_outcome_display', read_only=True)
    
    class Meta:
        model = SessionReport
        fields = [
            # Read-only context fields
            'id',
            'appointment',
            'appointment_date',
            'therapist',
            'patient',
            'session_outcome_display',
            'created_at',
            'updated_at',
            # Editable fields
            'session_summary',
            'mood_rating',
            'symptom_improvement',
            'treatment_goals_addressed',
            'session_outcome',
            'homework_assigned',
            'triggers_identified',
            'notes_for_next_session',
            'clinical_observations',
            'patient_visible',
        ]
        read_only_fields = ['therapist', 'patient', 'appointment', 'appointment_date', 'session_outcome_display', 'created_at', 'updated_at']
    
    def validate_mood_rating(self, value):
        if value < 1 or value > 10:
            raise serializers.ValidationError("Mood rating must be between 1 and 10")
        return value
    
    def validate_session_summary(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Session summary must be at least 10 characters")
        return value


class PatientSessionSummarySerializer(serializers.ModelSerializer):
    """Anonymized session summary for patient view"""
    session_outcome_display = serializers.CharField(source='get_session_outcome_display', read_only=True)
    appointment_date = serializers.DateField(source='appointment.appointment_date', read_only=True)
    
    class Meta:
        model = SessionReport
        fields = [
            'id',
            'appointment_date',
            'mood_rating',
            'session_outcome',
            'session_outcome_display',
            'symptom_improvement',
            'treatment_goals_addressed',
            'homework_assigned',
            'created_at',
        ]
        read_only_fields = fields