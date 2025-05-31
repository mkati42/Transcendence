from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser
#from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 'friends', 'blocked_users', 
            'friend_requests', 'isActiveTwoFactor',
            'secret_key', 'qr_code', 'profile_picture', 'bio', 'total_wins', 'total_games',
            'win_streak', 'lose_streak', 'casual_rating',
            'goals_scored', 'goals_conceded',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'profile_picture': {'required': False}
        }

    def validate_password(self, value):
        try:
            validate_password(value)  # Django'nun şifre doğrulama fonksiyonunu kullan
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
        )
        #user.generate_secret_key()
        return user

