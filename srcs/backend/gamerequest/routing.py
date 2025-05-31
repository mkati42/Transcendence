from django.urls import re_path, path
from .consumers import GameRequestSocketConsumer

websocket_urlpatterns = [
    path('ws/gamerequest/<str:token>/', GameRequestSocketConsumer.as_asgi()),
]
