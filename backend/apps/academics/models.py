from datetime import time
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from apps.common.models import BaseModel
from apps.users_auth.models import User
from django.utils import timezone

class AcademicSection(BaseModel):
    """
    কলেজের শ্রেণি, বিভাগ, শাখা ও শিক্ষাবর্ষ এবং শ্রেণি ইনচার্জের মডেল।
    """
    class ClassLevel(models.TextChoices):
        XI = 'XI', 'একাদশ শ্রেণি (1st Year)'
        XII = 'XII', 'দ্বাদশ শ্রেণি (2nd Year)'

    class GroupChoices(models.TextChoices):
        SCIENCE = 'SCI', 'বিজ্ঞান (Science)'
        HUMANITIES = 'HUM', 'মানবিক (Humanities)'
        BUSINESS = 'BUS', 'ব্যবসায় শিক্ষা (Business Studies)'
        GENERAL = 'GEN', 'সাধারণ (General)'

    class_level = models.CharField(max_length=10, choices=ClassLevel.choices, db_index=True)
    group = models.CharField(max_length=10, choices=GroupChoices.choices, db_index=True)
    section_name = models.CharField(max_length=30, default='A', help_text="যেমন: A, B বা ক, খ")
    session = models.CharField(max_length=20, db_index=True, help_text="যেমন: 2025-2026")
    
    in_charge_teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incharge_sections',
        limit_choices_to={'role': User.Role.TEACHER},
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Academic Section'
        verbose_name_plural = 'Academic Sections'
        unique_together = ('class_level', 'group', 'section_name', 'session')
        ordering = ['class_level', 'group', 'section_name']

    def clean(self):
        if self.in_charge_teacher and self.in_charge_teacher.role != User.Role.TEACHER:
            raise ValidationError("শুধুমাত্র শিক্ষক রোলের ইউজারকেই শ্রেণি ইনচার্জ করা যাবে।")

    def __str__(self):
        return f"{self.get_class_level_display()} | {self.get_group_display()} ({self.section_name}) [{self.session}]"


class Subject(BaseModel):
    """
    কলেজের পাঠ্য বিষয় (Subject) মডেল।
    উদাহরণ: Physics 1st Paper (Code: 174), Chemistry, Bangla ইত্যাদি।
    """
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, db_index=True, help_text="যেমন: 174, 175, 101")
    class_level = models.CharField(max_length=10, choices=AcademicSection.ClassLevel.choices, db_index=True)
    group = models.CharField(max_length=10, choices=AcademicSection.GroupChoices.choices, db_index=True)
    
    default_teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_subjects',
        limit_choices_to={'role': User.Role.TEACHER},
        help_text="এই বিষয়ের প্রধান শিক্ষক"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Subject'
        verbose_name_plural = 'Subjects'
        unique_together = ('code', 'class_level')
        ordering = ['class_level', 'group', 'code']

    def __str__(self):
        return f"{self.name} ({self.code}) - {self.get_class_level_display()}"


class ClassRoutine(BaseModel):
    """
    ক্লাস রুটিন ও পিরিয়ড শিডিউল মডেল।
    অটোমেটিক কনফ্লিক্ট চেকিং নিশ্চিত করবে যাতে একই সময় শিক্ষকের ডাবল শিডিউল বা ক্লাসরুমের সংঘাত না হয়।
    """
    class DayOfWeek(models.IntegerChoices):
        SATURDAY = 0, 'শনিবার (Saturday)'
        SUNDAY = 1, 'রবিবার (Sunday)'
        MONDAY = 2, 'সোমবার (Monday)'
        TUESDAY = 3, 'মঙ্গলবার (Tuesday)'
        WEDNESDAY = 4, 'বুধবার (Wednesday)'
        THURSDAY = 5, 'বৃহস্পতিবার (Thursday)'
        FRIDAY = 6, 'শুক্রবার (Friday)'

    section = models.ForeignKey(AcademicSection, on_delete=models.CASCADE, related_name='routines')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='routines')
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='routine_slots',
        limit_choices_to={'role': User.Role.TEACHER}
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices, db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_number = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        verbose_name = 'Class Routine Slot'
        verbose_name_plural = 'Class Routine Slots'
        ordering = ['day_of_week', 'start_time']

    def clean(self):
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError("ক্লাস শুরুর সময় শেষ সময়ের চেয়ে আগের হতে হবে।")

        # ১. একই সেকশনে একই দিনে কোনো পিরিয়ড ওভারল্যাপ হচ্ছে কি না চেক
        section_conflict = ClassRoutine.objects.filter(
            section=self.section,
            day_of_week=self.day_of_week,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        ).exclude(pk=self.pk)

        if section_conflict.exists():
            raise ValidationError(f"এই শাখার জন্য {self.get_day_of_week_display()} বারে উক্ত সময়ে ইতিমধ্যে একটি পিরিয়ড নির্ধারিত আছে।")

        # ২. একই সময়ে এই শিক্ষকের অন্য কোনো ক্লাসে পিরিয়ড আছে কি না চেক
        teacher_conflict = ClassRoutine.objects.filter(
            teacher=self.teacher,
            day_of_week=self.day_of_week,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        ).exclude(pk=self.pk)

        if teacher_conflict.exists():
            raise ValidationError(f"শিক্ষক {self.teacher.get_full_name()} এর {self.get_day_of_week_display()} বারে উক্ত সময়ে অন্য ক্লাসে ক্লাস রয়েছে।")

    def __str__(self):
        return f"{self.section} | {self.subject.name} | {self.get_day_of_week_display()} ({self.start_time.strftime('%I:%M %p')}-{self.end_time.strftime('%I:%M %p')})"


class Syllabus(BaseModel):
    """
    সিলেবাস বা টার্ম প্ল্যানার ফাইল আপলোড মডেল।
    """
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='syllabi')
    session = models.CharField(max_length=20, db_index=True, help_text="যেমন: 2025-2026")
    title = models.CharField(max_length=200, help_text="যেমন: একাদশ বিজ্ঞান - বার্ষিক পরীক্ষার পূর্ণাঙ্গ সিলেবাস")
    file = models.FileField(upload_to='syllabi/%Y/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = 'Syllabus'
        verbose_name_plural = 'Syllabi'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.subject.name} [{self.session}]"


class Homework(BaseModel):
    """
    দৈনিক ক্লাসের হোমওয়ার্ক বা অ্যাসাইনমেন্ট মডেল।
    """
    section = models.ForeignKey(AcademicSection, on_delete=models.CASCADE, related_name='homeworks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='homeworks')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_homeworks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField(db_index=True)
    attachment = models.FileField(upload_to='homeworks/%Y/%m/', null=True, blank=True)

    class Meta:
        verbose_name = 'Homework'
        verbose_name_plural = 'Homeworks'
        ordering = ['-due_date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.subject.name} ({self.section})"


class StudentAttendance(BaseModel):
    """
    শিক্ষার্থীদের দৈনিক হাজিরা মডেল।
    শ্রেণি ইনচার্জ প্রতিদিন পুরো সেকশনের বাল্ক হাজিরা সাবমিট করবেন।
    """
    class AttendanceStatus(models.TextChoices):
        PRESENT = 'PRESENT', 'উপস্থিত (Present)'
        ABSENT = 'ABSENT', 'অনুপস্থিত (Absent)'
        LATE = 'LATE', 'দেরিতে উপস্থিতি (Late)'
        LEAVE = 'LEAVE', 'ছুটি (On Leave)'

    student = models.ForeignKey(
        'users_auth.StudentProfile',
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    section = models.ForeignKey(
        AcademicSection,
        on_delete=models.CASCADE,
        related_name='student_attendances'
    )
    date = models.DateField(default=timezone.localdate, db_index=True)
    status = models.CharField(
        max_length=10,
        choices=AttendanceStatus.choices,
        default=AttendanceStatus.PRESENT,
        db_index=True
    )
    remarks = models.CharField(max_length=255, blank=True)
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_attendances'
    )

    class Meta:
        verbose_name = 'Student Attendance'
        verbose_name_plural = 'Student Attendances'
        unique_together = ('student', 'date')
        ordering = ['-date', 'student__roll_number']
        indexes = [
            # সেকশন ও তারিখ দিয়ে দ্রুত হাজিরা ফিল্টারিং
            models.Index(fields=['section', 'date']),
            models.Index(fields=['student', 'status']),
        ]

    def __str__(self):
        return f"[{self.date}] {self.student.roll_number} - {self.student.user.get_full_name()} ({self.status})"


class AcademicHoliday(BaseModel):
    """
    একাডেমিক ক্যালেন্ডারের ছুটির দিন ও শুক্রবার সেটআপ।
    """
    class HolidayType(models.TextChoices):
        GOVERNMENT = 'GOVERNMENT', 'সরকারি ছুটি (Government Holiday)'
        WEEKEND = 'WEEKEND', 'সাপ্তাহিক ছুটি/শুক্রবার (Weekend)'
        RELIGIOUS = 'RELIGIOUS', 'ধর্মীয় উৎসব (Religious Festival)'
        COLLEGE = 'COLLEGE', 'কলেজ নিজস্ব ছুটি (College Authority)'

    title = models.CharField(max_length=150, help_text="যেমন: মহান বিজয় দিবস, পবিত্র ঈদুল ফিতর")
    holiday_type = models.CharField(max_length=20, choices=HolidayType.choices, default=HolidayType.GOVERNMENT)
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    is_attendance_locked = models.BooleanField(default=True, help_text="এই দিনে কোনো শিক্ষক বা শিক্ষার্থী হাজিরা দিতে পারবে না")

    class Meta:
        verbose_name = 'Academic Holiday'
        verbose_name_plural = 'Academic Holidays'
        ordering = ['start_date']

    def __str__(self):
        return f"{self.title} ({self.start_date} to {self.end_date})"