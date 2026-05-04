from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TherapistMatchViewSet

router = DefaultRouter()
router.register(r'matches', TherapistMatchViewSet, basename='therapist-match')

urlpatterns = [
    path('', include(router.urls)),
]
