from api.models import Song, Artist, Genre
from api.serializers import SongSerializer, ArtistSerializer, GenreSerializer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from api.utils.decode_token import decode_token
from math import ceil
from django.shortcuts import get_object_or_404
import json
from django.db import IntegrityError
from django.http import JsonResponse


# genres
# API get genres
@api_view(["GET"])
@permission_classes([AllowAny])
def get_genres(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        all_genres = Genre.objects.all().order_by("id")
        serializer = GenreSerializer(all_genres, many=True, context={"request": request})

        return Response(
            {"data": serializer.data},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def add_genre(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            if not name:
                return JsonResponse(
                    {"error": "Tên thể loại không được để trống"}, status=400
                )
            genre = Genre.objects.create(name=name)
            return JsonResponse({"id": genre.id, "name": genre.name}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)


@api_view(["PUT"])
@permission_classes([AllowAny])
def update_genre(request, id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    if request.method == "PUT":
        try:
            genre = get_object_or_404(Genre, id=id)
            data = json.loads(request.body)
            name = data.get("name")
            if not name:
                return JsonResponse(
                    {"error": "Tên thể loại không được để trống"}, status=400
                )
            genre.name = name
            genre.save()
            return JsonResponse({"id": genre.id, "name": genre.name}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def delete_genre(request, id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    if request.method == "DELETE":
        try:
            genre = get_object_or_404(Genre, id=id)
            # Xóa tất cả bài hát liên quan đến thể loại
            songs = Song.objects.filter(genre=genre)
            if songs.exists():
                songs.delete()
            # Xóa thể loại
            genre.delete()
            return JsonResponse(
                {"message": "Xóa thể loại và các bài hát liên quan thành công"},
                status=200,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_genres_by_limit(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        page = int(request.GET.get("page", 1))
        limit = int(request.GET.get("limit", 6))

        offset = (page - 1) * limit
        all_genres = Genre.objects.all().order_by("id")
        total_count = all_genres.count()
        page_count = ceil(total_count / limit)

        # Lấy dữ pagination
        genres = all_genres[offset : offset + limit]

        # Serialize
        serializer = GenreSerializer(genres, many=True, context={"request": request})

        return Response(
            {"data": serializer.data, "count": total_count, "page_count": page_count},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
