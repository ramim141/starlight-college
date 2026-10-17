import uuid
from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.db.models import Count, Q
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.academics.models import StudentAttendance
from apps.common.permissions import IsAccountantOrPrincipal, IsPrincipal, IsTeacherOrPrincipal
from apps.finance.models import StudentInvoice
from apps.operations.models import (
    AlumniRecord,
    AssetCategory,
    CertificateRequest,
    Club,
    ClubEvent,
    ClubMembership,
    CollegeAsset,
    DevicePushSubscription,
    EventRegistration,
    InAppNotification,
    MarkerRequest,
    MarkerStock,
    Notice,
    ParentCommunicationLog,
    PersonalNote,
    SMSBroadcastLog,
    StudentComplaint,
    StudentLeaveApplication,
    TeacherAttendance,
    TeacherLeave,
    WhatsAppMessageLog,
    WhatsAppTemplate,
)
from apps.operations.serializers import (
    AlumniRecordSerializer,
    AssetCategorySerializer,
    CertificateRequestSerializer,
    ClubEventSerializer,
    ClubMembershipSerializer,
    ClubSerializer,
    CollegeAssetSerializer,
    DevicePushSubscriptionSerializer,
    EventRegistrationSerializer,
    InAppNotificationSerializer,
    MarkerRequestSerializer,
    MarkerStockSerializer,
    NoticeSerializer,
    ParentCommunicationLogSerializer,
    PersonalNoteSerializer,
    SMSBroadcastLogSerializer,
    StudentComplaintSerializer,
    StudentLeaveApplicationSerializer,
    TeacherAttendanceSerializer,
    TeacherLeaveSerializer,
    WhatsAppMessageLogSerializer,
    WhatsAppTemplateSerializer,
)
from apps.operations.services import WhatsAppNotificationService
from apps.users_auth.models import User


class TeacherAttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    শিক্ষকদের ডিজিটাল হাজিরা (Check-in, Check-out) এবং প্রিন্সিপালের অনুমোদন।
    """
    serializer_class = TeacherAttendanceSerializer
    permission_classes = [IsTeacherOrPrincipal]

    def get_queryset(self):
        user = self.request.user
        queryset = TeacherAttendance.objects.select_related(
            'teacher', 'teacher__teacher_profile', 'approved_by'
        ).all()

        if user.role == User.Role.TEACHER:
            queryset = queryset.filter(teacher=user)

        date_filter = self.request.query_params.get('date')
        if date_filter:
            queryset = queryset.filter(date=date_filter)

        status_filter = self.request.query_params.get('approval_status')
        if status_filter:
            queryset = queryset.filter(approval_status=status_filter.upper())

        return queryset

    @action(detail=False, methods=['post'], url_path='check-in')
    def check_in(self, request):
        if request.user.role != User.Role.TEACHER:
            return Response(
                {"success": False, "message": "শুধুমাত্র শিক্ষকগণ ডিজিটাল চেক-ইন করতে পারবেন।"},
                status=status.HTTP_403_FORBIDDEN,
            )

        today = timezone.localdate()
        current_time = timezone.localtime().time().replace(microsecond=0)

        if TeacherAttendance.objects.filter(teacher=request.user, date=today).exists():
            return Response(
                {"success": False, "message": f"আজকের ({today}) ডিজিটাল হাজিরা ইতিমধ্যে সম্পন্ন হয়েছে।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance = TeacherAttendance.objects.create(
            teacher=request.user,
            date=today,
            check_in_time=current_time,
            remarks=request.data.get('remarks', ''),
        )

        return Response(
            {
                "success": True,
                "message": f"সফলভাবে ডিজিটাল হাজিরা সম্পন্ন হয়েছে। প্রবেশের সময়: {current_time.strftime('%I:%M %p')}",
                "data": TeacherAttendanceSerializer(attendance).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['post'], url_path='check-out')
    def check_out(self, request):
        today = timezone.localdate()
        current_time = timezone.localtime().time().replace(microsecond=0)

        try:
            attendance = TeacherAttendance.objects.get(teacher=request.user, date=today)
        except TeacherAttendance.DoesNotExist:
            return Response(
                {"success": False, "message": "আজকের কোনো চেক-ইন রেকর্ড পাওয়া যায়নি। আগে চেক-ইন করুন।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance.check_out_time = current_time
        attendance.save()

        return Response(
            {
                "success": True,
                "message": f"চেক-আউট সফলভাবে রেকর্ড করা হয়েছে। সময়: {current_time.strftime('%I:%M %p')}",
                "data": TeacherAttendanceSerializer(attendance).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='verify')
    def verify_attendance(self, request, pk=None):
        attendance = self.get_object()
        new_status = request.data.get('approval_status', 'APPROVED').upper()

        if new_status not in [
            TeacherAttendance.ApprovalStatus.APPROVED,
            TeacherAttendance.ApprovalStatus.REJECTED,
        ]:
            return Response(
                {"success": False, "message": "approval_status হিসেবে APPROVED অথবা REJECTED প্রদান করুন।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance.approval_status = new_status
        attendance.approved_by = request.user
        attendance.approved_at = timezone.now()
        if 'remarks' in request.data:
            attendance.remarks = request.data['remarks']
        attendance.save()

        return Response(
            {
                "success": True,
                "message": f"শিক্ষকের হাজিরা সফলভাবে '{attendance.get_approval_status_display()}' করা হয়েছে।",
                "data": TeacherAttendanceSerializer(attendance).data,
            },
            status=status.HTTP_200_OK,
        )


class NoticeViewSet(viewsets.ModelViewSet):
    serializer_class = NoticeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsTeacherOrPrincipal()]

    def get_queryset(self):
        user = self.request.user
        base_qs = Notice.objects.select_related('created_by', 'target_section').filter(is_active=True)

        if not user.is_authenticated:
            return base_qs.filter(audience=Notice.AudienceType.ALL)

        if user.role == User.Role.PRINCIPAL or user.is_superuser:
            return base_qs

        if user.role == User.Role.TEACHER:
            return base_qs.filter(
                Q(audience__in=[Notice.AudienceType.ALL, Notice.AudienceType.TEACHERS, Notice.AudienceType.STUDENTS])
                | Q(created_by=user)
                | Q(target_section__in_charge_teacher=user)
            ).distinct()

        if user.role == User.Role.ACCOUNTANT:
            return base_qs.filter(audience=Notice.AudienceType.ALL)

        if user.role == User.Role.STUDENT:
            student_section = getattr(getattr(user, 'student_profile', None), 'section', None)
            return base_qs.filter(
                Q(audience__in=[Notice.AudienceType.ALL, Notice.AudienceType.STUDENTS])
                | Q(audience=Notice.AudienceType.SECTION, target_section=student_section)
            ).distinct()

        return base_qs.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if self.request.user.role != User.Role.PRINCIPAL and instance.created_by != self.request.user:
            raise PermissionDenied("আপনি শুধুমাত্র নিজের তৈরি করা নোটিশ এডিট করতে পারবেন।")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != User.Role.PRINCIPAL and instance.created_by != self.request.user:
            raise PermissionDenied("আপনি শুধুমাত্র নিজের তৈরি করা নোটিশ ডিলিট করতে পারবেন।")
        instance.delete()


class PersonalNoteViewSet(viewsets.ModelViewSet):
    serializer_class = PersonalNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PersonalNote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AlumniRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AlumniRecordSerializer

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            return [AllowAny()]
        return [IsPrincipal()]

    def get_authenticators(self):
        if self.request and self.request.method == 'POST' and not self.kwargs.get('pk'):
            return []
        return super().get_authenticators()

    def get_queryset(self):
        queryset = AlumniRecord.objects.select_related('verified_by').all()
        user = getattr(self.request, 'user', None)

        if user and user.is_authenticated and (user.role == User.Role.PRINCIPAL or user.is_superuser):
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter.upper())
            return queryset

        return queryset.filter(status=AlumniRecord.VerificationStatus.APPROVED)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        alumni = serializer.save()
        return Response(
            {
                "success": True,
                "message": "আপনার অ্যালুমনি রেজিস্ট্রেশন আবেদন সফলভাবে জমা হয়েছে। প্রিন্সিপালের অনুমোদনের পর এটি তালিকায় প্রকাশিত হবে।",
                "data": AlumniRecordSerializer(alumni).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='verify')
    def verify_alumni(self, request, pk=None):
        alumni = self.get_object()
        new_status = request.data.get('status', 'APPROVED').upper()

        if new_status not in [
            AlumniRecord.VerificationStatus.APPROVED,
            AlumniRecord.VerificationStatus.REJECTED,
        ]:
            return Response(
                {"success": False, "message": "status হিসেবে APPROVED অথবা REJECTED প্রদান করুন।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        alumni.status = new_status
        alumni.verified_by = request.user
        alumni.verified_at = timezone.now()
        alumni.rejection_reason = request.data.get('rejection_reason', '')
        alumni.save()

        return Response(
            {
                "success": True,
                "message": f"অ্যালুমনি প্রোফাইল সফলভাবে '{alumni.get_status_display()}' করা হয়েছে।",
                "data": AlumniRecordSerializer(alumni).data,
            },
            status=status.HTTP_200_OK,
        )


class MarkerRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MarkerRequestSerializer

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve', 'return_or_finish', 'acknowledge']:
            return [IsTeacherOrPrincipal()]
        return [IsPrincipal()]

    def get_queryset(self):
        user = self.request.user
        queryset = MarkerRequest.objects.select_related('teacher', 'issued_by').all()

        if user.role == User.Role.TEACHER:
            return queryset.filter(teacher=user)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.TEACHER:
            raise PermissionDenied("শুধুমাত্র শিক্ষকগণ মার্কারের জন্য আবেদন করতে পারবেন।")
        serializer.save(teacher=self.request.user)

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='issue')
    def issue_marker(self, request, pk=None):
        marker = self.get_object()
        if marker.status != MarkerRequest.RequestStatus.REQUESTED:
            return Response(
                {"success": False, "message": f"মার্কারটি ইতিমধ্যে '{marker.get_status_display()}' অবস্থায় রয়েছে।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        marker.status = MarkerRequest.RequestStatus.ISSUED
        marker.issued_by = request.user
        marker.issued_at = timezone.now()
        marker.remarks = request.data.get('remarks', marker.remarks)
        marker.save()

        return Response({
            "success": True,
            "message": "মার্কারটি সফলভাবে শিক্ষকের কাছে ইস্যু করা হয়েছে।",
            "data": MarkerRequestSerializer(marker).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='return-or-finish')
    def return_or_finish(self, request, pk=None):
        marker = self.get_object()
        if request.user.role == User.Role.TEACHER and marker.teacher_id != request.user.id:
            raise PermissionDenied("আপনি শুধুমাত্র নিজের মার্কারের স্ট্যাটাস আপডেট করতে পারবেন।")

        new_status = request.data.get('status', MarkerRequest.RequestStatus.RETURNED).upper()
        if new_status not in [MarkerRequest.RequestStatus.RETURNED, MarkerRequest.RequestStatus.DISPOSED]:
            return Response(
                {"success": False, "message": "স্ট্যাটাস হিসেবে RETURNED অথবা DISPOSED প্রদান করুন।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        marker.status = new_status
        marker.returned_at = timezone.now()
        if 'remarks' in request.data:
            marker.remarks = request.data['remarks']
        marker.save()

        return Response({
            "success": True,
            "message": f"মার্কার সফলভাবে '{marker.get_status_display()}' হিসেবে চিহ্নিত হয়েছে।",
            "data": MarkerRequestSerializer(marker).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='acknowledge')
    @transaction.atomic
    def acknowledge_receipt(self, request, pk=None):
        marker = self.get_object()
        if request.user.role == User.Role.TEACHER and marker.teacher_id != request.user.id:
            raise PermissionDenied("আপনি শুধুমাত্র নিজের মার্কার রিসিট কনফার্ম করতে পারবেন।")

        if marker.status != MarkerRequest.RequestStatus.ISSUED:
            return Response({"success": False, "message": "মার্কারটি এখনও অফিস থেকে ইস্যু করা হয়নি।"}, status=status.HTTP_400_BAD_REQUEST)

        if marker.is_acknowledged:
            return Response({"success": False, "message": "মার্কারটি ইতিমধ্যে বুঝে নেওয়া হয়েছে।"}, status=status.HTTP_400_BAD_REQUEST)

        stock = MarkerStock.objects.filter(color=marker.marker_color).first()
        if stock and stock.available_stock >= marker.quantity:
            stock.available_stock -= marker.quantity
            stock.save()

        marker.is_acknowledged = True
        marker.acknowledged_at = timezone.now()
        marker.save()

        return Response({
            "success": True,
            "message": f"{marker.get_marker_color_display()} মার্কার সফলভাবে বুঝে নেওয়া হয়েছে। সেন্ট্রাল স্টক আপডেট হয়েছে।",
            "data": MarkerRequestSerializer(marker).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsPrincipal], url_path='monthly-usage')
    def monthly_usage_report(self, request):
        month = request.query_params.get('month', timezone.localdate().month)
        year = request.query_params.get('year', timezone.localdate().year)

        usage = MarkerRequest.objects.filter(
            is_acknowledged=True,
            acknowledged_at__year=year,
            acknowledged_at__month=month
        ).values('teacher__first_name', 'teacher__last_name', 'teacher__username', 'teacher__teacher_profile__employee_id').annotate(
            total_markers=Sum('quantity')
        ).order_by('-total_markers')

        return Response({
            "success": True,
            "timeframe": f"{month}/{year}",
            "data": [
                {
                    "teacher_name": f"{item['teacher__first_name']} {item['teacher__last_name']}".strip() or item['teacher__username'],
                    "employee_id": item['teacher__teacher_profile__employee_id'],
                    "total_markers_used": item['total_markers'],
                }
                for item in usage
            ]
        }, status=status.HTTP_200_OK)


class MarkerStockViewSet(viewsets.ModelViewSet):
    queryset = MarkerStock.objects.all()
    serializer_class = MarkerStockSerializer
    permission_classes = [IsPrincipal]


class CollegeAssetViewSet(viewsets.ModelViewSet):
    queryset = CollegeAsset.objects.select_related('category', 'recorded_by').all()
    serializer_class = CollegeAssetSerializer
    permission_classes = [IsAccountantOrPrincipal]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class AssetCategoryViewSet(viewsets.ModelViewSet):
    queryset = AssetCategory.objects.all()
    serializer_class = AssetCategorySerializer
    permission_classes = [IsAccountantOrPrincipal]


class StudentLeaveApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = StudentLeaveApplicationSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = StudentLeaveApplication.objects.select_related(
            'student', 'student__user', 'section', 'reviewed_by_incharge', 'approved_by_principal'
        ).all()

        if user.role == User.Role.PRINCIPAL or user.is_superuser:
            return queryset
        if user.role == User.Role.TEACHER:
            return queryset.filter(section__in_charge_teacher=user)
        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)
        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != User.Role.STUDENT or not hasattr(user, 'student_profile'):
            raise PermissionDenied("শুধুমাত্র শিক্ষার্থীরা ছুটির জন্য আবেদন করতে পারবে।")
        
        student = user.student_profile
        serializer.save(student=student, section=student.section)

    @action(detail=True, methods=['patch'], url_path='incharge-review')
    def incharge_review(self, request, pk=None):
        leave_app = self.get_object()
        user = request.user

        if user.role != User.Role.PRINCIPAL and leave_app.section.in_charge_teacher_id != user.id:
            raise PermissionDenied(f"আপনি '{leave_app.section}' শাখার শ্রেণি ইনচার্জ নন।")

        new_status = request.data.get('status', '').upper()
        if new_status not in [
            StudentLeaveApplication.InChargeStatus.RECOMMENDED,
            StudentLeaveApplication.InChargeStatus.REJECTED
        ]:
            return Response(
                {"success": False, "message": "status হিসেবে RECOMMENDED অথবা REJECTED প্রদান করুন।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave_app.incharge_status = new_status
        leave_app.incharge_remarks = request.data.get('remarks', '')
        leave_app.reviewed_by_incharge = user
        leave_app.incharge_reviewed_at = timezone.now()
        leave_app.save()

        return Response({
            "success": True,
            "message": f"আবেদনটি সফলভাবে ইনচার্জ কর্তৃক '{leave_app.get_incharge_status_display()}' করা হয়েছে।",
            "data": StudentLeaveApplicationSerializer(leave_app).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='principal-review')
    @transaction.atomic
    def principal_review(self, request, pk=None):
        leave_app = self.get_object()

        if leave_app.incharge_status != StudentLeaveApplication.InChargeStatus.RECOMMENDED:
            force_override = request.data.get('force_approve', False)
            if not force_override:
                return Response(
                    {
                        "success": False,
                        "message": f"এই আবেদনটি এখনো শ্রেণি ইনচার্জ কর্তৃক সুপারিশ করা হয়নি। তবুও অনুমোদন দিতে চাইলে 'force_approve': true পাঠান।"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        new_status = request.data.get('status', '').upper()
        if new_status not in [
            StudentLeaveApplication.PrincipalStatus.APPROVED,
            StudentLeaveApplication.PrincipalStatus.REJECTED
        ]:
            return Response(
                {"success": False, "message": "status হিসেবে APPROVED অথবা REJECTED প্রদান করুন।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave_app.principal_status = new_status
        leave_app.principal_remarks = request.data.get('remarks', '')
        leave_app.approved_by_principal = request.user
        leave_app.principal_reviewed_at = timezone.now()
        leave_app.save()

        if new_status == StudentLeaveApplication.PrincipalStatus.APPROVED:
            curr_date = leave_app.start_date
            while curr_date <= leave_app.end_date:
                StudentAttendance.objects.update_or_create(
                    student=leave_app.student,
                    date=curr_date,
                    defaults={
                        'section': leave_app.section,
                        'status': StudentAttendance.AttendanceStatus.LEAVE,
                        'remarks': f"ছুটি অনুমোদিত (আবেদন আইডি: {leave_app.id})",
                        'recorded_by': request.user
                    }
                )
                curr_date += timedelta(days=1)

        return Response({
            "success": True,
            "message": f"আবেদনটি সফলভাবে '{leave_app.get_principal_status_display()}' করা হয়েছে এবং হাজিরায় স্বয়ংক্রিয়ভাবে ছুটির রেকর্ড আপডেট হয়েছে।",
            "data": StudentLeaveApplicationSerializer(leave_app).data
        }, status=status.HTTP_200_OK)


class CertificateRequestViewSet(viewsets.ModelViewSet):
    serializer_class = CertificateRequestSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = CertificateRequest.objects.select_related('student', 'student__user').all()

        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)
        if user.role in [User.Role.PRINCIPAL, User.Role.ACCOUNTANT] or user.is_superuser:
            return queryset
        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != User.Role.STUDENT or not hasattr(user, 'student_profile'):
            raise PermissionDenied("শুধুমাত্র শিক্ষার্থীরা সার্টিফিকেটের আবেদন করতে পারে।")
        
        cert_type = serializer.validated_data.get('certificate_type')
        fee = Decimal('200.00') if cert_type in [CertificateRequest.CertType.TESTIMONIAL, CertificateRequest.CertType.TRANSFER] else Decimal('100.00')
        serializer.save(student=user.student_profile, fee_amount=fee)

    @action(detail=True, methods=['patch'], permission_classes=[IsAccountantOrPrincipal], url_path='mark-fee-paid')
    def mark_fee_paid(self, request, pk=None):
        req_obj = self.get_object()
        req_obj.is_fee_paid = True
        req_obj.save()
        return Response({"success": True, "message": "সার্টিফিকেট ফি পরিশোধিত হিসেবে চিহ্নিত হয়েছে।", "data": CertificateRequestSerializer(req_obj).data})

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='principal-approve')
    def principal_approve(self, request, pk=None):
        req_obj = self.get_object()
        status_input = request.data.get('status', 'APPROVED').upper()

        if status_input == 'APPROVED':
            if not req_obj.is_fee_paid:
                return Response({"success": False, "message": "আবেদন ফি পরিশোধ না হওয়া পর্যন্ত অনুমোদন দেওয়া সম্ভব নয়।"}, status=status.HTTP_400_BAD_REQUEST)

            req_obj.status = CertificateRequest.RequestStatus.APPROVED
            req_obj.approved_by = request.user
            req_obj.approved_at = timezone.now()
            if not req_obj.certificate_number:
                req_obj.certificate_number = f"CERT-{req_obj.certificate_type}-{timezone.now().year}-{uuid.uuid4().hex[:6].upper()}"
            req_obj.save()

            message = f"আপনার {req_obj.get_certificate_type_display()} সফলভাবে অনুমোদিত হয়েছে। সনদ নম্বর: {req_obj.certificate_number}।"
        else:
            req_obj.status = CertificateRequest.RequestStatus.REJECTED
            req_obj.rejection_reason = request.data.get('rejection_reason', 'অধ্যক্ষ কর্তৃক বাতিলকৃত')
            req_obj.save()
            message = "আবেদনটি বাতিল করা হয়েছে।"

        return Response({
            "success": True,
            "message": message,
            "data": CertificateRequestSerializer(req_obj).data
        }, status=status.HTTP_200_OK)


class StudentComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = StudentComplaintSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = StudentComplaint.objects.select_related('student', 'student__user').all()

        if user.role == User.Role.PRINCIPAL or user.is_superuser:
            return queryset
        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)
        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != User.Role.STUDENT or not hasattr(user, 'student_profile'):
            raise PermissionDenied("শুধুমাত্র শিক্ষার্থীরা অভিযোগ বা পরামর্শ জমা দিতে পারবে।")
        serializer.save(student=user.student_profile)

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='resolve')
    def resolve_complaint(self, request, pk=None):
        complaint = self.get_object()
        complaint.status = request.data.get('status', StudentComplaint.ComplaintStatus.RESOLVED).upper()
        complaint.principal_remarks = request.data.get('remarks', '')
        complaint.action_taken_at = timezone.now()
        complaint.save()

        return Response({
            "success": True,
            "message": f"অভিযোগটি সফলভাবে '{complaint.get_status_display()}' করা হয়েছে।",
            "data": StudentComplaintSerializer(complaint, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class ParentCommunicationLogViewSet(viewsets.ModelViewSet):
    serializer_class = ParentCommunicationLogSerializer

    def get_permissions(self):
        return [IsTeacherOrPrincipal()]

    def get_queryset(self):
        user = self.request.user
        queryset = ParentCommunicationLog.objects.select_related('student', 'student__user', 'in_charge').all()

        if user.role == User.Role.PRINCIPAL or user.is_superuser:
            return queryset
        if user.role == User.Role.TEACHER:
            return queryset.filter(in_charge=user)
        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        student = serializer.validated_data['student']

        if user.role == User.Role.TEACHER and student.section.in_charge_teacher_id != user.id:
            raise PermissionDenied("আপনি এই শিক্ষার্থীর শ্রেণি ইনচার্জ নন।")

        phone = serializer.validated_data.get('guardian_phone_called') or student.guardian_phone
        serializer.save(in_charge=user, guardian_phone_called=phone)


class TeacherLeaveViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherLeaveSerializer

    def get_permissions(self):
        return [IsTeacherOrPrincipal()]

    def get_queryset(self):
        user = self.request.user
        queryset = TeacherLeave.objects.select_related('teacher', 'proxy_teacher', 'reviewed_by').all()

        if user.role == User.Role.PRINCIPAL or user.is_superuser:
            return queryset
        if user.role == User.Role.TEACHER:
            return queryset.filter(teacher=user)
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.TEACHER:
            raise PermissionDenied("শুধুমাত্র শিক্ষকগণ এই ছুটির জন্য আবেদন করতে পারবেন।")
        serializer.save(teacher=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-proxy-classes')
    def my_proxy_classes(self, request):
        if request.user.role != User.Role.TEACHER:
            return Response({"success": False, "message": "শুধুমাত্র শিক্ষকদের জন্য প্রযোজ্য।"}, status=status.HTTP_403_FORBIDDEN)

        proxies = TeacherLeave.objects.filter(
            proxy_teacher=request.user,
            status=TeacherLeave.LeaveStatus.APPROVED,
            end_date__gte=timezone.localdate()
        ).select_related('teacher')

        return Response({
            "success": True,
            "active_proxy_duties_count": proxies.count(),
            "data": TeacherLeaveSerializer(proxies, many=True).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='review-leave')
    def review_leave(self, request, pk=None):
        leave_obj = self.get_object()
        new_status = request.data.get('status', 'APPROVED').upper()

        if new_status not in [TeacherLeave.LeaveStatus.APPROVED, TeacherLeave.LeaveStatus.REJECTED]:
            return Response({"success": False, "message": "status হিসেবে APPROVED অথবা REJECTED প্রদান করুন।"}, status=status.HTTP_400_BAD_REQUEST)

        leave_obj.status = new_status
        leave_obj.reviewed_by = request.user
        leave_obj.reviewed_at = timezone.now()
        leave_obj.principal_remarks = request.data.get('remarks', '')
        leave_obj.save()

        msg = f"ছুটির আবেদনটি '{leave_obj.get_status_display()}' করা হয়েছে।"
        if new_status == TeacherLeave.LeaveStatus.APPROVED and leave_obj.proxy_teacher:
            msg += f" প্রক্সি শিক্ষক {leave_obj.proxy_teacher.get_full_name()} এর কাছে নোটিফিকেশন পাঠানো হয়েছে।"

        return Response({
            "success": True,
            "message": msg,
            "data": TeacherLeaveSerializer(leave_obj).data
        }, status=status.HTTP_200_OK)


class SMSBroadcastViewSet(viewsets.ModelViewSet):
    queryset = SMSBroadcastLog.objects.all()
    serializer_class = SMSBroadcastLogSerializer
    permission_classes = [IsPrincipal]

    @action(detail=False, methods=['post'], url_path='dispatch')
    @transaction.atomic
    def dispatch_sms(self, request):
        target = request.data.get('target_group')
        message_body = request.data.get('message_body', '')

        if not target or not message_body:
            return Response({"success": False, "message": "target_group এবং message_body আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        recipient_phones = []

        if target == SMSBroadcastLog.TargetGroup.ABSENT_TODAY:
            today = timezone.localdate()
            absent_attendances = StudentAttendance.objects.filter(
                date=today,
                status=StudentAttendance.AttendanceStatus.ABSENT
            ).select_related('student')
            recipient_phones = [att.student.guardian_phone for att in absent_attendances if att.student.guardian_phone]

        elif target == SMSBroadcastLog.TargetGroup.FEE_DEFAULTERS:
            defaulters = StudentInvoice.objects.filter(due_amount__gt=Decimal('0.00')).select_related('student')
            recipient_phones = list(set([inv.student.guardian_phone for inv in defaulters if inv.student.guardian_phone]))

        elif target == SMSBroadcastLog.TargetGroup.ALL_TEACHERS:
            teachers = User.objects.filter(role=User.Role.TEACHER, is_active=True)
            recipient_phones = [t.phone for t in teachers if t.phone]

        elif target == SMSBroadcastLog.TargetGroup.SECTION_STUDENTS:
            sec_id = request.data.get('section_id')
            students = StudentProfile.objects.filter(section_id=sec_id, user__is_active=True)
            recipient_phones = [s.guardian_phone for s in students if s.guardian_phone]

        log = SMSBroadcastLog.objects.create(
            sender=request.user,
            target_group=target,
            message_body=message_body,
            recipients_count=len(recipient_phones),
            recipients_sample=", ".join(recipient_phones[:10])
        )

        return Response({
            "success": True,
            "message": f"মোট {len(recipient_phones)} জন প্রাপকের কাছে টার্গেটেড SMS সফলভাবে প্রেরিত হয়েছে।",
            "log": SMSBroadcastLogSerializer(log).data,
            "total_recipients": len(recipient_phones),
        }, status=status.HTTP_201_CREATED)


class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.select_related('moderator_teacher').annotate(
        approved_member_count=Count(
            'memberships',
            filter=Q(memberships__status=ClubMembership.MembershipStatus.APPROVED),
        )
    ).all()
    serializer_class = ClubSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsPrincipal()]

    @action(detail=True, methods=['post'], url_path='apply')
    def apply_membership(self, request, pk=None):
        if request.user.role != User.Role.STUDENT or not hasattr(request.user, 'student_profile'):
            return Response({"success": False, "message": "শুধুমাত্র শিক্ষার্থীরা ক্লাবের সদস্য হতে পারে।"}, status=status.HTTP_403_FORBIDDEN)

        club = self.get_object()
        student = request.user.student_profile

        if ClubMembership.objects.filter(club=club, student=student).exists():
            return Response({"success": False, "message": "আপনি ইতিমধ্যে এই ক্লাবের সদস্যতার জন্য আবেদন করেছেন।"}, status=status.HTTP_400_BAD_REQUEST)

        membership = ClubMembership.objects.create(
            club=club,
            student=student,
            reason=request.data.get('reason', '')
        )

        return Response({
            "success": True,
            "message": f"{club.name}-এ আপনার সদস্যতার আবেদন জমা হয়েছে। ক্লাব ইনচার্জ শিক্ষক যাচাই করে অনুমোদন দেবেন।",
            "data": ClubMembershipSerializer(membership).data
        }, status=status.HTTP_201_CREATED)


class ClubMembershipViewSet(viewsets.ModelViewSet):
    serializer_class = ClubMembershipSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = ClubMembership.objects.select_related('club', 'student', 'student__user').all()

        if user.role == User.Role.PRINCIPAL or user.is_superuser:
            return queryset
        if user.role == User.Role.TEACHER:
            return queryset.filter(club__moderator_teacher=user)
        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)
        return queryset.none()

    @action(detail=True, methods=['patch'], url_path='review')
    def review_membership(self, request, pk=None):
        membership = self.get_object()
        user = request.user

        if user.role != User.Role.PRINCIPAL and membership.club.moderator_teacher_id != user.id:
            raise PermissionDenied("আপনি এই ক্লাবের দায়িত্বপ্রাপ্ত ইনচার্জ শিক্ষক নন।")

        new_status = request.data.get('status', 'APPROVED').upper()
        if new_status not in [
            ClubMembership.MembershipStatus.APPROVED,
            ClubMembership.MembershipStatus.REJECTED,
        ]:
            return Response(
                {"success": False, "message": "status হিসেবে APPROVED অথবা REJECTED প্রদান করুন।"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        membership.status = new_status
        membership.reviewed_by = user
        membership.reviewed_at = timezone.now()
        membership.save()

        return Response({
            "success": True,
            "message": f"শিক্ষার্থীর সদস্যপদ সফলভাবে '{membership.get_status_display()}' করা হয়েছে।",
            "data": ClubMembershipSerializer(membership).data
        }, status=status.HTTP_200_OK)


class ClubEventViewSet(viewsets.ModelViewSet):
    queryset = ClubEvent.objects.select_related('club').annotate(
        participant_count=Count('registrations')
    ).all()
    serializer_class = ClubEventSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'register_event']:
            return [IsAuthenticated()]
        return [IsTeacherOrPrincipal()]

    def perform_create(self, serializer):
        user = self.request.user
        club = serializer.validated_data['club']
        if user.role != User.Role.PRINCIPAL and club.moderator_teacher_id != user.id:
            raise PermissionDenied("আপনি শুধুমাত্র নিজের ক্লাবের ইভেন্ট তৈরি করতে পারবেন।")
        serializer.save()

    @action(detail=True, methods=['post'], url_path='register')
    def register_event(self, request, pk=None):
        if request.user.role != User.Role.STUDENT or not hasattr(request.user, 'student_profile'):
            return Response({"success": False, "message": "শুধুমাত্র শিক্ষার্থীরা ইভেন্টে রেজিস্ট্রেশন করতে পারে।"}, status=status.HTTP_403_FORBIDDEN)

        event = self.get_object()
        student = request.user.student_profile

        if event.registration_deadline < timezone.localdate():
            return Response({"success": False, "message": "দুঃখিত, এই ইভেন্টের রেজিস্ট্রেশনের সময়সীমা শেষ হয়ে গেছে।"}, status=status.HTTP_400_BAD_REQUEST)

        if EventRegistration.objects.filter(event=event, student=student).exists():
            return Response({"success": False, "message": "আপনি ইতিমধ্যে এই ইভেন্টে রেজিস্ট্রেশন করেছেন।"}, status=status.HTTP_400_BAD_REQUEST)

        reg = EventRegistration.objects.create(event=event, student=student)
        return Response({
            "success": True,
            "message": f"'{event.title}' প্রতিযোগিতায় আপনার নাম সফলভাবে রেজিস্ট্রেশন করা হয়েছে।",
            "data": EventRegistrationSerializer(reg).data
        }, status=status.HTTP_201_CREATED)


class WhatsAppNotificationViewSet(viewsets.GenericViewSet):
    permission_classes = [IsTeacherOrPrincipal]

    @action(detail=False, methods=['get'], url_path='templates')
    def get_templates(self, request):
        templates = WhatsAppTemplate.objects.filter(is_active=True)
        return Response({"success": True, "data": WhatsAppTemplateSerializer(templates, many=True).data})

    @action(detail=False, methods=['post'], url_path='send-absent-alert')
    @transaction.atomic
    def send_absent_alert(self, request):
        user = request.user
        today = timezone.localdate()
        section_id = request.data.get('section_id')

        template = WhatsAppTemplate.objects.filter(template_type=WhatsAppTemplate.TemplateType.ABSENT_ALERT, is_active=True).first()
        template_body = template.body_template if template else "আসসালামু আলাইকুম। আপনার সন্তান {student_name} (রোল: {roll}) আজ {date} তারিখে কলেজে অনুপস্থিত রয়েছে। - {college_name}"

        absent_qs = StudentAttendance.objects.filter(date=today, status=StudentAttendance.AttendanceStatus.ABSENT).select_related('student', 'student__user', 'section')

        if user.role == User.Role.TEACHER:
            absent_qs = absent_qs.filter(section__in_charge_teacher=user)
        elif section_id:
            absent_qs = absent_qs.filter(section_id=section_id)

        sent_count = 0
        for att in absent_qs:
            s = att.student
            if not s.guardian_phone:
                continue

            msg = WhatsAppNotificationService.render_template(template_body, {
                "student_name": s.user.get_full_name(),
                "roll": s.roll_number,
                "section_name": str(s.section),
                "date": today.strftime('%d-%m-%Y'),
            })

            WhatsAppNotificationService.send_whatsapp(
                sender_user=user,
                recipient_phone=s.guardian_phone,
                recipient_name=s.father_name or s.user.get_full_name(),
                message_text=msg,
                student=s,
                template=template
            )
            sent_count += 1

        return Response({
            "success": True,
            "message": f"মোট {sent_count} জন অভিভাবকের হোয়াটসঅ্যাপে অনুপস্থিতি বার্তা পাঠানো হয়েছে।",
            "total_sent": sent_count
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='send-fee-reminder')
    @transaction.atomic
    def send_fee_reminder(self, request):
        user = request.user
        section_id = request.data.get('section_id')

        template = WhatsAppTemplate.objects.filter(template_type=WhatsAppTemplate.TemplateType.FEE_REMINDER, is_active=True).first()
        template_body = template.body_template if template else "আসসালামু আলাইকুম। {student_name} (রোল: {roll}) এর {month} মাসের বেতন বাবদ মোট {due_amount} টাকা বকেয়া রয়েছে। নির্ধারিত সময়ের মধ্যে পরিশোধের অনুরোধ করা হলো। - {college_name}"

        invoices = StudentInvoice.objects.filter(due_amount__gt=Decimal('0.00')).select_related('student', 'student__user', 'section')

        if user.role == User.Role.TEACHER:
            invoices = invoices.filter(section__in_charge_teacher=user)
        elif section_id:
            invoices = invoices.filter(section_id=section_id)

        sent_count = 0
        for inv in invoices:
            s = inv.student
            if not s.guardian_phone:
                continue

            msg = WhatsAppNotificationService.render_template(template_body, {
                "student_name": s.user.get_full_name(),
                "roll": s.roll_number,
                "month": f"{inv.month}/{inv.year}",
                "due_amount": float(inv.due_amount),
            })

            WhatsAppNotificationService.send_whatsapp(
                sender_user=user,
                recipient_phone=s.guardian_phone,
                recipient_name=s.father_name or s.user.get_full_name(),
                message_text=msg,
                student=s,
                template=template
            )
            sent_count += 1

        return Response({
            "success": True,
            "message": f"মোট {sent_count} জন অভিভাবকের হোয়াটসঅ্যাপে বকেয়া তাগাদা পাঠানো হয়েছে।",
            "total_sent": sent_count
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='send-custom')
    def send_custom(self, request):
        user = request.user
        student_id = request.data.get('student_id')
        recipient_type = request.data.get('recipient_type', 'GUARDIAN')
        custom_message = request.data.get('custom_message', '').strip()

        if not student_id or not custom_message:
            return Response({"success": False, "message": "student_id এবং custom_message আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        student = StudentProfile.objects.select_related('user', 'section').get(id=student_id)

        if user.role == User.Role.TEACHER and student.section.in_charge_teacher_id != user.id:
            raise PermissionDenied("আপনি এই শিক্ষার্থীর শ্রেণি ইনচার্জ নন।")

        phone = student.guardian_phone if recipient_type == 'GUARDIAN' else student.user.phone
        name = student.father_name if recipient_type == 'GUARDIAN' else student.user.get_full_name()

        if not phone:
            return Response({"success": False, "message": "প্রদত্ত শিক্ষার্থীর কোনো ফোন নম্বর পাওয়া যায়নি।"}, status=status.HTTP_400_BAD_REQUEST)

        log = WhatsAppNotificationService.send_whatsapp(
            sender_user=user,
            recipient_phone=phone,
            recipient_name=name or student.user.username,
            message_text=custom_message,
            student=student
        )

        return Response({
            "success": True,
            "message": f"{name} এর হোয়াটসঅ্যাপে বার্তাটি সফলভাবে পাঠানো হয়েছে।",
            "log": WhatsAppMessageLogSerializer(log).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='history')
    def message_history(self, request):
        user = request.user
        queryset = WhatsAppMessageLog.objects.select_related('sender', 'student').all()

        if user.role == User.Role.TEACHER:
            queryset = queryset.filter(sender=user)

        return Response({
            "success": True,
            "total_messages": queryset.count(),
            "history": WhatsAppMessageLogSerializer(queryset[:50], many=True).data
        }, status=status.HTTP_200_OK)


class NotificationViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return InAppNotification.objects.filter(recipient=self.request.user)

    def list(self, request):
        queryset = self.get_queryset()[:30]
        serializer = InAppNotificationSerializer(queryset, many=True)
        return Response({
            "success": True,
            "unread_count": self.get_queryset().filter(is_read=False).count(),
            "notifications": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"success": True, "unread_count": count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notif = self.get_queryset().filter(id=pk).first()
        if not notif:
            return Response({"success": False, "message": "নোটিফিকেশন পাওয়া যায়নি।"}, status=status.HTTP_404_NOT_FOUND)

        notif.is_read = True
        notif.read_at = timezone.now()
        notif.save()
        return Response({"success": True, "message": "পড়া সম্পন্ন হয়েছে।", "data": InAppNotificationSerializer(notif).data})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True, read_at=timezone.now())
        return Response({"success": True, "message": f"{updated}টি নোটিফিকেশন পঠিত হিসেবে চিহ্নিত হয়েছে।"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='subscribe-device')
    def subscribe_device(self, request):
        serializer = DevicePushSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sub, created = DevicePushSubscription.objects.update_or_create(
            user=request.user,
            endpoint=serializer.validated_data['endpoint'],
            defaults={
                'device_type': serializer.validated_data.get('device_type', DevicePushSubscription.DeviceType.WEB),
                'p256dh_key': serializer.validated_data.get('p256dh_key', ''),
                'auth_key': serializer.validated_data.get('auth_key', ''),
                'fcm_token': serializer.validated_data.get('fcm_token', ''),
                'is_active': True,
            }
        )

        return Response({
            "success": True,
            "message": "ডিভাইসটি অফলাইন পুশ নোটিফিকেশনের জন্য সফলভাবে নিবন্ধিত হয়েছে।",
            "subscription_id": str(sub.id)
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)