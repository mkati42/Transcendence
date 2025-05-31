from django.urls import path
from .views import SaveGameDataView, GetUserProfileStatsView, GetGameStatsView

urlpatterns = [
    path('save_game_data/', SaveGameDataView.as_view(), name='save_game_data'),
    path('get_user_profile_stats/', GetUserProfileStatsView.as_view(), name='get_user_profile_stats'),
    path('get_game_stats/', GetGameStatsView.as_view(), name='get_game_stats'),
]
