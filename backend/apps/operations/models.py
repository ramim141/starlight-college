from datetime import time
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.academics.models import AcademicSection
from apps.common.models import BaseModel
from apps.users_auth.models import User, StudentProfile


class TeacherAttendance(BaseModel):
    """
    শিক্ষকদের ডিজিটাল হাজিরা, অটোমেটিক এন্ট্রি টাইম এবং প্রিন্সিপাল কর্তৃক অনুমোদন।
    """
    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'অপেক্ষমাণ (Pending)'
        APPROVED = 'APPROVED', 'অনুমোদিত (Approved)'
        REJECTED = 'REJECTED', 'বাতিল (Rejected)'

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='teacher_attendances',
        limit_choices_to={'role': User.Role.TEACHER},
    )
    date = models.DateField(default=timezone.localdate, db_index=True)
    check_in_time = models.TimeField()
    check_out_time = models.TimeField(null=True, blank=True)
    is_late = models.BooleanField(default=False)
    remarks = models.CharField(max_length=255, blank=True)

    approval_status = models.CharField(
        max_length=15,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        db_index=True,
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_teacher_attendances',
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Teacher Attendance'
        verbose_name_plural = 'Teacher Attendances'
        unique_together = ('teacher', 'date')
        ordering = ['-date', '-check_in_time']

    def save(self, *args, **kwargs):
        # সকাল ৯:১৫ এর পরে চেক-ইন করলে স্বয়ংক্রিয়ভাবে Late হিসেবে চিহ্নিত হবে
        cutoff_time = time(9, 15, 0)
        if self.check_in_time and self.check_in_time > cutoff_time:
            self.is_late = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.teacher.username} - {self.date} ({self.approval_status})"


class Notice(BaseModel):
    """
    প্রিন্সিপাল ও শিক্ষকদের নোটিশ বোর্ড।
    """
    class AudienceType(models.TextChoices):
        ALL = 'ALL', 'সকলের জন্য (All Users)'
        TEACHERS = 'TEACHERS', 'শুধুমাত্র শিক্ষকদের জন্য (Teachers Only)'
        STUDENTS = 'STUDENTS', 'সকল শিক্ষার্থীদের জন্য (All Students)'
        SECTION = 'SECTION', 'নির্দিষ্ট শ্রেণি/শাখার জন্য (Specific Section)'

    title = models.CharField(max_length=255)
    content = models.TextField()
    attachment = models.FileField(upload_to='notices/%Y/%m/', null=True, blank=True)
    
    audience = models.CharField(
        max_length=15,
        choices=AudienceType.choices,
        default=AudienceType.ALL,
        db_index=True,
    )
    target_section = models.ForeignKey(
        AcademicSection,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notices',
        help_text="Audience যদি SECTION হয়, তবে কোন শাখার জন্য নোটিশ তা সিলেক্ট করুন।",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='published_notices',
    )
    is_pinned = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Notice'
        verbose_name_plural = 'Notices'
        ordering = ['-is_pinned', '-created_at']

    def clean(self):
        if self.audience == self.AudienceType.SECTION and not self.target_section:
            raise ValidationError("নির্দিষ্ট শাখার নোটিশের ক্ষেত্রে 'target_section' নির্বাচন করা আবশ্যক।")

    def __str__(self):
        return f"{self.title} ({self.get_audience_display()})"


class PersonalNote(BaseModel):
    """
    প্রিন্সিপাল, শিক্ষক, অ্যাকাউন্ট্যান্ট এবং শিক্ষার্থীদের নিজস্ব গোপন শর্ট নোট (Sticky Notes)।
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='personal_notes',
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    color_code = models.CharField(max_length=20, default='#FEF3C7', help_text="UI কার্ডের কালার কোড")
    is_pinned = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Personal Note'
        verbose_name_plural = 'Personal Notes'
        ordering = ['-is_pinned', '-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class AlumniRecord(BaseModel):
    """
    প্রাক্তন শিক্ষার্থীদের (Alumni) রেজিস্ট্রেশন ও প্রিন্সিপাল কর্তৃক ভেরিফিকেশন মডেল।
    """
    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'অপেক্ষমাণ (Pending Verification)'
        APPROVED = 'APPROVED', 'অনুমোদিত (Verified Alumni)'
        REJECTED = 'REJECTED', 'বাতিল (Rejected)'

    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(blank=True)
    
    passing_year = models.PositiveIntegerField(db_index=True, help_text="যেমন: 2022, 2023")
    group = models.CharField(max_length=50, help_text="যেমন: Science, Humanities, Business Studies")
    ssc_roll = models.CharField(max_length=30)
    hsc_roll = models.CharField(max_length=30, db_index=True)
    hsc_registration_no = models.CharField(max_length=50, unique=True, db_index=True)
    
    current_institution_or_workplace = models.CharField(
        max_length=255, 
        blank=True,
        help_text="বর্তমান বিশ্ববিদ্যালয় বা কর্মস্থলের নাম"
    )
    designation_or_department = models.CharField(max_length=150, blank=True)
    photo = models.ImageField(upload_to='alumni/%Y/', null=True, blank=True)

    status = models.CharField(
        max_length=15,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
        db_index=True,
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_alumni',
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Alumni Record'
        verbose_name_plural = 'Alumni Records'
        ordering = ['-passing_year', 'full_name']

    def __str__(self):
        return f"{self.full_name} (HSC Batch: {self.passing_year}) - {self.status}"


class MarkerRequest(BaseModel):
    """
    হোয়াইটবোর্ড মার্কার ট্র্যাকার মডেল (বিকল্প ক ফ্লো)।
    শিক্ষক আবেদন করবেন -> প্রিন্সিপাল/অফিস ইস্যু করবেন -> ব্যবহার শেষে রিটার্ন/ডিসপোজ হবে।
    """
    class MarkerColor(models.TextChoices):
        BLACK = 'BLACK', 'কালো (Black)'
        BLUE = 'BLUE', 'নীল (Blue)'
        RED = 'RED', 'লাল (Red)'
        GREEN = 'GREEN', 'সবুজ (Green)'

    class RequestStatus(models.TextChoices):
        REQUESTED = 'REQUESTED', 'অনুরোধ করা হয়েছে (Requested)'
        ISSUED = 'ISSUED', 'ইস্যু করা হয়েছে (Issued)'
        RETURNED = 'RETURNED', 'ফেরত দেওয়া হয়েছে (Returned)'
        DISPOSED = 'DISPOSED', 'কালি শেষ/নষ্ট (Finished/Disposed)'
        REJECTED = 'REJECTED', 'বাতিল (Rejected)'

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='marker_requests',
        limit_choices_to={'role': User.Role.TEACHER}
    )
    marker_color = models.CharField(max_length=15, choices=MarkerColor.choices, default=MarkerColor.BLACK)
    quantity = models.PositiveIntegerField(default=1)
    purpose = models.CharField(max_length=255, help_text="যেমন: একাদশ রসায়ন ব্যবহারিক ক্লাস")

    status = models.CharField(
        max_length=20,
        choices=RequestStatus.choices,
        default=RequestStatus.REQUESTED,
        db_index=True
    )
    issued_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issued_markers'
    )
    issued_at = models.DateTimeField(null=True, blank=True)
    returned_at = models.DateTimeField(null=True, blank=True)
    remarks = models.CharField(max_length=255, blank=True)
    is_acknowledged = models.BooleanField(default=False, help_text="শিক্ষক মার্কার বুঝে পেয়েছেন কি না")
    acknowledged_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Marker Request'
        verbose_name_plural = 'Marker Requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.get_marker_color_display()} ({self.status})"


class StudentLeaveApplication(BaseModel):
    """
    ২-ধাপের স্টুডেন্ট ছুটির আবেদন মডেল:
    Student আবেদন ➔ শ্রেণি ইনচার্জ Recommendation ➔ প্রিন্সিপাল Final Approval
    """
    class InChargeStatus(models.TextChoices):
        PENDING = 'PENDING', 'পর্যালোচনায় আছে (Pending)'
        RECOMMENDED = 'RECOMMENDED', 'সুপারিশকৃত (Recommended)'
        REJECTED = 'REJECTED', 'ইনচার্জ কর্তৃক বাতিল (Rejected)'

    class PrincipalStatus(models.TextChoices):
        PENDING = 'PENDING', 'অপেক্ষমাণ (Pending)'
        APPROVED = 'APPROVED', 'চূড়ান্ত অনুমোদিত (Approved)'
        REJECTED = 'REJECTED', 'প্রিন্সিপাল কর্তৃক বাতিল (Rejected)'

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='leave_applications'
    )
    section = models.ForeignKey(
        AcademicSection,
        on_delete=models.CASCADE,
        related_name='student_leaves'
    )
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    reason = models.TextField()
    attachment = models.FileField(upload_to='leaves/%Y/%m/', null=True, blank=True)

    # ধাপ ১: শ্রেণি ইনচার্জের পর্যালোচনা
    incharge_status = models.CharField(
        max_length=20,
        choices=InChargeStatus.choices,
        default=InChargeStatus.PENDING,
        db_index=True
    )
    incharge_remarks = models.CharField(max_length=255, blank=True)
    reviewed_by_incharge = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_student_leaves'
    )
    incharge_reviewed_at = models.DateTimeField(null=True, blank=True)

    # ধাপ ২: প্রিন্সিপালের চূড়ান্ত সিদ্ধান্ত
    principal_status = models.CharField(
        max_length=20,
        choices=PrincipalStatus.choices,
        default=PrincipalStatus.PENDING,
        db_index=True
    )
    principal_remarks = models.CharField(max_length=255, blank=True)
    approved_by_principal = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_student_leaves'
    )
    principal_reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Student Leave Application'
        verbose_name_plural = 'Student Leave Applications'
        ordering = ['-created_at']

    def clean(self):
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("ছুটি শুরুর তারিখ শেষ তারিখের চেয়ে আগের হতে হবে।")

    def __str__(self):
        return f"{self.student.student_unique_id} ({self.start_date} to {self.end_date}) - [InCharge: {self.incharge_status}, Principal: {self.principal_status}]"


class MarkerStock(BaseModel):
    """
    কেন্দ্রীয় মার্কারের স্টক রেজিস্টার।
    """
    color = models.CharField(max_length=15, choices=MarkerRequest.MarkerColor.choices, unique=True)
    total_stock = models.PositiveIntegerField(default=0, help_text="মোট কেনা মার্কার সংখ্যা")
    available_stock = models.PositiveIntegerField(default=0, help_text="বর্তমানে স্টোরে অবশিষ্ট মার্কার সংখ্যা")

    class Meta:
        verbose_name = 'Marker Stock'
        verbose_name_plural = 'Marker Stocks'

    def __str__(self):
        return f"{self.get_color_display()} Stock: {self.available_stock}/{self.total_stock}"


class AssetCategory(BaseModel):
    """
    কলেজের স্থাবর সম্পদের খাত (আসবাবপত্র, বৈদ্যুতিক সরঞ্জাম, ক্লাসরুম টুলস, ল্যাব ইত্যাদি)।
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Asset Category'
        verbose_name_plural = 'Asset Categories'

    def __str__(self):
        return self.name


class CollegeAsset(BaseModel):
    """
    কলেজের মোট বেঞ্চ, হোয়াইটবোর্ড, ডেস্ক, ফ্যান ও ল্যাব সরঞ্জামের ইনভেন্টরি ট্র্যাকার।
    """
    class Condition(models.TextChoices):
        GOOD = 'GOOD', 'ভালো/সচল (Good/Usable)'
        DAMAGED = 'DAMAGED', 'নষ্ট/ভাঙা (Damaged)'
        UNDER_REPAIR = 'UNDER_REPAIR', 'মেরামতাধীন (Under Repair)'
        DISPOSED = 'DISPOSED', 'পরিত্যক্ত (Disposed)'

    name = models.CharField(max_length=150, help_text="যেমন: স্টুডেন্ট হাই-বেঞ্চ, হোয়াইটবোর্ড ৬x৪")
    asset_code = models.CharField(max_length=50, unique=True, db_index=True, help_text="যেমন: AST-BNCH-001")
    category = models.ForeignKey(AssetCategory, on_delete=models.PROTECT, related_name='assets')
    quantity = models.PositiveIntegerField(default=1)
    room_or_location = models.CharField(max_length=100, help_text="যেমন: Room-302, Chemistry Lab, Principal Room")
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.GOOD, db_index=True)
    purchase_date = models.DateField(null=True, blank=True)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    remarks = models.TextField(blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = 'College Asset'
        verbose_name_plural = 'College Assets'
        ordering = ['room_or_location', 'name']

    def __str__(self):
        return f"[{self.asset_code}] {self.name} (Qty: {self.quantity}) - {self.room_or_location}"


class CertificateRequest(BaseModel):
    """
    শিক্ষার্থীদের প্রত্যয়নপত্র, প্রশংসাপত্র ও টিসি আবেদন ইঞ্জিন।
    """
    class CertType(models.TextChoices):
        STUDENTSHIP = 'STUDENTSHIP', 'অধ্যয়নরত প্রত্যয়নপত্র (Studentship Certificate)'
        TESTIMONIAL = 'TESTIMONIAL', 'প্রশংসাপত্র (Testimonial)'
        TRANSFER = 'TC', 'ছাড়পত্র (Transfer Certificate - TC)'

    class RequestStatus(models.TextChoices):
        PENDING = 'PENDING', 'অপেক্ষমাণ (Pending)'
        APPROVED = 'APPROVED', 'অনুমোদিত (Approved)'
        REJECTED = 'REJECTED', 'বাতিল (Rejected)'
        ISSUED = 'ISSUED', 'বিতরণকৃত (Issued)'

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='certificate_requests')
    certificate_type = models.CharField(max_length=20, choices=CertType.choices, default=CertType.STUDENTSHIP)
    fee_amount = models.DecimalField(max_digits=8, decimal_places=2, default=100.00, help_text="আবেদন ফি (BDT)")
    is_fee_paid = models.BooleanField(default=False)
    
    reason = models.TextField(help_text="আবেদনের উদ্দেশ্য (যেমন: পাসপোর্ট বা ব্যাংক অ্যাকাউন্ট খোলা)")
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.PENDING, db_index=True)
    
    certificate_number = models.CharField(max_length=50, blank=True, unique=True, null=True, db_index=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_certificates')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Certificate Request'
        verbose_name_plural = 'Certificate Requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.student_unique_id} - {self.get_certificate_type_display()} ({self.status})"


class StudentComplaint(BaseModel):
    """
    সুরক্ষিত অভিযোগ ও পরামর্শ বক্স:
    শিক্ষার্থীর পরিচয় সাধারণ শিক্ষার্থী বা শিক্ষকদের কাছে সম্পূর্ণ অপ্রকাশিত থাকবে, 
    কিন্তু অধ্যক্ষ ড্যাশবোর্ডে শিক্ষার্থীর আসল নাম, রোল ও ফোন দেখতে পাবেন (ভুয়া অভিযোগ রোধে)।
    """
    class ComplaintCategory(models.TextChoices):
        BULLYING = 'BULLYING', 'র‌্যাগিং বা বুলিং (Bullying/Harassment)'
        CLASSROOM = 'CLASSROOM', 'শ্রেণিকক্ষ ও পরিবেশ (Classroom Facility)'
        TEACHER_FEEDBACK = 'TEACHER', 'শিক্ষক সংক্রান্ত মতামত (Teacher Feedback)'
        CANTEEN_CAMPUS = 'CAMPUS', 'ক্যান্টিন বা ক্যাম্পাস পরিচ্ছন্নতা (Campus/Canteen)'
        ACADEMIC = 'ACADEMIC', 'পড়ালেখা ও পরীক্ষা সংক্রান্ত (Academic)'
        OTHER = 'OTHER', 'অন্যান্য (Other)'

    class ComplaintStatus(models.TextChoices):
        PENDING = 'PENDING', 'পর্যালোচনায় আছে (Pending)'
        INVESTIGATING = 'INVESTIGATING', 'তদন্তাধীন (Under Investigation)'
        RESOLVED = 'RESOLVED', 'সমাধানকৃত (Resolved)'
        DISMISSED = 'DISMISSED', 'ভিত্তিহীন হিসেবে বাতিল (Dismissed)'

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='complaints')
    category = models.CharField(max_length=20, choices=ComplaintCategory.choices, default=ComplaintCategory.OTHER)
    title = models.CharField(max_length=200)
    description = models.TextField()
    attachment = models.FileField(upload_to='complaints/%Y/', null=True, blank=True)

    status = models.CharField(max_length=20, choices=ComplaintStatus.choices, default=ComplaintStatus.PENDING, db_index=True)
    principal_remarks = models.TextField(blank=True, help_text="অধ্যক্ষ কর্তৃক গৃহীত ব্যবস্থা বা নোট")
    action_taken_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Student Complaint'
        verbose_name_plural = 'Student Complaints'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.category}] {self.title} - {self.status}"


class ParentCommunicationLog(BaseModel):
    """
    শ্রেণি ইনচার্জের অভিভাবক কল-ডায়েরি:
    শিক্ষার্থীর অনিয়ম, অনুপস্থিতি বা ফলাফল নিয়ে অভিভাবকের সাথে ফোনালাপের রেকর্ড।
    """
    class CallCategory(models.TextChoices):
        ATTENDANCE = 'ATTENDANCE', 'অনুপস্থিতি সংক্রান্ত (Attendance Issue)'
        ACADEMIC = 'ACADEMIC', 'পড়ালেখা ও খারাপ ফলাফল (Academic Performance)'
        DISCIPLINE = 'DISCIPLINE', 'শৃঙ্খলা ও আচরণবিধি (Discipline/Behavior)'
        FEE_DUE = 'FEE_DUE', 'বেতন বা ফি বকেয়া (Fee Overdue)'
        HEALTH = 'HEALTH', 'অসুস্থতা বা জরুরি তথ্য (Health/Emergency)'
        GENERAL = 'GENERAL', 'সাধারণ খোঁজখবর (General Inquiry)'

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='parent_communication_logs'
    )
    in_charge = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='logged_parent_calls',
        limit_choices_to={'role': User.Role.TEACHER}
    )
    call_date = models.DateField(default=timezone.localdate, db_index=True)
    category = models.CharField(max_length=20, choices=CallCategory.choices, default=CallCategory.ATTENDANCE)
    guardian_phone_called = models.CharField(max_length=20, help_text="যে নম্বরে কল করা হয়েছিল")
    
    discussion_summary = models.TextField(help_text="অভিভাবকের সাথে কী কথা হলো তার সারসংক্ষেপ")
    guardian_response = models.CharField(max_length=255, blank=True, help_text="অভিভাবকের মন্তব্য বা প্রতিশ্রুতি")
    follow_up_needed = models.BooleanField(default=False, help_text="পরবর্তীতে আবার খোঁজ নেওয়া প্রয়োজন কি না")

    class Meta:
        verbose_name = 'Parent Communication Log'
        verbose_name_plural = 'Parent Communication Logs'
        ordering = ['-call_date', '-created_at']

    def __str__(self):
        return f"{self.student.roll_number} - {self.student.user.get_full_name()} [{self.call_date}]"


class TeacherLeave(BaseModel):
    """
    শিক্ষকদের ছুটির আবেদন ও প্রক্সি ক্লাস ইঞ্জিন:
    শিক্ষক আবেদন করবেন -> প্রিন্সিপাল অনুমোদন দিলে মনোনীত প্রক্সি শিক্ষকের কাছে নোটিফিকেশন যাবে।
    """
    class LeaveType(models.TextChoices):
        CASUAL = 'CASUAL', 'নৈমিত্তিক ছুটি (Casual Leave - CL)'
        MEDICAL = 'MEDICAL', 'চিকিৎসা ছুটি (Medical Leave - ML)'
        DUTY = 'DUTY', 'দাপ্তরিক/পরীক্ষার দায়িত্ব (Duty Leave)'
        MATERNITY = 'MATERNITY', 'মাতৃত্বকালীন ছুটি (Maternity Leave)'
        EMERGENCY = 'EMERGENCY', 'জরুরি পারিবারিক ছুটি (Emergency Leave)'

    class LeaveStatus(models.TextChoices):
        PENDING = 'PENDING', 'পর্যালোচনায় আছে (Pending)'
        APPROVED = 'APPROVED', 'অনুমোদিত (Approved)'
        REJECTED = 'REJECTED', 'বাতিল (Rejected)'

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='leaves_taken',
        limit_choices_to={'role': User.Role.TEACHER}
    )
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices, default=LeaveType.CASUAL)
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    total_days = models.PositiveIntegerField(default=1)
    reason = models.TextField(help_text="ছুটির সুনির্দিষ্ট কারণ")

    # ছুটির সময় ক্লাসের দায়িত্বপ্রাপ্ত প্রক্সি শিক্ষক
    proxy_teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='proxy_assigned_classes',
        limit_choices_to={'role': User.Role.TEACHER},
        help_text="ছুটিকালীন সময়ে যিনি ক্লাস পরিচালনা করবেন"
    )

    status = models.CharField(max_length=15, choices=LeaveStatus.choices, default=LeaveStatus.PENDING, db_index=True)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_teacher_leaves'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    principal_remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Teacher Leave & Proxy'
        verbose_name_plural = 'Teacher Leaves & Proxies'
        ordering = ['-start_date']

    def save(self, *args, **kwargs):
        if self.start_date and self.end_date:
            self.total_days = max(1, (self.end_date - self.start_date).days + 1)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.teacher.get_full_name()} ({self.get_leave_type_display()}): {self.start_date} to {self.end_date} - {self.status}"


class SMSBroadcastLog(BaseModel):
    """
    টার্গেটেড স্মার্ট বাল্ক SMS প্রেরণের লগ ও হিস্ট্রি।
    """
    class TargetGroup(models.TextChoices):
        ABSENT_TODAY = 'ABSENT_TODAY', 'আজকের অনুপস্থিত শিক্ষার্থীদের অভিভাবক'
        FEE_DEFAULTERS = 'FEE_DEFAULTERS', 'বকেয়া থাকা শিক্ষার্থীদের অভিভাবক'
        ALL_TEACHERS = 'ALL_TEACHERS', 'সকল শিক্ষক'
        SECTION_STUDENTS = 'SECTION_STUDENTS', 'নির্দিষ্ট শাখার শিক্ষার্থী'

    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    target_group = models.CharField(max_length=30, choices=TargetGroup.choices, db_index=True)
    message_body = models.TextField(help_text="প্রেরিত বার্তার বিষয়বস্তু")
    recipients_count = models.PositiveIntegerField(default=0)
    recipients_sample = models.TextField(blank=True, help_text="টার্গেট করা ফোন নম্বরসমূহের নমুনা")

    class Meta:
        verbose_name = 'SMS Broadcast Log'
        verbose_name_plural = 'SMS Broadcast Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.target_group}] {self.recipients_count} SMS Sent at {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class Club(BaseModel):
    """
    কলেজের সহ-পাঠ্যক্রমিক ক্লাব (সায়েন্স ক্লাব, ডিবেট ক্লাব ইত্যাদি)।
    প্রিন্সিপাল একজন শিক্ষককে 'ক্লাব মডারেটর/ইনচার্জ' হিসেবে নিযুক্ত করবেন।
    """
    name = models.CharField(max_length=150, unique=True, help_text="যেমন: স্টপলাইট সায়েন্স ক্লাব, ডিবেটিং সোসাইটি")
    description = models.TextField(blank=True)
    
    # দায়িত্বপ্রাপ্ত ক্লাব ইনচার্জ শিক্ষক
    moderator_teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_clubs',
        limit_choices_to={'role': User.Role.TEACHER},
        help_text="প্রিন্সিপাল কর্তৃক মনোনীত ক্লাব ইনচার্জ শিক্ষক"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'College Club'
        verbose_name_plural = 'College Clubs'
        ordering = ['name']

    def __str__(self):
        moderator = self.moderator_teacher.get_full_name() if self.moderator_teacher else "মনোনীত হয়নি"
        return f"{self.name} (Moderator: {moderator})"


class ClubMembership(BaseModel):
    """
    শিক্ষার্থীদের ক্লাবে সদস্য হওয়ার আবেদন মডেল।
    ক্লাব ইনচার্জ শিক্ষক আবেদন অনুমোদন বা বাতিল করবেন।
    """
    class MembershipStatus(models.TextChoices):
        PENDING = 'PENDING', 'অপেক্ষমাণ (Pending)'
        APPROVED = 'APPROVED', 'অনুমোদিত সদস্য (Approved)'
        REJECTED = 'REJECTED', 'বাতিল (Rejected)'

    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='memberships')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='club_memberships')
    reason = models.TextField(blank=True, help_text="ক্লাবে যোগদানের আগ্রহ বা দক্ষতা")
    status = models.CharField(max_length=20, choices=MembershipStatus.choices, default=MembershipStatus.PENDING, db_index=True)
    
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Club Membership'
        verbose_name_plural = 'Club Memberships'
        unique_together = ('club', 'student')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['club', 'status']),
        ]

    def __str__(self):
        return f"{self.student.roll_number} - {self.club.name} ({self.status})"


class ClubEvent(BaseModel):
    """
    ক্লাব কর্তৃক আয়োজিত বিজ্ঞান মেলা, কুইজ বা অলিম্পিয়াড ইভেন্ট।
    ক্লাব ইনচার্জ শিক্ষক এই ইভেন্ট তৈরি ও পরিচালনা করবেন।
    """
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200, help_text="যেমন: বার্ষিক বিজ্ঞান অলিম্পিয়াড ২০২৬")
    description = models.TextField()
    event_date = models.DateField(db_index=True)
    venue = models.CharField(max_length=150, help_text="যেমন: কলেজ অডিটোরিয়াম")
    registration_deadline = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Club Event'
        verbose_name_plural = 'Club Events'
        ordering = ['-event_date']

    def __str__(self):
        return f"{self.title} [{self.club.name}] - {self.event_date}"


class EventRegistration(BaseModel):
    """
    ইভেন্টে শিক্ষার্থীদের নাম রেজিস্ট্রেশন।
    """
    event = models.ForeignKey(ClubEvent, on_delete=models.CASCADE, related_name='registrations')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='event_registrations')
    registered_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Event Registration'
        verbose_name_plural = 'Event Registrations'
        unique_together = ('event', 'student')
        indexes = [
            models.Index(fields=['event', 'student']),
        ]

    def __str__(self):
        return f"{self.student.student_unique_id} - {self.event.title}"
    

class WhatsAppTemplate(BaseModel):
    """
    হোয়াটসঅ্যাপ মেসেজের প্রি-ডিফাইন্ড টেমপ্লেট:
    উপস্থিতি, বেতন বকেয়া, রুটিন বা জরুরি নোটিশের রেডিমেড ফরম্যাট।
    """
    class TemplateType(models.TextChoices):
        ABSENT_ALERT = 'ABSENT', 'অনুপস্থিতি অ্যালার্ট (Absent Alert)'
        FEE_REMINDER = 'FEE_DUE', 'বেতন/ফি বকেয়া তাগাদা (Fee Reminder)'
        TRANSPORT_ALERT = 'TRANSPORT', 'পরিবহন ও গাড়ি বিকল অ্যালার্ট (Transport Breakdown)'
        EXAM_NOTICE = 'EXAM', 'পরীক্ষা সংক্রান্ত নোটিশ (Exam Notice)'
        CUSTOM = 'CUSTOM', 'কাস্টম সাধারণ নোটিশ (Custom Notice)'

    title = models.CharField(max_length=150, help_text="যেমন: দৈনিক অনুপস্থিতির নোটিশ")
    template_type = models.CharField(max_length=20, choices=TemplateType.choices, unique=True)
    body_template = models.TextField(
        help_text="ডায়নামিক ভ্যারিয়েবল সাপোর্ট: {student_name}, {roll}, {date}, {due_amount}, {section_name}, {college_name}"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'WhatsApp Template'
        verbose_name_plural = 'WhatsApp Templates'

    def __str__(self):
        return f"{self.title} ({self.get_template_type_display()})"


class WhatsAppMessageLog(BaseModel):
    """
    শিক্ষক ও প্রিন্সিপাল কর্তৃক প্রেরিত প্রতিটি হোয়াটসঅ্যাপ বার্তার অডিট হিস্ট্রি।
    """
    class SendStatus(models.TextChoices):
        SENT = 'SENT', 'সফলভাবে প্রেরিত (Sent)'
        FAILED = 'FAILED', 'ব্যর্থ (Failed)'
        QUEUED = 'QUEUED', 'অপেক্ষমাণ (Queued)'

    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    student = models.ForeignKey(StudentProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='whatsapp_messages')
    recipient_phone = models.CharField(max_length=20, db_index=True)
    recipient_name = models.CharField(max_length=150)
    
    template = models.ForeignKey(WhatsAppTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    message_content = models.TextField()
    status = models.CharField(max_length=15, choices=SendStatus.choices, default=SendStatus.SENT, db_index=True)
    error_message = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'WhatsApp Message Log'
        verbose_name_plural = 'WhatsApp Message Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"To: {self.recipient_name} ({self.recipient_phone}) - {self.status}"


class InAppNotification(BaseModel):
    """
    ইন-অ্যাপ নোটিফিকেশন মডেল (ইউজারের ড্যাশবোর্ডের বেল আইকনে রিয়েল-টাইমে শো করবে)।
    """
    class NotificationType(models.TextChoices):
        LEAVE = 'LEAVE', 'ছুটি সংক্রান্ত (Leave Alert)'
        ATTENDANCE = 'ATTENDANCE', 'উপস্থিতি সংক্রান্ত (Attendance)'
        EXAM = 'EXAM', 'পরীক্ষা ও রেজাল্ট (Exam & Result)'
        FEE = 'FEE', 'বেতন ও জরিমানা (Fees & Dues)'
        ROUTINE = 'ROUTINE', 'ক্লাস রিমাইন্ডার (Class Reminder)'
        TRANSPORT = 'TRANSPORT', 'পরিবহন ও জরুরি নোটিশ (Transport Emergency)'
        GENERAL = 'GENERAL', 'সাধারণ নোটিশ (General Notice)'

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    body = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices, default=NotificationType.GENERAL, db_index=True)
    action_url = models.CharField(max_length=255, blank=True, help_text="ক্লিক করলে ফ্রন্টএন্ডের কোন পেজে নিয়ে যাবে (যেমন: /leaves/ বা /admit-card/)")
    
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'In-App Notification'
        verbose_name_plural = 'In-App Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] To: {self.recipient.username} - {self.title}"


class DevicePushSubscription(BaseModel):
    """
    ইউজারের ডিভাইসের পুশ টোকেন ও ব্রাউজার সাবস্ক্রিপশন কি (Offline Web Push Delivery এর জন্য)।
    ইউজার অফলাইনে থাকলেও ব্রাউজার/ফোনের ওএসে পুশ নোটিফিকেশন পাঠাতে এটি ব্যবহৃত হয়।
    """
    class DeviceType(models.TextChoices):
        WEB = 'WEB', 'ওয়েব ব্রাউজার (Chrome/Firefox/Edge)'
        ANDROID = 'ANDROID', 'অ্যান্ড্রয়েড ফোন (Mobile App)'
        IOS = 'IOS', 'আইওএস (iOS)'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_subscriptions')
    device_type = models.CharField(max_length=15, choices=DeviceType.choices, default=DeviceType.WEB)
    
    # ব্রাউজার Web Push API বা Firebase (FCM) টোকেন ডেটা
    endpoint = models.TextField(help_text="ব্রাউজারের পুশ সার্ভিস এন্ডপয়েন্ট URL")
    p256dh_key = models.CharField(max_length=255, blank=True, help_text="Web Push এনক্রিপশন পাবলিক কি")
    auth_key = models.CharField(max_length=255, blank=True, help_text="Web Push অথেন্টিকেশন সিক্রেট")
    fcm_token = models.TextField(blank=True, help_text="Firebase Cloud Messaging টোকেন (যদি মোবাইল অ্যাপে ব্যবহৃত হয়)")
    
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Device Push Subscription'
        verbose_name_plural = 'Device Push Subscriptions'
        unique_together = ('user', 'endpoint')

    def __str__(self):
        return f"{self.user.username} ({self.device_type}) - Active: {self.is_active}"