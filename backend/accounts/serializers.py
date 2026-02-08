# accounts/serializers.py

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import User, PatientProfile, TherapistProfile
import json


class PatientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    emergency_contact_name = serializers.CharField(required=True)
    emergency_contact_phone = serializers.CharField(required=True)
    basic_health_info = serializers.CharField(required=False, allow_blank=True)
    terms_accepted = serializers.BooleanField(required=True)

    # New address fields (added from AddressMixin)
    address_line_1 = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    address_line_2 = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'full_name', 'phone_number',
            'date_of_birth', 'gender', 'emergency_contact_name',
            'emergency_contact_phone', 'basic_health_info', 'terms_accepted',
            'address_line_1', 'address_line_2', 'city', 'state', 'country', 'postal_code'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already registered. Please use a different email or log in."
            )
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError({"terms_accepted": "You must accept the terms and conditions."})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        emergency_contact_name = validated_data.pop('emergency_contact_name')
        emergency_contact_phone = validated_data.pop('emergency_contact_phone')
        basic_health_info = validated_data.pop('basic_health_info', '')
        terms_accepted = validated_data.pop('terms_accepted')

        # Extract address fields
        address_data = {
            'address_line_1': validated_data.pop('address_line_1', None),
            'address_line_2': validated_data.pop('address_line_2', None),
            'city': validated_data.pop('city', None),
            'state': validated_data.pop('state', None),
            'country': validated_data.pop('country', None),
            'postal_code': validated_data.pop('postal_code', None),
        }

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    role='patient',
                    **validated_data
                )

                PatientProfile.objects.create(
                    user=user,
                    emergency_contact_name=emergency_contact_name,
                    emergency_contact_phone=emergency_contact_phone,
                    basic_health_info=basic_health_info,
                    terms_accepted=terms_accepted,
                    **address_data
                )

                return user

        except Exception as e:
            raise serializers.ValidationError({
                "error": f"Registration failed: {str(e)}"
            })


class TherapistRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    profession_type = serializers.ChoiceField(
        choices=TherapistProfile.PROFESSION_CHOICES, 
        required=True
    )
    license_id = serializers.CharField(required=True)
    years_of_experience = serializers.IntegerField(required=True, min_value=0)

    # New address fields (added from AddressMixin)
    address_line_1 = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    address_line_2 = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'full_name', 'phone_number',
            'date_of_birth', 'gender', 'profession_type', 'license_id', 
            'years_of_experience',
            'address_line_1', 'address_line_2', 'city', 'state', 'country', 'postal_code'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already registered. Please use a different email or log in."
            )
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        profession_type = validated_data.pop('profession_type')
        license_id = validated_data.pop('license_id')
        years_of_experience = validated_data.pop('years_of_experience')
        user_phone = validated_data.get('phone_number')

        # Extract address fields
        address_data = {
            'address_line_1': validated_data.pop('address_line_1', None),
            'address_line_2': validated_data.pop('address_line_2', None),
            'city': validated_data.pop('city', None),
            'state': validated_data.pop('state', None),
            'country': validated_data.pop('country', None),
            'postal_code': validated_data.pop('postal_code', None),
        }

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    role='therapist',
                    **validated_data
                )

                profile, created = TherapistProfile.objects.get_or_create(user=user)
                profile.profession_type = profession_type
                profile.license_id = license_id
                profile.years_of_experience = years_of_experience
                profile.phone_number = user_phone
                # Apply address fields
                for key, value in address_data.items():
                    setattr(profile, key, value)
                profile.save()

                return user
                
        except Exception as e:
            raise serializers.ValidationError({
                "error": f"Registration failed: {str(e)}"
            })


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'phone_number',
            'date_of_birth', 'gender', 'created_at'
        ]
        read_only_fields = ['id', 'role', 'created_at']


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = '__all__'  # Automatically includes address fields from AddressMixin


class TherapistProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = TherapistProfile
        fields = '__all__'
        read_only_fields = ['user', 'profile_completed']


class TherapistProfileCompleteSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = TherapistProfile
        fields = [
            'specialization_tags', 
            'languages_spoken', 
            'consultation_mode',
            'consultation_fees', 
            'availability_slots', 
            'bio', 
            'profile_picture',
            'phone_number', 
            'license_id',    
            'years_of_experience',
            'certificates',
            # Address fields added here so they can be updated in profile completion
            'address_line_1',
            'address_line_2',
            'city',
            'state',
            'country',
            'postal_code',
        ]
        

    def to_internal_value(self, data):
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy()
    
        if 'profile_picture' in data:
            if isinstance(data['profile_picture'], str):
                data.pop('profile_picture')
            elif data['profile_picture'] in [None, '', 'null', 'undefined']:
                data.pop('profile_picture')

        json_fields = ['specialization_tags', 'languages_spoken', 'availability_slots']
        for field in json_fields:
            value = data.get(field)
            if isinstance(value, str) and value:
                try:
                    data[field] = json.loads(value)
                except (ValueError, TypeError):
                    data[field] = []
    
        return super().to_internal_value(data)

    def validate_specialization_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Specialization tags must be a list.")
        return value

    def validate_languages_spoken(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Languages spoken must be a list.")
        return value

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        required_fields = [
            instance.specialization_tags,
            instance.languages_spoken,
            instance.consultation_mode,
            instance.consultation_fees is not None,
            instance.bio,
            instance.profile_picture 
        ]

        if all(required_fields):
            instance.profile_completed = True
        
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})


class UserDetailSerializer(serializers.ModelSerializer):
    patient_profile = PatientProfileSerializer(read_only=True)
    therapist_profile = TherapistProfileSerializer(read_only=True)
    redirect_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'phone_number',
            'date_of_birth', 'gender', 'created_at', 'patient_profile',
            'therapist_profile', 'redirect_url'
        ]

    def get_redirect_url(self, obj):
        if obj.role == 'patient':
            return '/patient/dashboard'
        elif obj.role == 'therapist':
            return '/therapist/dashboard'
        return '/'


class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            'emergency_contact_name',
            'emergency_contact_phone',
            'basic_health_info',
            # Address fields added
            'address_line_1',
            'address_line_2',
            'city',
            'state',
            'country',
            'postal_code',
        ]