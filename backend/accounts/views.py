from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from .models import User, TherapistProfile
from .serializers import (
    PatientRegistrationSerializer,
    TherapistRegistrationSerializer,
    LoginSerializer,
    UserDetailSerializer,
    TherapistProfileSerializer,
    TherapistProfileCompleteSerializer,
    PatientProfileSerializer,
    PatientProfileUpdateSerializer,
    
    
)
from .permissions import IsTherapist, IsPatient


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
        

class PatientProfileDetailView(generics.RetrieveAPIView):
    """Get patient profile details"""
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated, IsPatient]

    def get_object(self):
        return self.request.user.patient_profile


class PatientProfileUpdateView(generics.UpdateAPIView):
    """Update patient profile"""
    serializer_class = PatientProfileUpdateSerializer
    permission_classes = [IsAuthenticated, IsPatient]

    def get_object(self):
        return self.request.user.patient_profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            'message': 'Profile updated successfully',
            'profile': PatientProfileSerializer(instance).data
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def verify_therapist(request, therapist_id):
    """
    Admin endpoint to verify a therapist
    Only admins can verify therapists
    """
    try:
        therapist_profile = TherapistProfile.objects.select_related('user').get(
            user_id=therapist_id,
            user__role='therapist'
        )
    except TherapistProfile.DoesNotExist:
        return Response({
            'error': 'Therapist not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if therapist_profile.is_verified:
        return Response({
            'message': 'Therapist is already verified'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify the therapist
    therapist_profile.is_verified = True
    therapist_profile.verified_at = timezone.now()
    therapist_profile.verified_by = request.user
    therapist_profile.save()
    
    return Response({
        'message': f'Therapist {therapist_profile.user.full_name} has been verified successfully',
        'therapist': {
            'id': therapist_profile.user.id,
            'full_name': therapist_profile.user.full_name,
            'email': therapist_profile.user.email,
            'is_verified': therapist_profile.is_verified,
            'verified_at': therapist_profile.verified_at,
            'verified_by': therapist_profile.verified_by.full_name if therapist_profile.verified_by else None
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def unverify_therapist(request, therapist_id):
    """
    Admin endpoint to remove verification from a therapist
    Only admins can unverify therapists
    """
    try:
        therapist_profile = TherapistProfile.objects.select_related('user').get(
            user_id=therapist_id,
            user__role='therapist'
        )
    except TherapistProfile.DoesNotExist:
        return Response({
            'error': 'Therapist not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if not therapist_profile.is_verified:
        return Response({
            'message': 'Therapist is not verified'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Unverify the therapist
    therapist_profile.is_verified = False
    therapist_profile.verified_at = None
    therapist_profile.verified_by = None
    therapist_profile.save()
    
    return Response({
        'message': f'Verification removed for therapist {therapist_profile.user.full_name}',
        'therapist': {
            'id': therapist_profile.user.id,
            'full_name': therapist_profile.user.full_name,
            'email': therapist_profile.user.email,
            'is_verified': therapist_profile.is_verified
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_unverified_therapists(request):
    """
    Admin endpoint to list all unverified therapists
    """
    unverified = TherapistProfile.objects.filter(
        is_verified=False
    ).select_related('user')
    
    therapists_data = []
    for profile in unverified:
        therapists_data.append({
            'id': profile.user.id,
            'full_name': profile.user.full_name,
            'email': profile.user.email,
            'profession_type': profile.profession_type,
            'license_id': profile.license_id,
            'years_of_experience': profile.years_of_experience,
            'profile_completed': profile.profile_completed,
            'created_at': profile.created_at
        })
    
    return Response({
        'count': len(therapists_data),
        'therapists': therapists_data
    }, status=status.HTTP_200_OK)