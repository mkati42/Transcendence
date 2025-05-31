PLAYER_WAITING = 0
PLAYER_READY = 1

class Player:
    def __init__(self, channel_name, side, paddle, player_name):
        self.channel_name = channel_name
        self.side = side
        self.paddle = paddle
        self.ready = False
        self.score = 0
        self.playername = player_name

