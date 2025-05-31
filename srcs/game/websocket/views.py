from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from .consumers import rooms, GAME_WAITING, GAME_RUNNING, GAME_OVER

class GetGameStateView(APIView):

    def get(self, request, room_id, *args, **kwargs):
        # Oda mevcut mu kontrol et
        if room_id not in rooms:
            raise NotFound(detail="Room not found", code=404)
        
        game_state = rooms[room_id]['game_state']
        players_data = [
            {
                'side': player.side,
                'score': player.score,
            }
            for player in game_state.players
        ]
        
        response_data = {
            'room_id': game_state.room_id,
            'game_status': {
                GAME_WAITING: 'waiting',
                GAME_RUNNING: 'running',
                GAME_OVER: 'over',
            }.get(game_state.game_status, 'unknown'),
            'players': players_data,
        }
        
        return Response(response_data, status=200)