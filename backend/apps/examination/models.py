from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from apps.academics.models import AcademicSection, Subject
from apps.common.models import BaseModel
from apps.users_auth.models import StudentProfile, User

class Exam(BaseModel):
    """
    কলেজের মূল পরীক্ষার কনফিগারেশন মডেল।
    """
    class ExamType(models.TextChoices):
        SEMESTER = 'SEMESTER', 'সেমিস্টার পরীক্ষা (Semester Exam)'
        MODEL_TEST = 'MODEL_TEST', 'মডেল টেস্ট (Model Test - No Tutorial)'
        ANNUAL = 'ANNUAL', 'বার্ষিক পরীক্ষা (Annual Exam)'
        PRE_TEST = 'PRE_TEST', 'প্রাক-নির্বাচনী পরীক্ষা (Pre-Test)'
        TEST = 'TEST', 'নির্বাচনী পরীক্ষা (Test Exam)'

    name = models.CharField(max_length=150, help_text="যেমন: 2nd Semester - 2025")
    exam_type = models.CharField(max_length=20, choices=ExamType.choices, default=ExamType.SEMESTER, db_index=True)
    session = models.CharField(max_length=20, db_index=True, help_text="যেমন: 2025-2026")
    class_level = models.CharField(max_length=10, choices=AcademicSection.ClassLevel.choices, db_index=True)
    
    start_date = models.DateField(help_text="পরীক্ষা বা সেমিস্টার শুরুর তারিখ (হাজিরা গণনার জন্য)")
    end_date = models.DateField(help_text="পরীক্ষা শেষের তারিখ")

    # ফ্লেক্সিবল কনভার্সন অপশন (মডেল টেস্টে টিউটোরিয়াল ছাড়া ১০০%, সেমিস্টারে ৮০% + ২০%)
    has_tutorial_conversion = models.BooleanField(
        default=True,
        help_text="টিক দেওয়া থাকলে ৮০% এক্সাম + ২০% টিউটোরিয়াল হবে। আনচেক থাকলে সরাসরি ১০০% এক্সাম নম্বর কাউন্ট হবে।"
    )
    exam_weight_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=80.00)
    tutorial_weight_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=20.00)

    is_published = models.BooleanField(default=False, db_index=True, help_text="টিক দিলে ফলাফল শিক্ষার্থীদের জন্য দৃশ্যমান হবে")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = 'Exam'
        verbose_name_plural = 'Exams'
        ordering = ['-start_date']

    def save(self, *args, **kwargs):
        if self.exam_type == self.ExamType.MODEL_TEST:
            self.has_tutorial_conversion = False
            self.exam_weight_percentage = Decimal('100.00')
            self.tutorial_weight_percentage = Decimal('0.00')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} [{self.get_class_level_display()}] ({self.session})"


class ExamSubjectConfig(BaseModel):
    """
    পরীক্ষায় বিষয়ের পূর্ণমান ও নম্বর বিভাজন (CQ, MCQ, Practical, Tutorial)।
    """
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='subject_configs')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exam_configs')
    
    full_marks = models.DecimalField(max_digits=6, decimal_places=2, default=100.00)
    cq_full_marks = models.DecimalField(max_digits=6, decimal_places=2, default=70.00)
    mcq_full_marks = models.DecimalField(max_digits=6, decimal_places=2, default=30.00)
    practical_full_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    tutorial_full_marks = models.DecimalField(max_digits=6, decimal_places=2, default=20.00)
    pass_marks = models.DecimalField(max_digits=6, decimal_places=2, default=33.00)

    class Meta:
        verbose_name = 'Exam Subject Configuration'
        verbose_name_plural = 'Exam Subject Configurations'
        unique_together = ('exam', 'subject')

    def __str__(self):
        return f"{self.exam.name} - {self.subject.name} (Full: {self.full_marks})"


class SubjectMarksEntry(BaseModel):
    """
    বিষয়ভিত্তিক শিক্ষার্থীদের প্রাপ্ত নম্বর এন্ট্রি টেবিল।
    শিক্ষক একই টেবিলে CQ, MCQ, Practical এবং Tutorial নম্বর এন্ট্রি করবেন।
    """
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='marks_entries')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='marks_entries')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='subject_marks')
    section = models.ForeignKey(AcademicSection, on_delete=models.CASCADE, related_name='subject_marks')
    
    # শিক্ষকের ইনপুট ফিল্ড
    cq_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    mcq_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    practical_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    tutorial_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    is_absent = models.BooleanField(default=False)

    # সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে হিসাবকৃত ফলাফল
    obtained_semester_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00) # CQ + MCQ + Practical
    converted_semester_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00) # 80% (or 100%)
    final_total_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00) # Converted + Tutorial
    
    grade_letter = models.CharField(max_length=5, default='F', db_index=True) # A+, A, A-, B, C, D, F
    grade_point = models.DecimalField(max_digits=4, decimal_places=2, default=0.00) # 5.0, 4.0 ... 0.0
    is_passed = models.BooleanField(default=False, db_index=True)

    entered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = 'Subject Marks Entry'
        verbose_name_plural = 'Subject Marks Entries'
        unique_together = ('exam', 'subject', 'student')
        ordering = ['student__roll_number']

    def calculate_results(self):
        if self.is_absent:
            self.cq_marks = Decimal('0.00')
            self.mcq_marks = Decimal('0.00')
            self.practical_marks = Decimal('0.00')
            self.tutorial_marks = Decimal('0.00')
            self.obtained_semester_marks = Decimal('0.00')
            self.converted_semester_marks = Decimal('0.00')
            self.final_total_marks = Decimal('0.00')
            self.grade_letter = 'F'
            self.grade_point = Decimal('0.00')
            self.is_passed = False
            return

        self.cq_marks = Decimal(str(self.cq_marks or '0.00'))
        self.mcq_marks = Decimal(str(self.mcq_marks or '0.00'))
        self.practical_marks = Decimal(str(self.practical_marks or '0.00'))
        self.tutorial_marks = Decimal(str(self.tutorial_marks or '0.00'))
        config = self.exam.subject_configs.filter(subject=self.subject).first()
        if config is None:
            raise ValidationError("এই বিষয়টির জন্য পরীক্ষার নম্বর কনফিগারেশন পাওয়া যায়নি।")

        # ১. সেমিস্টারের মূল লিখিত ও ব্যবহারিক নম্বর
        self.obtained_semester_marks = self.cq_marks + self.mcq_marks + self.practical_marks

        # ২. কনভার্সন শতকরা হিসাব
        if self.exam.has_tutorial_conversion:
            weight_factor = self.exam.exam_weight_percentage / Decimal('100.00')
            self.converted_semester_marks = round(self.obtained_semester_marks * weight_factor, 1)
            self.final_total_marks = round(self.converted_semester_marks + self.tutorial_marks, 1)
        else:
            self.converted_semester_marks = self.obtained_semester_marks
            self.final_total_marks = self.obtained_semester_marks

        # ৩. কনফিগার করা পূর্ণমানের শতাংশ অনুযায়ী গ্রেড
        total = self.final_total_marks
        percentage = (total / config.full_marks) * Decimal('100.00') if config.full_marks else Decimal('0.00')
        if percentage >= Decimal('80.00'):
            self.grade_letter, self.grade_point = 'A+', Decimal('5.00')
        elif percentage >= Decimal('70.00'):
            self.grade_letter, self.grade_point = 'A', Decimal('4.00')
        elif percentage >= Decimal('60.00'):
            self.grade_letter, self.grade_point = 'A-', Decimal('3.50')
        elif percentage >= Decimal('50.00'):
            self.grade_letter, self.grade_point = 'B', Decimal('3.00')
        elif percentage >= Decimal('40.00'):
            self.grade_letter, self.grade_point = 'C', Decimal('2.00')
        elif percentage >= Decimal('33.00'):
            self.grade_letter, self.grade_point = 'D', Decimal('1.00')
        else:
            self.grade_letter, self.grade_point = 'F', Decimal('0.00')

        self.is_passed = total >= config.pass_marks

    def save(self, *args, **kwargs):
        self.calculate_results()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.roll_number} - {self.subject.name}: {self.final_total_marks} ({self.grade_letter})"


class CoCurricularEntry(BaseModel):
    """
    সহ-পাঠ্যক্রমিক কার্যক্রম (Co-curricular Activity, পূর্ণমান ১২৪):
    Attn (হাজিরা) স্বয়ংক্রিয়ভাবে Sprint 3-এর হাজিরা থেকে আসবে, এবং Ethics ইনচার্জ এন্ট্রি দেবেন।
    """
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='cocurricular_entries')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='cocurricular_entries')
    section = models.ForeignKey(AcademicSection, on_delete=models.CASCADE, related_name='cocurricular_entries')

    attendance_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, help_text="ডিজিটাল হাজিরা থেকে অটো হিসাবকৃত")
    ethics_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, help_text="শ্রেণি ইনচার্জ কর্তৃক প্রদত্ত")
    total_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    
    grade_letter = models.CharField(max_length=5, default='F')
    grade_point = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)

    class Meta:
        verbose_name = 'Co-Curricular Entry'
        verbose_name_plural = 'Co-Curricular Entries'
        unique_together = ('exam', 'student')

    def save(self, *args, **kwargs):
        self.total_marks = round(self.attendance_marks + self.ethics_marks, 2)
        # ১২৪ নম্বরের ওপর ভিত্তি করে শতকরা হিসাব: (প্রাপ্ত নম্বর / ১২৪) * ১০০
        scaled_score = (self.total_marks / Decimal('124.00')) * Decimal('100.00') if self.total_marks > 0 else Decimal('0.00')

        if scaled_score >= Decimal('80.00'):
            self.grade_letter, self.grade_point = 'A+', Decimal('5.00')
        elif scaled_score >= Decimal('70.00'):
            self.grade_letter, self.grade_point = 'A', Decimal('4.00')
        elif scaled_score >= Decimal('60.00'):
            self.grade_letter, self.grade_point = 'A-', Decimal('3.50')
        elif scaled_score >= Decimal('50.00'):
            self.grade_letter, self.grade_point = 'B', Decimal('3.00')
        elif scaled_score >= Decimal('40.00'):
            self.grade_letter, self.grade_point = 'C', Decimal('2.00')
        elif scaled_score >= Decimal('33.00'):
            self.grade_letter, self.grade_point = 'D', Decimal('1.00')
        else:
            self.grade_letter, self.grade_point = 'F', Decimal('0.00')

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.roll_number} - Co-curricular: {self.total_marks} ({self.grade_letter})"


class StudentExamResult(BaseModel):
    """
    শিক্ষার্থীর সামগ্রিক পরীক্ষার চূড়ান্ত ফলাফল, জিপিএ, মোট নম্বর এবং মেধা স্থান (Merit Position)।
    """
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='processed_results')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='exam_results')
    section = models.ForeignKey(AcademicSection, on_delete=models.CASCADE, related_name='exam_results')

    total_full_marks = models.DecimalField(max_digits=7, decimal_places=2, default=824.00, help_text="৭০০ + ১২৪ = ৮২৪")
    total_obtained_marks = models.DecimalField(max_digits=7, decimal_places=2, default=0.00)
    
    gpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.00, db_index=True)
    grade_letter = models.CharField(max_length=5, default='F', db_index=True)
    is_passed = models.BooleanField(default=False, db_index=True)

    failed_subjects_count = models.PositiveIntegerField(default=0)
    failed_subject_names = models.TextField(blank=True, help_text="অকৃতকার্য বিষয়ের কমা-সেপারেটেড নাম")

    # মেধা তালিকা স্থান
    section_position = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    class_position = models.PositiveIntegerField(null=True, blank=True, db_index=True)

    # পরীক্ষার সময়সীমার মধ্যকার উপস্থিতি সামারি
    working_days = models.PositiveIntegerField(default=0)
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)

    processed_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Student Exam Result'
        verbose_name_plural = 'Student Exam Results'
        unique_together = ('exam', 'student')
        ordering = ['-is_passed', '-gpa', '-total_obtained_marks', 'student__roll_number']
        indexes = [
            # রেজাল্টের দিন এক ক্লিকে মেধা তালিকা লোড হওয়া
            models.Index(fields=['exam', 'is_passed', '-gpa']),
            models.Index(fields=['section', 'is_passed']),
        ]

    def __str__(self):
        return f"{self.student.roll_number} - {self.student.user.get_full_name()} | GPA: {self.gpa} ({self.grade_letter}) - Pos: Sec {self.section_position}, Class {self.class_position}"


class ExamRoom(BaseModel):
    """
    পরীক্ষার হলের রুম তালিকা ও আসন ধারণক্ষমতা।
    """
    room_number = models.CharField(max_length=50, unique=True, help_text="যেমন: Room-201, Room-202")
    building = models.CharField(max_length=100, blank=True, default='Main Building')
    capacity = models.PositiveIntegerField(help_text="এই রুমে মোট কতজন শিক্ষার্থী পরীক্ষা দিতে পারবে")
    benches_count = models.PositiveIntegerField(default=20)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Exam Room'
        verbose_name_plural = 'Exam Rooms'
        ordering = ['room_number']

    def __str__(self):
        return f"{self.room_number} (Capacity: {self.capacity})"


class ExamSeatAssignment(BaseModel):
    """
    স্বয়ংক্রিয় সিট প্ল্যান অনুযায়ী শিক্ষার্থীর নির্ধারিত পরীক্ষার হল ও সিট নম্বর।
    """
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='seat_plans')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='exam_seats')
    room = models.ForeignKey(ExamRoom, on_delete=models.CASCADE, related_name='seated_students')
    seat_number = models.PositiveIntegerField(help_text="রুমের ভেতর নির্দিষ্ট আসন নম্বর")

    class Meta:
        verbose_name = 'Exam Seat Assignment'
        verbose_name_plural = 'Exam Seat Assignments'
        unique_together = ('exam', 'student')
        ordering = ['room', 'seat_number']

    def __str__(self):
        return f"{self.student.roll_number} - {self.room.room_number} (Seat: {self.seat_number})"


class InvigilationDuty(BaseModel):
    """
    পরীক্ষায় শিক্ষকদের হল গার্ড বা ইনভিজিলেশন রোস্টার।
    """
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='invigilation_duties')
    room = models.ForeignKey(ExamRoom, on_delete=models.CASCADE, related_name='duty_teachers')
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='exam_duties',
        limit_choices_to={'role': User.Role.TEACHER}
    )
    duty_date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Invigilation Duty'
        verbose_name_plural = 'Invigilation Duties'
        ordering = ['duty_date', 'start_time']

    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.room.room_number} [{self.duty_date}]"


class QuestionPaperSubmission(BaseModel):
    """
    শিক্ষক কর্তৃক পাসওয়ার্ড-প্রটেক্টেড প্রশ্নপত্র আপলোড ও প্রিন্সিপালের তদারকি।
    """
    class PaperStatus(models.TextChoices):
        SUBMITTED = 'SUBMITTED', 'জমা দেওয়া হয়েছে (Submitted)'
        ACCEPTED = 'ACCEPTED', 'গৃহীত (Accepted)'
        REVISION_REQUIRED = 'REVISION', 'সংশোধন প্রয়োজন (Revision Required)'

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='question_papers')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='question_papers')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_questions')
    
    question_file = models.FileField(upload_to='question_papers/%Y/', help_text="পাসওয়ার্ড প্রটেক্টেড PDF বা Doc ফাইল")
    file_password_hint = models.CharField(max_length=150, blank=True, help_text="প্রশ্নপত্রের পাসওয়ার্ড (শুধুমাত্র প্রিন্সিপাল দেখতে পাবেন)")
    status = models.CharField(max_length=20, choices=PaperStatus.choices, default=PaperStatus.SUBMITTED)
    principal_remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Question Paper Submission'
        verbose_name_plural = 'Question Paper Submissions'
        unique_together = ('exam', 'subject')

    def __str__(self):
        return f"{self.subject.name} - {self.exam.name} ({self.status})"