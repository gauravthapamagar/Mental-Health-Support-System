from django.urls import path
from . import views

urlpatterns = [
    # Public - Therapist discovery
    path('therapists/', views.list_available_therapists, name='list-therapists'),
    path('therapists/<int:therapist_id>/availability/', views.get_therapist_availability, name='therapist-availability'),
    path('therapists/<int:therapist_id>/slots/', views.get_available_slots, name='available-slots'),
    
    # Patient - Appointment management
    path('appointments/create/', views.create_appointment, name='create-appointment'),
    path('appointments/my/', views.my_appointments, name='my-appointments'),
    path('appointments/<int:appointment_id>/', views.appointment_detail, name='appointment-detail'),
    path('appointments/<int:appointment_id>/cancel/', views.cancel_appointment, name='cancel-appointment'),
    path('appointments/<int:appointment_id>/feedback/', views.submit_feedback, name='submit-feedback'),
    
    # Therapist - Appointment management
    path('therapist/appointments/', views.therapist_appointments, name='therapist-appointments'),
    path('therapist/appointments/<int:appointment_id>/confirm/', views.confirm_appointment, name='confirm-appointment'),
    
    # Statistics
    path('stats/', views.appointment_stats, name='appointment-stats'),
    path('therapist/activity/', views.therapist_recent_activity, name='therapist-activity'),
    path('therapist/patients/', views.get_therapist_patients, name='therapist-patients'),
    path('patient/dashboard-stats/', views.patient_dashboard_stats, name='patient-dashboard-stats'),
]