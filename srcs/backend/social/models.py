from django.db import models
from users.models import CustomUser


class Follow(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="following_social", null=True)
    target = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="followers_social", null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('owner', 'target')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.owner.username} follows {self.target.username}"


class Friend(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_requests", null=True)
    target = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="received_requests", null=True)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('owner', 'target')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.owner.username} -> {self.target.username} (Accepted: {self.is_accepted})"


class Block(models.Model):
    owner = models.ForeignKey(CustomUser, related_name='blocker_social', on_delete=models.CASCADE, null=True)
    target = models.ForeignKey(CustomUser, related_name='blocked_social', on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('owner', 'target')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.owner.username} blocked {self.target.username}'
