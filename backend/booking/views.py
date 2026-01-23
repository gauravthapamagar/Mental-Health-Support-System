from django.db.models import Q
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Avg, Count
from datetime import datetime, timedelta, time
from accounts.permissions import IsPatient, IsTherapist
from .models import (
    TherapistAvailability, TimeOffPeriod, Appointment,
    AppointmentHistory, AppointmentFeedback
)
from .serializers import (
    TherapistAvailabilitySerializer, TimeOffPeriodSerializer,
    AppointmentListSerializer, AppointmentDetailSerializer,
    CreateAppointmentSerializer, CancelAppointmentSerializer,
    RescheduleAppointmentSerializer, ConfirmAppointmentSerializer,
    AppointmentFeedbackSerializer, TherapistListSerializer,
    AvailableSlotSerializer
)
from accounts.models import User


class AppointmentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


# ========== PATIENT VIEWS ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPatient])
def my_appointments(request):
    """
    Get all appointments for logged-in patient
    """
    # Use select_related to prevent N+1 queries for therapist and their profile
    appointments = Appointment.objects.filter(
        patient=request.user
    ).select_related('therapist', 'therapist__therapist_profile').order_by('-appointment_date', '-start_time')
    
    # Filter by status (e.g. ?status=pending)
    status_filter = request.query_params.get('status')
    if status_filter:
        appointments = appointments.filter(status=status_filter)
    
    # Filter by upcoming/past
    filter_type = request.query_params.get('filter')
    today = timezone.now().date()

    if filter_type == 'upcoming':
        appointments = appointments.filter(
            appointment_date__gte=today,
            status__in=['pending', 'confirmed']
        )
    elif filter_type == 'past':
        # Use Q objects for the OR condition to prevent 500 error
        appointments = appointments.filter(
            Q(appointment_date__lt=today) | 
            Q(status__in=['completed', 'cancelled'])
        )
    
    paginator = AppointmentPagination()
    paginated = paginator.paginate_queryset(appointments, request)
    serializer = AppointmentListSerializer(paginated, many=True)
    
    return paginator.get_paginated_response(serializer.data)
@api_view(['GET'])
@permission_classes([AllowAny])
def list_available_therapists(request):
    """
    List all therapists available for booking (public endpoint)
    Patients can see this without logging in
    """
    therapists = User.objects.filter(
        role='therapist',
        therapist_profile__profile_completed=True
    ).select_related('therapist_profile')
    
    # Filter by specialization
    specialization = request.query_params.get('specialization')
    if specialization:
        therapists = therapists.filter(
            therapist_profile__specialization_tags__contains=[specialization]
        )
    
    # Filter by consultation mode
    mode = request.query_params.get('mode')
    if mode:
        therapists = therapists.filter(
            therapist_profile__consultation_mode__in=[mode, 'both']
        )
    
    # Filter by verified status
    verified_only = request.query_params.get('verified_only')
    if verified_only == 'true':
        therapists = therapists.filter(therapist_profile__is_verified=True)
    
    # Sort options
    sort_by = request.query_params.get('sort_by', 'name')
    if sort_by == 'name':
        therapists = therapists.order_by('full_name')
    elif sort_by == 'experience':
        therapists = therapists.order_by('-therapist_profile__years_of_experience')
    elif sort_by == 'fees_low':
        therapists = therapists.order_by('therapist_profile__consultation_fees')
    elif sort_by == 'fees_high':
        therapists = therapists.order_by('-therapist_profile__consultation_fees')
    
    paginator = AppointmentPagination()
    paginated_therapists = paginator.paginate_queryset(therapists, request)
    serializer = TherapistListSerializer(paginated_therapists, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_therapist_availability(request, therapist_id):
    """
    Get therapist's weekly availability schedule
    """
    therapist = get_object_or_404(User, id=therapist_id, role='therapist')
    
    availability = TherapistAvailability.objects.filter(
        therapist=therapist,
        is_active=True
    ).order_by('day_of_week', 'start_time')
    
    serializer = TherapistAvailabilitySerializer(availability, many=True)
    
    return Response({
        'therapist_id': therapist_id,
        'therapist_name': therapist.full_name,
        'availability': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_slots(request, therapist_id):
    therapist = get_object_or_404(User, id=therapist_id, role='therapist')
    
    # Check if therapist has a profile
    if not hasattr(therapist, 'therapist_profile'):
        return Response({
            'therapist_id': therapist_id,
            'therapist_name': therapist.full_name,
            'slots': []
        }, status=status.HTTP_200_OK)
    
    # Get availability from JSONField
    availability_schedule = therapist.therapist_profile.availability_slots or {}
    
    if not availability_schedule:
        return Response({
            'therapist_id': therapist_id,
            'therapist_name': therapist.full_name,
            'slots': []
        }, status=status.HTTP_200_OK)
    
    # Use timezone-aware 'now'
    now_aware = timezone.now()
    start_date = now_aware.date()
    end_date = start_date + timedelta(days=30)
    
    # Get time-off periods
    time_off_periods = TimeOffPeriod.objects.filter(
        therapist=therapist,
        end_date__gte=start_date,
        start_date__lte=end_date
    )
    
    # Get existing appointments
    existing_appointments = Appointment.objects.filter(
        therapist=therapist,
        appointment_date__gte=start_date,
        appointment_date__lte=end_date,
        status__in=['pending', 'confirmed']
    )
    
    available_slots = []
    current_date = start_date
    
    # Day name mapping (case-insensitive)
    day_mapping = {
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday'
    }
    
    while current_date <= end_date:
        # Get day name
        day_name_lower = current_date.strftime('%A').lower()
        day_name_capitalized = day_mapping.get(day_name_lower)
        
        # Check if therapist is on time-off
        is_time_off = time_off_periods.filter(
            start_date__lte=current_date,
            end_date__gte=current_date
        ).exists()
        
        if not is_time_off and day_name_capitalized in availability_schedule:
            # Get time ranges for this day
            time_ranges = availability_schedule[day_name_capitalized]
            
            for time_range in time_ranges:
                # Parse time range like "09:00 - 10:00"
                try:
                    start_str, end_str = time_range.split(' - ')
                    start_time = datetime.strptime(start_str.strip(), '%H:%M').time()
                    end_time = datetime.strptime(end_str.strip(), '%H:%M').time()
                except (ValueError, AttributeError):
                    continue  # Skip malformed time ranges
                
                # Create aware datetime objects
                slot_start_dt = timezone.make_aware(datetime.combine(current_date, start_time))
                slot_end_dt = timezone.make_aware(datetime.combine(current_date, end_time))
                
                # Generate 1-hour slots within this time range
                current_dt = slot_start_dt
                
                while current_dt < slot_end_dt:
                    slot_start_time = current_dt.time()
                    slot_end_dt_temp = current_dt + timedelta(hours=1)
                    
                    # Don't exceed the availability window
                    if slot_end_dt_temp > slot_end_dt:
                        break
                    
                    slot_end_time = slot_end_dt_temp.time()
                    
                    # Check if slot is already booked
                    is_booked = existing_appointments.filter(
                        appointment_date=current_date,
                        start_time__lt=slot_end_time,
                        end_time__gt=slot_start_time
                    ).exists()
                    
                    # Check if slot is in the past
                    is_past = current_dt < now_aware
                    
                    available_slots.append({
                        'date': current_date,
                        'start_time': slot_start_time,
                        'end_time': slot_end_time,
                        'is_available': not is_booked and not is_past
                    })
                    
                    # Move to next hour
                    current_dt = slot_end_dt_temp
        
        current_date += timedelta(days=1)
    
    serializer = AvailableSlotSerializer(available_slots, many=True)
    return Response({
        'therapist_id': therapist_id,
        'therapist_name': therapist.full_name,
        'slots': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPatient])
def create_appointment(request):
    """
    Create a new appointment (Patient only)
    """
    serializer = CreateAppointmentSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        appointment = serializer.save()
        
        return Response({
            'message': 'Appointment booked successfully! Waiting for therapist confirmation.',
            'appointment': AppointmentDetailSerializer(appointment).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPatient])
def my_appointments(request):
    """
    Get all appointments for logged-in patient
    """
    appointments = Appointment.objects.filter(
        patient=request.user
    ).select_related('therapist').order_by('-appointment_date', '-start_time')
    
    # Filter by status
    status_filter = request.query_params.get('status')
    if status_filter:
        appointments = appointments.filter(status=status_filter)
    
    # Filter by upcoming/past
    filter_type = request.query_params.get('filter')
    if filter_type == 'upcoming':
        appointments = appointments.filter(
            appointment_date__gte=timezone.now().date(),
            status__in=['pending', 'confirmed']
        )
    elif filter_type == 'past':
        appointments = appointments.filter(
            appointment_date__lt=timezone.now().date()
        ) | appointments.filter(
            status__in=['completed', 'cancelled']
        )
    
    paginator = AppointmentPagination()
    paginated = paginator.paginate_queryset(appointments, request)
    serializer = AppointmentListSerializer(paginated, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_detail(request, appointment_id):
    """
    Get detailed appointment information
    Patient can only see their own, Therapist can see their assigned
    """
    appointment = get_object_or_404(Appointment, id=appointment_id)
    
    # Check permissions
    if request.user.role == 'patient' and appointment.patient != request.user:
        return Response({
            'error': 'You do not have permission to view this appointment'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if request.user.role == 'therapist' and appointment.therapist != request.user:
        return Response({
            'error': 'You do not have permission to view this appointment'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = AppointmentDetailSerializer(appointment)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, appointment_id):
    """
    Cancel an appointment (both patient and therapist can cancel)
    """
    appointment = get_object_or_404(Appointment, id=appointment_id)
    
    # Check permissions
    if request.user.role == 'patient' and appointment.patient != request.user:
        return Response({
            'error': 'You do not have permission to cancel this appointment'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if request.user.role == 'therapist' and appointment.therapist != request.user:
        return Response({
            'error': 'You do not have permission to cancel this appointment'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Check if already cancelled
    if appointment.status == 'cancelled':
        return Response({
            'error': 'Appointment is already cancelled'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if can cancel (24 hours before)
    if not appointment.can_cancel:
        return Response({
            'error': 'Cannot cancel appointment less than 24 hours before scheduled time'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = CancelAppointmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Update appointment
    old_status = appointment.status
    appointment.status = 'cancelled'
    appointment.cancelled_by = request.user
    appointment.cancellation_reason = serializer.validated_data['cancellation_reason']
    appointment.cancelled_at = timezone.now()
    appointment.save()
    
    # Create history entry
    AppointmentHistory.objects.create(
        appointment=appointment,
        changed_by=request.user,
        action='cancelled',
        old_status=old_status,
        new_status='cancelled',
        notes=serializer.validated_data['cancellation_reason']
    )
    
    return Response({
        'message': 'Appointment cancelled successfully',
        'appointment': AppointmentDetailSerializer(appointment).data
    }, status=status.HTTP_200_OK)


# ========== THERAPIST VIEWS ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTherapist])
def therapist_appointments(request):
    """
    Get all appointments for logged-in therapist
    """
    appointments = Appointment.objects.filter(
        therapist=request.user
    ).select_related('patient').order_by('-appointment_date', '-start_time')
    
    # Filter by status
    status_filter = request.query_params.get('status')
    if status_filter:
        appointments = appointments.filter(status=status_filter)
    
    # Filter by date range
    filter_type = request.query_params.get('filter')
    if filter_type == 'today':
        appointments = appointments.filter(appointment_date=timezone.now().date())
    elif filter_type == 'upcoming':
        appointments = appointments.filter(
            appointment_date__gte=timezone.now().date(),
            status__in=['pending', 'confirmed']
        )
    elif filter_type == 'past':
        appointments = appointments.filter(
            appointment_date__lt=timezone.now().date()
        )
    
    paginator = AppointmentPagination()
    paginated = paginator.paginate_queryset(appointments, request)
    serializer = AppointmentListSerializer(paginated, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTherapist])
def confirm_appointment(request, appointment_id):
    """
    Therapist confirms an appointment
    """
    appointment = get_object_or_404(
        Appointment,
        id=appointment_id,
        therapist=request.user
    )
    
    if appointment.status != 'pending':
        return Response({
            'error': f'Cannot confirm appointment with status: {appointment.status}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = ConfirmAppointmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Update appointment
    old_status = appointment.status
    appointment.status = 'confirmed'
    appointment.confirmed_at = timezone.now()
    
    if serializer.validated_data.get('meeting_link'):
        appointment.meeting_link = serializer.validated_data['meeting_link']
    
    if serializer.validated_data.get('therapist_notes'):
        appointment.therapist_notes = serializer.validated_data['therapist_notes']
    
    appointment.save()
    
    # Create history entry
    AppointmentHistory.objects.create(
        appointment=appointment,
        changed_by=request.user,
        action='confirmed',
        old_status=old_status,
        new_status='confirmed',
        notes='Appointment confirmed by therapist'
    )
    
    return Response({
        'message': 'Appointment confirmed successfully',
        'appointment': AppointmentDetailSerializer(appointment).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_feedback(request, appointment_id):
    """
    Patient submits feedback after appointment
    """
    appointment = get_object_or_404(
        Appointment,
        id=appointment_id,
        patient=request.user
    )
    
    # Check if appointment is completed
    if appointment.status != 'completed':
        return Response({
            'error': 'Can only submit feedback for completed appointments'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if feedback already exists
    if hasattr(appointment, 'feedback'):
        return Response({
            'error': 'Feedback already submitted for this appointment'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = AppointmentFeedbackSerializer(data=request.data)
    if serializer.is_valid():
        feedback = serializer.save(appointment=appointment)
        
        return Response({
            'message': 'Feedback submitted successfully',
            'feedback': AppointmentFeedbackSerializer(feedback).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_stats(request):
    """
    Enhanced appointment statistics for Dashboard
    """
    if request.user.role == 'patient':
        appointments = Appointment.objects.filter(patient=request.user)
    else:
        # For Therapists
        appointments = Appointment.objects.filter(therapist=request.user)
    
    today = timezone.now().date()
    
    # Calculate unique patients (specific to therapists)
    total_patients = appointments.values('patient').distinct().count() if request.user.role == 'therapist' else 0

    stats = {
        'total_appointments': appointments.count(),
        'total_patients': total_patients,
        'pending': appointments.filter(status='pending').count(),
        'confirmed': appointments.filter(status='confirmed').count(),
        'completed': appointments.filter(status='completed').count(),
        'cancelled': appointments.filter(status='cancelled').count(),
        'upcoming': appointments.filter(
            appointment_date__gte=today,
            status__in=['pending', 'confirmed']
        ).count(),
        # Count sessions today
        'today_sessions': appointments.filter(appointment_date=today).count(),
        # Calculate hours (assuming 1 hour per completed appointment)
        'hours_this_week': appointments.filter(
            status='completed',
            appointment_date__gte=today - timedelta(days=today.weekday())
        ).count(),
        'success_rate': 98 # Placeholder or logic based on feedback
    }
    
    return Response(stats, status=status.HTTP_200_OK)