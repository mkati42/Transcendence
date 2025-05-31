
# Create your views here.
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend

from .models import Block, Follow, Friend
from .serializers import BlockSerializer, FollowSerializer, FriendSerializer
from .decorators import follow_check, unfollow_check, \
                        friendReq_check, friendAccept_check, \
                        friendReqCancel_check, unfriend_check, \
                        block_check, unblock_check
from django.views.decorators.csrf import csrf_exempt

User = get_user_model()



class FollowViewSet(viewsets.ModelViewSet, generics.DestroyAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['owner', 'target']


    @action(detail=False, methods=['post'], url_path='request')
    @follow_check(to_control='target_name')
    def custom_create(self, request):
        '''Follows user'''
        follower_user = request.user
        followed_username = request.data.get('target_name')
        followed_user = User.objects.get(username=followed_username)

        follow_instance = Follow(owner=request.user, target=followed_user)
        follow_instance.save()
        return Response(
            {'message': f'{follower_user.username} has followed {followed_user.username}', 
             'code': '201'},
            status=status.HTTP_201_CREATED
        )


    @action(detail=False, methods=['post'], url_path='unfollow')
    @unfollow_check(to_control='target_name')
    def custom_unfollow(self, request):
        '''Unfollows user'''
        unfollower_user = request.user
        unfollowed_user = User.objects.filter(username=request.data.get('target_name')).first()

        follow_instance = Follow.objects.filter(owner=unfollower_user, target=unfollowed_user).first()
        follow_instance.delete()
        return Response({
            'message': f'{unfollower_user.username} has unfollowed {unfollowed_user.username}', 
            'code': '200'
            }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='followings')
    def custom_getFollowingList(self, request):
        user = request.user
        followings = Follow.objects.filter(owner=user)
        data = FollowSerializer(followings, many=True).data
        for item in data:
            item.pop('owner', None)
            item.pop('id', None)
        return Response({
            'followings': data, 
            'count': len(data), 
            'code': '200'
        })


    @action(detail=False, methods=['get'], url_path='followers')
    def custom_getFollowerList(self, request):
        user = request.user
        followers = Follow.objects.filter(target=user)
        data = FollowSerializer(followers, many=True).data
        for item in data:
            item.pop('target', None)
            item.pop('id', None)
        return Response({
            'followers': data, 
            'count': len(data), 
            'code': '200'
        })



class FriendViewSet(viewsets.ModelViewSet):
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['sender_username', 'receiver_username', 'is_accepted']

    @csrf_exempt
    @action(detail=False, methods=['post'], url_path='request')
    @friendReq_check(to_control='target_name')
    def custom_create(self, request):
        '''Sends friend requests'''
        receiver_username = request.data.get("target_name")
        receiver = User.objects.filter(username=receiver_username).first()

        friend_req = Friend.objects.create(owner=request.user, target=receiver)
        friend_req.save()

        serializer = self.get_serializer(friend_req)
        return Response({
            'data':serializer.data,
            'message': f'{request.user.username} has sent friend request to {receiver_username}',
            'code': '201'
            }, status=status.HTTP_201_CREATED)
    


    @action(detail=False, methods=['patch'], url_path='accept')
    @friendAccept_check(to_control='target_name')
    def custom_update(self, request):
        '''Accepts friend requests'''
        sender_username = request.data.get('target_name')

        friend_request = Friend.objects.filter(
            owner__username=sender_username, 
            target=request.user,
            is_accepted=False
        ).first()

        friend_request.is_accepted = True
        friend_request.save()

        return Response({
            'message': f'{request.user.username} has accepted friend request from {sender_username}', 
            'code': '200'
            }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['delete'], url_path='cancel')
    @friendReqCancel_check(to_control='target_name')
    def custom_cancel(self, request):
        '''Cancels friend requests'''
        target_name = request.data.get('target_name')
        target = User.objects.filter(username=target_name).first()

        friend_request = Friend.objects.filter(
            owner=request.user, 
            target=target,
            is_accepted=False
        ).first()

        friend_request.delete()

        return Response({
            'message': f'{request.user.username} has canceled friend request to {target_name}', 
            'code': '200'
            }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['delete'], url_path='delete')
    # @unfriend_check(to_control='target_name')
    def custom_destroy(self, request):
        '''Declines or deletes friend requests'''
        name = request.data.get('target_name')

        friend_request = Friend.objects.filter(
            Q(owner__username=name, target=request.user) | 
            Q(owner=request.user, target__username=name)
        ).first()

        if friend_request:
            friend_request.delete()

        return Response({
            'message': f'{request.user.username} has unfriended {name}', 
            'code': '200'
            }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='list-friends')
    def list_friends(self, request):
        '''Lists friends'''
        friends = Friend.objects.filter(Q(owner=request.user) | Q(target=request.user), is_accepted=True)
        data = []
        for friend in friends:
            if friend.owner == request.user:
                friend_username = friend.target.username
            else:
                friend_username = friend.owner.username
            data.append({
                'username': friend_username,
                'friendship_date': friend.created_at
            })
        return Response({
            'friends': data,
            'count': len(data),
            'code': '200'
            }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='sent-requests')
    def list_sent_requests(self, request):
        '''Lists sent friend requests'''
        friend_requests = Friend.objects.filter(owner=request.user, is_accepted=False)
        data = []
        for friend_request in friend_requests:
            data.append({
                'username': friend_request.target.username,
                'request_date': friend_request.created_at
            })
        return Response({
            'sent-requests': data, 
            'count': len(data),
            'code': 200
            }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='received-requests')
    def list_received_requests(self, request):
        '''Lists received friend requests'''
        friend_requests = Friend.objects.filter(target=request.user, is_accepted=False)
        data = []
        for friend_request in friend_requests:
            data.append({
                'username': friend_request.owner.username,
                'request_date': friend_request.created_at
            })
        return Response({
            'received-requests': data, 
            'count': len(data),
            'code': 200
            }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='all-requests')
    def list_requests(self, request):
        '''Lists sent and received friend requests'''
        sent_requests = Friend.objects.filter(owner=request.user, is_accepted=False)
        received_requests = Friend.objects.filter(target=request.user, is_accepted=False)
        data = {
            'sent_requests': [],
            'received_requests': []
        }
        for request in sent_requests:
            data['sent_requests'].append({
                'username': request.target.username,
                'request_date': request.created_at
            })
        for request in received_requests:
            data['received_requests'].append({
                'username': request.owner.username,
                'request_date': request.created_at
            })
        return Response({
            'all-requests': data, 
            'count': len(data),
            'code': 200
            }, status=status.HTTP_200_OK)


class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['owner', 'target']


    @action(detail=False, methods=['post'], url_path='block')
    @block_check(to_control='target_name')
    def block_user(self, request):
        '''Blocks user'''
        username = request.data.get('target_name')
        blocked_user = User.objects.get(username=username)
        Block.objects.create(owner=request.user, target=blocked_user)

        if Friend.objects.filter(
            Q(owner=request.user, target=blocked_user, is_accepted=True) |
            Q(owner=blocked_user, target=request.user, is_accepted=True)
        ).exists():
            Friend.objects.filter(
                Q(owner=request.user, target=blocked_user, is_accepted=True) |
                Q(owner=blocked_user, target=request.user, is_accepted=True)
            ).delete()

        if Follow.objects.filter(owner=request.user, target=blocked_user).exists():
            Follow.objects.filter(owner=request.user, target=blocked_user).delete()

        if Follow.objects.filter(owner=blocked_user, target=request.user).exists():
            Follow.objects.filter(owner=blocked_user, target=request.user).delete()


        return Response({
            'message': f'{request.user.username} has blocked {username}',
            'code': '201'
            }, status=status.HTTP_201_CREATED)


    @action(detail=False, methods=['post'], url_path='unblock')
    @unblock_check(to_control='target_name')
    def unblock_user(self, request):
        '''Unblocks user'''
        username = request.data.get('target_name')
        blocked_user = User.objects.get(username=username)
        Block.objects.filter(owner=request.user, target=blocked_user).delete()
        return Response({
            'message': f'{request.user.username} has unblocked {username}', 
            'code': '200'
            }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='blocked-users')
    def list_blocked_users(self, request):
        '''Lists blocked users'''
        blocked_users = Block.objects.filter(owner=request.user)
        data = []
        for block in blocked_users:
            data.append({
                'username': block.target.username,
                'blocked_at': block.created_at
            })
        return Response({
            'blocked-users': data, 
            'count': len(data),
            'code': '200'
            }, status=status.HTTP_200_OK)

