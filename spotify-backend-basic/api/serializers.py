from rest_framework import serializers
from .models import User, Message, Conversation, Song, Artist, Genre, Playlist
from django.conf import settings
from urllib.parse import unquote


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "fullname",
            "profile_pic",
            "is_active",
            "role",
            "dateRegister",
            "monthRegister",
            "isRegister",
        ]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr != "password":
                setattr(instance, attr, value)
        instance.save()
        return instance


class MessageSerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "group", "content", "timestamp"]


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = "__all__"


class SongSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()
    artist_info = serializers.SerializerMethodField()
    genre_info = serializers.SerializerMethodField()
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        write_only=False  # Cho phép cả đọc và ghi
    )
    # Ánh xạ artist_id và genre_id
    artist_id = serializers.PrimaryKeyRelatedField(
        queryset=Artist.objects.all(), source="artist"
    )
    genre_id = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(), source="genre"
    )

    class Meta:
        model = Song
        fields = fields = [
            "id",
            "title",
            "duration",
            "release_date",
            "play_count",
            "audio_url",
            "artist_info",
            "genre_info",
            "artist_id",
            "genre_id",
            "image",
            "is_premium"
        ]

    def get_audio_url(self, obj):
        if not obj.audio_file:
            return None

        request = self.context.get("request")
        url = obj.audio_file.url
        decoded_url = unquote(url)

        if request:
            return request.build_absolute_uri(decoded_url)
        return f"{settings.BASE_URL}{decoded_url}"

    def to_representation(self, instance):
        """Override để trả về URL đầy đủ khi hiển thị"""
        ret = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            url = instance.image.url
            ret['image'] = request.build_absolute_uri(url) if request else f"{settings.BASE_URL}{url}"
        return ret
    
    def get_artist_info(self, obj):
        return {"id": obj.artist.id, "name": obj.artist.name}

    def get_genre_info(self, obj):
        return {"id": obj.genre.id, "name": obj.genre.name}


class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ("id", "name")


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ("id", "name")

class PlaylistSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    fullname = serializers.SerializerMethodField()
    class Meta:
        model = Playlist
        fields = ["id", "user", "fullname", "name", "created_at", "description", "image"]
        read_only_fields = ["id", "created_at"]
    def get_fullname(self, obj):
        return obj.user.fullname if obj.user else None