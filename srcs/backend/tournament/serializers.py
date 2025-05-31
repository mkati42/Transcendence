from rest_framework import serializers
from .models import Tournament, Match

class TournamentSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField()
    participants_count = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            'id', 'name', 'description', 'owner', 
            'max_participants', 'min_participants', 
            'is_active', 'start_date', 
            'participants_count'
        ]
        read_only_fields = ['is_active', 'start_date']

    def get_participants_count(self, obj):
        return obj.participants.count()

class MatchSerializer(serializers.ModelSerializer):
    player1_username = serializers.CharField(source='player1.username', read_only=True)
    player2_username = serializers.CharField(source='player2.username', read_only=True)
    winner_username = serializers.CharField(source='winner.username', read_only=True, allow_null=True)

    class Meta:
        model = Match
        fields = [
            'id', 'tournament', 'player1_username', 'player2_username', 
            'room_id', 'is_completed', 'winner_username'
        ]