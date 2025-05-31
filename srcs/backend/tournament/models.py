from django.db import models
from django.conf import settings

class Tournament(models.Model):
    name = models.CharField(max_length=200)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_tournaments')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='tournaments')
    
    max_participants = models.IntegerField(default=16)
    min_participants = models.IntegerField(default=4)
    
    is_active = models.BooleanField(default=False)
    start_date = models.DateTimeField(null=True, blank=True)
    
    def can_start(self):
        return (self.participants.count() >= self.min_participants and 
                self.participants.count() <= self.max_participants)
    
    def is_open_for_registration(self):
        return not self.is_active and self.start_date is None

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    player1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matches_as_player1')
    player2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matches_as_player2')
    
    room_id = models.CharField(max_length=100, unique=True)
    is_completed = models.BooleanField(default=False)
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='won_matches')
