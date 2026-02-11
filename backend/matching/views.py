from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from surveys.models import SurveyResponse
from .models import TherapistMatch
from .serializers import TherapistMatchSerializer, MatchResultSerializer
from .algorithm import TherapistMatcher


class TherapistMatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for therapist matching operations
    """
    serializer_class = TherapistMatchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return matches for the current user only"""
        return TherapistMatch.objects.filter(
            patient=self.request.user
        ).select_related(
            'top_match_1', 'top_match_2', 'top_match_3',
            'top_match_1__therapist_profile',
            'top_match_2__therapist_profile',
            'top_match_3__therapist_profile',
            'survey_response'
        ).order_by('-matched_at')
    
    @action(detail=False, methods=['post'])
    def find_matches(self, request):
        """
        Find therapist matches based on survey response
        
        POST /api/matching/matches/find_matches/
        Body: {"survey_response_id": 123}
        """
        survey_response_id = request.data.get('survey_response_id')
        
        if not survey_response_id:
            return Response(
                {'error': 'survey_response_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the survey response (must belong to current user)
        survey_response = get_object_or_404(
            SurveyResponse,
            id=survey_response_id,
            patient=request.user
        )
        
        # Check if matches already exist for this survey response
        existing_match = TherapistMatch.objects.filter(
            patient=request.user,
            survey_response=survey_response
        ).first()
        
        if existing_match:
            # Return existing matches
            serializer = TherapistMatchSerializer(existing_match)
            return Response({
                'success': True,
                'message': 'Returning existing matches',
                'data': serializer.data
            })
        
        # Run the matching algorithm
        matcher = TherapistMatcher(survey_response)
        top_matches = matcher.find_best_matches(top_n=3)
        
        if not top_matches:
            return Response({
                'success': False,
                'message': 'No matching therapists found',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create the match record
        match_data = {
            'patient': request.user,
            'survey_response': survey_response,
        }
        
        # Add top matches with their scores and reasons
        match_results = []
        for i, (therapist, score, breakdown) in enumerate(top_matches, 1):
            match_data[f'top_match_{i}'] = therapist
            match_data[f'top_match_{i}_score'] = score
            
            reasons = matcher.generate_match_reasons(therapist, breakdown)
            match_results.append({
                'rank': i,
                'therapist_id': therapist.id,
                'therapist_name': therapist.full_name,
                'score': round(score * 100, 1),  # Convert to percentage
                'reasons': reasons,
                'breakdown': {
                    'semantic_score': round(breakdown['layer2_semantic']['score'] * 100, 1),
                    'collaborative_score': round(breakdown['layer3_collaborative']['score'] * 100, 1),
                    'specialization_score': round(breakdown['specialization_score'] * 100, 1),
                }
            })
        
        # Add match reasons to the data
        match_data['match_reasons'] = {
            str(result['therapist_id']): result['reasons']
            for result in match_results
        }

        # Save to database
        therapist_match = TherapistMatch.objects.create(**match_data)
        
        # Serialize and return
        serializer = TherapistMatchSerializer(therapist_match)
        
        return Response({
            'success': True,
            'message': f'Found {len(top_matches)} matching therapists',
            'match_id': therapist_match.id,
            'results': match_results,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """
        Get the latest match result for the current user
        
        GET /api/matching/matches/latest/
        """
        latest_match = self.get_queryset().first()
        
        if not latest_match:
            return Response({
                'success': False,
                'message': 'No matches found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TherapistMatchSerializer(latest_match)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def rematch(self, request, pk=None):
        """
        Re-run matching for an existing match record
        
        POST /api/matching/matches/{id}/rematch/
        """
        match = self.get_object()
        survey_response = match.survey_response
        
        # Run matching again
        matcher = TherapistMatcher(survey_response)
        top_matches = matcher.find_best_matches(top_n=3)
        
        if not top_matches:
            return Response({
                'success': False,
                'message': 'No matching therapists found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Update the match record
        for i, (therapist, score, breakdown) in enumerate(top_matches, 1):
            setattr(match, f'top_match_{i}', therapist)
            setattr(match, f'top_match_{i}_score', score)
        
        match.save()
        
        serializer = TherapistMatchSerializer(match)
        return Response({
            'success': True,
            'message': 'Matches updated',
            'data': serializer.data
        })