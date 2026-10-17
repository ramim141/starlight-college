from django.contrib import admin
from apps.academics.models import (
    AcademicSection,
    ClassRoutine,
    Homework,
    Subject,
    Syllabus,
    StudentAttendance,
)
from apps.academics.models import AcademicHoliday

@admin.register(AcademicSection)
class AcademicSectionAdmin(admin.ModelAdmin):
    list_display = ('class_level', 'group', 'section_name', 'session', 'in_charge_teacher', 'is_active')
    list_filter = ('class_level', 'group', 'session', 'is_active')
    search_fields = ('section_name', 'session', 'in_charge_teacher__first_name')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'class_level', 'group', 'default_teacher', 'is_active')
    list_filter = ('class_level', 'group', 'is_active')
    search_fields = ('name', 'code')

@admin.register(ClassRoutine)
class ClassRoutineAdmin(admin.ModelAdmin):
    list_display = ('section', 'subject', 'teacher', 'day_of_week', 'start_time', 'end_time', 'room_number')
    list_filter = ('day_of_week', 'section__class_level', 'section__group')
    search_fields = ('subject__name', 'teacher__first_name', 'room_number')

@admin.register(Syllabus)
class SyllabusAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'session', 'uploaded_by', 'created_at')
    list_filter = ('session', 'subject__class_level')
    search_fields = ('title', 'subject__name')

@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'subject', 'teacher', 'due_date', 'created_at')
    list_filter = ('due_date', 'section__class_level', 'subject')
    search_fields = ('title', 'description', 'teacher__username')

@admin.register(StudentAttendance)
class StudentAttendanceAdmin(admin.ModelAdmin):
    list_display = ('date', 'student', 'section', 'status', 'recorded_by', 'created_at')
    list_filter = ('date', 'status', 'section__class_level', 'section__group')
    search_fields = ('student__student_unique_id', 'student__user__first_name', 'student__roll_number')
    date_hierarchy = 'date'


@admin.register(AcademicHoliday)
class AcademicHolidayAdmin(admin.ModelAdmin):
    list_display = ('title', 'holiday_type', 'start_date', 'end_date', 'is_attendance_locked')
    list_filter = ('holiday_type', 'is_attendance_locked')
    search_fields = ('title',)