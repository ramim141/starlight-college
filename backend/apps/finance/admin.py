from django.contrib import admin
from apps.finance.models import (
    CollegeExpense,
    DriverAdvanceDeduction,
    ExpenseCategory,
    FineWaiverApplication,
    PaymentTransaction,
    StudentInvoice,
    TeacherPayroll,
    TeacherSalaryClaim,
    TransportVehicle,
    VehicleBreakdownAlert,
    VehicleDailyLog,
    VehicleMonthlyBill,
    BankDeposit,
    InchargeCashHandover,
    Supplier,
    SupplierPayment,
    SupplierPurchase,
)

@admin.register(StudentInvoice)
class StudentInvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'student', 'month', 'year', 'total_amount', 'paid_amount', 'due_amount', 'status')
    list_filter = ('status', 'year', 'month')
    search_fields = ('invoice_number', 'student__student_unique_id')

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('receipt_no', 'invoice', 'amount_paid', 'payment_method', 'transaction_reference', 'collected_by')
    list_filter = ('payment_method',)
    search_fields = ('receipt_no', 'transaction_reference')

@admin.register(FineWaiverApplication)
class FineWaiverApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'invoice', 'incharge_status', 'recommended_waiver_amount', 'principal_status', 'approved_waiver_amount')
    list_filter = ('incharge_status', 'principal_status')

@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')

@admin.register(CollegeExpense)
class CollegeExpenseAdmin(admin.ModelAdmin):
    list_display = ('voucher_no', 'title', 'category', 'amount', 'expense_date', 'status', 'approved_by')
    list_filter = ('status', 'expense_date', 'category')
    search_fields = ('voucher_no', 'title')

@admin.register(TeacherPayroll)
class TeacherPayrollAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'month', 'year', 'base_salary', 'net_salary', 'status')
    list_filter = ('status', 'year', 'month')

@admin.register(TeacherSalaryClaim)
class TeacherSalaryClaimAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'claim_type', 'requested_amount', 'status', 'approved_by')
    list_filter = ('status', 'claim_type')

@admin.register(TransportVehicle)
class TransportVehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle_number', 'driver_name', 'driver_phone', 'route_name', 'daily_rate', 'is_active')
    search_fields = ('vehicle_number', 'driver_name', 'route_name', 'stoppages')

@admin.register(VehicleBreakdownAlert)
class VehicleBreakdownAlertAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'location', 'is_resolved', 'reported_by', 'created_at')
    list_filter = ('is_resolved', 'created_at')
    search_fields = ('vehicle__vehicle_number', 'location', 'reason')

@admin.register(VehicleDailyLog)
class VehicleDailyLogAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'date', 'ran_today', 'trips_count', 'remarks')
    list_filter = ('ran_today', 'date')

@admin.register(DriverAdvanceDeduction)
class DriverAdvanceDeductionAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'date', 'amount', 'purpose', 'recorded_by')
    list_filter = ('date',)

@admin.register(VehicleMonthlyBill)
class VehicleMonthlyBillAdmin(admin.ModelAdmin):
    list_display = ('bill_number', 'vehicle', 'month', 'year', 'total_days_run', 'gross_bill', 'total_deductions', 'net_payable', 'status')
    list_filter = ('status', 'year', 'month')



@admin.register(InchargeCashHandover)
class InchargeCashHandoverAdmin(admin.ModelAdmin):
    list_display = ('in_charge', 'handover_date', 'amount', 'status', 'received_by', 'received_at')
    list_filter = ('status', 'handover_date')
    search_fields = ('in_charge__username', 'in_charge__first_name')


@admin.register(BankDeposit)
class BankDepositAdmin(admin.ModelAdmin):
    list_display = ('bank_name', 'account_number', 'deposit_date', 'amount', 'slip_number', 'deposited_by')
    list_filter = ('bank_name', 'deposit_date')
    search_fields = ('account_number', 'slip_number')


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'service_type', 'phone', 'contact_person', 'is_active')
    search_fields = ('name', 'phone')


@admin.register(SupplierPurchase)
class SupplierPurchaseAdmin(admin.ModelAdmin):
    list_display = ('invoice_no', 'supplier', 'purchase_date', 'total_bill', 'paid_amount', 'due_amount')
    list_filter = ('purchase_date', 'supplier')
    search_fields = ('invoice_no', 'supplier__name')


@admin.register(SupplierPayment)
class SupplierPaymentAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'payment_date', 'amount_paid', 'payment_method', 'paid_by')
    list_filter = ('payment_date', 'payment_method')