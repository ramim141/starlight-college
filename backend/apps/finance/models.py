import uuid
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from apps.academics.models import AcademicSection
from apps.common.models import BaseModel
from apps.users_auth.models import StudentProfile, User

class StudentInvoice(BaseModel):
    """
    শিক্ষার্থীর মাসিক বেতন, পরিবহন ফি, অনুপস্থিতির জরিমানা ও বকেয়া ইনভয়েস।
    """
    class InvoiceStatus(models.TextChoices):
        UNPAID = 'UNPAID', 'অপরিশোধিত (Unpaid)'
        PARTIAL = 'PARTIAL', 'আংশিক পরিশোধিত (Partially Paid)'
        PAID = 'PAID', 'সম্পূর্ণ পরিশোধিত (Paid)'

    invoice_number = models.CharField(max_length=50, unique=True, editable=False, db_index=True)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='invoices')
    section = models.ForeignKey(AcademicSection, on_delete=models.CASCADE, related_name='invoices')
    
    month = models.PositiveSmallIntegerField(help_text="মাসের ক্রমিক নম্বর (১ = জানুয়ারি, ১২ = ডিসেম্বর)")
    year = models.PositiveIntegerField(help_text="যেমন: 2026")
    
    # ফি-এর খাতসমূহ
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    transport_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    absence_fine = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="প্রতিদিন ১০০ টাকা জরিমানা")
    other_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # মওকুফ বা ছাড় (ইনচার্জের সুপারিশে অধ্যক্ষের অনুমোদনে আসবে)
    waiver_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # আর্থিক মোট এবং পরিশোধ হিসাব
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    due_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=15, choices=InvoiceStatus.choices, default=InvoiceStatus.UNPAID, db_index=True)
    due_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = 'Student Invoice'
        verbose_name_plural = 'Student Invoices'
        unique_together = ('student', 'month', 'year')
        ordering = ['-year', '-month', 'student__roll_number']
        indexes = [
            # বকেয়া ও মাসের ভিত্তিতে চোখের পলকে সার্চ
            models.Index(fields=['student', 'due_amount']),
            models.Index(fields=['year', 'month', 'status']),
        ]

    def calculate_totals(self):
        tuition_fee = Decimal(str(self.tuition_fee or 0))
        transport_fee = Decimal(str(self.transport_fee or 0))
        absence_fine = Decimal(str(self.absence_fine or 0))
        other_fees = Decimal(str(self.other_fees or 0))
        waiver_amount = Decimal(str(self.waiver_amount or 0))
        paid_amount = Decimal(str(self.paid_amount or 0))
        gross_total = tuition_fee + transport_fee + absence_fine + other_fees
        self.total_amount = max(Decimal('0.00'), gross_total - waiver_amount)
        self.due_amount = max(Decimal('0.00'), self.total_amount - paid_amount)

        if paid_amount >= self.total_amount and self.total_amount > Decimal('0.00'):
            self.status = self.InvoiceStatus.PAID
        elif paid_amount > Decimal('0.00'):
            self.status = self.InvoiceStatus.PARTIAL
        else:
            self.status = self.InvoiceStatus.UNPAID

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            unique_suffix = uuid.uuid4().hex[:6].upper()
            self.invoice_number = f"INV-{self.year}{self.month:02d}-{unique_suffix}"
        self.calculate_totals()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} | {self.student.student_unique_id} - {self.month}/{self.year} ({self.status})"


class PaymentTransaction(BaseModel):
    """
    ফি জমার ট্রানজেকশন ও মানি রিসিট (ক্যাশ, বিকাশ, ব্যাংক ইত্যাদি)।
    """
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'ক্যাশ কাউন্টার (Cash)'
        BKASH = 'BKASH', 'বিকাশ (bKash)'
        NAGAD = 'NAGAD', 'নগদ (Nagad)'
        BANK = 'BANK', 'ব্যাংক ট্রান্সফার (Bank)'
        OTHER = 'OTHER', 'অন্যান্য (Other)'

    receipt_no = models.CharField(max_length=50, unique=True, editable=False, db_index=True)
    invoice = models.ForeignKey(StudentInvoice, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    transaction_reference = models.CharField(max_length=100, blank=True, help_text="bKash TrxID বা ব্যাংক স্লিপ নম্বর")
    collected_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Payment Transaction'
        verbose_name_plural = 'Payment Transactions'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.receipt_no:
            self.receipt_no = f"REC-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.receipt_no} - {self.amount_paid} BDT ({self.payment_method})"


class FineWaiverApplication(BaseModel):
    """
    অনুপস্থিতির জরিমানা বা ফি মওকুফের ২-ধাপের আবেদন:
    Student আবেদন ➔ In-Charge শিক্ষক সুপারিশ ➔ Principal চূড়ান্ত অনুমোদন (স্বয়ংক্রিয়ভাবে বিলে ডিসকাউন্ট যোগ হবে)।
    """
    class InChargeWaiverStatus(models.TextChoices):
        PENDING = 'PENDING', 'পর্যালোচনায় আছে (Pending)'
        RECOMMENDED = 'RECOMMENDED', 'সুপারিশকৃত (Recommended)'
        REJECTED = 'REJECTED', 'সুপারিশ বাতিল (Rejected)'

    class PrincipalWaiverStatus(models.TextChoices):
        PENDING = 'PENDING', 'অপেক্ষমাণ (Pending)'
        APPROVED = 'APPROVED', 'মওকুফ অনুমোদিত (Approved)'
        REJECTED = 'REJECTED', 'মওকুফ বাতিল (Rejected)'

    invoice = models.ForeignKey(StudentInvoice, on_delete=models.CASCADE, related_name='waiver_applications')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='waiver_applications')
    reason = models.TextField(help_text="অসুস্থতা বা পারিবারিক কারণে জরিমানা মওকুফের কারণ")
    
    # ধাপ ১: ইনচার্জ সুপারিশ
    incharge_status = models.CharField(max_length=20, choices=InChargeWaiverStatus.choices, default=InChargeWaiverStatus.PENDING, db_index=True)
    recommended_waiver_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    incharge_remarks = models.CharField(max_length=255, blank=True)
    reviewed_by_incharge = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='incharge_waivers')
    incharge_reviewed_at = models.DateTimeField(null=True, blank=True)

    # ধাপ ২: প্রিন্সিপালের চূড়ান্ত সিদ্ধান্ত
    principal_status = models.CharField(max_length=20, choices=PrincipalWaiverStatus.choices, default=PrincipalWaiverStatus.PENDING, db_index=True)
    approved_waiver_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    principal_remarks = models.CharField(max_length=255, blank=True)
    approved_by_principal = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='principal_waivers')
    principal_reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Fine Waiver Application'
        verbose_name_plural = 'Fine Waiver Applications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.student_unique_id} | Inv: {self.invoice.invoice_number} | Status: {self.principal_status}"
    

class ExpenseCategory(BaseModel):
    """
    কলেজের খরচের খাত (যেমন: বিদ্যুৎ ও ইউটিলিটি, শিক্ষক আপ্যায়ন, ল্যাব সরঞ্জাম, মেরামত ও রক্ষণাবেক্ষণ ইত্যাদি)।
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Expense Category'
        verbose_name_plural = 'Expense Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class CollegeExpense(BaseModel):
    """
    কলেজের দৈনন্দিন খরচের ভাউচার মডেল।
    অ্যাকাউন্ট্যান্ট ড্রাফট এন্ট্রি দেবেন এবং প্রিন্সিপাল অনুমোদন করবেন।
    """
    class ExpenseStatus(models.TextChoices):
        PENDING = 'PENDING', 'অপেক্ষমাণ (Pending Approval)'
        APPROVED = 'APPROVED', 'অনুমোদিত (Approved)'
        REJECTED = 'REJECTED', 'বাতিল (Rejected)'

    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.PROTECT,
        related_name='expenses'
    )
    title = models.CharField(max_length=200, help_text="খরচের সংক্ষিপ্ত শিরোনাম")
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="টাকার পরিমাণ")
    voucher_no = models.CharField(max_length=50, unique=True, editable=False, db_index=True)
    voucher_image = models.ImageField(upload_to='vouchers/%Y/%m/', null=True, blank=True)
    
    expense_date = models.DateField(default=timezone.localdate, db_index=True)
    description = models.TextField(blank=True, help_text="খরচের বিস্তারিত ব্যাখ্যা বা ভেন্ডরের তথ্য")
    
    status = models.CharField(
        max_length=15,
        choices=ExpenseStatus.choices,
        default=ExpenseStatus.PENDING,
        db_index=True
    )
    
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_expenses'
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_expenses'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'College Expense'
        verbose_name_plural = 'College Expenses'
        ordering = ['-expense_date', '-created_at']

    def save(self, *args, **kwargs):
        if not self.voucher_no:
            self.voucher_no = f"VCH-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.voucher_no}] {self.title} - {self.amount} BDT ({self.status})"


class TeacherPayroll(BaseModel):
    """
    শিক্ষকদের মাসিক পে-রোল শিট মডেল (অ্যাকাউন্ট্যান্ট জেনারেট করবেন -> প্রিন্সিপাল অ্যাপ্রুভ করবেন -> ডিজবার্স হবে)।
    """
    class PayrollStatus(models.TextChoices):
        PENDING = 'PENDING', 'অপেক্ষমাণ (Pending Approval)'
        APPROVED = 'APPROVED', 'প্রিন্সিপাল কর্তৃক অনুমোদিত (Approved)'
        DISBURSED = 'DISBURSED', 'পরিশোধিত (Disbursed/Paid)'
        REJECTED = 'REJECTED', 'বাতিল (Rejected)'

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payrolls',
        limit_choices_to={'role': User.Role.TEACHER}
    )
    month = models.PositiveSmallIntegerField(help_text="মাসের ক্রমিক নম্বর (১-১২)")
    year = models.PositiveIntegerField()
    
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    bonus_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=20, choices=PayrollStatus.choices, default=PayrollStatus.PENDING, db_index=True)
    payment_method = models.CharField(max_length=20, choices=PaymentTransaction.PaymentMethod.choices, default=PaymentTransaction.PaymentMethod.BANK)
    payment_reference = models.CharField(max_length=100, blank=True, help_text="চেক নম্বর বা ব্যাংক ট্রানজেকশন আইডি")
    
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_payrolls')
    approved_at = models.DateTimeField(null=True, blank=True)
    disbursed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='disbursed_payrolls')
    disbursed_at = models.DateTimeField(null=True, blank=True)
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Teacher Payroll'
        verbose_name_plural = 'Teacher Payrolls'
        unique_together = ('teacher', 'month', 'year')
        ordering = ['-year', '-month']

    def save(self, *args, **kwargs):
        self.net_salary = max(Decimal('0.00'), (self.base_salary + self.bonus_allowance) - self.deductions)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.month}/{self.year} (Net: {self.net_salary} BDT)"


class TeacherSalaryClaim(BaseModel):
    """
    শিক্ষক কর্তৃক অগ্রিম বা বিশেষ বেতন ক্লেইমের মডেল (শিক্ষক আবেদন ➔ প্রিন্সিপাল অ্যাপ্রুভ ➔ অ্যাকাউন্ট্যান্ট ডিজবার্স)।
    """
    class ClaimStatus(models.TextChoices):
        PENDING = 'PENDING', 'পর্যালোচনায় আছে (Pending)'
        APPROVED_BY_PRINCIPAL = 'APPROVED', 'অধ্যক্ষ কর্তৃক অনুমোদিত (Approved by Principal)'
        DISBURSED = 'DISBURSED', 'অ্যাকাউন্ট কর্তৃক পরিশোধিত (Disbursed)'
        REJECTED = 'REJECTED', 'বাতিল (Rejected)'

    class ClaimType(models.TextChoices):
        REGULAR = 'REGULAR', 'মাসিক নিয়মিত বেতন (Regular Monthly Salary)'
        ADVANCE = 'ADVANCE', 'অগ্রিম বেতন দাবি (Salary Advance)'
        SPECIAL = 'SPECIAL', 'বিশেষ সম্মানী বা বোনাস (Special Allowance)'

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='salary_claims',
        limit_choices_to={'role': User.Role.TEACHER}
    )
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()
    claim_type = models.CharField(max_length=20, choices=ClaimType.choices, default=ClaimType.REGULAR)
    requested_amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField(help_text="দাবি বা অগ্রিমের কারণ")

    status = models.CharField(max_length=20, choices=ClaimStatus.choices, default=ClaimStatus.PENDING, db_index=True)
    principal_remarks = models.CharField(max_length=255, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_salary_claims')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    disbursed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='disbursed_salary_claims')
    disbursed_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'Teacher Salary Claim'
        verbose_name_plural = 'Teacher Salary Claims'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.teacher.get_full_name()} | {self.claim_type} ({self.requested_amount} BDT) - {self.status}"


class TransportVehicle(BaseModel):
    """
    কলেজের পরিবহন/গাড়ির তালিকা ও দৈনিক রুট ভিত্তিক চুক্তি।
    """
    vehicle_number = models.CharField(max_length=50, unique=True, help_text="যেমন: ঢাকা মেট্রো-চ-১১-২২৩৩")
    driver_name = models.CharField(max_length=150)
    driver_phone = models.CharField(max_length=20, db_index=True)
    route_name = models.CharField(max_length=200, help_text="যেমন: রুট ১: আম্বরখানা ➔ কলেজ ক্যাম্পাস")
    stoppages = models.TextField(blank=True, help_text="গাড়ির স্টপেজসমূহ, যেমন: আম্বরখানা ➔ চৌহাট্টা ➔ বন্দর ➔ ক্যাম্পাস")
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, help_text="প্রতিদিন গাড়ি চললে নির্ধারিত বিল (BDT)")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Transport Vehicle'
        verbose_name_plural = 'Transport Vehicles'
        ordering = ['route_name']

    def __str__(self):
        return f"{self.vehicle_number} ({self.route_name}) - {self.daily_rate} Tk/day"


class VehicleDailyLog(BaseModel):
    """
    গাড়ির দৈনিক ট্রিপ ও উপস্থিতি লগ (গাড়ি না চললে ওই দিনের বিল নেই)।
    """
    vehicle = models.ForeignKey(TransportVehicle, on_delete=models.CASCADE, related_name='daily_logs')
    date = models.DateField(default=timezone.localdate, db_index=True)
    ran_today = models.BooleanField(default=True, help_text="আজ গাড়ি চলাচল করেছে কি না")
    trips_count = models.PositiveIntegerField(default=2, help_text="সাধারণত আসা ও যাওয়া মিলিয়ে ২টি ট্রিপ")
    remarks = models.CharField(max_length=255, blank=True, help_text="গাড়ি নষ্ট থাকলে বা ট্রিপ মিসের কারণ")
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = 'Vehicle Daily Log'
        verbose_name_plural = 'Vehicle Daily Logs'
        unique_together = ('vehicle', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.vehicle.vehicle_number} - {self.date} (Ran: {self.ran_today})"


class DriverAdvanceDeduction(BaseModel):
    """
    ড্রাইভার কর্তৃক গ্যাস/তেল বাবদ বা ব্যক্তিগত কারণে কলেজ থেকে অগ্রিম টাকা গ্রহণ (যা মাসের বিল থেকে কাটা যাবে)।
    """
    vehicle = models.ForeignKey(TransportVehicle, on_delete=models.CASCADE, related_name='advances')
    date = models.DateField(default=timezone.localdate, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="গৃহীত অগ্রিম টাকার পরিমাণ")
    purpose = models.CharField(max_length=255, help_text="যেমন: সিএনজি গ্যাস রিফিল বা টায়ার মেরামত")
    voucher_no = models.CharField(max_length=50, blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = 'Driver Advance / Deduction'
        verbose_name_plural = 'Driver Advances / Deductions'
        ordering = ['-date']

    def __str__(self):
        return f"{self.vehicle.vehicle_number} | {self.amount} BDT ({self.purpose})"


class VehicleMonthlyBill(BaseModel):
    """
    গাড়ির মালিক বা ড্রাইভারের মাসিক নিট বিল মডেল:
    (যতদিন গাড়ি চলেছে * দৈনিক রেট) - তেলের অগ্রিম টাকা = নিট প্রদেয় বিল
    """
    class BillStatus(models.TextChoices):
        DRAFT = 'DRAFT', 'খসড়া (Draft)'
        APPROVED = 'APPROVED', 'অনুমোদিত (Approved)'
        SETTLED = 'SETTLED', 'পরিশোধিত (Settled/Paid)'

    bill_number = models.CharField(max_length=50, unique=True, editable=False)
    vehicle = models.ForeignKey(TransportVehicle, on_delete=models.CASCADE, related_name='monthly_bills')
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()

    total_days_run = models.PositiveIntegerField(default=0)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    gross_bill = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_payable = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    status = models.CharField(max_length=15, choices=BillStatus.choices, default=BillStatus.DRAFT, db_index=True)
    settled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    settled_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'Vehicle Monthly Bill'
        verbose_name_plural = 'Vehicle Monthly Bills'
        unique_together = ('vehicle', 'month', 'year')
        ordering = ['-year', '-month']

    def save(self, *args, **kwargs):
        if not self.bill_number:
            self.bill_number = f"VBILL-{self.year}{self.month:02d}-{uuid.uuid4().hex[:6].upper()}"
        self.gross_bill = self.total_days_run * self.daily_rate
        self.net_payable = max(Decimal('0.00'), self.gross_bill - self.total_deductions)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.bill_number} | {self.vehicle.vehicle_number} ({self.net_payable} BDT) - {self.status}"


class VehicleBreakdownAlert(BaseModel):
    """
    মাঝপথে গাড়ি নষ্ট হওয়ার ইমার্জেন্সি রিপোর্ট।
    ড্রাইভারের কলের পর অ্যাকাউন্ট্যান্ট বা প্রিন্সিপাল অফিসিয়ালি নোটিশ জারি করবেন।
    """
    vehicle = models.ForeignKey(TransportVehicle, on_delete=models.CASCADE, related_name='breakdowns')
    location = models.CharField(max_length=200, help_text="যে স্থানে গাড়ি নষ্ট হয়েছে")
    reason = models.TextField(help_text="যান্ত্রিক ত্রুটির কারণ")
    alert_message = models.TextField(help_text="শিক্ষার্থী ও অভিভাবকদের পাঠানো বার্তা")
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = 'Vehicle Breakdown Alert'
        verbose_name_plural = 'Vehicle Breakdown Alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.vehicle.vehicle_number}] {self.location} - Resolved: {self.is_resolved}"


class InchargeCashHandover(BaseModel):
    """
    শ্রেণি ইনচার্জ কর্তৃক সারাদিনে শিক্ষার্থীদের থেকে আদায়কৃত ক্যাশ টাকা অ্যাকাউন্ট্যান্টের কাছে বুঝিয়ে দেওয়ার রিকনসিলিয়েশন মডেল।
    """
    class HandoverStatus(models.TextChoices):
        PENDING = 'PENDING', 'অপেক্ষমাণ (Pending Verification)'
        VERIFIED = 'VERIFIED', 'গৃহীত ও যাচাইকৃত (Verified & Received)'
        DISCREPANCY = 'DISCREPANCY', 'টাকার হিসাবে অমিল (Discrepancy Found)'

    in_charge = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='cash_handovers',
        limit_choices_to={'role': User.Role.TEACHER}
    )
    handover_date = models.DateField(default=timezone.localdate, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="ইনচার্জ কর্তৃক বুঝিয়ে দেওয়া নগদ টাকা")
    status = models.CharField(max_length=20, choices=HandoverStatus.choices, default=HandoverStatus.PENDING, db_index=True)
    
    received_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_handovers',
        help_text="যে অ্যাকাউন্ট্যান্ট ক্যাশ বুঝে নিলেন"
    )
    received_at = models.DateTimeField(null=True, blank=True)
    notes = models.CharField(max_length=255, blank=True, help_text="হিসাব সংক্রান্ত কোনো মন্তব্য")

    class Meta:
        verbose_name = 'In-Charge Cash Handover'
        verbose_name_plural = 'In-Charge Cash Handovers'
        ordering = ['-handover_date', '-created_at']

    def __str__(self):
        return f"{self.in_charge.get_full_name()} -> {self.amount} BDT [{self.handover_date}] ({self.status})"


class BankDeposit(BaseModel):
    """
    কলেজের ড্রয়ার থেকে ব্যাংকে টাকা জমা দেওয়ার রেকর্ড ও ব্যাংক ডিপোজিট স্লিপ মডেল (Cash to Bank Transfer)।
    """
    bank_name = models.CharField(max_length=150, help_text="যেমন: সোনালী ব্যাংক, ডাচ-বাংলা ব্যাংক")
    account_number = models.CharField(max_length=50, help_text="কলেজের ব্যাংক অ্যাকাউন্ট নম্বর")
    deposit_date = models.DateField(default=timezone.localdate, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="ব্যাংকে জমাকৃত টাকার পরিমাণ")
    
    slip_number = models.CharField(max_length=100, help_text="ব্যাংক জমার স্লিপ বা ট্রানজেকশন নম্বর")
    slip_image = models.ImageField(upload_to='bank_slips/%Y/%m/', null=True, blank=True, help_text="ব্যাংক রসিদের ছবি")
    
    deposited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Bank Deposit'
        verbose_name_plural = 'Bank Deposits'
        ordering = ['-deposit_date']

    def __str__(self):
        return f"{self.bank_name} ({self.account_number}) - {self.amount} BDT [{self.deposit_date}]"


class Supplier(BaseModel):
    """
    কলেজের সরবরাহকারী বা দোকানদারদের তথ্য (যেমন: প্রিন্টিং প্রেস, ফার্নিচার দোকান, ল্যাব ভেন্ডর)।
    """
    name = models.CharField(max_length=150, unique=True, help_text="দোকান বা ভেন্ডরের নাম")
    service_type = models.CharField(max_length=100, help_text="যেমন: প্রিন্টিং প্রেস, ফার্নিচার, স্টেশনারি")
    contact_person = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, db_index=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Supplier / Vendor'
        verbose_name_plural = 'Suppliers & Vendors'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.service_type})"


class SupplierPurchase(BaseModel):
    """
    ভেন্ডর থেকে কেনাকাটা বা কাজের বিল।
    """
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchases')
    invoice_no = models.CharField(max_length=100, unique=True)
    purchase_date = models.DateField(default=timezone.localdate)
    item_description = models.TextField(help_text="যেমন: ৫০টি পরীক্ষার ব্যানার ও প্রশ্নপত্র প্রিন্টিং")
    total_bill = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    due_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        verbose_name = 'Supplier Purchase'
        verbose_name_plural = 'Supplier Purchases'
        ordering = ['-purchase_date']
        indexes = [
            models.Index(fields=['supplier', 'due_amount']),
        ]

    def save(self, *args, **kwargs):
        self.due_amount = max(Decimal('0.00'), self.total_bill - self.paid_amount)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.supplier.name} - Inv: {self.invoice_no} (Due: {self.due_amount})"


class SupplierPayment(BaseModel):
    """
    দোকানদার/ভেন্ডরদের বকেয়া কিস্তির পরিশোধ মডেল।
    """
    purchase = models.ForeignKey(SupplierPurchase, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateField(default=timezone.localdate)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentTransaction.PaymentMethod.choices, default=PaymentTransaction.PaymentMethod.CASH)
    payment_receipt_no = models.CharField(max_length=100, blank=True)
    paid_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Supplier Payment'
        verbose_name_plural = 'Supplier Payments'
        ordering = ['-payment_date']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # মূল পারচেজ বিলে পরিশোধ সমন্বয় করা
        p = self.purchase
        total_paid = p.payments.aggregate(total=models.Sum('amount_paid'))['total'] or Decimal('0.00')
        p.paid_amount = total_paid
        p.save()

    def __str__(self):
        return f"Payment of {self.amount_paid} to {self.purchase.supplier.name}"