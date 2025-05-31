import random, string, base64
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class CustomUser(AbstractUser):
    email = models.EmailField(max_length=255, unique=True)
    isActiveTwoFactor = models.BooleanField(default=False)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    qr_code = models.TextField(blank=True, null=True)
    secret_key = models.CharField(max_length=64, blank=True, null=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)  # Arkadaşlar
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by', blank=True)  # Engellenen kullanıcılar
    friend_requests = models.ManyToManyField('self', symmetrical=False, related_name='pending_requests', blank=True)  # Arkadaşlık istekleri

    # Suleyman eklenilenler
    total_games = models.IntegerField(default=0)
    total_wins = models.IntegerField(default=0)
    casual_rating = models.IntegerField(default=500)

    tournament_total = models.IntegerField(default=0)
    tournament_wins = models.IntegerField(default=0)
    tournament_rating = models.IntegerField(default=500)

    win_streak = models.IntegerField(default=0)
    lose_streak = models.IntegerField(default=0)
    goals_scored = models.IntegerField(default=0)
    goals_conceded = models.IntegerField(default=0)


    def generate_secret_key(self):
        if not self.secret_key:
            characters = string.ascii_uppercase + "234567"
            random_string = ''.join(random.choice(characters) for _ in range(32))
            self.secret_key = base64.b32encode(random_string.encode()).decode('utf-8')

            # Base32 padding ekleme
            self.secret_key = self.secret_key.rstrip('=')  # Fazla padding'i kaldır
            self.save()


    def __str__(self):
        return self.username
