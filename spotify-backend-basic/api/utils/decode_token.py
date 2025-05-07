import jwt
from django.conf import settings
from django.http import JsonResponse
from ..models import User

def decode_token(request):
    token = request.headers.get("Authorization")
    print(f"Received Token: {token}")
    if not token:
        return None, JsonResponse({"error": "No token"}, status=401)

    try:
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        decoded_payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_payload.get("id")
        print(user_id)

        if not User.objects.filter(id=user_id).exists():
            return None, JsonResponse({"error": "User not found"}, status=401)

        return user_id, None

    except jwt.ExpiredSignatureError:
        return None, JsonResponse({"error": "Token expired"}, status=401)

    except jwt.InvalidTokenError:
        return None, JsonResponse({"error": "Invalid token"}, status=401)
