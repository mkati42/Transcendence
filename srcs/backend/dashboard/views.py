from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .models import GameData, CustomUser
from .serializers import GameDataSerializer, getGameDataSerializer
from .utils import updateUsersAfterSave
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError, PermissionDenied


class SaveGameDataView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            try:
                player1 = get_object_or_404(CustomUser, username=data['player1_name'])
                player2 = get_object_or_404(CustomUser, username=data['player2_name'])
            except Exception as e:
                return Response({'error': f'Player retrieval error: {str(e)}'}, status=400)

            if data['player1_goals'] > data['player2_goals']:
                winner, loser = player1, player2
            elif data['player1_goals'] < data['player2_goals']:
                winner, loser = player2, player1
            else:
                return Response({'error': 'The game cannot end in a tie.'}, status=400)

            try:
                game_data = GameData.objects.create(
                    game_type=data['game_type'],
                    player1=player1,
                    player2=player2,
                    winner=winner,
                    loser=loser,
                    winner_name=winner.username,
                    loser_name=loser.username,
                    player1_name=data['player1_name'],
                    player2_name=data['player2_name'],
                    player1_goals=data['player1_goals'],
                    player2_goals=data['player2_goals'],
                    player1_streak=player1.win_streak - player1.lose_streak,
                    player2_streak=player2.win_streak - player2.lose_streak,
                    player1_casual_rank=player1.casual_rating,
                    player2_casual_rank=player2.casual_rating,
                    player1_tournament_rank=player1.tournament_rating,
                    player2_tournament_rank=player2.tournament_rating,
                    game_date=data['game_date'],
                    game_played_time=data['game_played_time'],
                )
                game_data.save()
                updateUsersAfterSave(game_data)
            except Exception as e:
                return Response({'error': f'Game data creation error: {str(e)}'}, status=500)

            serializer = GameDataSerializer(game_data)
            return Response({'message': 'Game data saved successfully', 'data': serializer.data}, status=201)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=500)


class GetUserProfileStatsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        try:
            username = request.GET.get('username')
            if username:
                user = get_object_or_404(CustomUser, username=username)
            else:
                raise ValidationError('Username parameter is required.')

            user_stats = {
                'username': user.username,
                'total_wins': user.total_wins,
                'total_games': user.total_games,
                'casual_rating': user.casual_rating,
                'tournament_rating': user.tournament_rating,
                'goals_scored': user.goals_scored,
                'goals_conceded': user.goals_conceded,
                'win_rate': user.total_wins / user.total_games if user.total_games > 0 else 0,
                'streak': user.win_streak - user.lose_streak,
            }
            return Response({'message': 'User profile statistics retrieved successfully', 'data': user_stats})
        except ValidationError as e:
            return Response({'error': str(e)}, status=400)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=403)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class GetGameStatsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        try:
            game_id = request.GET.get('game_id')
            if not game_id:
                raise ValidationError(f"Game ID parameter is required.: " + str(game_id))
            game = get_object_or_404(GameData, game_id=game_id)
            serializer = getGameDataSerializer(game)
            return Response({'message': 'Game statistics retrieved successfully', 'data': serializer.data})
        except ValidationError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
