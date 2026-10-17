from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.common.permissions import IsPrincipal
from apps.users_auth.models import User
from apps.users_auth.serializers import (
    CustomTokenObtainPairSerializer,
    StaffCreateSerializer,
    UserMinimalSerializer,
)


class CustomLoginView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/
    শিক্ষার্থী (SSC Roll, Passing Year, PIN) অথবা স্টাফ (Username, Password) উভয়ের জন্য কেন্দ্রীয় লগইন।
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserProfileView(APIView):
    """
    GET / PATCH: /api/v1/auth/me/
    লগইন থাকা ইউজারের প্রোফাইল তথ্য দেখা এবং নিজস্ব প্রোফাইল (নাম, ফোন, ইমেইল, ছবি) আপডেট করা।
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserMinimalSerializer(request.user, context={'request': request})
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserMinimalSerializer(
            request.user, 
            data=request.data, 
            partial=True, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "success": True,
            "message": "প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে।",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    POST /api/v1/auth/change-password/
    লগইন থাকা যেকোনো ইউজারের নিজস্ব পাসওয়ার্ড পরিবর্তন।
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {"success": False, "message": "পুরাতন ও নতুন পাসওয়ার্ড উভয়টি প্রদান করা আবশ্যক।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.check_password(old_password):
            return Response(
                {"success": False, "message": "বর্তমান পাসওয়ার্ডটি সঠিক নয়।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 6:
            return Response(
                {"success": False, "message": "নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.set_password(new_password)
        request.user.save()
        return Response(
            {"success": True, "message": "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।"},
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    রিফ্রেশ টোকেন ব্ল্যাকলিস্ট করে নিরাপদ লগআউট সম্পন্ন করে।
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token প্রদান করা আবশ্যক।"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"success": True, "message": "সফলভাবে লগআউট সম্পন্ন হয়েছে।"},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"success": False, "message": "টোকেনটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে।"},
                status=status.HTTP_400_BAD_REQUEST
            )


class StaffListCreateView(generics.ListCreateAPIView):
    """
    GET / POST: /api/v1/auth/staff/
    প্রিন্সিপাল কর্তৃক শিক্ষক ও অ্যাকাউন্ট্যান্ট অ্যাকাউন্ট তৈরি এবং তালিকা দেখার এন্ডপয়েন্ট।
    """
    permission_classes = [IsPrincipal]

    def get_queryset(self):
        queryset = User.objects.filter(
            role__in=[User.Role.TEACHER, User.Role.ACCOUNTANT]
        ).select_related('teacher_profile').prefetch_related('incharge_sections')
        
        role_filter = self.request.query_params.get('role')
        if role_filter:
            queryset = queryset.filter(role=role_filter.upper())
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StaffCreateSerializer
        return UserMinimalSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "success": True,
                "message": f"{user.get_role_display()} অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে।",
                "data": UserMinimalSerializer(user, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET / PUT / PATCH / DELETE: /api/v1/auth/staff/<uuid:pk>/
    অধ্যক্ষ কর্তৃক নির্দিষ্ট স্টাফের প্রোফাইল দেখা, তথ্য আপডেট করা এবং নিষ্ক্রিয় (Deactivate) করা।
    """
    permission_classes = [IsPrincipal]
    queryset = User.objects.filter(
        role__in=[User.Role.TEACHER, User.Role.ACCOUNTANT]
    ).select_related('teacher_profile').prefetch_related('incharge_sections')
    serializer_class = UserMinimalSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])