from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Conversation
from ..serializers import ConversationSerializer
from ..utils.decode_token import decode_token

@api_view(['GET'])
def get_conversation(request):
    user_id, error_response = decode_token(request)
    if error_response: return error_response
    
    conversations = Conversation.objects.filter(name="General")
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data)