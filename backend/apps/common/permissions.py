from rest_framework.permissions import BasePermission
from apps.users_auth.models import User


class IsPrincipal(BasePermission):
    """
    শুধুমাত্র প্রিন্সিপালের (Super Admin) জন্য এক্সেস।
    """
    message = "এই কাজটি করার অনুমতি শুধুমাত্র প্রিন্সিপালের রয়েছে।"

    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated 
            and (request.user.role == User.Role.PRINCIPAL or request.user.is_superuser)
        )


class IsTeacherOrPrincipal(BasePermission):
    """
    শিক্ষক এবং প্রিন্সিপাল উভয়ের জন্য এক্সেস।
    """
    message = "এই অংশে শুধুমাত্র শিক্ষক অথবা প্রিন্সিপাল প্রবেশ করতে পারবেন।"

    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated 
            and request.user.role in [User.Role.TEACHER, User.Role.PRINCIPAL]
        )


class IsAccountantOrPrincipal(BasePermission):
    """
    অ্যাকাউন্ট্যান্ট এবং প্রিন্সিপাল উভয়ের জন্য এক্সেস।
    """
    message = "এই অংশে শুধুমাত্র অ্যাকাউন্ট্যান্ট অথবা প্রিন্সিপাল প্রবেশ করতে পারবেন।"

    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated 
            and request.user.role in [User.Role.ACCOUNTANT, User.Role.PRINCIPAL]
        )


class IsStudentOrPrincipal(BasePermission):
    """
    স্টুডেন্ট এবং প্রিন্সিপাল উভয়ের জন্য এক্সেস।
    """
    message = "এই অংশে শুধুমাত্র শিক্ষার্থী অথবা প্রিন্সিপাল প্রবেশ করতে পারবেন।"

    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated 
            and request.user.role in [User.Role.STUDENT, User.Role.PRINCIPAL]
        )


class IsLibraryManagerOrPrincipal(BasePermission):
    """
    দায়িত্বপ্রাপ্ত লাইব্রেরি স্টাফ এবং প্রিন্সিপালের জন্য এক্সেস।
    """
    message = "লাইব্রেরি পরিচালনার অনুমতি আপনার নেই।"

    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated 
            and (request.user.is_library_manager or request.user.role == User.Role.PRINCIPAL)
        )