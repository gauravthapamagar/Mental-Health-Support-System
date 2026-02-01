from rest_framework import serializers
from .models import JournalEntry

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = [
            'id',
            'title',
            'content',
            'mood',
            'mood_intensity',
            'tags',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_mood_intensity(self, value):
        if not (1 <= value <= 10):
            raise serializers.ValidationError("Mood intensity must be between 1 and 10.")
        return value

    def create(self, validated_data):
        validated_data['patient'] = self.context['request'].user.patient_profile
        return super().create(validated_data)