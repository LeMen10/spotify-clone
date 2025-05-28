from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from api.models import User, Song, Message, Artist
from datetime import datetime, timedelta
from api.serializers import SongSerializer
from api.utils.decode_token import decode_token


@api_view(["GET"])
def get_system_stats(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        stats = {
            "total_users": User.objects.count(),
            "total_songs": Song.objects.count(),
            "total_genres": Artist.objects.count(),
            "total_messages": Message.objects.count(),
        }

        return Response({"data": stats}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def top_popular_songs_char(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        queryset = Song.objects.select_related("artist").filter(play_count__gt=0).all()
        top_songs = queryset.order_by("-play_count", "-release_date")[:5]

        chart_data = {
            "labels": [song.title for song in top_songs],
            "datasets": [
                {
                    "label": "Play count",
                    "data": [song.play_count for song in top_songs],
                    "backgroundColor": [
                        "#36A2EB",
                    ],
                    "artists": [song.artist.name for song in top_songs],
                }
            ],
        }
        return Response({"success": True, "data": chart_data})

    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
def top_songs(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    
    songs = Song.objects.filter(play_count__gt=0).order_by("-play_count", "-release_date")[:10]
    serializer = SongSerializer(songs, many=True, context={"request": request})
    return Response(serializer.data)
