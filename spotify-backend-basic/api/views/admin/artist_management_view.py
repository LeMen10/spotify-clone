from api.models import Song, Artist, Genre
from api.serializers import SongSerializer, ArtistSerializer, GenreSerializer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from api.utils.decode_token import decode_token
from math import ceil
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import json
from django.db import IntegrityError


# artist
# API get artists
@api_view(["GET"])
def get_artists_by_limit(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        page = int(request.GET.get("page", 1))
        limit = int(request.GET.get("limit", 6))

        offset = (page - 1) * limit
        all_artists = Artist.objects.all().order_by("id")
        total_count = all_artists.count()
        page_count = ceil(total_count / limit)

        artists = all_artists[offset : offset + limit]
        serializer = ArtistSerializer(artists, many=True, context={"request": request})

        return Response(
            {"data": serializer.data, "count": total_count, "page_count": page_count},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def add_artist(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            if not name:
                return JsonResponse(
                    {"error": "Artist name cannot be left blank"}, status=400
                )
            artist = Artist.objects.create(name=name)
            return JsonResponse({"id": artist.id, "name": artist.name}, status=201)
        except IntegrityError:
            return JsonResponse({"error": "The artist has existed"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not supported"}, status=405)


@api_view(["PUT"])
def update_artist(request, id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    if request.method == "PUT":
        try:
            artist = get_object_or_404(Artist, id=id)
            data = json.loads(request.body)
            name = data.get("name")
            if not name:
                return JsonResponse(
                    {"error": "Artist name cannot be left blank"}, status=400
                )
            artist.name = name
            artist.save()
            return JsonResponse({"id": artist.id, "name": artist.name}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not supported"}, status=405)


@api_view(["DELETE"])
def delete_artist(request, id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    if request.method == "DELETE":
        try:
            artist = get_object_or_404(Artist, id=id)
            # Xóa tất cả bài hát liên quan đến nghệ sĩ
            songs = Song.objects.filter(artist=artist)
            if songs.exists():
                songs.delete()
            # Xóa nghệ sĩ
            artist.delete()
            return JsonResponse(
                {"message": "Delete artist and related songs successfully"},
                status=200,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not supported"}, status=405)

@api_view(["GET"])
def get_artists(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        all_artists = Artist.objects.all().order_by("id")
        serializer = ArtistSerializer(all_artists, many=True, context={"request": request})
        return Response(
            {"data": serializer.data},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
