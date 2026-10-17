from decimal import Decimal
from django.db import transaction
from django.db.models import Count, Max, Q, Sum, Prefetch
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.academics.models import AcademicSection, StudentAttendance, Subject
from apps.common.permissions import IsPrincipal, IsTeacherOrPrincipal
from apps.examination.models import (
    CoCurricularEntry,
    Exam,
    ExamRoom,
    ExamSeatAssignment,
    ExamSubjectConfig,
    InvigilationDuty,
    QuestionPaperSubmission,
    StudentExamResult,
    SubjectMarksEntry,
)
from apps.examination.serializers import (
    BulkCoCurricularEntrySerializer,
    BulkSubjectMarksEntrySerializer,
    ExamRoomSerializer,
    ExamSeatAssignmentSerializer,
    ExamSerializer,
    ExamSubjectConfigSerializer,
    InvigilationDutySerializer,
    QuestionPaperSubmissionSerializer,
    TeacherQuestionPaperSubmissionSerializer,
    ResultProcessRequestSerializer,
    StudentExamResultSerializer,
)
from apps.finance.models import StudentInvoice
from apps.users_auth.models import StudentProfile, User


class ExamViewSet(viewsets.ModelViewSet):
    """
    পরীক্ষা তৈরি ও কনফিগারেশন ভিউসেট (প্রিন্সিপাল পরিচালিত)।
    """
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_admit_card']:
            return [IsAuthenticated()]
        return [IsPrincipal()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'], url_path='my-admit-card')
    def my_admit_card(self, request, pk=None):
        """
        GET /api/v1/examination/exams/<id>/my-admit-card/
        স্মার্ট অ্যাডমিট কার্ড ইঞ্জিন (Due-Lock লজিক):
        কোনো বকেয়া থাকলে সরাসরি 403 Forbidden সহ লাল সতর্কবার্তা আসবে।
        """
        if request.user.role != User.Role.STUDENT or not hasattr(request.user, 'student_profile'):
            return Response({"success": False, "message": "শুধুমাত্র শিক্ষার্থীরা অ্যাডমিট কার্ড পেতে পারে।"}, status=status.HTTP_403_FORBIDDEN)

        exam = self.get_object()
        student = request.user.student_profile

        # বকেয়া চেক (Due-Lock Logic)
        total_due = StudentInvoice.objects.filter(
            student=student,
            due_amount__gt=Decimal('0.00')
        ).aggregate(total=Sum('due_amount'))['total'] or Decimal('0.00')

        if total_due > Decimal('0.00'):
            return Response({
                "success": False,
                "is_locked": True,
                "message": "অনুগ্রহপূর্বক তোমার শ্রেণি ইনচার্জের কাছে বকেয়া পরিশোধ করে অ্যাডমিট কার্ড আনলক করো।",
                "total_due_amount": float(total_due),
                "warning": "বকেয়া ফি পরিশোধ ব্যতীত পরীক্ষায় অংশগ্রহণ নিষিদ্ধ।"
            }, status=status.HTTP_403_FORBIDDEN)

        seat_assignment = ExamSeatAssignment.objects.filter(exam=exam, student=student).first()
        subject_configs = exam.subject_configs.select_related('subject')
        routine_slots = [
            {
                "subject_name": sc.subject.name,
                "subject_code": sc.subject.code,
                "full_marks": float(sc.full_marks),
            }
            for sc in subject_configs
        ]

        return Response({
            "success": True,
            "is_locked": False,
            "institution": {
                "name": "STARLIGHT COLLEGE",
                "address": "Sunargown R/A, Dokshin surma, Sylhet",
                "eiin": "135342",
            },
            "admit_card": {
                "exam_name": exam.name,
                "session": exam.session,
                "student_name": student.user.get_full_name(),
                "student_id": student.student_unique_id,
                "roll_number": student.roll_number,
                "class_level": student.section.get_class_level_display(),
                "group": student.section.get_group_display(),
                "section": student.section.section_name,
                "seat_info": {
                    "room_number": seat_assignment.room.room_number if seat_assignment else "বরাদ্দ হয়নি",
                    "seat_number": seat_assignment.seat_number if seat_assignment else "অপেক্ষমাণ",
                },
                "subjects": routine_slots,
                "instructions": [
                    "পরীক্ষা শুরুর ১৫ মিনিট পূর্বে পরীক্ষার হলে উপস্থিত হতে হবে।",
                    "অ্যাডমিট কার্ড ছাড়া কোনো শিক্ষার্থীকে পরীক্ষার হলে প্রবেশ করতে দেওয়া হবে না।",
                    "মোবাইল ফোন বা কোনো ডিজিটাল ডিভাইস সম্পূর্ণ নিষিদ্ধ।"
                ]
            }
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsPrincipal], url_path='generate-seat-plan')
    @transaction.atomic
    def generate_seat_plan(self, request, pk=None):
        """
        POST /api/v1/examination/exams/<id>/generate-seat-plan/
        স্বয়ংক্রিয় সিট প্ল্যান জেনারেটর (রুমের ধারণক্ষমতা অনুযায়ী ক্রমানুসারে আসন বণ্টন)।
        """
        exam = self.get_object()
        room_ids = request.data.get('room_ids', [])

        if not room_ids:
            return Response({"success": False, "message": "কমপক্ষে একটি রুম নির্বাচন করা আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        rooms = ExamRoom.objects.filter(id__in=room_ids, is_active=True).order_by('room_number')
        students = StudentProfile.objects.filter(
            section__class_level=exam.class_level,
            section__session=exam.session,
            user__is_active=True,
        ).order_by('roll_number')

        total_capacity = sum(r.capacity for r in rooms)
        if len(students) > total_capacity:
            return Response({
                "success": False,
                "message": f"নির্বাচিত রুমগুলোতে মোট আসন {total_capacity}টি, কিন্তু পরীক্ষার্থী রয়েছে {len(students)} জন। আরও রুম যুক্ত করুন।"
            }, status=status.HTTP_400_BAD_REQUEST)

        ExamSeatAssignment.objects.filter(exam=exam).delete()

        student_idx = 0
        assigned_records = []

        for room in rooms:
            for seat_no in range(1, room.capacity + 1):
                if student_idx >= len(students):
                    break
                
                assignment = ExamSeatAssignment(
                    exam=exam,
                    student=students[student_idx],
                    room=room,
                    seat_number=seat_no
                )
                assigned_records.append(assignment)
                student_idx += 1

        ExamSeatAssignment.objects.bulk_create(assigned_records)

        return Response({
            "success": True,
            "message": f"{exam.name} এর জন্য মোট {len(assigned_records)} জন শিক্ষার্থীর আসন বিন্যাস সফলভাবে তৈরি করা হয়েছে।",
            "total_seated": len(assigned_records),
            "rooms_used": rooms.count()
        }, status=status.HTTP_201_CREATED)


class ExamRoomViewSet(viewsets.ModelViewSet):
    queryset = ExamRoom.objects.all()
    serializer_class = ExamRoomSerializer
    permission_classes = [IsPrincipal]


class InvigilationDutyViewSet(viewsets.ModelViewSet):
    """
    শিক্ষকদের হল গার্ড রোস্টার ভিউসেট।
    """
    queryset = InvigilationDuty.objects.select_related('exam', 'room', 'teacher').all()
    serializer_class = InvigilationDutySerializer
    permission_classes = [IsTeacherOrPrincipal]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.role == User.Role.TEACHER:
            return queryset.filter(teacher=user)
        return queryset


class QuestionPaperSubmissionViewSet(viewsets.ModelViewSet):
    """
    শিক্ষক কর্তৃক পাসওয়ার্ড-প্রটেক্টেড প্রশ্নপত্র আপলোড।
    """
    queryset = QuestionPaperSubmission.objects.select_related(
        'exam', 'subject', 'teacher'
    ).order_by('-created_at')
    serializer_class = QuestionPaperSubmissionSerializer
    permission_classes = [IsTeacherOrPrincipal]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == User.Role.TEACHER:
            return queryset.filter(teacher=self.request.user)
        return queryset

    def get_serializer_class(self):
        if self.request.user.role == User.Role.TEACHER:
            return TeacherQuestionPaperSubmissionSerializer
        return QuestionPaperSubmissionSerializer

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class ExamSubjectConfigViewSet(viewsets.ModelViewSet):
    """
    পরীক্ষার বিষয়ভিত্তিক পূর্ণমান ও পাশ নম্বর নির্ধারণ।
    """
    queryset = ExamSubjectConfig.objects.select_related('exam', 'subject').all()
    serializer_class = ExamSubjectConfigSerializer
    permission_classes = [IsPrincipal]


class MarksEntryViewSet(viewsets.GenericViewSet):
    permission_classes = [IsTeacherOrPrincipal]

    @action(detail=False, methods=['get'], url_path='mark-sheet')
    def get_mark_sheet(self, request):
        exam_id = request.query_params.get('exam')
        subject_id = request.query_params.get('subject')
        section_id = request.query_params.get('section')

        if not exam_id or not subject_id or not section_id:
            return Response({"success": False, "message": "exam, subject এবং section প্যারামিটার প্রয়োজন।"}, status=status.HTTP_400_BAD_REQUEST)

        exam = Exam.objects.filter(id=exam_id).first()
        section = AcademicSection.objects.filter(id=section_id).first()
        subject = Subject.objects.filter(id=subject_id).first()
        if not exam or not section or not subject:
            return Response(
                {"success": False, "message": "পরীক্ষা, বিষয় অথবা শাখা খুঁজে পাওয়া যায়নি।"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if section.class_level != exam.class_level or section.session != exam.session:
            return Response(
                {"success": False, "message": "এই শাখাটি পরীক্ষার অন্তর্ভুক্ত নয়।"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not ExamSubjectConfig.objects.filter(exam=exam, subject=subject).exists():
            return Response(
                {"success": False, "message": "এই বিষয়টি পরীক্ষার জন্য কনফিগার করা হয়নি।"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if request.user.role == User.Role.TEACHER and section.in_charge_teacher_id != request.user.id:
            raise PermissionDenied("শুধুমাত্র নিজের দায়িত্বপ্রাপ্ত শাখার mark sheet দেখা যাবে।")

        students = StudentProfile.objects.filter(section=section, user__is_active=True).select_related('user').order_by('roll_number')
        existing_marks = {
            m.student_id: m
            for m in SubjectMarksEntry.objects.filter(exam_id=exam_id, subject_id=subject_id, section_id=section_id)
        }

        sheet = []
        for s in students:
            m = existing_marks.get(s.id)
            sheet.append({
                "student_id": str(s.id),
                "student_unique_id": s.student_unique_id,
                "roll_number": s.roll_number,
                "student_name": s.user.get_full_name() or s.user.username,
                "cq_marks": float(m.cq_marks) if m else 0.0,
                "mcq_marks": float(m.mcq_marks) if m else 0.0,
                "practical_marks": float(m.practical_marks) if m else 0.0,
                "tutorial_marks": float(m.tutorial_marks) if m else 0.0,
                "final_total_marks": float(m.final_total_marks) if m else 0.0,
                "grade_letter": m.grade_letter if m else 'N/A',
                "is_absent": m.is_absent if m else False,
            })

        return Response({
            "success": True,
            "total_students": len(sheet),
            "students": sheet
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='bulk-save')
    def bulk_save_marks(self, request):
        serializer = BulkSubjectMarksEntrySerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        saved = serializer.save_marks(teacher_user=request.user)

        return Response({
            "success": True,
            "message": f"মোট {len(saved)} জন শিক্ষার্থীর নম্বর ও গ্রেড সফলভাবে হিসাব করে সংরক্ষণ করা হয়েছে।",
            "saved_count": len(saved)
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='save-cocurricular')
    def save_cocurricular(self, request):
        serializer = BulkCoCurricularEntrySerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        saved = serializer.save_co_curricular()

        return Response({
            "success": True,
            "message": f"মোট {len(saved)} জন শিক্ষার্থীর সহ-পাঠ্যক্রমিক কার্যক্রম ফলাফল সফলভাবে তৈরি করা হয়েছে।",
            "saved_count": len(saved)
        }, status=status.HTTP_200_OK)


class StudentExamResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StudentExamResult.objects.select_related('exam', 'student', 'student__user', 'section').all()
    serializer_class = StudentExamResultSerializer

    def get_permissions(self):
        if self.action == 'process_result':
            return [IsPrincipal()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile, exam__is_published=True)

        if user.role == User.Role.TEACHER:
            return queryset.filter(section__in_charge_teacher=user)

        exam_id = self.request.query_params.get('exam')
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)

        section_id = self.request.query_params.get('section')
        if section_id:
            queryset = queryset.filter(section_id=section_id)

        return queryset

    @action(detail=False, methods=['post'], url_path='process')
    @transaction.atomic
    def process_result(self, request):
        serializer = ResultProcessRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exam_id = serializer.validated_data['exam_id']
        section_id = serializer.validated_data.get('section_id')

        exam = Exam.objects.get(id=exam_id)
        students_qs = StudentProfile.objects.filter(
            section__class_level=exam.class_level,
            section__session=exam.session,
            user__is_active=True,
        )

        if section_id:
            students_qs = students_qs.filter(section_id=section_id)

        working_days = StudentAttendance.objects.filter(
            section__class_level=exam.class_level,
            section__session=exam.session,
            date__range=[exam.start_date, exam.end_date]
        ).values('date').distinct().count()

        config_full_marks = sum(
            config.full_marks for config in exam.subject_configs.all()
        ) + Decimal('124.00')
        attendance_prefetch = Prefetch(
            'attendances',
            queryset=StudentAttendance.objects.filter(
                date__range=[exam.start_date, exam.end_date]
            ),
            to_attr='exam_attendance',
        )
        students = list(
            students_qs.select_related('section').prefetch_related(
                Prefetch(
                    'subject_marks',
                    queryset=SubjectMarksEntry.objects.filter(exam=exam).select_related('subject'),
                    to_attr='exam_marks',
                ),
                Prefetch(
                    'cocurricular_entries',
                    queryset=CoCurricularEntry.objects.filter(exam=exam),
                    to_attr='exam_cocurricular',
                ),
                attendance_prefetch,
            )
        )
        existing_results = {
            result.student_id: result
            for result in StudentExamResult.objects.filter(exam=exam, student_id__in=[s.id for s in students])
        }
        to_create = []
        to_update = []
        processed_results = []
        for student in students:
            marks_entries = student.exam_marks
            cocurricular = student.exam_cocurricular[0] if student.exam_cocurricular else None

            total_obtained = sum(m.final_total_marks for m in marks_entries)
            failed_subjects = [m.subject.name for m in marks_entries if not m.is_passed]

            if cocurricular:
                total_obtained += cocurricular.total_marks
                if cocurricular.grade_letter == 'F':
                    failed_subjects.append('Co-curricular Activity')

            failed_count = len(failed_subjects)

            if failed_count > 0:
                is_passed = False
                final_gpa = Decimal('0.00')
                overall_grade = 'F'
            else:
                is_passed = True
                total_gp = sum(m.grade_point for m in marks_entries)
                total_subjects_count = len(marks_entries)

                if cocurricular:
                    total_gp += cocurricular.grade_point
                    total_subjects_count += 1

                final_gpa = round(Decimal(total_gp) / Decimal(total_subjects_count), 2) if total_subjects_count > 0 else Decimal('0.00')

                if final_gpa >= Decimal('5.00'):
                    overall_grade = 'A+'
                elif final_gpa >= Decimal('4.00'):
                    overall_grade = 'A'
                elif final_gpa >= Decimal('3.50'):
                    overall_grade = 'A-'
                elif final_gpa >= Decimal('3.00'):
                    overall_grade = 'B'
                elif final_gpa >= Decimal('2.00'):
                    overall_grade = 'C'
                elif final_gpa >= Decimal('1.00'):
                    overall_grade = 'D'
                else:
                    overall_grade = 'F'

            present_days = sum(
                attendance.status in [
                    StudentAttendance.AttendanceStatus.PRESENT,
                    StudentAttendance.AttendanceStatus.LATE,
                ]
                for attendance in student.exam_attendance
            )
            absent_days = sum(
                attendance.status == StudentAttendance.AttendanceStatus.ABSENT
                for attendance in student.exam_attendance
            )

            result_obj = existing_results.get(student.id)
            result_values = {
                    'section': student.section,
                    'total_full_marks': config_full_marks,
                    'total_obtained_marks': total_obtained,
                    'gpa': final_gpa,
                    'grade_letter': overall_grade,
                    'is_passed': is_passed,
                    'failed_subjects_count': failed_count,
                    'failed_subject_names': ", ".join(failed_subjects),
                    'working_days': working_days,
                    'present_days': present_days,
                    'absent_days': absent_days,
                    'section_position': None,
                    'class_position': None,
                }
            if result_obj:
                for field, value in result_values.items():
                    setattr(result_obj, field, value)
                to_update.append(result_obj)
            else:
                result_obj = StudentExamResult(
                    exam=exam,
                    student=student,
                    processed_at=timezone.now(),
                    **result_values,
                )
                to_create.append(result_obj)
            processed_results.append(result_obj)

        if to_create:
            StudentExamResult.objects.bulk_create(to_create)
        if to_update:
            StudentExamResult.objects.bulk_update(
                to_update,
                fields=[
                    'section', 'total_full_marks', 'total_obtained_marks', 'gpa',
                    'grade_letter', 'is_passed', 'failed_subjects_count',
                    'failed_subject_names', 'working_days', 'present_days',
                    'absent_days', 'section_position', 'class_position',
                ],
            )

        passed_in_class = StudentExamResult.objects.filter(
            exam=exam,
            is_passed=True
        ).order_by('-gpa', '-total_obtained_marks', 'student__roll_number')

        ranked_results = []
        for idx, res in enumerate(passed_in_class, start=1):
            res.class_position = idx
            ranked_results.append(res)
        if ranked_results:
            StudentExamResult.objects.bulk_update(ranked_results, ['class_position'])

        passed_by_section = {}
        for result in StudentExamResult.objects.filter(
            exam=exam,
            section__class_level=exam.class_level,
            section__session=exam.session,
            is_passed=True,
        ).select_related('section', 'student').order_by(
            'section_id', '-gpa', '-total_obtained_marks', 'student__roll_number'
        ):
            passed_by_section.setdefault(result.section_id, []).append(result)

        section_ranked_results = []
        for passed_in_sec in passed_by_section.values():
            for idx, res in enumerate(passed_in_sec, start=1):
                res.section_position = idx
                section_ranked_results.append(res)
        if section_ranked_results:
            StudentExamResult.objects.bulk_update(section_ranked_results, ['section_position'])

        total_passed = len(passed_in_class)
        return Response({
            "success": True,
            "message": f"{exam.name} এর ফলাফল ও মেধা তালিকা সফলভাবে প্রসেস করা হয়েছে।",
            "total_processed": len(processed_results),
            "total_passed": total_passed,
            "total_failed": len(processed_results) - total_passed
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-result')
    def my_result(self, request):
        if request.user.role != User.Role.STUDENT or not hasattr(request.user, 'student_profile'):
            return Response({"success": False, "message": "শুধুমাত্র শিক্ষার্থীরা এই রেজাল্ট দেখতে পারে।"}, status=status.HTTP_403_FORBIDDEN)

        exam_id = request.query_params.get('exam')
        if not exam_id:
            return Response({"success": False, "message": "exam প্যারামিটার প্রদান করা আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        result = StudentExamResult.objects.filter(
            exam_id=exam_id,
            student=request.user.student_profile,
            exam__is_published=True
        ).first()

        if not result:
            return Response({"success": False, "message": "ফলাফল এখনো প্রকাশিত হয়নি অথবা খুঁজে পাওয়া যায়নি।"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "success": True,
            "data": StudentExamResultSerializer(result).data
        }, status=status.HTTP_200_OK)


class ExaminationReportsViewSet(viewsets.ViewSet):
    """
    পিডিএফ ও প্রিন্ট রিপোর্টের জন্য ডেডিকেটেড অ্যানালিটিক্স ও মার্কশিট ভিউসেট।
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='progress-report')
    def progress_report(self, request):
        exam_id = request.query_params.get('exam')
        student_id = request.query_params.get('student')
        user = request.user

        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            student_id = str(user.student_profile.id)

        if not exam_id or not student_id:
            return Response(
                {"success": False, "message": "exam এবং student আইডি প্রদান করা আবশ্যক।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            exam = Exam.objects.get(id=exam_id)
            student = StudentProfile.objects.select_related('user', 'section').get(id=student_id)
        except (Exam.DoesNotExist, StudentProfile.DoesNotExist):
            return Response({"success": False, "message": "পরীক্ষা অথবা শিক্ষার্থী খুঁজে পাওয়া যায়নি।"}, status=status.HTTP_404_NOT_FOUND)

        overall_result = StudentExamResult.objects.filter(exam=exam, student=student).first()
        subject_entries = SubjectMarksEntry.objects.filter(exam=exam, student=student).select_related('subject')

        subject_rows = []
        for entry in subject_entries:
            highest_mark = SubjectMarksEntry.objects.filter(
                exam=exam,
                subject=entry.subject,
                section__class_level=exam.class_level,
                section__session=exam.session,
            ).aggregate(max_mark=Max('final_total_marks'))['max_mark'] or Decimal('0.00')

            subject_rows.append({
                "subject_name": entry.subject.name,
                "subject_code": entry.subject.code,
                "full_marks": float(
                    exam.subject_configs.filter(subject=entry.subject).values_list(
                        'full_marks', flat=True
                    ).first() or Decimal('0.00')
                ),
                "cq": float(entry.cq_marks),
                "mcq": float(entry.mcq_marks),
                "practical": float(entry.practical_marks),
                "semester_obtained": float(entry.obtained_semester_marks),
                "semester_converted": float(entry.converted_semester_marks),
                "tutorial": float(entry.tutorial_marks),
                "total_marks": float(entry.final_total_marks),
                "letter_grade": entry.grade_letter,
                "grade_point": float(entry.grade_point),
                "highest_marks": float(highest_mark),
            })

        cocurricular = CoCurricularEntry.objects.filter(exam=exam, student=student).first()
        cocurricular_highest = CoCurricularEntry.objects.filter(
            exam=exam,
            section__class_level=exam.class_level,
            section__session=exam.session,
        ).aggregate(max_cocurr=Max('total_marks'))['max_cocurr'] or Decimal('0.00')

        cocurricular_data = {
            "title": "Co-curricular Activity",
            "full_marks": 124.0,
            "attn": float(cocurricular.attendance_marks) if cocurricular else 0.0,
            "ethics": float(cocurricular.ethics_marks) if cocurricular else 0.0,
            "total_marks": float(cocurricular.total_marks) if cocurricular else 0.0,
            "converted": float(cocurricular.total_marks) if cocurricular else 0.0,
            "letter_grade": cocurricular.grade_letter if cocurricular else 'F',
            "grade_point": float(cocurricular.grade_point) if cocurricular else 0.0,
            "highest_marks": float(cocurricular_highest),
        }

        summary_data = {
            "working_days": overall_result.working_days if overall_result else 0,
            "present_days": overall_result.present_days if overall_result else 0,
            "absent_days": overall_result.absent_days if overall_result else 0,
            "total_marks": float(overall_result.total_full_marks) if overall_result else 824.0,
            "total_obtained": float(overall_result.total_obtained_marks) if overall_result else 0.0,
            "grade": overall_result.grade_letter if overall_result else 'F',
            "gpa": float(overall_result.gpa) if overall_result else 0.00,
            "section_position": overall_result.section_position if overall_result else None,
            "class_position": overall_result.class_position if overall_result else None,
        }

        return Response({
            "success": True,
            "institution": {
                "name": "STARLIGHT COLLEGE",
                "address": "Sunargown R/A, Dokshin surma, Sylhet",
                "eiin": "135342",
            },
            "exam_info": {
                "report_title": "Progress Report",
                "exam_name": exam.name,
                "session": exam.session,
            },
            "student_info": {
                "student_name": student.user.get_full_name() or student.user.username,
                "student_id": student.student_unique_id,
                "student_roll": student.roll_number,
                "version": "Bangla",
                "class_level": student.section.get_class_level_display(),
                "section": student.section.section_name,
                "gender": student.get_gender_display(),
                "group": student.section.get_group_display(),
            },
            "grading_scale": [
                {"mark_range": "80-100", "letter_grade": "A+", "grade_point": 5.0},
                {"mark_range": "70-79", "letter_grade": "A", "grade_point": 4.0},
                {"mark_range": "60-69", "letter_grade": "A-", "grade_point": 3.5},
                {"mark_range": "50-59", "letter_grade": "B", "grade_point": 3.0},
                {"mark_range": "40-49", "letter_grade": "C", "grade_point": 2.0},
                {"mark_range": "33-39", "letter_grade": "D", "grade_point": 1.0},
                {"mark_range": "00-32", "letter_grade": "F", "grade_point": 0.0},
            ],
            "subjects": subject_rows,
            "co_curricular": cocurricular_data,
            "overall_summary": summary_data,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='subject-analysis')
    def subject_analysis(self, request):
        exam_id = request.query_params.get('exam')
        group = request.query_params.get('group')

        if not exam_id:
            return Response({"success": False, "message": "exam আইডি প্রদান করা আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        exam = Exam.objects.get(id=exam_id)
        subjects_qs = Subject.objects.filter(exam_configs__exam=exam).distinct()
        if group:
            subjects_qs = subjects_qs.filter(group=group.upper())

        analysis_rows = []
        for idx, subj in enumerate(subjects_qs, start=1):
            entries = SubjectMarksEntry.objects.filter(exam_id=exam_id, subject=subj)
            total_students = entries.count()

            if total_students > 0:
                passed_count = entries.filter(is_passed=True).count()
                failed_count = entries.filter(is_passed=False).count()
                pass_pct = round((passed_count / total_students) * 100.0, 2)
                fail_pct = round((failed_count / total_students) * 100.0, 2)
            else:
                passed_count, failed_count, pass_pct, fail_pct = 0, 0, 0.0, 0.0

            analysis_rows.append({
                "sl": idx,
                "subject_name": subj.name,
                "subject_code": subj.code,
                "total_students": total_students,
                "number_of_student_passed": passed_count,
                "pass_percentage": f"{pass_pct}%",
                "number_of_student_failed": failed_count,
                "failed_percentage": f"{fail_pct}%",
            })

        return Response({
            "success": True,
            "report_title": "SUBJECT WISE RESULT ANALYSIS",
            "exam_id": exam_id,
            "data": analysis_rows,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='failed-statistics')
    def failed_statistics(self, request):
        exam_id = request.query_params.get('exam')
        gender = request.query_params.get('gender', 'MALE').upper()

        if not exam_id:
            return Response({"success": False, "message": "exam আইডি প্রদান করা আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        failed_results = StudentExamResult.objects.filter(
            exam_id=exam_id,
            is_passed=False,
            student__gender=gender
        ).select_related('student', 'student__user').order_by('student__roll_number')

        failed_rows = []
        for idx, res in enumerate(failed_results, start=1):
            failed_rows.append({
                "sl": idx,
                "student_name": res.student.user.get_full_name() or res.student.user.username,
                "student_id": res.student.student_unique_id,
                "roll": res.student.roll_number,
                "failed_subjects": res.failed_subject_names,
                "total_failed_count": res.failed_subjects_count,
            })

        gender_label = "ছাত্র-সকল গ্রুপ" if gender == 'MALE' else "ছাত্রী-সকল গ্রুপ"

        return Response({
            "success": True,
            "report_title": f"বিষয় ভিত্তিক অকৃতকার্য বিবরণী ({gender_label})",
            "gender": gender,
            "total_failed_students": len(failed_rows),
            "data": failed_rows,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='merit-list')
    def merit_list(self, request):
        exam_id = request.query_params.get('exam')
        section_id = request.query_params.get('section')

        if not exam_id:
            return Response({"success": False, "message": "exam আইডি প্রদান করা আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        passed_results = StudentExamResult.objects.filter(
            exam_id=exam_id,
            is_passed=True
        ).select_related('student', 'student__user', 'section').order_by('class_position')

        if section_id:
            passed_results = passed_results.filter(section_id=section_id).order_by('section_position')

        merit_rows = []
        for idx, res in enumerate(passed_results, start=1):
            merit_rows.append({
                "sl": idx,
                "student_name": res.student.user.get_full_name() or res.student.user.username,
                "student_id": res.student.student_unique_id,
                "roll": res.student.roll_number,
                "section": res.section.section_name,
                "sub_total_full": float(res.total_full_marks),
                "obtained_marks": float(res.total_obtained_marks),
                "grade": res.grade_letter,
                "gpa": float(res.gpa),
                "section_position": res.section_position,
                "class_position": res.class_position,
            })

        return Response({
            "success": True,
            "report_title": "OFFICIAL MERIT LIST",
            "total_passed": len(merit_rows),
            "data": merit_rows,
        }, status=status.HTTP_200_OK)