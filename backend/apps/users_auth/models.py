import uuid
from django.core import signing
from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.common.models import BaseModel


class User(AbstractUser):
    class Role(models.TextChoices):
        PRINCIPAL = 'PRINCIPAL', 'Principal (Super Admin)'
        TEACHER = 'TEACHER', 'Teacher'
        ACCOUNTANT = 'ACCOUNTANT', 'Accountant'
        STUDENT = 'STUDENT', 'Student'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=Role.choices, db_index=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
    profile_photo = models.ImageField(upload_to='profiles/%Y/%m/', null=True, blank=True)
    
    # সাময়িকভাবে লাইব্রেরির দায়িত্বপ্রাপ্ত স্টাফের জন্য ফ্ল্যাগ
    is_library_manager = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['role']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} [{self.get_role_display()}]"

    @property
    def is_principal(self):
        return self.role == self.Role.PRINCIPAL

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER

    @property
    def is_accountant(self):
        return self.role == self.Role.ACCOUNTANT

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT


class TeacherProfile(BaseModel):
    """
    শিক্ষকদের বিস্তারিত প্রোফাইল, মূল বেতন ও পাবলিক ওয়েবসাইটের পরিচিতি।
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=30, unique=True, db_index=True)
    designation = models.CharField(max_length=100, help_text="যেমন: প্রভাষক, সহকারী অধ্যাপক")
    department = models.CharField(max_length=100, help_text="যেমন: রসায়ন, পদার্থবিজ্ঞান, বাংলা")
    qualification = models.CharField(max_length=255, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    
    # স্যালারি রিকোয়েস্ট ফ্লো-এর জন্য শিক্ষকের নির্ধারিত মাসিক বেতন
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # পাবলিক ওয়েবসাইটের টিচার প্যানেল পেজে দেখানোর জন্য
    bio = models.TextField(blank=True)
    show_on_website = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Teacher Profile'
        verbose_name_plural = 'Teacher Profiles'
        ordering = ['department', 'user__first_name']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.department})"


class StudentProfile(BaseModel):
    """
    শিক্ষার্থীর একাডেমিক প্রোফাইল, ইউনিক আইডি, রোল, সেশন এবং মাসিক ফি সেটিংস।
    
    """
    class GenderChoices(models.TextChoices):
        MALE = 'MALE', 'ছাত্র (Male)'
        FEMALE = 'FEMALE', 'ছাত্রী (Female)'
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_unique_id = models.CharField(max_length=35, unique=True, editable=False, db_index=True)
    gender = models.CharField(max_length=10, choices=GenderChoices.choices, default=GenderChoices.MALE, db_index=True)
    section = models.ForeignKey('academics.AcademicSection', on_delete=models.PROTECT, related_name='students')
    roll_number = models.PositiveIntegerField(db_index=True)
    session = models.CharField(max_length=20, db_index=True, help_text="যেমন: 2025-2026")

    
    # বোর্ড রেজিস্ট্রেশন তথ্য (অ্যালুমনি ও পরীক্ষার জন্য)
    ssc_roll = models.CharField(max_length=30, blank=True, null=True)
    passing_year = models.CharField(max_length=4, blank=True, default='', db_index=True)
    temporary_pin_token = models.CharField(max_length=255, blank=True, default='')
    hsc_registration_no = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    
    # অভিভাবকের তথ্য (SMS নোটিফিকেশনের জন্য)
    father_name = models.CharField(max_length=150)
    mother_name = models.CharField(max_length=150)
    guardian_phone = models.CharField(max_length=20, db_index=True)
    guardian_whatsapp_number = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text="অভিভাবকের WhatsApp নম্বর",
    )
    student_whatsapp_number = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text="শিক্ষার্থীর WhatsApp নম্বর",
    )
    present_address = models.TextField(blank=True)
    
    # ফি ও পরিবহন কনফিগারেশন (শ্রেণি ইনচার্জ যা হ্যান্ডেল করবেন)
    monthly_tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    uses_transport = models.BooleanField(default=False)
    assigned_vehicle = models.ForeignKey(
        'finance.TransportVehicle',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='passengers',
        help_text="শিক্ষার্থী যে নির্দিষ্ট গাড়িতে যাতায়াত করে"
    )
    
    monthly_transport_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enrolled_students'
    )

    class Meta:
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
        unique_together = ('section', 'roll_number')
        constraints = [
            models.UniqueConstraint(
                fields=['ssc_roll', 'passing_year'],
                name='unique_student_ssc_roll_passing_year',
            ),
        ]
        ordering = ['section', 'roll_number']
        indexes = [
            models.Index(fields=['section', 'roll_number']),
            models.Index(fields=['section', 'session']),
        ]

    def save(self, *args, **kwargs):
        # সেশন যদি খালি থাকে তবে সেকশনের সেশন অটো বসে যাবে
        if not self.session and self.section:
            self.session = self.section.session

        # অটোমেটিক স্টুডেন্ট ইউনিক আইডি জেনারেশন: [Year]-[Class]-[Group]-[Section]-[Roll]
        if not self.student_unique_id and self.section:
            year_prefix = self.session.split('-')[0].strip()
            self.student_unique_id = (
                f"{year_prefix}-{self.section.class_level}-"
                f"{self.section.group}-{self.section.section_name}-"
                f"{int(self.roll_number):04d}"
            ).upper()
        super().save(*args, **kwargs)

    def set_temporary_pin(self, pin):
        self.temporary_pin_token = signing.dumps({'pin': pin}, compress=True)

    def get_temporary_pin(self):
        if not self.temporary_pin_token:
            return ''
        try:
            return signing.loads(self.temporary_pin_token)['pin']
        except signing.BadSignature:
            return ''

    def __str__(self):
        return f"[{self.student_unique_id}] Roll: {self.roll_number} - {self.user.get_full_name()}"