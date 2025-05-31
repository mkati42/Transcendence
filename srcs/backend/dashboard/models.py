from django.db import models
from users.models import CustomUser


class GameData(models.Model):
    game_id = models.AutoField(primary_key=True)
    game_type = models.CharField(max_length=10, default='Casual')
    player1 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='player_1', null=True)
    player1_name = models.CharField(max_length=100, default='Player 1')
    player2 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='player_2', null=True)
    player2_name = models.CharField(max_length=100, default='Player 2')
    winner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='winner_player', null=True)
    winner_name = models.CharField(max_length=100, default='Winner')
    loser = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='loser_player', null=True)
    loser_name = models.CharField(max_length=100, default='Loser')
    player1_streak = models.IntegerField(default=0)
    player2_streak = models.IntegerField(default=0)
    player1_casual_rank = models.IntegerField(default=0)
    player2_casual_rank = models.IntegerField(default=0)
    player1_tournament_rank = models.IntegerField(default=0)
    player2_tournament_rank = models.IntegerField(default=0)
    player1_goals = models.IntegerField(default=0)
    player2_goals = models.IntegerField(default=0)
    game_date = models.DateTimeField(auto_now_add=True)
    game_played_time = models.FloatField(default=0)

    def __str__(self):
        return f'{self.player1_name} vs {self.player1_name}'