from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from api.models import Playlist, PlaylistSong, Song
from api.serializers import PlaylistSerializer, SongSerializer
from api.utils.decode_token import decode_token
from math import ceil

User = get_user_model()


@api_view(["GET"])
def get_playlist_by_limit(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        page = int(request.GET.get("page", 1))
        limit = int(request.GET.get("limit", 10))

        offset = (page - 1) * limit
        all_playlists = (
            Playlist.objects.filter(user_id=user_id).select_related("user").order_by("-created_at")
        )
        total_count = all_playlists.count()
        page_count = ceil(total_count / limit)

        # Lấy dữ liệu theo trang
        playlists = all_playlists[offset : offset + limit]

        # Serialize
        serializer = PlaylistSerializer(
            playlists, many=True, context={"request": request}
        )

        return Response(
            {"data": serializer.data, "count": total_count, "page_count": page_count},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def add_playlist(request):
    user_id, error_response = decode_token(request)
    if error_response:
        return error_response
    try:
        name = request.data.get("name")
        if not name:
            return Response(
                {"error": "Playlist name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Lấy user từ user_id
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Tạo playlist
        playlist = Playlist.objects.create(
            user=user,
            name=name,
            image=None,
        )

        serializer = PlaylistSerializer(playlist, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT"])
def update_playlist(request, playlist_id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        playlist = Playlist.objects.get(pk=playlist_id)
    except Playlist.DoesNotExist:
        return Response(
            {"error": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        serializer = PlaylistSerializer(
            playlist, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_playlist_detail(request, playlist_id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        playlist = Playlist.objects.get(id=playlist_id)
    except Playlist.DoesNotExist:
        return Response(
            {"error": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = PlaylistSerializer(playlist, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


# nam
@api_view(["DELETE"])
# @permission_classes([AllowAny])
def delete_playlist(request, playlist_id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        playlist = Playlist.objects.get(pk=playlist_id)
        playlist.delete()
        return Response(
            {"message": "Playlist deleted successfully"}, status=status.HTTP_200_OK
        )
    except Playlist.DoesNotExist:
        return Response(
            {"error": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def add_song_to_playlist(request):
    user_id, error_response = decode_token(request)
    if error_response:
        return error_response
    playlist_id = request.data.get("playlist_id")
    song_id = request.data.get("song_id")

    if not playlist_id or not song_id:
        return Response(
            {"error": "Playlist ID and Song ID are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        playlist = Playlist.objects.get(id=playlist_id)
        song = Song.objects.get(id=song_id)
    except Playlist.DoesNotExist:
        return Response(
            {"error": "Playlist not found."}, status=status.HTTP_404_NOT_FOUND
        )
    except Song.DoesNotExist:
        return Response({"error": "Song not found."}, status=status.HTTP_404_NOT_FOUND)

    # Check if the song is already in the playlist
    if PlaylistSong.objects.filter(playlist=playlist, song=song).exists():
        return Response(
            {"message": "Song is already in the playlist."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    PlaylistSong.objects.create(playlist=playlist, song=song)

    return Response(
        {"message": "successfully"},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def get_song_of_playlist(request, playlist_id):
    user_id, error_response = decode_token(request)
    if error_response:
        return error_response
    try:
        # Lấy tất cả bài hát in playlist với playlist_id
        playlist_songs = PlaylistSong.objects.filter(playlist_id=playlist_id)

        # Lấy danh sách bài hát từ PlaylistSong
        songs = [playlist_song.song for playlist_song in playlist_songs]

        # Serialize danh sách bài hát
        serializer = SongSerializer(songs, many=True, context={"request": request})

        return Response(serializer.data, status=status.HTTP_200_OK)
    except PlaylistSong.DoesNotExist:
        return Response(
            {"error": "Playlist not found or no songs in playlist."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE"])
def remove_song_from_playlist(request):
    user_id, error_response = decode_token(request)
    if error_response:
        return error_response

    playlist_id = request.data.get("playlist_id")
    song_id = request.data.get("song_id")

    if not playlist_id or not song_id:
        return Response(
            {"error": "Playlist ID and Song ID are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        playlist = Playlist.objects.get(id=playlist_id)
        song = Song.objects.get(id=song_id)
    except Playlist.DoesNotExist:
        return Response(
            {"error": "Playlist not found."}, status=status.HTTP_404_NOT_FOUND
        )
    except Song.DoesNotExist:
        return Response({"error": "Song not found."}, status=status.HTTP_404_NOT_FOUND)

    # Kiểm tra xem bài hát có trong playlist không
    try:
        playlist_song = PlaylistSong.objects.get(playlist=playlist, song=song)
        playlist_song.delete()
        return Response(
            {"message": "Song removed from playlist successfully."},
            status=status.HTTP_200_OK,
        )
    except PlaylistSong.DoesNotExist:
        return Response(
            {"error": "Song is not in the playlist."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
# @permission_classes([AllowAny])
def get_playlists(request):
    user_id, error_response = decode_token(request)
    if error_response:
        return error_response
    try:
        all_playlists = (
            Playlist.objects.all().select_related("user").order_by("-created_at")
        )
        # Serialize
        serializer = PlaylistSerializer(
            all_playlists, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
