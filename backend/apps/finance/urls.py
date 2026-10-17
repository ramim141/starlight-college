from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.finance.views import (
    BankDepositViewSet,
    CollegeExpenseViewSet,
    DailyCashClosingView,
    DriverAdvanceDeductionViewSet,
    ExpenseCategoryViewSet,
    FinancialBalanceSheetView,
    FineWaiverApplicationViewSet,
    InchargeCashHandoverViewSet,
    MasterDefaulterListView,
    StudentInvoiceViewSet,
    SupplierPurchaseViewSet,
    SupplierViewSet,
    TeacherPayrollViewSet,
    TeacherSalaryClaimViewSet,
    TransportVehicleViewSet,
    VehicleDailyLogViewSet,
    VehicleMonthlyBillViewSet,
)

app_name = 'finance'

router = DefaultRouter()
router.register(r'invoices', StudentInvoiceViewSet, basename='invoice')
router.register(r'waivers', FineWaiverApplicationViewSet, basename='waiver')
router.register(r'categories', ExpenseCategoryViewSet, basename='expense-category')
router.register(r'expenses', CollegeExpenseViewSet, basename='expense')
router.register(r'payrolls', TeacherPayrollViewSet, basename='payroll')
router.register(r'salary-claims', TeacherSalaryClaimViewSet, basename='salary-claim')
router.register(r'vehicles', TransportVehicleViewSet, basename='vehicle')
router.register(r'vehicle-logs', VehicleDailyLogViewSet, basename='vehicle-log')
router.register(r'driver-advances', DriverAdvanceDeductionViewSet, basename='driver-advance')
router.register(r'vehicle-bills', VehicleMonthlyBillViewSet, basename='vehicle-bill')
router.register(r'cash-handovers', InchargeCashHandoverViewSet, basename='cash-handover')
router.register(r'bank-deposits', BankDepositViewSet, basename='bank-deposit')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'supplier-purchases', SupplierPurchaseViewSet, basename='supplier-purchase')

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/balance-sheet/', FinancialBalanceSheetView.as_view(), name='balance-sheet'),
    path('analytics/daily-closing/', DailyCashClosingView.as_view(), name='daily-closing'),
    path('analytics/defaulters/', MasterDefaulterListView.as_view(), name='master-defaulters'),
]