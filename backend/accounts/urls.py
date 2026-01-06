from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('auth/register/patient/', views.patient_registration, name='patient-register'),
    path('auth/register/therapist/', views.therapist_registration, name='therapist-register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', views.current_user, name='current-user'),
    
    path('therapist/profile/complete/', views.TherapistProfileCompleteView.as_view(), name='therapist-profile-complete'),
    path('therapist/profile/me/', views.TherapistProfileDetailView.as_view(), name='therapist-profile-detail'),
    path('therapist/profile/update/', views.TherapistProfileUpdateView.as_view(), name='therapist-profile-update'),
]