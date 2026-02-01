from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import JournalEntry
from .serializers import JournalEntrySerializer

class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return journal entries for the authenticated patient only"""
        try:
            patient = self.request.user.patient_profile
            return JournalEntry.objects.filter(patient=patient)
        except:
            return JournalEntry.objects.none()

    def perform_create(self, serializer):
        """Automatically set the patient to the current user"""
        patient = self.request.user.patient_profile
        serializer.save(patient=patient)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get mood analytics for the patient"""
        days = int(request.query_params.get('days', 30))
        patient = request.user.patient_profile
        
        # Get entries from the last N days
        start_date = timezone.now() - timedelta(days=days)
        entries = JournalEntry.objects.filter(
            patient=patient,
            created_at__gte=start_date
        )

        # Calculate mood distribution
        mood_analytics = entries.values('mood').annotate(count=Count('mood'))
        total_entries = entries.count()

        result = []
        for item in mood_analytics:
            result.append({
                'mood': item['mood'],
                'count': item['count'],
                'percentage': round((item['count'] / total_entries * 100), 2) if total_entries > 0 else 0
            })

        return Response(result)

    @action(detail=False, methods=['get'], url_path='analytics/mood')
    def mood_analytics(self, request):
        """Get detailed mood analytics"""
        days = int(request.query_params.get('days', 30))
        patient = request.user.patient_profile
        
        start_date = timezone.now() - timedelta(days=days)
        entries = JournalEntry.objects.filter(
            patient=patient,
            created_at__gte=start_date
        )

        mood_analytics = entries.values('mood').annotate(
            count=Count('mood')
        ).order_by('-count')
        
        total = entries.count()
        return Response([
            {
                'mood': item['mood'],
                'count': item['count'],
                'percentage': round((item['count'] / total * 100), 2) if total > 0 else 0
            }
            for item in mood_analytics
        ])

    @action(detail=False, methods=['get'], url_path='analytics/trend')
    def mood_trend(self, request):
        """Get mood trend over time"""
        days = int(request.query_params.get('days', 30))
        patient = request.user.patient_profile
        
        start_date = timezone.now() - timedelta(days=days)
        entries = JournalEntry.objects.filter(
            patient=patient,
            created_at__gte=start_date
        )

        # Group by date and calculate average mood intensity
        date_mood_map = {}
        for entry in entries:
            date = entry.created_at.date()
            date_str = date.isoformat()
            
            if date_str not in date_mood_map:
                date_mood_map[date_str] = {'intensities': [], 'date': date_str}
            
            date_mood_map[date_str]['intensities'].append(entry.mood_intensity)

        # Calculate averages
        result = [
            {
                'date': v['date'],
                'avgIntensity': round(sum(v['intensities']) / len(v['intensities']), 2),
                'count': len(v['intensities'])
            }
            for v in sorted(date_mood_map.values(), key=lambda x: x['date'])
        ]

        return Response(result)

    @action(detail=False, methods=['get'], url_path='analytics/summary')
    def summary(self, request):
        """Get summary statistics"""
        patient = request.user.patient_profile
        all_entries = JournalEntry.objects.filter(patient=patient)
        
        total = all_entries.count()
        avg_intensity = all_entries.aggregate(Avg('mood_intensity'))['mood_intensity__avg'] or 0

        # Most common mood
        most_common_mood = all_entries.values('mood').annotate(
            count=Count('mood')
        ).order_by('-count').first()

        return Response({
            'total_entries': total,
            'average_intensity': round(avg_intensity, 2),
            'most_common_mood': most_common_mood['mood'] if most_common_mood else None,
            'entries_this_month': all_entries.filter(
                created_at__month=timezone.now().month,
                created_at__year=timezone.now().year
            ).count()
        })