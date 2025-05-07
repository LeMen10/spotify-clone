import jwt
# import datetime
from datetime import datetime, timedelta, timezone
from django.conf import settings

def generate_jwt_token(user):
    expiration_time = datetime.now(timezone.utc) + timedelta(days=3)
    payload = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "fullname": user.fullname,
        "exp": expiration_time,
        "iat": datetime.now(timezone.utc)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token, expiration_time
