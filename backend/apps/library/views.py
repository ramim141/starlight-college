from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsLibraryManagerOrPrincipal, IsTeacherOrPrincipal
from apps.library.models import Book, BookBorrowRequest, BookCategory
from apps.library.serializers import (
    BookBorrowRequestSerializer,
    BookCategorySerializer,
    BookSerializer,
)
from apps.users_auth.models import User


class BookViewSet(viewsets.ModelViewSet):
    """
    বইয়ের ক্যাটালগ ও সার্চ:
    - তালিকা ও বিস্তারিত দেখা: সকল লগইন করা শিক্ষার্থী ও শিক্ষক।
    - বই যোগ/আপডেট: লাইব্রেরি ম্যানেজার অথবা প্রিন্সিপাল।
    """
    queryset = Book.objects.select_related('category').all()
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsLibraryManagerOrPrincipal()]


class BookBorrowRequestViewSet(viewsets.ModelViewSet):
    """
    ৪-ধাপের বই ইস্যু ও রিটার্ন ইঞ্জিন:
    ১. Student আবেদন করবে (POST)
    ২. শিক্ষক তদারকি করে অনুমোদন দেবেন (PATCH /<id>/teacher-review/)
    ৩. লাইব্রেরি ম্যানেজার বই ইস্যু করবেন ও স্টক কমবে (PATCH /<id>/issue-book/)
    ৪. বই ফেরত দিলে স্টক বাড়বে ও লেট ফাইন হিসাব হবে (PATCH /<id>/return-book/)
    """
    serializer_class = BookBorrowRequestSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = BookBorrowRequest.objects.select_related('student', 'student__user', 'book', 'teacher_approver', 'issued_by').all()

        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)
        
        # শিক্ষক, লাইব্রেরি ম্যানেজার অথবা প্রিন্সিপাল সব আবেদন দেখতে পাবেন (যে কোনো বিষয় শিক্ষক অনুমোদন করতে পারবেন)
        if user.role == User.Role.TEACHER or user.is_library_manager or user.role == User.Role.PRINCIPAL or user.is_superuser:
            return queryset
            
        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != User.Role.STUDENT or not hasattr(user, 'student_profile'):
            raise PermissionDenied("শুধুমাত্র শিক্ষার্থীরা বইয়ের জন্য আবেদন করতে পারে।")

        book = serializer.validated_data['book']
        if book.available_copies < 1:
            raise serializers.ValidationError({"book": "দুঃখিত, এই বইটির কোনো কপি বর্তমানে লাইব্রেরিতে অবশিষ্ট নেই।"})

        serializer.save(student=user.student_profile, status=BookBorrowRequest.BorrowStatus.REQUESTED)

    @action(detail=True, methods=['patch'], permission_classes=[IsTeacherOrPrincipal], url_path='teacher-review')
    def teacher_review(self, request, pk=None):
        """
        ধাপ ২: বিষয় শিক্ষক কর্তৃক শিক্ষার্থীর বই আবেদন অনুমোদন।
        """
        borrow_req = self.get_object()
        new_status = request.data.get('status', '').upper()

        if new_status not in [BookBorrowRequest.BorrowStatus.TEACHER_APPROVED, BookBorrowRequest.BorrowStatus.TEACHER_REJECTED]:
            return Response({"success": False, "message": "status হিসেবে TEACHER_APPROVED অথবা TEACHER_REJECTED দিন।"}, status=status.HTTP_400_BAD_REQUEST)

        borrow_req.status = new_status
        borrow_req.teacher_approver = request.user
        borrow_req.teacher_approved_at = timezone.now()
        borrow_req.teacher_remarks = request.data.get('remarks', '')
        borrow_req.save()

        return Response({
            "success": True,
            "message": f"আবেদনটি শিক্ষক কর্তৃক '{borrow_req.get_status_display()}' করা হয়েছে।",
            "data": BookBorrowRequestSerializer(borrow_req).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[IsLibraryManagerOrPrincipal], url_path='issue-book')
    @transaction.atomic
    def issue_book(self, request, pk=None):
        """
        ধাপ ৩: লাইব্রেরি ম্যানেজার কর্তৃক বই প্রদান ➔ সেন্ট্রাল স্টক মাইনাস হওয়া।
        """
        borrow_req = self.get_object()
        borrow_req = BookBorrowRequest.objects.select_for_update().get(pk=borrow_req.pk)
        book = Book.objects.select_for_update().get(pk=borrow_req.book_id)

        if borrow_req.status != BookBorrowRequest.BorrowStatus.TEACHER_APPROVED:
            return Response({"success": False, "message": "শিক্ষকের অনুমোদন ছাড়া বই ইস্যু করা যাবে না।"}, status=status.HTTP_400_BAD_REQUEST)

        if book.available_copies < 1:
            return Response({"success": False, "message": "লাইব্রেরিতে বইটির স্টক শেষ হয়ে গেছে।"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            days = int(request.data.get('days', 7))
        except (TypeError, ValueError):
            return Response({"success": False, "message": "days একটি পূর্ণসংখ্যা হতে হবে।"}, status=status.HTTP_400_BAD_REQUEST)
        if days < 1 or days > 365:
            return Response({"success": False, "message": "days-এর মান ১ থেকে ৩৬৫-এর মধ্যে হতে হবে।"}, status=status.HTTP_400_BAD_REQUEST)

        # স্টক মাইনাস করা
        book.available_copies -= 1
        book.save()

        borrow_req.status = BookBorrowRequest.BorrowStatus.ISSUED
        borrow_req.issued_by = request.user
        borrow_req.issued_at = timezone.now()
        borrow_req.due_date = timezone.localdate() + timedelta(days=days)
        borrow_req.save()

        return Response({
            "success": True,
            "message": f"বইটি সফলভাবে প্রদান করা হয়েছে। ফেরত দেওয়ার শেষ তারিখ: {borrow_req.due_date}",
            "data": BookBorrowRequestSerializer(borrow_req).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[IsLibraryManagerOrPrincipal], url_path='return-book')
    @transaction.atomic
    def return_book(self, request, pk=None):
        """
        ধাপ ৪: বই ফেরত গ্রহণ ➔ সেন্ট্রাল স্টক বৃদ্ধি ও বিলম্ব ফি হিসাব।
        """
        borrow_req = self.get_object()
        borrow_req = BookBorrowRequest.objects.select_for_update().get(pk=borrow_req.pk)

        if borrow_req.status != BookBorrowRequest.BorrowStatus.ISSUED:
            return Response({"success": False, "message": "এই বইটি বর্তমানে ইস্যুকৃত অবস্থায় নেই।"}, status=status.HTTP_400_BAD_REQUEST)

        # স্টক ১টি বাড়ানো
        book = Book.objects.select_for_update().get(pk=borrow_req.book_id)
        book.available_copies += 1
        book.save()

        today = timezone.localdate()
        late_fine = Decimal('0.00')

        # বিলম্ব ফি হিসাব (নির্ধারিত তারিখ পার হলে প্রতিদিন ১০ টাকা জরিমানা)
        if borrow_req.due_date and today > borrow_req.due_date:
            overdue_days = (today - borrow_req.due_date).days
            late_fine = Decimal(str(overdue_days * 10))

        borrow_req.status = BookBorrowRequest.BorrowStatus.RETURNED
        borrow_req.returned_at = timezone.now()
        borrow_req.late_fine = late_fine
        borrow_req.save()

        msg = f"বইটি সফলভাবে ফেরত গ্রহণ করা হয়েছে।"
        if late_fine > 0:
            msg += f" {borrow_req.due_date} তারিখের পর জমা দেওয়ায় {late_fine} টাকা বিলম্ব ফি ধার্য হয়েছে।"

        return Response({
            "success": True,
            "message": msg,
            "data": BookBorrowRequestSerializer(borrow_req).data
        }, status=status.HTTP_200_OK)


class BookCategoryViewSet(viewsets.ModelViewSet):
    queryset = BookCategory.objects.all()
    serializer_class = BookCategorySerializer
    permission_classes = [IsLibraryManagerOrPrincipal]