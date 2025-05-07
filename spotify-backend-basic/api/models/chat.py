from django.db import models
from .user import User

class Conversation(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)  # Nhóm chat hoặc chat riêng
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "conversations"

class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = "conversation_participants"
        unique_together = ('conversation', 'user')  # Đảm bảo mỗi user chỉ tham gia 1 lần vào 1 cuộc trò chuyện

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, null=True, blank=True
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "messages"