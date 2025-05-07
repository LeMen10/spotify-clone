from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from ..models import User
from ..serializers import UserSerializer
from rest_framework import status
from ..utils.decode_token import decode_token

@api_view(["GET"])
@permission_classes([AllowAny])
def get_users_test(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user_id, error_response = decode_token(request)
    if error_response:
        return error_response
    return Response(
        {
            "message": "Success",
            "user": str(request.user),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def get_user(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    user = User.objects.get(id=user_id)
    return Response(
        {
            "message": "Success",
            "user": {
                "id": user.id,
                "username": user.username,
                "profile_pic": str(user.profile_pic) if user.profile_pic else None,
                "isPremium" : user.isRegister,
                "premiumDate": user.dateRegister,
                "MonthPremium": user.monthRegister,
                "mail": user.email
            },
        },
        status=status.HTTP_200_OK,
    )
