from django.contrib import admin
from apps.common.models import SystemActivityLog

@admin.register(SystemActivityLog)
class SystemActivityLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'username', 'user_role', 'ip_address', 'created_at')
    list_filter = ('action', 'user_role', 'created_at')
    search_fields = ('username', 'description', 'ip_address')
    readonly_fields = ('user', 'username', 'user_role', 'action', 'ip_address', 'description', 'created_at')