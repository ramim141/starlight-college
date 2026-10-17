from rest_framework import serializers
from apps.common.models import SystemActivityLog

class SystemActivityLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = SystemActivityLog
        fields = '__all__'