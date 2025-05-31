from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Tournament, Match
from .serializers import TournamentSerializer, MatchSerializer
from .utils import matchmaker
from django.views.decorators.csrf import csrf_exempt

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the tournament owner to the current user
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], url_path='join')
    def join_tournament(self, request, pk=None):
        tournament = self.get_object()
        
        # Check if tournament is still open for registration
        if not tournament.is_open_for_registration():
            return Response({
                'message': 'Tournament registration is closed.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user is already a participant
        if request.user in tournament.participants.all():
            return Response({
                'message': 'You are already a participant.'
            }, status=status.HTTP_400_BAD_REQUEST)

        tournament.participants.add(request.user)
        tournament.save()

        return Response({
            'message': 'You have joined the tournament.'
        }, status=status.HTTP_200_OK)

    @csrf_exempt
    @action(detail=True, methods=['post'], url_path='exit')
    def exit_tournament(self, request, pk=None):
        tournament = self.get_object()

        # Check if user is a participant
        if request.user not in tournament.participants.all():
            return Response({
                'message': 'You are not a participant in this tournament.'
            }, status=status.HTTP_400_BAD_REQUEST)

        tournament.participants.remove(request.user)
        tournament.save()

        return Response({
            'message': 'You have exited the tournament.'
        }, status=status.HTTP_200_OK)

    @csrf_exempt
    @action(detail=True, methods=['post'], url_path='start')
    def start_tournament(self, request, pk=None):
        tournament = self.get_object()

        # Authorization checks
        if tournament.owner != request.user:
            return Response({
                'message': 'Only the tournament owner can start it.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Tournament start eligibility checks
        if not tournament.can_start():
            return Response({
                'message': 'Tournament cannot start. Check participant requirements.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate matches using matchmaker utility
        matches = matchmaker(tournament)

        # Update tournament status
        tournament.is_active = True
        tournament.save()

        # Serialize match data
        match_data = MatchSerializer(matches, many=True).data

        return Response({
            'message': 'Tournament started successfully.',
            'matches': match_data
        }, status=status.HTTP_200_OK)

    @csrf_exempt
    @action(detail=False, methods=['get'], url_path='active')
    def list_active_tournaments(self, request):

        active_tournaments = Tournament.objects.filter(
            is_active=False,  # Not yet started
            start_date__isnull=True
        )
        
        serializer = self.get_serializer(active_tournaments, many=True)
        
        # Annotate with participant status
        for tournament in serializer.data:
            tournament_obj = Tournament.objects.get(id=tournament['id'])
            tournament['is_participant'] = request.user in tournament_obj.participants.all()
        
        return Response(serializer.data)

    @csrf_exempt
    @action(detail=True, methods=['get'], url_path='matches')
    def tournament_matches(self, request, pk=None):
        tournament = self.get_object()
        matches = Match.objects.filter(tournament=tournament)
        
        # Check if user is a participant or owner
        if (request.user not in tournament.participants.all() and 
            request.user != tournament.owner):
            return Response({
                'message': 'You do not have permission to view tournament matches.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

    @csrf_exempt
    @action(detail=True, methods=['delete'], url_path='destroy')
    def destroy_tournament(self, request, pk=None):
        tournament = self.get_object()
    
        # Check if the request user is the owner of the tournament
        if tournament.owner != request.user:
            return Response({
                'message': 'Only the owner can destroy this tournament.'
            }, status=status.HTTP_403_FORBIDDEN)
    
        # Delete the tournament
        tournament.delete()
    
        return Response({
            'message': 'Tournament has been successfully destroyed.'
        }, status=status.HTTP_200_OK)