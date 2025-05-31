GAME_WAITING = 0
GAME_RUNNING = 1
GAME_OVER = 2

class GameState:
    def __init__(self, room_id, channel_layer):
        self.room_id = room_id
        self.channel_layer = channel_layer
        self.channel_name_left = None
        self.channel_name_right = None
        self.game_status = GAME_WAITING
        self.score = [0, 0]
        self.player_left = None
        self.player_right = None
    
    def get_player(self, channel_name):
        if self.channel_name_left == channel_name:
            return self.player_left
        if self.channel_name_right == channel_name:
            return self.player_right
        return None
