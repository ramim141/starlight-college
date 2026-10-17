from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.common.views import SystemActivityLogViewSet

app_name = 'common'

router = DefaultRouter()
router.register(r'audit-logs', SystemActivityLogViewSet, basename='audit-log')

urlpatterns = [
    path('', include(router.urls)),
]