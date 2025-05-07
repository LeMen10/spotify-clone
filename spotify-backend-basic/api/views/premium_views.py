from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.utils import timezone
from ..models import User
import json
from api.utils.decode_token import decode_token


@api_view(["POST"])
def activate_premium(request):
    if request.method == "POST":
        user_id, error_response = decode_token(request)
        if error_response: return error_response
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")

            user = User.objects.get(id=user_id)

            # Set premium information
            user.dateRegister = timezone.now().date()
            user.monthRegister = 1
            user.isRegister = True
            user.save()

            return JsonResponse(
                {"success": True, "message": "Premium activated successfully"}
            )

        except User.DoesNotExist:
            return JsonResponse(
                {"success": False, "error": "User not found"}, status=404
            )
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

    return JsonResponse(
        {"success": False, "error": "Invalid request method"}, status=405
    )


@api_view(["POST"])
def deactivate_premium(request):
    if request.method == "POST":
        user_id, error_response = decode_token(request)
        if error_response: return error_response
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")
            print(user_id)

            user = User.objects.get(id=user_id)

            # Deactivate premium
            user.isRegister = False
            user.save()

            return JsonResponse(
                {"success": True, "message": "Premium deactivated successfully"}
            )

        except User.DoesNotExist:
            return JsonResponse(
                {"success": False, "error": "User not found"}, status=404
            )
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

    return JsonResponse(
        {"success": False, "error": "Invalid request method"}, status=405
    )
