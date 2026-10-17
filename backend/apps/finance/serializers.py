from decimal import Decimal
import uuid
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import serializers

from apps.academics.models import AcademicSection, StudentAttendance
from apps.finance.models import FineWaiverApplication, PaymentTransaction, StudentInvoice, CollegeExpense, ExpenseCategory, VehicleBreakdownAlert
from apps.finance.models import (
    DriverAdvanceDeduction,
    TeacherPayroll,
    TeacherSalaryClaim,
    TransportVehicle,
    VehicleDailyLog,
    VehicleMonthlyBill,
)
from apps.users_auth.models import StudentProfile, User
from apps.finance.models import (
    BankDeposit,
    InchargeCashHandover,
    Supplier,
    SupplierPayment,
    SupplierPurchase,
)




class PaymentTransactionSerializer(serializers.ModelSerializer):
    collected_by_name = serializers.SerializerMethodField()
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id',
            'receipt_no',
            'invoice',
            'amount_paid',
            'payment_method',
            'payment_method_display',
            'transaction_reference',
            'collected_by',
            'collected_by_name',
            'remarks',
            'created_at',
        ]
        read_only_fields = ['id', 'receipt_no', 'collected_by', 'created_at']

    def get_collected_by_name(self, obj) -> str | None:
        if obj.collected_by:
            return obj.collected_by.get_full_name() or obj.collected_by.username
        return None

    def validate_amount_paid(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("জমার পরিমাণ ০ টাকার বেশি হতে হবে।")
        return value


class StudentInvoiceSerializer(serializers.ModelSerializer):
    student_unique_id = serializers.CharField(source='student.student_unique_id', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    section_name = serializers.CharField(source='section.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payments = PaymentTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = StudentInvoice
        fields = [
            'id',
            'invoice_number',
            'student',
            'student_unique_id',
            'student_name',
            'roll_number',
            'section',
            'section_name',
            'month',
            'year',
            'tuition_fee',
            'transport_fee',
            'absence_fine',
            'other_fees',
            'waiver_amount',
            'total_amount',
            'paid_amount',
            'due_amount',
            'status',
            'status_display',
            'due_date',
            'payments',
            'created_at',
        ]
        read_only_fields = [
            'id', 'invoice_number', 'total_amount', 'paid_amount',
            'due_amount', 'status', 'created_at'
        ]


class InvoiceGenerateSerializer(serializers.Serializer):
    """
    এক বা একাধিক মাসের জন্য পুরো সেকশন বা নির্দিষ্ট শিক্ষার্থীর ইনভয়েস বাল্ক তৈরির সিরিয়ালাইজার।
    """
    section_id = serializers.UUIDField(required=False, allow_null=True)
    student_id = serializers.UUIDField(required=False, allow_null=True)
    months = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=12),
        allow_empty=False,
        help_text="এক বা একাধিক মাস, যেমন: [10, 11]"
    )
    year = serializers.IntegerField(default=2026)
    due_date = serializers.DateField(required=False, allow_null=True)
    other_fees = serializers.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00')
    )

    def validate(self, attrs):
        if not attrs.get('section_id') and not attrs.get('student_id'):
            raise serializers.ValidationError("অবশ্যই 'section_id' অথবা 'student_id'-এর যেকোনো একটি প্রদান করতে হবে।")
        return attrs

    @transaction.atomic
    def generate(self, created_by_user):
        section_id = self.validated_data.get('section_id')
        student_id = self.validated_data.get('student_id')
        months = self.validated_data['months']
        year = self.validated_data['year']
        due_date = self.validated_data.get('due_date')
        other_fees = self.validated_data.get('other_fees', Decimal('0.00'))

        if student_id:
            students = StudentProfile.objects.filter(id=student_id, user__is_active=True)
        else:
            students = StudentProfile.objects.filter(section_id=section_id, user__is_active=True)

        students = list(students.select_related('section'))
        student_ids = [student.id for student in students]
        existing = set(
            StudentInvoice.objects.filter(
                student_id__in=student_ids, month__in=months, year=year
            ).values_list('student_id', 'month')
        )
        attendance_counts = {}
        attendance_rows = StudentAttendance.objects.filter(
                student_id__in=student_ids,
                date__year=year,
                date__month__in=months,
                status=StudentAttendance.AttendanceStatus.ABSENT,
            ).values('student_id', 'date__month').annotate(absent_days=Count('id'))
        for row in attendance_rows:
            attendance_counts[(row['student_id'], row['date__month'])] = row['absent_days']

        invoices_to_create = []
        for student in students:
            for month in months:
                if (student.id, month) in existing:
                    continue
                absence_fine = Decimal(str(
                    attendance_counts.get((student.id, month), 0) * 100
                ))
                transport_fee = (
                    student.monthly_transport_fee
                    if student.uses_transport else Decimal('0.00')
                )
                invoices_to_create.append(StudentInvoice(
                    invoice_number=f"INV-{year}{month:02d}-{uuid.uuid4().hex[:6].upper()}",
                    student=student,
                    section=student.section,
                    month=month,
                    year=year,
                    tuition_fee=student.monthly_tuition_fee,
                    transport_fee=transport_fee,
                    absence_fine=absence_fine,
                    other_fees=other_fees,
                    due_date=due_date,
                    created_by=created_by_user,
                ))

        for invoice in invoices_to_create:
            invoice.calculate_totals()
        created_invoices = StudentInvoice.objects.bulk_create(invoices_to_create)

        return created_invoices


class FineWaiverApplicationSerializer(serializers.ModelSerializer):
    student_unique_id = serializers.CharField(source='student.student_unique_id', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    roll_number = serializers.CharField(source='student.roll_number', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    absence_fine = serializers.DecimalField(source='invoice.absence_fine', max_digits=10, decimal_places=2, read_only=True)
    total_amount = serializers.DecimalField(source='invoice.total_amount', max_digits=10, decimal_places=2, read_only=True)
    due_amount = serializers.DecimalField(source='invoice.due_amount', max_digits=10, decimal_places=2, read_only=True)
    incharge_status_display = serializers.CharField(source='get_incharge_status_display', read_only=True)
    principal_status_display = serializers.CharField(source='get_principal_status_display', read_only=True)
    reviewed_by_incharge_name = serializers.SerializerMethodField()
    approved_by_principal_name = serializers.SerializerMethodField()

    class Meta:
        model = FineWaiverApplication
        fields = [
            'id',
            'invoice',
            'invoice_number',
            'student',
            'student_unique_id',
            'student_name',
            'roll_number',
            'absence_fine',
            'total_amount',
            'due_amount',
            'reason',
            'incharge_status',
            'incharge_status_display',
            'recommended_waiver_amount',
            'incharge_remarks',
            'reviewed_by_incharge',
            'reviewed_by_incharge_name',
            'incharge_reviewed_at',
            'principal_status',
            'principal_status_display',
            'approved_waiver_amount',
            'principal_remarks',
            'approved_by_principal',
            'approved_by_principal_name',
            'principal_reviewed_at',
            'created_at',
        ]
        read_only_fields = [
            'id', 'student', 'incharge_status', 'incharge_remarks', 'reviewed_by_incharge',
            'incharge_reviewed_at', 'principal_status', 'approved_waiver_amount', 'principal_remarks',
            'approved_by_principal', 'principal_reviewed_at', 'created_at'
        ]

    def get_reviewed_by_incharge_name(self, obj) -> str | None:
        if obj.reviewed_by_incharge:
            return obj.reviewed_by_incharge.get_full_name() or obj.reviewed_by_incharge.username
        return None

    def get_approved_by_principal_name(self, obj) -> str | None:
        if obj.approved_by_principal:
            return obj.approved_by_principal.get_full_name() or obj.approved_by_principal.username
        return None

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class CollegeExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    recorded_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CollegeExpense
        fields = [
            'id',
            'voucher_no',
            'category',
            'category_name',
            'title',
            'amount',
            'voucher_image',
            'expense_date',
            'description',
            'status',
            'status_display',
            'recorded_by',
            'recorded_by_name',
            'approved_by',
            'approved_by_name',
            'approved_at',
            'rejection_reason',
            'created_at',
        ]
        read_only_fields = [
            'id', 'voucher_no', 'status', 'recorded_by', 'approved_by',
            'approved_at', 'rejection_reason', 'created_at'
        ]

    def get_recorded_by_name(self, obj) -> str | None:
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.username
        return None

    def get_approved_by_name(self, obj) -> str | None:
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.username
        return None

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("খরচের পরিমাণ অবশ্যই ০ টাকার বেশি হতে হবে।")
        return value


class TeacherPayrollSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    employee_id = serializers.CharField(source='teacher.teacher_profile.employee_id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    disbursed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherPayroll
        fields = [
            'id',
            'teacher',
            'teacher_name',
            'employee_id',
            'month',
            'year',
            'base_salary',
            'bonus_allowance',
            'deductions',
            'net_salary',
            'status',
            'status_display',
            'payment_method',
            'payment_reference',
            'approved_by',
            'approved_by_name',
            'approved_at',
            'disbursed_by',
            'disbursed_by_name',
            'disbursed_at',
            'remarks',
            'created_at',
        ]
        read_only_fields = ['id', 'net_salary', 'status', 'approved_by', 'approved_at', 'disbursed_by', 'disbursed_at', 'created_at']

    def get_teacher_name(self, obj) -> str:
        return obj.teacher.get_full_name() or obj.teacher.username

    def get_approved_by_name(self, obj) -> str | None:
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.username
        return None

    def get_disbursed_by_name(self, obj) -> str | None:
        if obj.disbursed_by:
            return obj.disbursed_by.get_full_name() or obj.disbursed_by.username
        return None


class TeacherSalaryClaimSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    claim_type_display = serializers.CharField(source='get_claim_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    disbursed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherSalaryClaim
        fields = [
            'id',
            'teacher',
            'teacher_name',
            'month',
            'year',
            'claim_type',
            'claim_type_display',
            'requested_amount',
            'reason',
            'status',
            'status_display',
            'principal_remarks',
            'approved_by',
            'approved_by_name',
            'approved_at',
            'disbursed_by',
            'disbursed_by_name',
            'disbursed_at',
            'payment_reference',
            'created_at',
        ]
        read_only_fields = ['id', 'teacher', 'status', 'approved_by', 'approved_at', 'disbursed_by', 'disbursed_at', 'created_at']

    def get_teacher_name(self, obj) -> str:
        return obj.teacher.get_full_name() or obj.teacher.username

    def get_approved_by_name(self, obj) -> str | None:
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.username
        return None

    def get_disbursed_by_name(self, obj) -> str | None:
        if obj.disbursed_by:
            return obj.disbursed_by.get_full_name() or obj.disbursed_by.username
        return None


class TransportVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportVehicle
        fields = '__all__'


class VehicleDailyLogSerializer(serializers.ModelSerializer):
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = VehicleDailyLog
        fields = ['id', 'vehicle', 'vehicle_number', 'date', 'ran_today', 'trips_count', 'remarks', 'recorded_by', 'recorded_by_name', 'created_at']
        read_only_fields = ['id', 'recorded_by', 'created_at']

    def get_recorded_by_name(self, obj) -> str | None:
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.username
        return None


class DriverAdvanceDeductionSerializer(serializers.ModelSerializer):
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DriverAdvanceDeduction
        fields = ['id', 'vehicle', 'vehicle_number', 'date', 'amount', 'purpose', 'voucher_no', 'recorded_by', 'recorded_by_name', 'created_at']
        read_only_fields = ['id', 'recorded_by', 'created_at']

    def get_recorded_by_name(self, obj) -> str | None:
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.username
        return None


class VehicleMonthlyBillSerializer(serializers.ModelSerializer):
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    route_name = serializers.CharField(source='vehicle.route_name', read_only=True)
    driver_name = serializers.CharField(source='vehicle.driver_name', read_only=True)
    driver_phone = serializers.CharField(source='vehicle.driver_phone', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    settled_by_name = serializers.SerializerMethodField()

    class Meta:
        model = VehicleMonthlyBill
        fields = [
            'id',
            'bill_number',
            'vehicle',
            'vehicle_number',
            'route_name',
            'driver_name',
            'driver_phone',
            'month',
            'year',
            'total_days_run',
            'daily_rate',
            'gross_bill',
            'total_deductions',
            'net_payable',
            'status',
            'status_display',
            'settled_by',
            'settled_by_name',
            'settled_at',
            'payment_reference',
            'created_at',
        ]
        read_only_fields = ['id', 'bill_number', 'total_days_run', 'daily_rate', 'gross_bill', 'total_deductions', 'net_payable', 'status', 'settled_by', 'settled_at', 'created_at']

    def get_settled_by_name(self, obj) -> str | None:
        if obj.settled_by:
            return obj.settled_by.get_full_name() or obj.settled_by.username
        return None


class VehicleBreakdownAlertSerializer(serializers.ModelSerializer):
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    route_name = serializers.CharField(source='vehicle.route_name', read_only=True)
    reported_by_name = serializers.SerializerMethodField()

    class Meta:
        model = VehicleBreakdownAlert
        fields = [
            'id', 'vehicle', 'vehicle_number', 'route_name', 'location', 
            'reason', 'alert_message', 'is_resolved', 'resolved_at', 
            'reported_by', 'reported_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'reported_by', 'resolved_at', 'created_at']

    def get_reported_by_name(self, obj) -> str | None:
        if obj.reported_by:
            return obj.reported_by.get_full_name() or obj.reported_by.username
        return None


class InchargeCashHandoverSerializer(serializers.ModelSerializer):
    in_charge_name = serializers.CharField(source='in_charge.get_full_name', read_only=True)
    received_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = InchargeCashHandover
        fields = [
            'id', 'in_charge', 'in_charge_name', 'handover_date', 'amount', 
            'status', 'status_display', 'received_by', 'received_by_name', 
            'received_at', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'in_charge', 'status', 'received_by', 'received_at', 'created_at']

    def get_received_by_name(self, obj) -> str | None:
        if obj.received_by:
            return obj.received_by.get_full_name() or obj.received_by.username
        return None


class BankDepositSerializer(serializers.ModelSerializer):
    deposited_by_name = serializers.SerializerMethodField()

    class Meta:
        model = BankDeposit
        fields = [
            'id', 'bank_name', 'account_number', 'deposit_date', 'amount', 
            'slip_number', 'slip_image', 'deposited_by', 'deposited_by_name', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'deposited_by', 'created_at']

    def get_deposited_by_name(self, obj) -> str | None:
        if obj.deposited_by:
            return obj.deposited_by.get_full_name() or obj.deposited_by.username
        return None


class SupplierSerializer(serializers.ModelSerializer):
    total_due = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = ['id', 'name', 'service_type', 'contact_person', 'phone', 'address', 'total_due', 'is_active', 'created_at']

    def get_total_due(self, obj) -> float:
        if hasattr(obj, 'total_due_amount'):
            total = obj.total_due_amount or Decimal('0.00')
        else:
            total = obj.purchases.aggregate(
                due=models.Sum('due_amount')
            )['due'] or Decimal('0.00')
        return float(total)


class SupplierPaymentSerializer(serializers.ModelSerializer):
    paid_by_name = serializers.CharField(source='paid_by.get_full_name', read_only=True)

    class Meta:
        model = SupplierPayment
        fields = ['id', 'purchase', 'payment_date', 'amount_paid', 'payment_method', 'payment_receipt_no', 'paid_by', 'paid_by_name', 'remarks', 'created_at']
        read_only_fields = ['id', 'paid_by', 'created_at']


class SupplierPurchaseSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    payments = SupplierPaymentSerializer(many=True, read_only=True)

    class Meta:
        model = SupplierPurchase
        fields = ['id', 'supplier', 'supplier_name', 'invoice_no', 'purchase_date', 'item_description', 'total_bill', 'paid_amount', 'due_amount', 'payments', 'created_at']
        read_only_fields = ['id', 'paid_amount', 'due_amount', 'created_at']