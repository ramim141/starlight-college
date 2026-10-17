from decimal import Decimal
from django.db import transaction
from rest_framework import serializers

from apps.academics.models import AcademicSection, StudentAttendance, Subject
from apps.examination.models import (
    CoCurricularEntry,
    Exam,
    ExamSubjectConfig,
    SubjectMarksEntry,
    StudentExamResult,
)
from apps.examination.models import (
    ExamRoom,
    ExamSeatAssignment,
    InvigilationDuty,
    QuestionPaperSubmission,
)
from apps.users_auth.models import StudentProfile, User
from apps.common.validators import validate_upload

class ExamSerializer(serializers.ModelSerializer):
    class_level_display = serializers.CharField(source='get_class_level_display', read_only=True)
    exam_type_display = serializers.CharField(source='get_exam_type_display', read_only=True)

    class Meta:
        model = Exam
        fields = [
            'id',
            'name',
            'exam_type',
            'exam_type_display',
            'session',
            'class_level',
            'class_level_display',
            'start_date',
            'end_date',
            'has_tutorial_conversion',
            'exam_weight_percentage',
            'tutorial_weight_percentage',
            'is_published',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ExamSubjectConfigSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = ExamSubjectConfig
        fields = [
            'id',
            'exam',
            'subject',
            'subject_name',
            'subject_code',
            'full_marks',
            'cq_full_marks',
            'mcq_full_marks',
            'practical_full_marks',
            'tutorial_full_marks',
            'pass_marks',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class SingleStudentMarkItemSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    cq_marks = serializers.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    mcq_marks = serializers.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    practical_marks = serializers.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    tutorial_marks = serializers.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    is_absent = serializers.BooleanField(default=False)


class BulkSubjectMarksEntrySerializer(serializers.Serializer):
    """
    বিষয়ভিত্তিক শিক্ষক কর্তৃক ক্লাসের সব স্টুডেন্টের CQ, MCQ, Practical, Tutorial এক ক্লিকে এন্ট্রি করার সিরিয়ালাইজার।
    """
    exam_id = serializers.UUIDField()
    subject_id = serializers.UUIDField()
    section_id = serializers.UUIDField()
    marks_list = SingleStudentMarkItemSerializer(many=True)

    def validate(self, attrs):
        try:
            exam = Exam.objects.get(id=attrs['exam_id'])
        except Exam.DoesNotExist:
            raise serializers.ValidationError({"exam_id": "প্রদত্ত পরীক্ষাটি খুঁজে পাওয়া যায়নি।"})
        try:
            subject = Subject.objects.get(id=attrs['subject_id'])
        except Subject.DoesNotExist:
            raise serializers.ValidationError({"subject_id": "প্রদত্ত বিষয়টি খুঁজে পাওয়া যায়নি।"})
        try:
            section = AcademicSection.objects.get(id=attrs['section_id'])
        except AcademicSection.DoesNotExist:
            raise serializers.ValidationError({"section_id": "প্রদত্ত শ্রেণি/শাখাটি খুঁজে পাওয়া যায়নি।"})

        if section.class_level != exam.class_level or section.session != exam.session:
            raise serializers.ValidationError({"section_id": "এই শাখাটি পরীক্ষার শ্রেণি বা সেশনের অন্তর্ভুক্ত নয়।"})
        try:
            config = ExamSubjectConfig.objects.get(exam=exam, subject=subject)
        except ExamSubjectConfig.DoesNotExist:
            raise serializers.ValidationError({"subject_id": "এই বিষয়টি পরীক্ষার জন্য কনফিগার করা হয়নি।"})

        if self.context.get('request') and self.context['request'].user.role == User.Role.TEACHER:
            if section.in_charge_teacher_id != self.context['request'].user.id:
                raise serializers.ValidationError({"section_id": "শুধুমাত্র নিজের দায়িত্বপ্রাপ্ত শাখার নম্বর এন্ট্রি করা যাবে।"})

        for item in attrs['marks_list']:
            student = StudentProfile.objects.filter(
                id=item['student_id'], section=section, user__is_active=True
            ).first()
            if not student:
                raise serializers.ValidationError({"marks_list": "তালিকার সব শিক্ষার্থী নির্বাচিত শাখার অন্তর্ভুক্ত হতে হবে।"})
            limits = {
                'cq_marks': config.cq_full_marks,
                'mcq_marks': config.mcq_full_marks,
                'practical_marks': config.practical_full_marks,
                'tutorial_marks': config.tutorial_full_marks,
            }
            for field, maximum in limits.items():
                if item[field] < 0 or item[field] > maximum:
                    raise serializers.ValidationError({
                        "marks_list": f"{field} এর নম্বর ০ থেকে {maximum} এর মধ্যে হতে হবে।"
                    })
        return attrs

    @transaction.atomic
    def save_marks(self, teacher_user):
        exam = Exam.objects.get(id=self.validated_data['exam_id'])
        subject = Subject.objects.get(id=self.validated_data['subject_id'])
        section = AcademicSection.objects.get(id=self.validated_data['section_id'])
        marks_list = self.validated_data['marks_list']

        saved_entries = []
        for item in marks_list:
            entry, _ = SubjectMarksEntry.objects.update_or_create(
                exam=exam,
                subject=subject,
                student_id=item['student_id'],
                defaults={
                    'section': section,
                    'cq_marks': item.get('cq_marks', Decimal('0.00')),
                    'mcq_marks': item.get('mcq_marks', Decimal('0.00')),
                    'practical_marks': item.get('practical_marks', Decimal('0.00')),
                    'tutorial_marks': item.get('tutorial_marks', Decimal('0.00')),
                    'is_absent': item.get('is_absent', False),
                    'entered_by': teacher_user,
                }
            )
            saved_entries.append(entry)

        return saved_entries


class SingleEthicsItemSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    ethics_marks = serializers.DecimalField(max_digits=6, decimal_places=2, default=0.00)


class BulkCoCurricularEntrySerializer(serializers.Serializer):
    """
    শ্রেণি ইনচার্জ কর্তৃক Co-curricular নম্বর তৈরি:
    হাজিরা স্বয়ংক্রিয়ভাবে ডিজিটাল হাজিরা থেকে ক্যালকুলেট হবে এবং ইনচার্জের পাঠানো Ethics নম্বর যুক্ত হবে।
    """
    exam_id = serializers.UUIDField()
    section_id = serializers.UUIDField()
    ethics_list = SingleEthicsItemSerializer(many=True)

    def validate(self, attrs):
        try:
            exam = Exam.objects.get(id=attrs['exam_id'])
        except Exam.DoesNotExist:
            raise serializers.ValidationError({"exam_id": "প্রদত্ত পরীক্ষাটি খুঁজে পাওয়া যায়নি।"})
        try:
            section = AcademicSection.objects.get(id=attrs['section_id'])
        except AcademicSection.DoesNotExist:
            raise serializers.ValidationError({"section_id": "প্রদত্ত শ্রেণি/শাখাটি খুঁজে পাওয়া যায়নি।"})

        if section.class_level != exam.class_level or section.session != exam.session:
            raise serializers.ValidationError({"section_id": "এই শাখাটি পরীক্ষার শ্রেণি বা সেশনের অন্তর্ভুক্ত নয়।"})

        request = self.context.get('request')
        if request and request.user.role == User.Role.TEACHER:
            if section.in_charge_teacher_id != request.user.id:
                raise serializers.ValidationError({
                    "section_id": "শুধুমাত্র নিজের দায়িত্বপ্রাপ্ত শাখার নম্বর এন্ট্রি করা যাবে।"
                })

        for item in attrs['ethics_list']:
            if not StudentProfile.objects.filter(
                id=item['student_id'], section=section, user__is_active=True
            ).exists():
                raise serializers.ValidationError({
                    "ethics_list": "তালিকার সব শিক্ষার্থী নির্বাচিত শাখার অন্তর্ভুক্ত হতে হবে।"
                })
        return attrs

    @transaction.atomic
    def save_co_curricular(self):
        exam = Exam.objects.get(id=self.validated_data['exam_id'])
        section = AcademicSection.objects.get(id=self.validated_data['section_id'])
        ethics_list = self.validated_data['ethics_list']

        # পরীক্ষার সময়সীমার মধ্যকার মোট কার্যদিবস ও উপস্থিতির তথ্য সংগ্রহ
        total_days = StudentAttendance.objects.filter(
            section=section,
            date__range=[exam.start_date, exam.end_date]
        ).values('date').distinct().count()

        saved_entries = []
        for item in ethics_list:
            student = StudentProfile.objects.get(id=item['student_id'])
            
            # ডিজিটাল হাজিরা থেকে স্বয়ংক্রিয় উপস্থিতি গণনা
            if total_days > 0:
                present_days = StudentAttendance.objects.filter(
                    student=student,
                    date__range=[exam.start_date, exam.end_date],
                    status__in=[StudentAttendance.AttendanceStatus.PRESENT, StudentAttendance.AttendanceStatus.LATE]
                ).count()
                # সর্বোচ্চ ৬০ নম্বরের মধ্যে হাজিরার স্কেলিং
                calculated_attn = round((Decimal(present_days) / Decimal(total_days)) * Decimal('60.00'), 1)
            else:
                calculated_attn = Decimal('0.00')

            cocurricular, _ = CoCurricularEntry.objects.update_or_create(
                exam=exam,
                student=student,
                defaults={
                    'section': section,
                    'attendance_marks': calculated_attn,
                    'ethics_marks': item.get('ethics_marks', Decimal('0.00')),
                }
            )
            saved_entries.append(cocurricular)

        return saved_entries

class StudentExamResultSerializer(serializers.ModelSerializer):
    student_unique_id = serializers.CharField(source='student.student_unique_id', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    gender = serializers.CharField(source='student.gender', read_only=True)
    section_name = serializers.CharField(source='section.__str__', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)

    class Meta:
        model = StudentExamResult
        fields = [
            'id',
            'exam',
            'exam_name',
            'student',
            'student_unique_id',
            'roll_number',
            'student_name',
            'gender',
            'section',
            'section_name',
            'total_full_marks',
            'total_obtained_marks',
            'gpa',
            'grade_letter',
            'is_passed',
            'failed_subjects_count',
            'failed_subject_names',
            'section_position',
            'class_position',
            'working_days',
            'present_days',
            'absent_days',
            'processed_at',
        ]
        read_only_fields = '__all__'


class ResultProcessRequestSerializer(serializers.Serializer):
    exam_id = serializers.UUIDField()
    section_id = serializers.UUIDField(required=False, allow_null=True, help_text="খালি রাখলে পুরো ক্লাসের রেজাল্ট প্রসেস হবে")


class ExamRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamRoom
        fields = '__all__'


class ExamSeatAssignmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)

    class Meta:
        model = ExamSeatAssignment
        fields = ['id', 'exam', 'student', 'roll_number', 'student_name', 'room', 'room_number', 'seat_number']


class InvigilationDutySerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)

    class Meta:
        model = InvigilationDuty
        fields = [
            'id', 'exam', 'room', 'room_number', 'teacher', 'teacher_name', 
            'duty_date', 'start_time', 'end_time', 'remarks', 'created_at'
        ]


class QuestionPaperSubmissionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)

    class Meta:
        model = QuestionPaperSubmission
        fields = [
            'id', 'exam', 'subject', 'subject_name', 'teacher', 'teacher_name', 
            'question_file', 'file_password_hint', 'status', 'principal_remarks', 'created_at'
        ]
        read_only_fields = ['id', 'teacher', 'status', 'principal_remarks', 'created_at']

    def validate_question_file(self, value):
        return validate_upload(value, {'.pdf', '.doc', '.docx'}, max_size_mb=10)


class TeacherQuestionPaperSubmissionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)

    class Meta:
        model = QuestionPaperSubmission
        fields = [
            'id', 'exam', 'subject', 'subject_name', 'teacher', 'teacher_name',
            'question_file', 'status', 'principal_remarks', 'created_at'
        ]
        read_only_fields = [
            'id', 'teacher', 'status', 'principal_remarks', 'created_at'
        ]

    def validate_question_file(self, value):
        return validate_upload(value, {'.pdf', '.doc', '.docx'}, max_size_mb=10)