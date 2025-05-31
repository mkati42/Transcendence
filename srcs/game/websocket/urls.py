from django.urls import path
from .views import GetGameStateView

urlpatterns = [
    path('state/<str:room_id>/', GetGameStateView.as_view(), name='get_game_state'),
]