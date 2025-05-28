from api.models import Song, Artist, Genre
from api.serializers import SongSerializer, ArtistSerializer, GenreSerializer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from api.utils.decode_token import decode_token
from math import ceil


@api_view(["GET"])
@permission_classes([AllowAny])
def get_songs_management(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        page = int(request.GET.get("page", 1))
        limit = int(request.GET.get("limit", 10))

        offset = (page - 1) * limit
        all_songs = Song.objects.all().select_related("artist", "genre").order_by("id")
        total_count = all_songs.count()
        page_count = ceil(total_count / limit)

        # Lấy dữ pagination
        songs = all_songs[offset : offset + limit]

        # Serialize
        serializer = SongSerializer(songs, many=True, context={"request": request})

        return Response(
            {"data": serializer.data, "count": total_count, "page_count": page_count},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])  # Hỗ trợ upload file
def add_song(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        title = request.data.get("title")
        duration = request.data.get("duration")
        release_date = request.data.get("release_date")
        artist_id = request.data.get("artist_id")
        genre_id = request.data.get("genre_id")
        audio_file = request.FILES.get("audio_file")
        image_file = request.FILES.get("image_file") 
        is_premium = request.data.get("is_premium")
        is_premium = is_premium.lower() == "true"
        
        if not all([title, duration, release_date, artist_id, genre_id, audio_file, image_file]):
            return Response({"error": "Missing fields"}, status=400)

        song = Song.objects.create(
            title=title,
            duration=duration,
            release_date=release_date,
            artist_id=artist_id,
            genre_id=genre_id,
            audio_file=audio_file,
            image=image_file,
            is_premium=is_premium,
        )

        return Response(SongSerializer(song).data, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])
def update_song(request, song_id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        song = Song.objects.get(pk=song_id)
    except Song.DoesNotExist:
        return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)
    print("Received data:", request.data) 
    serializer = SongSerializer(song, data=request.data, partial=True) 
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def delete_song(request, song_id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        song = Song.objects.get(pk=song_id)
        song.delete()
        return Response({"message": "success"}, status=200)
    except Song.DoesNotExist:
        return Response({"error": "error"}, status=404)

