from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, TherapistProfile
from .serializers import (
    PatientRegistrationSerializer,
    TherapistRegistrationSerializer,
    LoginSerializer,
    UserDetailSerializer,
    TherapistProfileSerializer,
    TherapistProfileCompleteSerializer
)
from .permissions import IsTherapist


def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def patient_registration(request):
    """Register a new patient"""
    serializer = PatientRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'Patient registered successfully',
            'user': UserDetailSerializer(user).data,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def therapist_registration(request):
    """Register a new therapist"""
    serializer = TherapistRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'Therapist registered successfully. Please complete your profile.',
            'user': UserDetailSerializer(user).data,
            'tokens': tokens,
            'profile_completed': False
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login for both patients and therapists"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(email=email, password=password)
        
        if user is not None:
            tokens = get_tokens_for_user(user)
            user_data = UserDetailSerializer(user).data
            
            response_data = {
                'message': 'Login successful',
                'user': user_data,
                'tokens': tokens,
                'redirect_url': user_data['redirect_url']
            }
            
            # Add profile completion status for therapists
            if user.role == 'therapist':
                response_data['profile_completed'] = user.therapist_profile.profile_completed
            
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current logged-in user details"""
    serializer = UserDetailSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


class TherapistProfileCompleteView(generics.UpdateAPIView):
    """Complete therapist profile after registration"""
    serializer_class = TherapistProfileCompleteSerializer
    permission_classes = [IsAuthenticated, IsTherapist]

    def get_object(self):
        return self.request.user.therapist_profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            'message': 'Profile completed successfully',
            'profile': TherapistProfileSerializer(instance).data
        }, status=status.HTTP_200_OK)


class TherapistProfileDetailView(generics.RetrieveAPIView):
    """Get therapist profile details"""
    serializer_class = TherapistProfileSerializer
    permission_classes = [IsAuthenticated, IsTherapist]

    def get_object(self):
        return self.request.user.therapist_profile


class TherapistProfileUpdateView(generics.UpdateAPIView):
    """Update therapist profile"""
    serializer_class = TherapistProfileCompleteSerializer
    permission_classes = [IsAuthenticated, IsTherapist]

    def get_object(self):
        return self.request.user.therapist_profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            'message': 'Profile updated successfully',
            'profile': TherapistProfileSerializer(instance).data
        }, status=status.HTTP_200_OK)