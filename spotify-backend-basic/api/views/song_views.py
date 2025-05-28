from ..models import Song
from ..serializers import SongSerializer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from ..utils.decode_token import decode_token
from rest_framework import status
from django.db.models import Q, Func, Value
from unidecode import unidecode


class Unaccent(Func):
    function = "unaccent"
    arity = 1


@api_view(["GET"])
@permission_classes([AllowAny])
def get_songs(request):
    songs = Song.objects.all()
    serializer = SongSerializer(songs, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])  # Hỗ trợ upload file
def add_song(request):
    try:
        title = request.data.get("title")
        duration = request.data.get("duration")
        release_date = request.data.get("release_date")
        artist_id = request.data.get("artist_id")
        genre_id = request.data.get("genre_id")
        audio_file = request.FILES.get("audio_file")  # Lấy file từ request
        image = request.FILES.get(image)

        if not all(
            [title, duration, release_date, artist_id, genre_id, audio_file, image]
        ):
            return Response({"error": "Missing fields"}, status=400)

        song = Song.objects.create(
            title=title,
            duration=duration,
            release_date=release_date,
            artist_id=artist_id,
            genre_id=genre_id,
            audio_file=audio_file,
            image=image,
        )

        return Response(SongSerializer(song).data, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def search_songs(request):
    try:
        query = request.GET.get("query", "").strip()
        if not query:
            return Response(
                {"error": "Query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        unaccented_query = unidecode(query)
        songs = Song.objects.annotate(
            unaccented_title=Unaccent("title"),
            unaccented_artist=Unaccent("artist__name"),
        ).filter(
            Q(unaccented_title__icontains=unaccented_query)
            | Q(unaccented_artist__icontains=unaccented_query)
        )

        serializer = SongSerializer(songs, many=True, context={"request": request})

        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def increase_play_count(request, song_id):
    try:
        song = Song.objects.get(id=song_id)
        song.play_count += 1
        song.save()

        serializer = SongSerializer(song, context={"request": request})
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)

    except Song.DoesNotExist:
        return Response({"error": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
