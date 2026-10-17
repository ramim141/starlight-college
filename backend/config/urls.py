from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from apps.common.views import health_check

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    
    # API v1 Routes
    path('api/v1/auth/', include('apps.users_auth.urls')),
    path('api/v1/academics/', include('apps.academics.urls')),
    path('api/v1/operations/', include('apps.operations.urls')),
    path('api/v1/finance/', include('apps.finance.urls')),
    path('api/v1/examination/', include('apps.examination.urls')),
    path('api/v1/library/', include('apps.library.urls')),
    path('api/v1/system/', include('apps.common.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)