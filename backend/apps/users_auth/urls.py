from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users_auth.views import (
    ChangePasswordView,
    CurrentUserProfileView,
    CustomLoginView,
    LogoutView,
    StaffDetailView,
    StaffListCreateView,
)

app_name = 'users_auth'

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserProfileView.as_view(), name='current_user'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Principal creates, lists, views & updates Teachers/Accountants
    path('staff/', StaffListCreateView.as_view(), name='staff_list_create'),
    path('staff/<uuid:pk>/', StaffDetailView.as_view(), name='staff_detail'),
]