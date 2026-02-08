from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    TherapistAvailability, TimeOffPeriod, Appointment,
    AppointmentHistory, AppointmentFeedback
)
from surveys.models import SurveyResponse  # For linking in admin


@admin.register(TherapistAvailability)
class TherapistAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['therapist', 'day_of_week', 'start_time', 'end_time', 'is_active', 'created_at']
    list_filter = ['day_of_week', 'is_active']
    search_fields = ['therapist__full_name', 'therapist__email']
    readonly_fields = ['created_at']  # removed updated_at
    list_per_page = 20


@admin.register(TimeOffPeriod)
class TimeOffPeriodAdmin(admin.ModelAdmin):
    list_display = ['therapist', 'start_date', 'end_date', 'reason', 'created_at']
    list_filter = ['start_date', 'end_date']
    search_fields = ['therapist__full_name', 'reason']
    readonly_fields = ['created_at']  # removed updated_at
    date_hierarchy = 'start_date'


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'patient_name',
        'therapist_name',
        'appointment_date',
        'start_time',
        'status_badge',
        'appointment_type',
        'session_mode',
        'survey_response_link',
        'created_at'
    ]
    list_filter = [
        'status',
        'appointment_type',
        'session_mode',
        'appointment_date',
        'created_at',
        # Removed 'survey_response__isnull' — invalid
    ]
    search_fields = [
        'patient__full_name', 'patient__email',
        'therapist__full_name', 'therapist__email',
        'reason_for_visit', 'patient_notes',
    ]
    readonly_fields = ['created_at', 'updated_at', 'confirmed_at', 'cancelled_at']
    raw_id_fields = ['patient', 'therapist', 'survey_response', 'cancelled_by']
    list_per_page = 25
    date_hierarchy = 'appointment_date'

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
                'reason_for_visit', 'patient_notes', 'contact_phone', 'contact_email',
                'survey_response'
            )
        }),
        ('Meeting & Notes', {
            'fields': ('meeting_link', 'meeting_id', 'therapist_notes')
        }),
        ('Cancellation Info', {
            'fields': ('cancelled_by', 'cancellation_reason', 'cancelled_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'confirmed_at'),
            'classes': ('collapse',)
        }),
    )

    def patient_name(self, obj):
        return obj.patient.full_name if obj.patient else "-"
    patient_name.short_description = "Patient"
    patient_name.admin_order_field = 'patient__full_name'

    def therapist_name(self, obj):
        return obj.therapist.full_name if obj.therapist else "-"
    therapist_name.short_description = "Therapist"
    therapist_name.admin_order_field = 'therapist__full_name'

    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'confirmed': 'blue',
            'completed': 'green',
            'cancelled': 'red',
            'no_show': 'gray',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 10px; '
            'border-radius: 12px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"

    def survey_response_link(self, obj):
        if not obj.survey_response:
            return format_html('<span style="color: gray;">None</span>')
        
        url = reverse("admin:surveys_surveyresponse_change", args=[obj.survey_response.id])
        title = obj.survey_response.survey.title if obj.survey_response.survey else "Untitled"
        return format_html(
            '<a href="{}" target="_blank">ID {} - {}</a>',
            url,
            obj.survey_response.id,
            title[:30] + "..." if len(title) > 30 else title
        )
    survey_response_link.short_description = "Assessment"
    survey_response_link.allow_tags = True

    actions = ['mark_as_confirmed', 'mark_as_completed', 'mark_as_cancelled']

    def mark_as_confirmed(self, request, queryset):
        from django.utils import timezone
        updated = queryset.filter(status='pending').update(
            status='confirmed',
            confirmed_at=timezone.now()
        )
        self.message_user(request, f'{updated} appointment(s) marked as confirmed.')
    mark_as_confirmed.short_description = "Mark selected as Confirmed"

    def mark_as_completed(self, request, queryset):
        updated = queryset.filter(status='confirmed').update(status='completed')
        self.message_user(request, f'{updated} appointment(s) marked as completed.')
    mark_as_completed.short_description = "Mark selected as Completed"

    def mark_as_cancelled(self, request, queryset):
        from django.utils import timezone
        updated = queryset.exclude(status='cancelled').update(
            status='cancelled',
            cancelled_at=timezone.now(),
            cancelled_by=request.user
        )
        self.message_user(request, f'{updated} appointment(s) cancelled by admin.')
    mark_as_cancelled.short_description = "Cancel selected appointments"


@admin.register(AppointmentHistory)
class AppointmentHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'appointment_link',
        'action',
        'changed_by_name',
        'old_status',
        'new_status',
        'created_at'
    ]
    list_filter = ['action', 'created_at']
    search_fields = [
        'appointment__patient__full_name',
        'appointment__therapist__full_name',
        'notes',
        'changed_by__full_name'
    ]
    readonly_fields = ['created_at']
    list_per_page = 30

    def appointment_link(self, obj):
        url = reverse("admin:booking_appointment_change", args=[obj.appointment.id])
        return format_html(
            '<a href="{}">#{}</a> - {} with {}',
            url,
            obj.appointment.id,
            obj.appointment.patient.full_name,
            obj.appointment.therapist.full_name
        )
    appointment_link.short_description = "Appointment"
    appointment_link.allow_tags = True

    def changed_by_name(self, obj):
        return obj.changed_by.full_name if obj.changed_by else "System"
    changed_by_name.short_description = "Changed By"


@admin.register(AppointmentFeedback)
class AppointmentFeedbackAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'appointment_link',
        'rating_stars',
        'would_recommend',
        'created_at'
    ]
    list_filter = ['rating', 'would_recommend', 'created_at']
    search_fields = [
        'appointment__patient__full_name',
        'appointment__therapist__full_name',
        'feedback_text'
    ]
    readonly_fields = ['created_at', 'rating', 'feedback_text', 'would_recommend']
    list_per_page = 20

    def appointment_link(self, obj):
        url = reverse("admin:booking_appointment_change", args=[obj.appointment.id])
        return format_html(
            '<a href="{}">{} → {}</a>',
            url,
            obj.appointment.patient.full_name[:20],
            obj.appointment.therapist.full_name[:20]
        )
    appointment_link.short_description = "Appointment"

    def rating_stars(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return format_html(
            '<span style="color: #f59e0b; font-size: 1.2em;">{}</span> <small>({} / 5)</small>',
            stars,
            obj.rating
        )
    rating_stars.short_description = "Rating"