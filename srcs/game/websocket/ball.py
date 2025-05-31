import time

class Ball:
    def __init__(self, position):
        self.previous_time = time.time()
        self.position = position
        self.velocityX = 200
        self.velocityY = 200
        self.radius =  10
        self.game_width = 1200
        self.game_height = 600 

    def update_ball(self):
        self.current_time = time.time()
        self.delta_time = self.current_time - self.previous_time
        self.previous_time = self.current_time
        self.position[0] += self.velocityY * self.delta_time
        self.position[1] += self.velocityX * self.delta_time

    def reset_ball(self):
        self.position[1] = int(self.game_width / 2)
        self.position[0] = int(self.game_height / 2)
        self.velocityX = 200
        self.velocityY = 200

    def check_collision(self):
        if (self.position[0] + self.radius > self.game_height or
            self.position[0] - self.radius <= 0):
            self.velocityY *= -1

    def check_goal(self, player_left, player_right):
        paddle_left = 250
        paddle_right = 250
        if player_left == None and player_right != None:
            paddle_right = player_right.paddle.position[1]
        elif player_right == None and player_left != None:
            paddle_left = player_left.paddle.position[1]
        else:
            paddle_left = player_left.paddle.position[1]
            paddle_right = player_right.paddle.position[1]
        if self.position[1] + self.radius > self.game_width:
            if self.position[0] < paddle_right or self.position[0] > paddle_right + 100:
                    return player_left
            else: 
                self.velocityX *= -1
        if self.position[1] - self.radius < 0:
            if self.position[0] < paddle_left or self.position[0] > paddle_left + 100:
                    return player_right
            else: 
                self.velocityX *= -1
        return None


