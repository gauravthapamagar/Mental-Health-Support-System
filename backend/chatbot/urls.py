from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat, name='chat'),
    path('check-crisis/', views.check_crisis, name='check_crisis'),
]