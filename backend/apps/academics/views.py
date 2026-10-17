import secrets
import re
from decimal import Decimal
from openpyxl import load_workbook
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from django.db import transaction
from apps.examination.models import StudentExamResult
from apps.academics.models import AcademicHoliday, AcademicSection, StudentAttendance
from apps.academics.serializers import (
    AcademicHolidaySerializer,
    AcademicSectionSerializer,
    StudentDetailSerializer,
    StudentEnrollmentSerializer,
    BulkAttendanceCreateSerializer,
    StudentAttendanceRecordSerializer,
)
from apps.common.permissions import IsPrincipal, IsTeacherOrPrincipal
from apps.users_auth.models import StudentProfile, User
from apps.finance.models import StudentInvoice
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers

class AcademicSectionViewSet(viewsets.ModelViewSet):
    """
    শ্রেণি/শাখা পরিচালনা এবং শ্রেণি ইনচার্জ নিযুক্ত করার ViewSet।
    """
    queryset = AcademicSection.objects.select_related('in_charge_teacher').annotate(
        student_count=Count('students')
    ).all()
    serializer_class = AcademicSectionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsPrincipal()]

    @action(detail=True, methods=['patch'], url_path='assign-incharge')
    def assign_incharge(self, request, pk=None):
        section = self.get_object()
        teacher_id = request.data.get('teacher_id')

        if not teacher_id:
            section.in_charge_teacher = None
            section.save()
            return Response({
                "success": True,
                "message": "এই শ্রেণি থেকে ইনচার্জ অব্যাহতি দেওয়া হয়েছে।",
                "data": AcademicSectionSerializer(section).data
            })

        try:
            teacher = User.objects.get(id=teacher_id, role=User.Role.TEACHER, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "প্রদত্ত আইডিতে কোনো সক্রিয় শিক্ষক পাওয়া যায়নি।"},
                status=status.HTTP_404_NOT_FOUND
            )

        section.in_charge_teacher = teacher
        section.save()

        return Response({
            "success": True,
            "message": f"{teacher.get_full_name()} কে সফলভাবে '{section}' এর শ্রেণি ইনচার্জ নিযুক্ত করা হয়েছে।",
            "data": AcademicSectionSerializer(section).data
        }, status=status.HTTP_200_OK)


class StudentViewSet(viewsets.ModelViewSet):
    """
    স্টুডেন্ট অ্যাকাউন্ট তৈরি, তালিকা দেখা এবং প্রোফাইল/ফি সেটআপ আপডেট করার ViewSet।
    - প্রিন্সিপাল: সব শাখার স্টুডেন্ট তৈরি, দেখা, এডিট ও ডিলিট করতে পারবেন।
    - শ্রেণি ইনচার্জ: শুধুমাত্র নিজের দায়িত্বপ্রাপ্ত শাখায় স্টুডেন্ট তৈরি ও এডিট করতে পারবেন।
    """
    queryset = StudentProfile.objects.select_related('user', 'section', 'created_by').all()

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsPrincipal()]
        if self.action in ['create', 'update', 'partial_update']:
            return [IsTeacherOrPrincipal()]
        role = getattr(self.request.user, 'role', None)
        if role == User.Role.STUDENT:
            return [IsAuthenticated()]
        if role == User.Role.TEACHER:
            return [IsTeacherOrPrincipal()]
        return [IsPrincipal()]

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentEnrollmentSerializer
        return StudentDetailSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        # স্টুডেন্ট লগইন করলে সে শুধু নিজের প্রোফাইলই দেখতে পাবে
        if user.role == User.Role.STUDENT:
            return queryset.filter(user=user)

        if user.role == User.Role.TEACHER:
            queryset = queryset.filter(section__in_charge_teacher=user)

        # কুয়েরি প্যারামিটার দিয়ে ফিল্টার (?section=<uuid>&uses_transport=true&my_incharge_only=true)
        section_id = self.request.query_params.get('section')
        if section_id:
            queryset = queryset.filter(section_id=section_id)

        uses_transport = self.request.query_params.get('uses_transport')
        if uses_transport is not None:
            is_transport = uses_transport.lower() in ['true', '1']
            queryset = queryset.filter(uses_transport=is_transport)

        my_incharge_only = self.request.query_params.get('my_incharge_only')
        if my_incharge_only and my_incharge_only.lower() in ['true', '1'] and user.role == User.Role.TEACHER:
            queryset = queryset.filter(section__in_charge_teacher=user)

        return queryset

    def _verify_incharge_permission(self, user, section: AcademicSection):
        """
        চেক করবে ইউজার প্রিন্সিপাল কি না অথবা ওই নির্দিষ্ট শাখার ইনচার্জ কি না।
        """
        if user.role == User.Role.PRINCIPAL or user.is_superuser:
            return
        if section.in_charge_teacher_id != user.id:
            raise PermissionDenied(
                f"আপনি '{section}' শাখার শ্রেণি ইনচার্জ নন। শুধুমাত্র ওই শাখার ইনচার্জ বা প্রিন্সিপাল স্টুডেন্ট পরিচালনা করতে পারবেন।"
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        section = serializer.validated_data['section']
        self._verify_incharge_permission(request.user, section)

        student_profile = serializer.save()
        return Response(
            {
                "success": True,
                "message": "শিক্ষার্থীর অ্যাকাউন্ট ও প্রোফাইল সফলভাবে তৈরি করা হয়েছে।",
                "data": StudentDetailSerializer(student_profile, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['post'], permission_classes=[IsPrincipal], url_path='bulk-import')
    def bulk_import(self, request):
        upload = request.FILES.get('file')
        if not upload or not upload.name.lower().endswith(('.xlsx', '.xlsm')):
            return Response(
                {"success": False, "message": "একটি .xlsx অথবা .xlsm Excel file upload করুন।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            workbook = load_workbook(upload, read_only=True, data_only=True)
            worksheet = workbook.active
            rows = list(worksheet.values)
        except Exception as exc:
            return Response(
                {"success": False, "message": f"Excel file পড়া যায়নি: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not rows or not rows[0]:
            return Response({"success": False, "message": "Excel sheet খালি।"}, status=status.HTTP_400_BAD_REQUEST)

        def normalize(value):
            return re.sub(r'[^a-z0-9]', '_', str(value or '').strip().lower()).strip('_')

        aliases = {
            'name': ('name', 'full_name', 'student_name', 'first_name'),
            'first_name': ('first_name',),
            'last_name': ('last_name',),
            'gender': ('gender',),
            'section': ('section', 'section_id'),
            'class_level': ('class_level', 'class'),
            'group': ('group',),
            'section_name': ('section_name', 'branch'),
            'session': ('session',),
            'roll_number': ('roll_number', 'roll', 'class_roll'),
            'ssc_roll': ('ssc_roll', 'ssc_roll_no'),
            'passing_year': ('passing_year', 'pass_year'),
            'hsc_registration_no': ('hsc_registration_no', 'hsc_registration'),
            'father_name': ('father_name', 'father'),
            'mother_name': ('mother_name', 'mother'),
            'guardian_phone': ('guardian_phone', 'guardian_mobile'),
            'guardian_whatsapp_number': ('guardian_whatsapp_number', 'guardian_whatsapp'),
            'student_whatsapp_number': ('student_whatsapp_number', 'student_whatsapp'),
            'present_address': ('present_address', 'address'),
            'monthly_tuition_fee': ('monthly_tuition_fee', 'tuition_fee', 'monthly_fee'),
            'uses_transport': ('uses_transport', 'transport', 'use_transport', 'has_transport', 'bus'),
            'monthly_transport_fee': ('monthly_transport_fee', 'transport_fee', 'bus_fee'),
            'assigned_vehicle': ('assigned_vehicle', 'vehicle', 'vehicle_number', 'bus_no'),
        }
        header_map = {normalize(value): index for index, value in enumerate(rows[0])}

        def cell(row, field):
            for alias in aliases[field]:
                if alias in header_map:
                    return row[header_map[alias]]
            return ''

        def split_name(row):
            full_name = str(cell(row, 'name') or '').strip()
            first_name = str(cell(row, 'first_name') or '').strip()
            last_name = str(cell(row, 'last_name') or '').strip()
            if not first_name and full_name:
                parts = full_name.split(maxsplit=1)
                first_name = parts[0]
                last_name = parts[1] if len(parts) > 1 else ''
            return first_name, last_name

        prepared = []
        errors = []
        for row_number, row in enumerate(rows[1:], start=2):
            if not any(value not in (None, '') for value in row):
                continue
            first_name, last_name = split_name(row)
            section_value = str(cell(row, 'section') or '').strip()
            section = None
            if section_value:
                try:
                    import uuid
                    uuid.UUID(section_value)
                    section = AcademicSection.objects.filter(id=section_value, is_active=True).first()
                except Exception:
                    section = None

            if not section:
                section = AcademicSection.objects.filter(
                    class_level=str(cell(row, 'class_level') or '').strip().upper(),
                    group=str(cell(row, 'group') or '').strip().upper(),
                    section_name=str(cell(row, 'section_name') or '').strip(),
                    session=str(cell(row, 'session') or '').strip(),
                    is_active=True,
                ).first()

            if not section:
                errors.append({
                    "row": row_number,
                    "error": "section ID অথবা class_level, group, section_name ও session-এর সঠিক combination দিতে হবে।",
                })
                continue

            raw_roll = cell(row, 'roll_number')
            try:
                roll_number = int(float(str(raw_roll).strip()))
            except (ValueError, TypeError):
                roll_number = None

            raw_tuition = cell(row, 'monthly_tuition_fee')
            try:
                monthly_tuition_fee = float(raw_tuition) if raw_tuition not in (None, '') else 0.0
            except (ValueError, TypeError):
                monthly_tuition_fee = 0.0

            raw_transport = str(cell(row, 'uses_transport') or '').strip().lower()
            raw_transport_fee = cell(row, 'monthly_transport_fee') or 0
            try:
                transport_fee = float(raw_transport_fee)
            except (ValueError, TypeError):
                transport_fee = 0.0

            uses_transport = (
                raw_transport in ('true', 'yes', '1', 'y', 'হ্যাঁ') or transport_fee > 0
            )

            vehicle_val = str(cell(row, 'assigned_vehicle') or '').strip()
            assigned_vehicle_pk = None
            if vehicle_val:
                try:
                    from apps.finance.models import TransportVehicle
                    v = (
                        TransportVehicle.objects.filter(vehicle_number__iexact=vehicle_val, is_active=True).first() or
                        TransportVehicle.objects.filter(route_name__icontains=vehicle_val, is_active=True).first()
                    )
                    if not v:
                        try:
                            import uuid
                            uuid.UUID(vehicle_val)
                            v = TransportVehicle.objects.filter(id=vehicle_val, is_active=True).first()
                        except Exception:
                            pass
                    if v:
                        assigned_vehicle_pk = v.pk
                        uses_transport = True
                except Exception:
                    pass

            pin = f"{secrets.randbelow(1000000):06d}"
            prepared.append({
                'row': row_number,
                'data': {
                    'password': pin,
                    'first_name': first_name,
                    'last_name': last_name,
                    'gender': str(cell(row, 'gender') or 'MALE').upper(),
                    'section': section.pk,
                    'roll_number': roll_number,
                    'ssc_roll': str(cell(row, 'ssc_roll') or '').strip(),
                    'passing_year': str(cell(row, 'passing_year') or '').strip(),
                    'hsc_registration_no': str(cell(row, 'hsc_registration_no') or '').strip(),
                    'father_name': str(cell(row, 'father_name') or '').strip(),
                    'mother_name': str(cell(row, 'mother_name') or '').strip(),
                    'guardian_phone': str(cell(row, 'guardian_phone') or '').strip(),
                    'guardian_whatsapp_number': str(cell(row, 'guardian_whatsapp_number') or '').strip(),
                    'student_whatsapp_number': str(cell(row, 'student_whatsapp_number') or '').strip(),
                    'present_address': str(cell(row, 'present_address') or '').strip(),
                    'monthly_tuition_fee': monthly_tuition_fee,
                    'uses_transport': uses_transport,
                    'monthly_transport_fee': transport_fee if uses_transport else 0.0,
                    'assigned_vehicle': assigned_vehicle_pk,
                },
                'section': section,
                'pin': pin,
            })

        for item in prepared:
            serializer = StudentEnrollmentSerializer(data=item['data'], context={'request': request})
            if not serializer.is_valid():
                errors.append({"row": item['row'], "error": serializer.errors})

        if errors:
            return Response(
                {"success": False, "message": "Import বাতিল হয়েছে। Excel-এর errorগুলো ঠিক করে আবার upload করুন।", "errors": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        imported = []
        with transaction.atomic():
            for item in prepared:
                serializer = StudentEnrollmentSerializer(data=item['data'], context={'request': request})
                serializer.is_valid(raise_exception=True)
                profile = serializer.save()
                profile.set_temporary_pin(item['pin'])
                profile.save(update_fields=['temporary_pin_token'])
                imported.append({
                    'id': str(profile.id),
                    'name': profile.user.get_full_name(),
                    'ssc_roll': profile.ssc_roll,
                    'passing_year': profile.passing_year,
                    'pin': item['pin'],
                    'guardian_whatsapp_number': profile.guardian_whatsapp_number,
                    'student_whatsapp_number': profile.student_whatsapp_number,
                })

        return Response({
            "success": True,
            "message": f"{len(imported)} জন শিক্ষার্থীর account ও profile তৈরি হয়েছে।",
            "data": imported,
        }, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        instance = self.get_object()
        target_section = serializer.validated_data.get('section', instance.section)
        self._verify_incharge_permission(self.request.user, instance.section)
        self._verify_incharge_permission(self.request.user, target_section)
        serializer.save()

    @action(detail=True, methods=['get'], permission_classes=[IsPrincipal], url_path='360')
    def student_360(self, request, pk=None):
        student = self.get_object()
        attendance_qs = student.attendances.order_by('-date')
        attendance_counts = {
            status_value: attendance_qs.filter(status=status_value).count()
            for status_value, _ in StudentAttendance.AttendanceStatus.choices
        }
        invoices = student.invoices.prefetch_related('payments').order_by('-year', '-month')
        exam_results = student.exam_results.select_related('exam').order_by('-exam__start_date')
        subject_marks = student.subject_marks.select_related('exam', 'subject').order_by('-exam__start_date', 'subject__name')

        return Response({
            "success": True,
            "data": {
                "profile": StudentDetailSerializer(student, context={'request': request}).data,
                "attendance": {
                    "summary": attendance_counts,
                    "total": attendance_qs.count(),
                    "records": [
                        {
                            "date": record.date,
                            "status": record.status,
                            "status_display": record.get_status_display(),
                            "remarks": record.remarks,
                        }
                        for record in attendance_qs[:100]
                    ],
                },
                "fees": {
                    "summary": {
                        "total": sum((invoice.total_amount for invoice in invoices), Decimal('0.00')),
                        "paid": sum((invoice.paid_amount for invoice in invoices), Decimal('0.00')),
                        "due": sum((invoice.due_amount for invoice in invoices), Decimal('0.00')),
                    },
                    "invoices": [
                        {
                            "id": str(invoice.id),
                            "invoice_number": invoice.invoice_number,
                            "month": invoice.month,
                            "year": invoice.year,
                            "total_amount": invoice.total_amount,
                            "paid_amount": invoice.paid_amount,
                            "due_amount": invoice.due_amount,
                            "status": invoice.status,
                            "payments": [
                                {
                                    "receipt_no": payment.receipt_no,
                                    "amount_paid": payment.amount_paid,
                                    "payment_method": payment.payment_method,
                                    "transaction_reference": payment.transaction_reference,
                                    "created_at": payment.created_at,
                                }
                                for payment in invoice.payments.all()
                            ],
                        }
                        for invoice in invoices[:100]
                    ],
                },
                "exams": {
                    "results": [
                        {
                            "exam": result.exam.name,
                            "exam_id": str(result.exam_id),
                            "total_full_marks": result.total_full_marks,
                            "total_obtained_marks": result.total_obtained_marks,
                            "gpa": result.gpa,
                            "grade_letter": result.grade_letter,
                            "is_passed": result.is_passed,
                            "section_position": result.section_position,
                            "class_position": result.class_position,
                            "failed_subjects_count": result.failed_subjects_count,
                        }
                        for result in exam_results
                    ],
                    "subject_marks": [
                        {
                            "exam": mark.exam.name,
                            "subject": mark.subject.name,
                            "final_total_marks": mark.final_total_marks,
                            "grade_letter": mark.grade_letter,
                            "grade_point": mark.grade_point,
                            "is_passed": mark.is_passed,
                            "is_absent": mark.is_absent,
                        }
                        for mark in subject_marks[:200]
                    ],
                },
            },
        })

    @action(detail=False, methods=['get'], url_path='my-id-card')
    def my_id_card(self, request):
        """
        GET /api/v1/academics/students/my-id-card/
        ডিজিটাল স্টুডেন্ট আইডি কার্ড ডেটা ও কিউআর-কোড ইনফো।
        """
        if request.user.role != User.Role.STUDENT or not hasattr(request.user, 'student_profile'):
            return Response({"success": False, "message": "শুধুমাত্র শিক্ষার্থীরা আইডি কার্ড পেতে পারে।"}, status=status.HTTP_403_FORBIDDEN)

        student = request.user.student_profile
        return Response({
            "success": True,
            "institution": "STARLIGHT COLLEGE, SYLHET",
            "student_id": student.student_unique_id,
            "name": student.user.get_full_name(),
            "roll": student.roll_number,
            "class_level": student.section.get_class_level_display(),
            "group": student.section.get_group_display(),
            "section": student.section.section_name,
            "session": student.session,
            "guardian_phone": student.guardian_phone,
            "blood_group": "A+",
            "photo_url": student.user.profile_photo.url if student.user.profile_photo else None
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], permission_classes=[IsTeacherOrPrincipal], url_path='at-risk-tracker')
    def at_risk_tracker(self, request):
        """
        GET /api/v1/academics/students/at-risk-tracker/?section=<uuid>
        ইনচার্জ ও প্রিন্সিপালের জন্য দুর্বল ও অনিয়মিত শিক্ষার্থীদের অটোমেটিক লাল তালিকা:
        ১. যাদের ক্লাসে মোট উপস্থিতি ৭০%-এর নিচে নেমে গেছে।
        ২. যারা একাধিক পরীক্ষায় বা অন্তত ২টি বিষয়ে ফেল করেছে।
        """
        user = request.user
        section_id = request.query_params.get('section')

        students = StudentProfile.objects.filter(user__is_active=True).select_related('user', 'section')

        if user.role == User.Role.TEACHER:
            # শিক্ষক শুধু নিজ দায়িত্বপ্রাপ্ত শাখার শিক্ষার্থীদের ঝুঁকি দেখতে পাবেন
            students = students.filter(section__in_charge_teacher=user)
        elif section_id:
            students = students.filter(section_id=section_id)

        at_risk_list = []
        for s in students:
            risk_factors = []
            
            # ১. উপস্থিতি বিশ্লেষণ
            total_days = StudentAttendance.objects.filter(section=s.section).values('date').distinct().count()
            present_days = StudentAttendance.objects.filter(
                student=s, 
                status__in=[StudentAttendance.AttendanceStatus.PRESENT, StudentAttendance.AttendanceStatus.LATE]
            ).count()

            attendance_pct = round((present_days / total_days) * 100, 1) if total_days > 0 else 100.0
            if attendance_pct < 70.0:
                risk_factors.append({
                    "type": "LOW_ATTENDANCE",
                    "severity": "HIGH" if attendance_pct < 50.0 else "MEDIUM",
                    "description": f"উপস্থিতি মাত্র {attendance_pct}% (মোট {total_days} কার্যদিবসে উপস্থিত {present_days} দিন)।"
                })

            # ২. একাডেমিক ফলাফল ও ফেইল্ড বিশ্লেষণ
            failed_results = StudentExamResult.objects.filter(student=s, is_passed=False)
            failed_exam_count = failed_results.count()
            
            if failed_exam_count >= 1:
                total_failed_subs = sum(res.failed_subjects_count for res in failed_results)
                risk_factors.append({
                    "type": "ACADEMIC_FAILURE",
                    "severity": "CRITICAL" if failed_exam_count >= 2 else "HIGH",
                    "description": f"এ পর্যন্ত {failed_exam_count}টি পরীক্ষায় অকৃতকার্য (মোট {total_failed_subs}টি বিষয়ে ফেল)।"
                })

            # যদি কোনো একটি ঝুঁকিতে পড়ে তবে তালিকায় যোগ হবে
            if risk_factors:
                at_risk_list.append({
                    "student_id": str(s.id),
                    "student_unique_id": s.student_unique_id,
                    "roll_number": s.roll_number,
                    "student_name": s.user.get_full_name(),
                    "section": str(s.section),
                    "guardian_phone": s.guardian_phone,
                    "attendance_percentage": f"{attendance_pct}%",
                    "risk_factors_count": len(risk_factors),
                    "risk_details": risk_factors,
                })

        return Response({
            "success": True,
            "total_at_risk_students": len(at_risk_list),
            "watchlist": at_risk_list
        }, status=status.HTTP_200_OK)

from datetime import datetime
from apps.academics.models import ClassRoutine, Homework, Subject, Syllabus
from apps.academics.serializers import (
    ClassRoutineSerializer,
    HomeworkSerializer,
    SubjectSerializer,
    SyllabusSerializer,
)

class SubjectViewSet(viewsets.ModelViewSet):
    """
    পাঠ্য বিষয় (Subject) তৈরি ও তালিকা:
    - প্রিন্সিপাল: বিষয় তৈরি, আপডেট ও ডিলিট করতে পারবেন।
    - শিক্ষক ও শিক্ষার্থী: বিষয় তালিকা দেখতে পারবেন।
    """
    queryset = Subject.objects.select_related('default_teacher').filter(is_active=True)
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsPrincipal()]

    def get_queryset(self):
        queryset = super().get_queryset()
        class_level = self.request.query_params.get('class_level')
        group = self.request.query_params.get('group')
        if class_level:
            queryset = queryset.filter(class_level=class_level.upper())
        if group:
            queryset = queryset.filter(group=group.upper())
        return queryset


class ClassRoutineViewSet(viewsets.ModelViewSet):
    """
    ক্লাস রুটিন তৈরি ও শিডিউল ভিউসেট:
    - প্রিন্সিপাল: রুটিন তৈরি ও মডিফাই করতে পারবেন।
    - স্পেশাল অ্যাকশন 'my-schedule': শিক্ষক আজকের দিনের তাঁর ক্লাস শিডিউল দেখবেন।
    """
    queryset = ClassRoutine.objects.select_related('section', 'subject', 'teacher').all()
    serializer_class = ClassRoutineSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_schedule']:
            return [IsAuthenticated()]
        return [IsPrincipal()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        # স্টুডেন্ট লগইন করলে স্বয়ংক্রিয়ভাবে তার সেকশনের রুটিন ফিল্টার হবে
        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(section=user.student_profile.section)

        section_id = self.request.query_params.get('section')
        if section_id:
            queryset = queryset.filter(section_id=section_id)

        teacher_id = self.request.query_params.get('teacher')
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)

        day = self.request.query_params.get('day_of_week')
        if day is not None:
            queryset = queryset.filter(day_of_week=day)

        return queryset

    @action(detail=False, methods=['get'], url_path='my-schedule')
    def my_schedule(self, request):
        """
        GET /api/v1/academics/routines/my-schedule/
        শিক্ষকের আজকের পিরিয়ডগুলোর তালিকা ও নোটিফিকেশন অ্যালার্ট।
        """
        if request.user.role != User.Role.TEACHER:
            return Response(
                {"success": False, "message": "শুধুমাত্র শিক্ষকদের জন্য এই শিডিউল প্রযোজ্য।"},
                status=status.HTTP_403_FORBIDDEN
            )

        # পাইথনের weekday (0=Mon, 6=Sun) কে আমাদের মডেলের (0=Sat .. 6=Fri) সাথে রূপান্তর
        py_weekday = datetime.today().weekday()
        model_day = (py_weekday + 2) % 7

        todays_classes = ClassRoutine.objects.filter(
            teacher=request.user,
            day_of_week=model_day
        ).select_related('section', 'subject').order_time_asc() if hasattr(ClassRoutine.objects, 'order_time_asc') else ClassRoutine.objects.filter(
            teacher=request.user,
            day_of_week=model_day
        ).select_related('section', 'subject').order_by('start_time')

        serializer = self.get_serializer(todays_classes, many=True)
        return Response({
            "success": True,
            "day": ClassRoutine.DayOfWeek(model_day).label,
            "total_classes_today": todays_classes.count(),
            "data": serializer.data
        }, status=status.HTTP_200_OK)
        
    @method_decorator(cache_page(60 * 15)) # ১৫ মিনিটের জন্য সার্ভার ক্যাশে থাকবে
    @method_decorator(vary_on_headers("Authorization")) # ইউজারের টোকেন অনুযায়ী আলাদা ক্যাশ
    def list(self, request, *args, **kwargs):
        """রুটিন দেখার সময় কোনো ডেটাবেস কোয়েরি হবে না, সরাসরি ক্যাশ থেকে মিলিসেকেন্ডে লোড হবে"""
        return super().list(request, *args, **kwargs)

class SyllabusViewSet(viewsets.ModelViewSet):
    """
    সিলেবাস ফাইল আপলোড ও দেখা:
    - শিক্ষক ও প্রিন্সিপাল আপলোড করতে পারবেন।
    - শিক্ষার্থীরা তাদের প্রাসঙ্গিক বিষয়ের সিলেবাস ডাউনলোড করতে পারবে।
    """
    queryset = Syllabus.objects.select_related('subject', 'uploaded_by').all()
    serializer_class = SyllabusSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsTeacherOrPrincipal()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class HomeworkViewSet(viewsets.ModelViewSet):
    """
    হোমওয়ার্ক দেওয়ার এবং দেখার ভিউসেট:
    - শিক্ষক ও প্রিন্সিপাল হোমওয়ার্ক পোস্ট করতে পারবেন।
    - শিক্ষার্থীরা তাদের সেকশনের হোমওয়ার্ক দেখতে পাবে।
    """
    queryset = Homework.objects.select_related('section', 'subject', 'teacher').all()
    serializer_class = HomeworkSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsTeacherOrPrincipal()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(section=user.student_profile.section)

        section_id = self.request.query_params.get('section')
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class StudentAttendanceViewSet(viewsets.GenericViewSet):
    """
    শিক্ষার্থীদের ডিজিটাল বাল্ক হাজিরা ভিউসেট:
    1. bulk-mark: শ্রেণি ইনচার্জ এক ক্লিকে পুরো ক্লাসের হাজিরা দেবেন/আপডেট করবেন।
    2. section-sheet: কোনো তারিখের পুরো সেকশনের স্টুডেন্ট তালিকা ও তাদের স্ট্যাটাস রিটার্ন করবে।
    3. my-attendance: স্টুডেন্ট লগইন করে নিজের মাসিক উপস্থিতি রিপোর্ট ও পার্সেন্টেজ (%) দেখবে।
    """
    queryset = StudentAttendance.objects.select_related('student', 'student__user', 'section', 'recorded_by').all()

    def get_permissions(self):
        if self.action == 'my_attendance':
            return [IsAuthenticated()]
        return [IsTeacherOrPrincipal()]

    @action(detail=False, methods=['get'], url_path='section-sheet')
    def section_sheet(self, request):
        """
        GET /api/v1/academics/attendance/section-sheet/?section=<uuid>&date=YYYY-MM-DD
        ফ্রন্টএন্ডে হাজিরা নেওয়ার পেজ লোড করার জন্য এটি কল করা হবে।
        """
        section_id = request.query_params.get('section')
        if not section_id:
            return Response(
                {"success": False, "message": "section প্যারামিটার প্রদান করা আবশ্যক।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            section = AcademicSection.objects.get(id=section_id)
        except AcademicSection.DoesNotExist:
            return Response(
                {"success": False, "message": "প্রদত্ত শাখাটি পাওয়া যায়নি।"},
                status=status.HTTP_404_NOT_FOUND
            )

        # ইনচার্জ সিকিউরিটি বাউন্ডারি চেক
        if request.user.role == User.Role.TEACHER and section.in_charge_teacher_id != request.user.id:
            raise PermissionDenied(f"আপনি '{section}' শাখার শ্রেণি ইনচার্জ নন। শুধুমাত্র শ্রেণি ইনচার্জ হাজিরা দেখতে বা নিতে পারবেন।")

        target_date_str = request.query_params.get('date')
        if target_date_str:
            try:
                target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"success": False, "message": "তারিখ অবশ্যই YYYY-MM-DD ফরম্যাটে হতে হবে।"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            target_date = timezone.localdate()

        # ওই সেকশনের সব স্টুডেন্ট সংগ্রহ
        students = StudentProfile.objects.filter(section=section, user__is_active=True).select_related('user').order_by('roll_number')
        
        # ইতিমধ্যে ওই তারিখে নেওয়া হাজিরার ম্যাপ তৈরি
        existing_attendances = {
            att.student_id: att
            for att in StudentAttendance.objects.filter(section=section, date=target_date)
        }

        sheet_data = []
        for stu in students:
            att = existing_attendances.get(stu.id)
            sheet_data.append({
                "student_id": str(stu.id),
                "student_unique_id": stu.student_unique_id,
                "roll_number": stu.roll_number,
                "student_name": stu.user.get_full_name() or stu.user.username,
                "status": att.status if att else StudentAttendance.AttendanceStatus.PRESENT,
                "remarks": att.remarks if att else "",
                "is_already_marked": att is not None
            })

        return Response({
            "success": True,
            "section": str(section),
            "date": target_date.strftime('%Y-%m-%d'),
            "total_students": len(sheet_data),
            "is_submitted": any(item['is_already_marked'] for item in sheet_data),
            "students": sheet_data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='bulk-mark')
    def bulk_mark(self, request):
        """
        POST /api/v1/academics/attendance/bulk-mark/
        শ্রেণি ইনচার্জ এক ক্লিকে পুরো সেকশনের হাজিরা সেভ করবেন।
        """
        serializer = BulkAttendanceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section_id = serializer.validated_data['section_id']
        section = AcademicSection.objects.get(id=section_id)

        # ইনচার্জ সিকিউরিটি বাউন্ডারি চেক
        if request.user.role == User.Role.TEACHER and section.in_charge_teacher_id != request.user.id:
            raise PermissionDenied(f"আপনি '{section}' শাখার শ্রেণি ইনচার্জ নন। আপনি এই ক্লাসের হাজিরা সাবমিট করতে পারবেন না।")

        saved_records = serializer.save_bulk(recorder_user=request.user)

        return Response({
            "success": True,
            "message": f"মোট {len(saved_records)} জন শিক্ষার্থীর হাজিরা সফলভাবে সংরক্ষণ করা হয়েছে।",
            "date": serializer.validated_data['date'].strftime('%Y-%m-%d'),
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-attendance')
    def my_attendance(self, request):
        """
        GET /api/v1/academics/attendance/my-attendance/
        লগইন করা স্টুডেন্টের উপস্থিতি অ্যানালিটিক্স ও শতকরা (%) ক্যালকুলেশন।
        """
        if request.user.role != User.Role.STUDENT or not hasattr(request.user, 'student_profile'):
            return Response(
                {"success": False, "message": "এই রিপোর্টটি শুধুমাত্র শিক্ষার্থীদের জন্য প্রযোজ্য।"},
                status=status.HTTP_403_FORBIDDEN
            )

        student = request.user.student_profile
        records = StudentAttendance.objects.filter(student=student).order_by('-date')

        # ঐচ্ছিক ফিল্টারিং: ?month=10&year=2026
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        if month and year:
            records = records.filter(date__month=month, date__year=year)

        total_working_days = records.count()
        present_count = records.filter(status=StudentAttendance.AttendanceStatus.PRESENT).count()
        late_count = records.filter(status=StudentAttendance.AttendanceStatus.LATE).count()
        absent_count = records.filter(status=StudentAttendance.AttendanceStatus.ABSENT).count()
        leave_count = records.filter(status=StudentAttendance.AttendanceStatus.LEAVE).count()

        percentage = 0.0
        if total_working_days > 0:
            # প্রেজেন্ট এবং লেট উভয়কেই উপস্থিতির অংশ হিসেবে ধরা হয়
            percentage = round(((present_count + late_count) / total_working_days) * 100, 2)

        return Response({
            "success": True,
            "student_unique_id": student.student_unique_id,
            "total_working_days": total_working_days,
            "present_count": present_count,
            "late_count": late_count,
            "absent_count": absent_count,
            "leave_count": leave_count,
            "attendance_percentage": f"{percentage}%",
            "history": StudentAttendanceRecordSerializer(records[:30], many=True).data
        }, status=status.HTTP_200_OK)

class AcademicHolidayViewSet(viewsets.ModelViewSet):
    """
    একাডেমিক ছুটির ক্যালেন্ডার ভিউসেট:
    - তৈরি/আপডেট: প্রিন্সিপাল।
    - ক্যালেন্ডার দেখা: সকল ইউজার।
    """
    queryset = AcademicHoliday.objects.all()
    serializer_class = AcademicHolidaySerializer

    @method_decorator(cache_page(60))
    @method_decorator(vary_on_headers('Authorization'))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsPrincipal()]