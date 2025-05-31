from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlockViewSet, FollowViewSet, FriendViewSet

router = DefaultRouter()
router.register(r'follow', FollowViewSet, basename='follow')
router.register(r'friend', FriendViewSet, basename='friend')
router.register(r'block', BlockViewSet, basename='block')

"""
DefaultRouter():register()

basename = block -->    block-list: GET /blocks/ (list)
                        block-detail: GET /blocks/<id>/ (detail)

GET /blocks/: list all blocks
POST /blocks/: register a new block
GET /blocks/<id>/: get a specific block register
PUT /blocks/<id>/: update a specific block register
DELETE /blocks/<id>/: delete a specific block register
"""""

urlpatterns = [
    path('', include(router.urls)),
]
