from functools import wraps
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import status
from .models import Block, Follow, Friend

User = get_user_model()


def checkCommon(to_control=None):
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            targetname = request.data.get(to_control)

            if not targetname:
                return Response(
                    {'error': 'Providing name is required', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if targetname == request.user.username:
                return Response(
                    {'error': 'You cannot target yourself', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = User.objects.filter(username=targetname).first()
            if not user:
                return Response(
                    {'error': 'User not found', 
                    'code': '404'},
                    status=status.HTTP_404_NOT_FOUND
                )

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator



def follow_check(to_control):
    def decorator(func):
        @wraps(func)
        @checkCommon(to_control=to_control)
        def wrapper(self, request, *args, **kwargs):
            follower_user=request.user
            followed_user = User.objects.filter(username=request.data.get(to_control)).first()

            if Follow.objects.filter(owner=follower_user, target=followed_user).first():
                return Response(
                    {'error': 'This user is already followed', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if Block.objects.filter(owner=followed_user, target=follower_user).exists():
                return Response(
                    {'error': 'You are blocked by the user you want to follow', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if Block.objects.filter(owner=follower_user, target=followed_user).exists():
                return Response(
                    {'error': 'You have blocked the user you want to follow', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator



def unfollow_check(to_control):
    def decorator(func):
        @wraps(func)
        @checkCommon(to_control=to_control)
        def wrapper(self, request, *args, **kwargs):
            unfollower_user=request.user
            unfollowed_user = User.objects.filter(username=request.data.get(to_control)).first()

            if not Follow.objects.filter(owner=unfollower_user, target=unfollowed_user).exists():
                return Response(
                    {'error': 'You are not following this user', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator



def friendReq_check(to_control):
    def decorator(func):
        @wraps(func)
        @checkCommon(to_control=to_control)
        def wrapper(self, request, *args, **kwargs):
            sender_user = request.user
            receiver_user = User.objects.filter(username=request.data.get(to_control)).first()

            if Block.objects.filter(owner=receiver_user, target=sender_user).exists():
                return Response(
                    {'error': 'You are blocked by the user you want to send friend request', 
                     'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if Block.objects.filter(owner=sender_user, target=receiver_user).exists():
                return Response(
                    {'error': 'You have blocked the user you want to send friend request', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if Friend.objects.filter(owner=sender_user, target=receiver_user).exclude(is_accepted=True).exists():
                return Response(
                    {'error': 'You have already sent a friend request to this user', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if Friend.objects.filter(owner=sender_user, target=receiver_user, is_accepted=True).exists() or \
                Friend.objects.filter(owner=receiver_user, target=sender_user, is_accepted=True).exists():
                return Response(
                    {'error': 'This user is already your friend', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if Friend.objects.filter(owner=receiver_user, target=sender_user, is_accepted=False).exists():
                req = Friend.objects.filter(owner=receiver_user, target=sender_user).first()
                req.is_accepted = True
                req.save()
                return Response(
                    {'error': f'You have already received a friend request from {sender_user.username}. You are now friends', 
                    'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator



def friendAccept_check(to_control):
    def decorator(func):
        @wraps(func)
        @checkCommon(to_control=to_control)
        def wrapper(self, request, *args, **kwargs):
            receiver_user = request.user
            sender_user= User.objects.filter(username=request.data.get(to_control)).first()

            if Block.objects.filter(owner=receiver_user, target=sender_user).exists():
                return Response(
                    {'error': 'You cannot accept friend request because you have blocked this user', 
                     'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if Block.objects.filter(owner=sender_user, target=receiver_user).exists():
                return Response(
                    {'error': 'You cannot accept friend request because you are blocked by this user', 
                     'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not Friend.objects.filter(owner=sender_user, target=receiver_user).exists():
                return Response(
                    {'error': f'You have not received a friend request from {sender_user.username}', 
                     'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if Friend.objects.filter(owner=sender_user, target=receiver_user, is_accepted=True).exists() or \
                Friend.objects.filter(owner=receiver_user, target=sender_user, is_accepted=True).exists():
                return Response(
                    {'error': 'This user is already your friend', 
                     'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator



def friendReqCancel_check(to_control):
    def decorator(func):
        @wraps(func)
        @checkCommon(to_control=to_control)
        def wrapper(self, request, *args, **kwargs):
            sender_user = request.user
            receiver_user = User.objects.filter(username=request.data.get(to_control)).first()

            if not Friend.objects.filter(owner=sender_user, target=receiver_user, is_accepted=False).exists():
                return Response(
                    {'error': f'You have not sent a friend request to {receiver_user.username}', 
                     'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator



def unfriend_check(to_control):
    def decorator(func):
        @wraps(func)
        @checkCommon(to_control=to_control)
        def wrapper(self, request, *args, **kwargs):
            sender_user = request.user
            receiver_user = User.objects.filter(username=request.data.get(to_control)).first()

            if (not Friend.objects.filter(owner=sender_user, target=receiver_user, is_accepted=False).exists()) and \
                (not Friend.objects.filter(owner=receiver_user, target=sender_user, is_accepted=False).exists()):
                return Response(
                    {'error': 'This user is not your friend', 
                     'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator




def block_check(to_control):
    def decorator(func):
        @wraps(func)
        @checkCommon(to_control=to_control)
        def wrapper(self, request, *args, **kwargs):
            blocked_name = request.data.get(to_control)
            blocked_user = User.objects.filter(username=blocked_name).first()
            if Block.objects.filter(owner=request.user, target=blocked_user).exists():
                return Response(
                    {'error': f'You have already blocked {blocked_name}', 
                     'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator



def unblock_check(to_control):
    def decorator(func):
        @wraps(func)
        @checkCommon(to_control=to_control)
        def wrapper(self, request, *args, **kwargs):
            unblocked_name = request.data.get(to_control)
            unblocked_user = User.objects.filter(username=unblocked_name).first()
            if not Block.objects.filter(owner=request.user, target=unblocked_user).exists():
                return Response(
                    {'error': f'You have not blocked {unblocked_name}', 
                     'code': '400'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator

