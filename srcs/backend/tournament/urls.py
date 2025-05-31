from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet

router = DefaultRouter()
router.register(r'', TournamentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]