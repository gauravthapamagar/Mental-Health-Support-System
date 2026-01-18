from django.contrib import admin
from django.utils.html import format_html
from .models import (
    TherapistAvailability, TimeOffPeriod, Appointment,
    AppointmentHistory, AppointmentFeedback
)


@admin.register(TherapistAvailability)
class TherapistAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['therapist', 'day_of_week', 'start_time', 'end_time', 'is_active']
    list_filter = ['day_of_week', 'is_active']
    search_fields = ['therapist__full_name', 'therapist__email']
    readonly_fields = ['created_at']


@admin.register(TimeOffPeriod)
class TimeOffPeriodAdmin(admin.ModelAdmin):
    list_display = ['therapist', 'start_date', 'end_date', 'reason']
    list_filter = ['start_date', 'end_date']
    search_fields = ['therapist__full_name', 'reason']
    readonly_fields = ['created_at']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'patient_name', 'therapist_name', 'appointment_date',
        'start_time', 'status_badge', 'appointment_type', 'session_mode',
        'created_at'
    ]
    list_filter = ['status', 'appointment_type', 'session_mode', 'appointment_date']
    search_fields = [
        'patient__full_name', 'patient__email',
        'therapist__full_name', 'therapist__email',
        'reason_for_visit'
    ]
    readonly_fields = ['created_at', 'updated_at', 'confirmed_at', 'cancelled_at']
    
    fieldsets = (
        ('Participants', {
            'fields': ('patient', 'therapist')
        }),
        ('Appointment Details', {
            'fields': (
                'appointment_date', 'start_time', 'end_time', 'duration_minutes',
                'appointment_type', 'status', 'session_mode'
            )
        }),
        ('Booking Information', {
            'fields': (
                'reason_for_visit', 'patient_notes', 'contact_phone', 'contact_email'
            )
        }),
        ('Meeting Details', {
            'fields': ('meeting_link', 'meeting_id', 'therapist_notes')
        }),
        ('Cancellation', {
            'fields': (
                'cancelled_by', 'cancellation_reason', 'cancelled_at'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'confirmed_at')
        }),
    )
    
    def patient_name(self, obj):
        return obj.patient.full_name
    patient_name.short_description = 'Patient'
    
    def therapist_name(self, obj):
        return obj.therapist.full_name
    therapist_name.short_description = 'Therapist'
    
    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'confirmed': 'blue',
            'completed': 'green',
            'cancelled': 'red',
            'no_show': 'gray'
        }
        color = colors.get(obj.status, 'gray')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    actions = ['mark_as_confirmed', 'mark_as_completed', 'mark_as_cancelled']
    
    def mark_as_confirmed(self, request, queryset):
        from django.utils import timezone
        updated = queryset.filter(status='pending').update(
            status='confirmed',
            confirmed_at=timezone.now()
        )
        self.message_user(request, f'{updated} appointment(s) marked as confirmed.')
    mark_as_confirmed.short_description = 'Mark selected as Confirmed'
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.filter(status='confirmed').update(status='completed')
        self.message_user(request, f'{updated} appointment(s) marked as completed.')
    mark_as_completed.short_description = 'Mark selected as Completed'
    
    def mark_as_cancelled(self, request, queryset):
        from django.utils import timezone
        updated = queryset.exclude(status='cancelled').update(
            status='cancelled',
            cancelled_at=timezone.now(),
            cancelled_by=request.user
        )
        self.message_user(request, f'{updated} appointment(s) cancelled.')
    mark_as_cancelled.short_description = 'Cancel selected appointments'


@admin.register(AppointmentHistory)
class AppointmentHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'appointment_short', 'action', 'changed_by', 'old_status', 'new_status', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['appointment__patient__full_name', 'appointment__therapist__full_name', 'notes']
    readonly_fields = ['created_at']
    
    def appointment_short(self, obj):
        return f"#{obj.appointment.id} - {obj.appointment.patient.full_name}"
    appointment_short.short_description = 'Appointment'


@admin.register(AppointmentFeedback)
class AppointmentFeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'appointment_short', 'rating_display', 'would_recommend', 'created_at']
    list_filter = ['rating', 'would_recommend', 'created_at']
    search_fields = ['appointment__patient__full_name', 'appointment__therapist__full_name', 'feedback_text']
    readonly_fields = ['created_at']
    
    def appointment_short(self, obj):
        return f"{obj.appointment.patient.full_name} with {obj.appointment.therapist.full_name}"
    appointment_short.short_description = 'Appointment'
    
    def rating_display(self, obj):
        stars = '⭐' * obj.rating
        return format_html(
            '<span style="font-size: 16px;">{}</span> <span style="color: gray;">({}/5)</span>',
            stars,
            obj.rating
        )
    rating_display.short_description = 'Rating'