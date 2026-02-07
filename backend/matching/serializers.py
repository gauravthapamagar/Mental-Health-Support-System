from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TherapistMatch
from accounts.models import TherapistProfile

User = get_user_model()


class TherapistProfileDetailSerializer(serializers.ModelSerializer):
    """Detailed therapist profile for match results"""
    class Meta:
        model = TherapistProfile
        fields = [
            'profession_type',
            'license_id',
            'years_of_experience',
            'specialization_tags',
            'languages_spoken',
            'consultation_mode',
            'consultation_fees',
            'bio',
            'profile_picture',
            'is_verified',
        ]


class TherapistSerializer(serializers.ModelSerializer):
    """Serialize therapist user with profile for match results"""
    profile = TherapistProfileDetailSerializer(source='therapist_profile', read_only=True)
    specializations = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'gender',
            'profile',
            'specializations',
        ]
    
    def get_specializations(self, obj):
        """Get specialization tags from profile"""
        profile = getattr(obj, 'therapist_profile', None)
        if profile:
            return profile.specialization_tags or []
        return []


class MatchResultSerializer(serializers.Serializer):
    """Serialize a single match result with score and reasons"""
    rank = serializers.IntegerField()
    therapist = TherapistSerializer()
    score = serializers.FloatField()
    compatibility_percentage = serializers.SerializerMethodField()
    
    def get_compatibility_percentage(self, obj):
        return round(obj.get('score', 0) * 100, 1)


class TherapistMatchSerializer(serializers.ModelSerializer):
    """Serialize the full match result with top 3 therapists"""
    top_match_1_details = TherapistSerializer(source='top_match_1', read_only=True)
    top_match_2_details = TherapistSerializer(source='top_match_2', read_only=True)
    top_match_3_details = TherapistSerializer(source='top_match_3', read_only=True)
    
    matches = serializers.SerializerMethodField()
    
    class Meta:
        model = TherapistMatch
        fields = [
            'id',
            'survey_response',
            'top_match_1',
            'top_match_1_score',
            'top_match_1_details',
            'top_match_2',
            'top_match_2_score',
            'top_match_2_details',
            'top_match_3',
            'top_match_3_score',
            'top_match_3_details',
            'matches',
            'matched_at',
            'updated_at',
        ]
        read_only_fields = ['matched_at', 'updated_at']
    
    def get_matches(self, obj):
        """Return structured list of matches"""
        matches = []
        
        for i in range(1, 4):
            therapist = getattr(obj, f'top_match_{i}', None)
            score = getattr(obj, f'top_match_{i}_score', 0)
            
            if therapist:
                matches.append({
                    'rank': i,
                    'therapist': TherapistSerializer(therapist).data,
                    'score': score,
                    'compatibility_percentage': round(score * 100, 1),
                })
        
        return matches