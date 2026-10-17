from django.db import connection
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from apps.common.models import SystemActivityLog
from apps.common.permissions import IsPrincipal
from apps.common.serializers import SystemActivityLogSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
    except Exception:
        return JsonResponse(
            {'status': 'unhealthy', 'database': 'unavailable'},
            status=503,
        )
    return JsonResponse({'status': 'ok', 'database': 'ok'})

class SystemActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    প্রিন্সিপাল কর্তৃক সিস্টেম অ্যাক্টিভিটি অডিট লগ পর্যবেক্ষণ।
    """
    queryset = SystemActivityLog.objects.all()
    serializer_class = SystemActivityLogSerializer
    permission_classes = [IsPrincipal]

    def get_queryset(self):
        queryset = super().get_queryset()
        action_param = self.request.query_params.get('action')
        username = self.request.query_params.get('username')
        if action_param:
            queryset = queryset.filter(action=action_param.upper())
        if username:
            queryset = queryset.filter(username__icontains=username)
        return queryset