from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, PatientProfile, TherapistProfile


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

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'full_name', 'phone_number',
            'date_of_birth', 'gender', 'emergency_contact_name',
            'emergency_contact_phone', 'basic_health_info', 'terms_accepted'
        ]

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

        user = User.objects.create_user(
            role='patient',
            **validated_data
        )

        PatientProfile.objects.create(
            user=user,
            emergency_contact_name=emergency_contact_name,
            emergency_contact_phone=emergency_contact_phone,
            basic_health_info=basic_health_info,
            terms_accepted=terms_accepted
        )

        return user


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
    profession_type = serializers.CharField(required=True)
    license_id = serializers.CharField(required=False, allow_blank=True)
    years_of_experience = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'full_name', 'phone_number',
            'date_of_birth', 'gender', 'profession_type', 'license_id',
            'years_of_experience'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        profession_type = validated_data.pop('profession_type')
        license_id = validated_data.pop('license_id', None)
        years_of_experience = validated_data.pop('years_of_experience', None)

        user = User.objects.create_user(
            role='therapist',
            **validated_data
        )

        TherapistProfile.objects.create(
            user=user,
            profession_type=profession_type,
            license_id=license_id,
            years_of_experience=years_of_experience
        )

        return user


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
        fields = '__all__'


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
            'specialization_tags', 'languages_spoken', 'consultation_mode',
            'consultation_fees', 'availability_slots', 'bio'
        ]

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
        
        if all([
            instance.specialization_tags,
            instance.languages_spoken,
            instance.consultation_mode,
            instance.consultation_fees is not None,
            instance.bio
        ]):
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