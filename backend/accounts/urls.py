from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('auth/register/patient/', views.patient_registration, name='patient-register'),
    path('auth/register/therapist/', views.therapist_registration, name='therapist-register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', views.current_user, name='current-user'),
    path('users/', views.user_list_view, name='admin-user-list'),
    path('admin/stats/', views.admin_stats, name='admin-stats'),
    path('therapist/profile/complete/', views.TherapistProfileCompleteView.as_view(), name='therapist-profile-complete'),
    path('therapist/profile/me/', views.TherapistProfileDetailView.as_view(), name='therapist-profile-detail'),
    path('therapist/profile/update/', views.TherapistProfileUpdateView.as_view(), name='therapist-profile-update'),
    path('patient/profile/me/', views.PatientProfileDetailView.as_view(), name='patient-profile-detail'),
    path('patient/profile/update/', views.PatientProfileUpdateView.as_view(), name='patient-profile-update'),
    path('therapists/unverified/', views.list_unverified_therapists, name='list-unverified-therapists'),
    path('therapists/<int:therapist_id>/verify/', views.verify_therapist, name='verify-therapist'),
    path('therapists/<int:therapist_id>/unverify/', views.unverify_therapist, name='unverify-therapist'),
]