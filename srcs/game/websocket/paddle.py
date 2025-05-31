class Paddle:
    def __init__(self, position):
        self.position = position 
        self.paddle_width = 10
        self.paddle_height = 100
        self.game_height = 600

    def move(self, direction):
        x, y = self.position
        if direction == 'up':
            if self.position[1] > 0:
                y -= 10
        elif direction == 'down':
            if self.position[1] < self.game_height - self.paddle_height:
                y += 10
        self.position = (x, y)
