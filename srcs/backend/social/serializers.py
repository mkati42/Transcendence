from rest_framework import serializers
from .models import Block, Follow, Friend


class FollowSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    target = serializers.ReadOnlyField(source='target.username')

    class Meta:
        model = Follow
        fields = ['id', 'owner', 'target', 'created_at']


class FriendSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    target = serializers.ReadOnlyField(source='target.username')

    class Meta:
        model = Friend
        fields = ['id', 'owner', 'target', 'is_accepted', 'created_at']


class BlockSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    target = serializers.ReadOnlyField(source='target.username')

    class Meta:
        model = Block
        fields = ['id', 'owner', 'target', 'created_at']
