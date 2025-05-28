from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from api.utils.decode_token import decode_token
from api.serializers import UserSerializer
from math import ceil

User = get_user_model()

@api_view(["GET"])
def get_users(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        page = int(request.GET.get("page", 1))
        limit = int(request.GET.get("limit", 10))

        offset = (page - 1) * limit
        all_users = User.objects.all().order_by("-id")
        total_count = all_users.count()
        page_count = ceil(total_count / limit)

        users = all_users[offset : offset + limit]

        # Serialize
        serializer = UserSerializer(users, many=True, context={"request": request})

        return Response(
            {"data": serializer.data, "count": total_count, "page_count": page_count},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def add_user(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        fullname = request.data.get("fullname")
        profile_pic = request.data.get("profile_pic")

        if not all([username, email, password, fullname, profile_pic]):
            return Response(
                {"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            fullname=fullname,
            profile_pic=profile_pic,
        )

        user.save()
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT"])
def update_user(request, user_id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        serializer = UserSerializer(
            user, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            # Xử lý password nếu được cung cấp
            if "password" in request.data:
                user.set_password(request.data["password"])
                user.save()
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE"])
def delete_user(request, user_id):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    try:
        user = User.objects.get(pk=user_id)
        user.delete()
        return Response(
            {"message": "User deleted successfully"}, status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
