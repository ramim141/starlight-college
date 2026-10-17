from django.contrib import admin
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

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('name', 'exam_type', 'session', 'class_level', 'start_date', 'has_tutorial_conversion', 'is_published')
    list_filter = ('exam_type', 'session', 'class_level', 'is_published')
    search_fields = ('name',)


@admin.register(ExamSubjectConfig)
class ExamSubjectConfigAdmin(admin.ModelAdmin):
    list_display = ('exam', 'subject', 'full_marks', 'cq_full_marks', 'mcq_full_marks', 'practical_full_marks', 'tutorial_full_marks')
    list_filter = ('exam', 'subject__class_level')


@admin.register(SubjectMarksEntry)
class SubjectMarksEntryAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'exam', 'cq_marks', 'mcq_marks', 'practical_marks', 'tutorial_marks', 'final_total_marks', 'grade_letter', 'grade_point', 'is_passed')
    list_filter = ('exam', 'subject', 'grade_letter', 'is_passed')
    search_fields = ('student__student_unique_id', 'student__roll_number', 'student__user__first_name')


@admin.register(CoCurricularEntry)
class CoCurricularEntryAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'attendance_marks', 'ethics_marks', 'total_marks', 'grade_letter', 'grade_point')
    list_filter = ('exam', 'grade_letter')
    search_fields = ('student__student_unique_id', 'student__roll_number')


@admin.register(StudentExamResult)
class StudentExamResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'total_obtained_marks', 'gpa', 'grade_letter', 'is_passed', 'section_position', 'class_position', 'failed_subjects_count')
    list_filter = ('exam', 'grade_letter', 'is_passed', 'section__class_level')
    search_fields = ('student__student_unique_id', 'student__roll_number', 'student__user__first_name')
    ordering = ('-is_passed', '-gpa', '-total_obtained_marks')


@admin.register(ExamRoom)
class ExamRoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'building', 'capacity', 'benches_count', 'is_active')
    search_fields = ('room_number',)


@admin.register(ExamSeatAssignment)
class ExamSeatAssignmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'room', 'seat_number')
    list_filter = ('exam', 'room')
    search_fields = ('student__student_unique_id', 'student__roll_number', 'room__room_number')


@admin.register(InvigilationDuty)
class InvigilationDutyAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'room', 'duty_date', 'start_time', 'end_time', 'exam')
    list_filter = ('duty_date', 'exam')
    search_fields = ('teacher__username', 'room__room_number')


@admin.register(QuestionPaperSubmission)
class QuestionPaperSubmissionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'exam', 'teacher', 'status', 'created_at')
    list_filter = ('status', 'exam')
    search_fields = ('subject__name', 'teacher__username')