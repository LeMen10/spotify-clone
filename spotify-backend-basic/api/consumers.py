import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .models import Message, Conversation, ConversationParticipant, User
from channels.db import database_sync_to_async
from .utils import decode_token
from django.http import HttpRequest


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get("message")
            sender_id = text_data_json.get("sender_id")
            conversation_id = text_data_json.get("conversation_id")

            if not all([message, sender_id, conversation_id]):
                raise ValueError("Missing required fields in message data")

            # Get sender and conversation
            sender = await self.get_user(sender_id)
            conversation = await self.get_conversation(conversation_id)
            # Save message to database
            message = await self.save_message(conversation, sender, message)
            # Send message to room group

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message",
                    "message": message.content,
                    "sender_id": sender.id,
                    "sender_name": sender.username,  # or any other field
                    "sender_fullname": sender.fullname,  # full name
                    "profile_pic": (
                        sender.profile_pic if sender.profile_pic != "null" else None
                    ),
                    "conversation_id": conversation.id,
                    "timestamp": message.timestamp.isoformat(),  # convert datetime to string
                },
            )

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON format"}))
        except ValueError as e:
            await self.send(text_data=json.dumps({"error": str(e)}))
        except Exception as e:
            await self.send(text_data=json.dumps({"error": "Internal server error"}))

    async def chat_message(self, event):
        # Forward the complete message data to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "message": event["message"],
                    "sender_id": event["sender_id"],
                    "sender_name": event["sender_name"],
                    "sender_fullname": event["sender_fullname"],
                    "profile_pic": event["profile_pic"],
                    "conversation_id": event["conversation_id"],
                    "timestamp": event["timestamp"],
                }, ensure_ascii=False
            )
        )

    # Database operations (using sync_to_async)
    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def get_conversation(self, conversation_id):
        return Conversation.objects.get(id=conversation_id)

    @database_sync_to_async
    def save_message(self, conversation, sender, content):
        return Message.objects.create(
            conversation=conversation, sender=sender, content=content
        )
