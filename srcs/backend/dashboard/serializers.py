from rest_framework import serializers
from .models import GameData, CustomUser
from users.serializers import CustomUserSerializer

class GameDataSerializer(serializers.ModelSerializer):
    player1 = CustomUserSerializer(read_only=True)
    player2 = CustomUserSerializer(read_only=True)
    winner = CustomUserSerializer(read_only=True)

    class Meta:
        model = GameData
        fields = ['game_id', 'game_type', 'player1', 'player1_name', 'player2', 'player2_name', 
                  'winner', 'player1_goals', 'player2_goals', 'game_date', 'game_played_time']

    def create(self, validated_data):
        player1_name = validated_data['player1_name']
        player2_name = validated_data['player2_name']
        
        player1 = CustomUser.objects.get(username=player1_name)
        player2 = CustomUser.objects.get(username=player2_name)
        if validated_data['player1_goals'] > validated_data['player2_goals']:
            winner = player1
        elif validated_data['player1_goals'] < validated_data['player2_goals']:
            winner = player2
    
        game_data = GameData.objects.create(
            game_type=validated_data.get('game_type', 'Casual'),
            player1=player1,
            player2=player2,
            winner=winner,
            player1_name=player1_name,
            player2_name=player2_name,
            winner_name=winner.username,
            loser=player1 if winner == player2 else player2,
            loser_name=player1.username if winner == player2 else player2.username,
            player1_goals=validated_data.get('player1_goals', 0),
            player2_goals=validated_data.get('player2_goals', 0),
            game_date=validated_data.get('game_date'),
            game_played_time=validated_data.get('game_played_time', 0)
        )
        
        return game_data

class getGameDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = GameData
        # exclude player1, player2, winner, loser fields
        fields = ['game_id', 'game_type', 'player1_name', 'player2_name', 'winner_name', 'loser_name',
                  'player1_goals', 'player2_goals',
                  'player1_casual_rank', 'player2_casual_rank', 'player1_tournament_rank', 'player2_tournament_rank', 
                  'player1_streak', 'player2_streak',
                  'game_date', 'game_played_time']

    def create(self, game_data: GameData):
        game_id = game_data.game_id
        game_type = game_data.game_type
        player1_name = game_data.player1_name
        player2_name = game_data.player2_name
        player1_goals = game_data.player1_goals
        player2_goals = game_data.player2_goals
        player1_streak = game_data.player1.win_streak - game_data.player1.lose_streak
        player2_streak = game_data.player2.win_streak - game_data.player2.lose_streak
        player1_casual_rank = game_data.player1.casual_rating
        player2_casual_rank = game_data.player2.casual_rating
        player1_tournament_rank = game_data.player2.tournament_rating
        player2_tournament_rank = game_data.player2.tournament_rating
        game_date = game_data.game_date
        game_played_time = game_data.game_played_time
        if player1_goals > player2_goals:
            winner_name = player1_name
            loser_name = player2_name
        else:
            winner_name = player2_name
            loser_name = player1_name
        return {
            'game_id': game_id,
            'game_type': game_type,
            'player1_name': player1_name,
            'player2_name': player2_name,
            'winner_name': winner_name,
            'loser_name': loser_name,
            'player1_goals': player1_goals,
            'player2_goals': player2_goals,
            'player1_streak': player1_streak,
            'player2_streak': player2_streak,
            'player1_rank': player1_casual_rank,
            'player2_rank': player2_casual_rank,
            'player1_tournament_rank': player1_tournament_rank,
            'player2_tournament_rank': player2_tournament_rank,
            'game_date': game_date,
            'game_played_time': game_played_time
        }
