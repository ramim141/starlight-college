from datetime import datetime
from decimal import Decimal
from django.db import transaction
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAccountantOrPrincipal, IsPrincipal, IsTeacherOrPrincipal
from apps.finance.models import (
    BankDeposit,
    CollegeExpense,
    DriverAdvanceDeduction,
    ExpenseCategory,
    FineWaiverApplication,
    InchargeCashHandover,
    PaymentTransaction,
    StudentInvoice,
    Supplier,
    SupplierPayment,
    SupplierPurchase,
    TeacherPayroll,
    TeacherSalaryClaim,
    TransportVehicle,
    VehicleBreakdownAlert,
    VehicleDailyLog,
    VehicleMonthlyBill,
)
from apps.finance.serializers import (
    BankDepositSerializer,
    CollegeExpenseSerializer,
    DriverAdvanceDeductionSerializer,
    ExpenseCategorySerializer,
    FineWaiverApplicationSerializer,
    InchargeCashHandoverSerializer,
    InvoiceGenerateSerializer,
    PaymentTransactionSerializer,
    StudentInvoiceSerializer,
    SupplierPaymentSerializer,
    SupplierPurchaseSerializer,
    SupplierSerializer,
    TeacherPayrollSerializer,
    TeacherSalaryClaimSerializer,
    TransportVehicleSerializer,
    VehicleBreakdownAlertSerializer,
    VehicleDailyLogSerializer,
    VehicleMonthlyBillSerializer,
)
from apps.users_auth.models import User


class StudentInvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ইনভয়েস পরিচালনা, বাল্ক বিল জেনারেশন এবং ফি কালেকশন ভিউসেট।
    """
    queryset = StudentInvoice.objects.select_related('student', 'student__user', 'section').prefetch_related('payments').all()
    serializer_class = StudentInvoiceSerializer

    def get_permissions(self):
        if self.action in ['generate_invoices']:
            return [IsAccountantOrPrincipal()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('payments')
        else:
            queryset = queryset.prefetch_related(None)

        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)
        elif user.role == User.Role.TEACHER:
            queryset = queryset.filter(section__in_charge_teacher=user)

        section_id = self.request.query_params.get('section')
        if section_id:
            queryset = queryset.filter(section_id=section_id)

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        return queryset

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_invoices(self, request):
        serializer = InvoiceGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invoices = serializer.generate(created_by_user=request.user)

        return Response({
            "success": True,
            "message": f"মোট {len(invoices)} টি নতুন ইনভয়েস সফলভাবে জেনারেট করা হয়েছে।",
            "total_generated": len(invoices)
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='collect-payment')
    @transaction.atomic
    def collect_payment(self, request, pk=None):
        invoice = self.get_object()
        user = request.user

        # পারমিশন ও বাউন্ডারি চেক: অ্যাকাউন্ট্যান্ট, প্রিন্সিপাল অথবা নিজ সেকশনের শ্রেণি ইনচার্জ
        if user.role not in [User.Role.ACCOUNTANT, User.Role.PRINCIPAL, User.Role.TEACHER] and not user.is_superuser:
            raise PermissionDenied("ফি আদায়ের অনুমতি আপনার নেই।")

        if user.role == User.Role.TEACHER:
            if invoice.section.in_charge_teacher_id != user.id:
                raise PermissionDenied(f"আপনি '{invoice.section}' শাখার শ্রেণি ইনচার্জ নন। শুধুমাত্র শ্রেণি ইনচার্জ নিজ ক্লাসের ফি গ্রহণ করতে পারবেন।")

        invoice = StudentInvoice.objects.select_for_update().select_related(
            'section', 'section__in_charge_teacher'
        ).get(pk=invoice.pk)
        serializer = PaymentTransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount_to_pay = serializer.validated_data['amount_paid']

        if invoice.status == StudentInvoice.InvoiceStatus.PAID:
            return Response(
                {"success": False, "message": "এই ইনভয়েসটির সম্পূর্ণ বিল ইতিমধ্যে পরিশোধিত।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if amount_to_pay > invoice.due_amount:
            return Response(
                {"success": False, "message": f"প্রদত্ত পরিমাণ বকেয়া টাকার চেয়ে বেশি। বর্তমান বকেয়া: {invoice.due_amount} টাকা।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment = serializer.save(invoice=invoice, collected_by=request.user)
        
        # ইনভয়েস আপডেট
        invoice.paid_amount += amount_to_pay
        invoice.save()

        return Response({
            "success": True,
            "message": f"{amount_to_pay} টাকা সফলভাবে গৃহীত হয়েছে। রসিদ নম্বর: {payment.receipt_no}",
            "receipt": PaymentTransactionSerializer(payment).data,
            "invoice_status": invoice.status,
            "current_due": invoice.due_amount
        }, status=status.HTTP_201_CREATED)


class FineWaiverApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = FineWaiverApplicationSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = FineWaiverApplication.objects.select_related('student', 'student__user', 'invoice').all()

        if user.role in [User.Role.PRINCIPAL, User.Role.ACCOUNTANT] or user.is_superuser:
            return queryset

        if user.role == User.Role.TEACHER:
            return queryset.filter(invoice__section__in_charge_teacher=user)

        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)

        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != User.Role.STUDENT or not hasattr(user, 'student_profile'):
            raise PermissionDenied("শুধুমাত্র শিক্ষার্থীরা মওকুফের আবেদন করতে পারে।")

        invoice = serializer.validated_data['invoice']
        if invoice.student != user.student_profile:
            raise PermissionDenied("আপনি শুধুমাত্র নিজের ইনভয়েসের জন্য মওকুফের আবেদন করতে পারেন।")

        serializer.save(student=user.student_profile)

    @action(detail=True, methods=['patch'], url_path='incharge-recommend')
    def incharge_recommend(self, request, pk=None):
        waiver_app = self.get_object()
        user = request.user

        if user.role != User.Role.PRINCIPAL and waiver_app.invoice.section.in_charge_teacher_id != user.id:
            raise PermissionDenied("আপনি এই শিক্ষার্থীর শ্রেণি ইনচার্জ নন।")

        status_input = request.data.get('status', '').upper()
        if status_input not in [
            FineWaiverApplication.InChargeWaiverStatus.RECOMMENDED,
            FineWaiverApplication.InChargeWaiverStatus.REJECTED
        ]:
            return Response({"success": False, "message": "status হিসেবে RECOMMENDED অথবা REJECTED দিন।"}, status=status.HTTP_400_BAD_REQUEST)

        recommended_amount = Decimal(str(request.data.get('recommended_waiver_amount', '0.00')))
        if recommended_amount > waiver_app.invoice.absence_fine and recommended_amount > waiver_app.invoice.total_amount:
            return Response({"success": False, "message": "সুপারিশকৃত টাকার পরিমাণ মূল বিলের চেয়ে বেশি হতে পারে না।"}, status=status.HTTP_400_BAD_REQUEST)

        waiver_app.incharge_status = status_input
        waiver_app.recommended_waiver_amount = recommended_amount
        waiver_app.incharge_remarks = request.data.get('remarks', '')
        waiver_app.reviewed_by_incharge = user
        waiver_app.incharge_reviewed_at = timezone.now()
        waiver_app.save()

        return Response({
            "success": True,
            "message": f"আবেদনটিতে সফলভাবে ইনচার্জের মতামত সংরক্ষিত হয়েছে ({waiver_app.get_incharge_status_display()})।",
            "data": FineWaiverApplicationSerializer(waiver_app).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='principal-approve')
    @transaction.atomic
    def principal_approve(self, request, pk=None):
        waiver_app = self.get_object()
        status_input = request.data.get('status', '').upper()

        if status_input not in [
            FineWaiverApplication.PrincipalWaiverStatus.APPROVED,
            FineWaiverApplication.PrincipalWaiverStatus.REJECTED
        ]:
            return Response({"success": False, "message": "status হিসেবে APPROVED অথবা REJECTED দিন।"}, status=status.HTTP_400_BAD_REQUEST)

        approved_amount = Decimal(str(request.data.get('approved_waiver_amount', waiver_app.recommended_waiver_amount)))
        
        waiver_app.principal_status = status_input
        waiver_app.approved_waiver_amount = approved_amount if status_input == FineWaiverApplication.PrincipalWaiverStatus.APPROVED else Decimal('0.00')
        waiver_app.principal_remarks = request.data.get('remarks', '')
        waiver_app.approved_by_principal = request.user
        waiver_app.principal_reviewed_at = timezone.now()
        waiver_app.save()

        if status_input == FineWaiverApplication.PrincipalWaiverStatus.APPROVED:
            invoice = waiver_app.invoice
            invoice.waiver_amount += approved_amount
            invoice.save()

        return Response({
            "success": True,
            "message": f"মওকুফের আবেদন সফলভাবে '{waiver_app.get_principal_status_display()}' করা হয়েছে এবং ইনভয়েসের বকেয়া আপডেট হয়েছে।",
            "updated_invoice": StudentInvoiceSerializer(waiver_app.invoice).data
        }, status=status.HTTP_200_OK)


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.filter(is_active=True)
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAccountantOrPrincipal]


class CollegeExpenseViewSet(viewsets.ModelViewSet):
    queryset = CollegeExpense.objects.select_related('category', 'recorded_by', 'approved_by').all()
    serializer_class = CollegeExpenseSerializer
    permission_classes = [IsAccountantOrPrincipal]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(expense_date__range=[start_date, end_date])

        return queryset

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='verify')
    def verify_expense(self, request, pk=None):
        expense = self.get_object()
        new_status = request.data.get('status', '').upper()

        if new_status not in [CollegeExpense.ExpenseStatus.APPROVED, CollegeExpense.ExpenseStatus.REJECTED]:
            return Response(
                {"success": False, "message": "status হিসেবে APPROVED অথবা REJECTED প্রদান করুন।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        expense.status = new_status
        expense.approved_by = request.user
        expense.approved_at = timezone.now()
        expense.rejection_reason = request.data.get('rejection_reason', '') if new_status == CollegeExpense.ExpenseStatus.REJECTED else ''
        expense.save()

        return Response({
            "success": True,
            "message": f"ভাউচার {expense.voucher_no} সফলভাবে '{expense.get_status_display()}' করা হয়েছে।",
            "data": CollegeExpenseSerializer(expense).data
        }, status=status.HTTP_200_OK)


class FinancialBalanceSheetView(APIView):
    permission_classes = [IsAccountantOrPrincipal]

    def get(self, request):
        now = timezone.localdate()
        year = int(request.query_params.get('year', now.year))
        month = request.query_params.get('month')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        payments_qs = PaymentTransaction.objects.all()
        expenses_qs = CollegeExpense.objects.filter(status=CollegeExpense.ExpenseStatus.APPROVED)
        invoices_qs = StudentInvoice.objects.all()

        if start_date and end_date:
            payments_qs = payments_qs.filter(created_at__date__range=[start_date, end_date])
            expenses_qs = expenses_qs.filter(expense_date__range=[start_date, end_date])
            invoices_qs = invoices_qs.filter(created_at__date__range=[start_date, end_date])
            timeframe_label = f"{start_date} to {end_date}"
        elif month:
            month = int(month)
            payments_qs = payments_qs.filter(created_at__year=year, created_at__month=month)
            expenses_qs = expenses_qs.filter(expense_date__year=year, expense_date__month=month)
            invoices_qs = invoices_qs.filter(year=year, month=month)
            timeframe_label = f"Month: {month:02d}, Year: {year}"
        else:
            payments_qs = payments_qs.filter(created_at__year=year)
            expenses_qs = expenses_qs.filter(expense_date__year=year)
            invoices_qs = invoices_qs.filter(year=year)
            timeframe_label = f"Full Year: {year}"

        total_collected = payments_qs.aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
        total_expense = expenses_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        net_balance = total_collected - total_expense

        total_due_receivable = invoices_qs.aggregate(due=Sum('due_amount'))['due'] or Decimal('0.00')
        total_billed = invoices_qs.aggregate(billed=Sum('total_amount'))['billed'] or Decimal('0.00')

        category_breakdown = expenses_qs.values('category__name').annotate(
            total_spent=Sum('amount'),
            voucher_count=Count('id')
        ).order_by('-total_spent')

        payment_methods_breakdown = payments_qs.values('payment_method').annotate(
            total_amount=Sum('amount_paid'),
            tx_count=Count('id')
        ).order_by('-total_amount')

        pending_expenses = CollegeExpense.objects.filter(status=CollegeExpense.ExpenseStatus.PENDING).aggregate(
            count=Count('id'),
            total=Sum('amount')
        )

        return Response({
            "success": True,
            "timeframe": timeframe_label,
            "summary": {
                "total_fee_collected": float(total_collected),
                "total_approved_expense": float(total_expense),
                "net_cash_in_hand": float(net_balance),
                "total_student_due_receivable": float(total_due_receivable),
                "total_invoiced_amount": float(total_billed),
            },
            "category_wise_expense": [
                {
                    "category": item['category__name'],
                    "total_amount": float(item['total_spent']),
                    "voucher_count": item['voucher_count'],
                }
                for item in category_breakdown
            ],
            "payment_channel_breakdown": [
                {
                    "method": item['payment_method'],
                    "total_collected": float(item['total_amount']),
                    "transactions": item['tx_count'],
                }
                for item in payment_methods_breakdown
            ],
            "pending_audit_alert": {
                "pending_vouchers": pending_expenses['count'] or 0,
                "pending_amount": float(pending_expenses['total'] or Decimal('0.00')),
            }
        }, status=status.HTTP_200_OK)


class TeacherPayrollViewSet(viewsets.ModelViewSet):
    queryset = TeacherPayroll.objects.select_related('teacher', 'approved_by', 'disbursed_by').all()
    serializer_class = TeacherPayrollSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAccountantOrPrincipal()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.role == User.Role.TEACHER:
            return queryset.filter(teacher=user)
        return queryset

    @action(detail=False, methods=['post'], url_path='bulk-generate')
    @transaction.atomic
    def bulk_generate(self, request):
        month = request.data.get('month')
        year = request.data.get('year')

        if not month or not year:
            return Response({"success": False, "message": "month এবং year প্রদান করা আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        teachers = User.objects.filter(role=User.Role.TEACHER, is_active=True).select_related('teacher_profile')
        created_count = 0

        for teacher in teachers:
            if TeacherPayroll.objects.filter(teacher=teacher, month=month, year=year).exists():
                continue

            base_salary = getattr(teacher.teacher_profile, 'base_salary', Decimal('0.00')) if hasattr(teacher, 'teacher_profile') else Decimal('0.00')

            TeacherPayroll.objects.create(
                teacher=teacher,
                month=month,
                year=year,
                base_salary=base_salary,
                bonus_allowance=Decimal('0.00'),
                deductions=Decimal('0.00'),
                status=TeacherPayroll.PayrollStatus.PENDING,
            )
            created_count += 1

        return Response({
            "success": True,
            "message": f"{month}/{year} মাসের জন্য মোট {created_count} জন শিক্ষকের পে-রোল প্রস্তুত করা হয়েছে।",
            "total_generated": created_count
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='approve')
    def approve_payroll(self, request, pk=None):
        payroll = self.get_object()
        payroll.status = TeacherPayroll.PayrollStatus.APPROVED
        payroll.approved_by = request.user
        payroll.approved_at = timezone.now()
        payroll.remarks = request.data.get('remarks', payroll.remarks)
        payroll.save()

        return Response({
            "success": True,
            "message": f"শিক্ষক {payroll.teacher.get_full_name()} এর বেতন প্রিন্সিপাল কর্তৃক অনুমোদিত হয়েছে।",
            "data": TeacherPayrollSerializer(payroll).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='disburse')
    def disburse_payroll(self, request, pk=None):
        payroll = self.get_object()
        if payroll.status != TeacherPayroll.PayrollStatus.APPROVED:
            return Response(
                {"success": False, "message": "প্রিন্সিপালের অনুমোদন ছাড়া বেতন প্রদান করা যাবে না।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        payroll.status = TeacherPayroll.PayrollStatus.DISBURSED
        payroll.disbursed_by = request.user
        payroll.disbursed_at = timezone.now()
        payroll.payment_reference = request.data.get('payment_reference', 'DISBURSED-CASH-OR-BANK')
        payroll.save()

        return Response({
            "success": True,
            "message": f"বেতন সফলভাবে পরিশোধিত হয়েছে ({payroll.net_salary} BDT)।",
            "data": TeacherPayrollSerializer(payroll).data
        }, status=status.HTTP_200_OK)


class TeacherSalaryClaimViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherSalaryClaimSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = TeacherSalaryClaim.objects.select_related('teacher', 'approved_by', 'disbursed_by').all()

        if user.role == User.Role.TEACHER:
            return queryset.filter(teacher=user)
        if user.role in [User.Role.PRINCIPAL, User.Role.ACCOUNTANT] or user.is_superuser:
            return queryset
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.TEACHER:
            raise PermissionDenied("শুধুমাত্র শিক্ষকগণ বেতনের আবেদন করতে পারবেন।")
        serializer.save(teacher=self.request.user)

    @action(detail=True, methods=['patch'], permission_classes=[IsPrincipal], url_path='principal-approve')
    def principal_approve(self, request, pk=None):
        claim = self.get_object()
        status_input = request.data.get('status', 'APPROVED').upper()

        if status_input == 'REJECTED':
            claim.status = TeacherSalaryClaim.ClaimStatus.REJECTED
        else:
            claim.status = TeacherSalaryClaim.ClaimStatus.APPROVED_BY_PRINCIPAL

        claim.principal_remarks = request.data.get('remarks', '')
        claim.approved_by = request.user
        claim.approved_at = timezone.now()
        claim.save()

        return Response({
            "success": True,
            "message": f"দাবিটি প্রিন্সিপাল কর্তৃক '{claim.get_status_display()}' করা হয়েছে।",
            "data": TeacherSalaryClaimSerializer(claim).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[IsAccountantOrPrincipal], url_path='disburse')
    def disburse_claim(self, request, pk=None):
        claim = self.get_object()
        if claim.status != TeacherSalaryClaim.ClaimStatus.APPROVED_BY_PRINCIPAL:
            return Response(
                {"success": False, "message": "শুধুমাত্র প্রিন্সিপাল কর্তৃক অনুমোদিত ক্লেইমই পরিশোধ করা সম্ভব।"},
                status=status.HTTP_400_BAD_REQUEST
            )

        claim.status = TeacherSalaryClaim.ClaimStatus.DISBURSED
        claim.disbursed_by = request.user
        claim.disbursed_at = timezone.now()
        claim.payment_reference = request.data.get('payment_reference', 'CASH/MFS')
        claim.save()

        return Response({
            "success": True,
            "message": f"শিক্ষককে ক্লেইমের {claim.requested_amount} টাকা সফলভাবে প্রদান করা হয়েছে।",
            "data": TeacherSalaryClaimSerializer(claim).data
        }, status=status.HTTP_200_OK)


class TransportVehicleViewSet(viewsets.ModelViewSet):
    queryset = TransportVehicle.objects.all()
    serializer_class = TransportVehicleSerializer
    permission_classes = [IsAccountantOrPrincipal]
    
    @action(detail=False, methods=['get'], url_path='my-route')
    def my_route(self, request):
        if request.user.role != User.Role.STUDENT or not hasattr(request.user, 'student_profile'):
            return Response({"success": False, "message": "শুধুমাত্র শিক্ষার্থীরা এই তথ্য দেখতে পারে।"}, status=status.HTTP_403_FORBIDDEN)

        student = request.user.student_profile
        if not student.uses_transport or not student.assigned_vehicle:
            return Response({"success": False, "message": "আপনি কোনো পরিবহন সুবিধার সাথে যুক্ত নন।"}, status=status.HTTP_404_NOT_FOUND)

        vehicle = student.assigned_vehicle
        active_alert = VehicleBreakdownAlert.objects.filter(vehicle=vehicle, is_resolved=False).first()

        return Response({
            "success": True,
            "vehicle_number": vehicle.vehicle_number,
            "driver_name": vehicle.driver_name,
            "driver_phone": vehicle.driver_phone,
            "route_name": vehicle.route_name,
            "stoppages": vehicle.stoppages,
            "has_emergency_breakdown": active_alert is not None,
            "active_alert": VehicleBreakdownAlertSerializer(active_alert).data if active_alert else None,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAccountantOrPrincipal], url_path='emergency-breakdown')
    @transaction.atomic
    def emergency_breakdown(self, request, pk=None):
        vehicle = self.get_object()
        location = request.data.get('location', 'অজানা স্থান')
        reason = request.data.get('reason', 'ড্রাইভার কর্তৃক ফোনে রিপোর্টকৃত যান্ত্রিক ত্রুটি')
        
        default_msg = f"জরুরি বিজ্ঞপ্তি: {vehicle.route_name}-এর গাড়িটিতে ({vehicle.vehicle_number}) {location}-এ যান্ত্রিক ত্রুটি দেখা দিয়েছে। বিকল্প ব্যবস্থা গ্রহণ করা হচ্ছে।"
        alert_msg = request.data.get('alert_message', default_msg)

        alert = VehicleBreakdownAlert.objects.create(
            vehicle=vehicle,
            location=location,
            reason=reason,
            alert_message=alert_msg,
            reported_by=request.user
        )

        passengers = vehicle.passengers.filter(user__is_active=True).select_related('user')
        targeted_recipients = [
            {
                "student_id": p.student_unique_id,
                "student_name": p.user.get_full_name(),
                "guardian_phone": p.guardian_phone
            }
            for p in passengers
        ]

        return Response({
            "success": True,
            "message": f"{vehicle.vehicle_number} গাড়ির জরুরি বিকল নোটিশ জারি করা হয়েছে। মোট {len(targeted_recipients)} জন শিক্ষার্থী ও অভিভাবক তাৎক্ষণিক অ্যালার্ট পাবেন।",
            "alert": VehicleBreakdownAlertSerializer(alert).data,
            "dispatched_recipients_count": len(targeted_recipients),
            "targeted_recipients": targeted_recipients
        }, status=status.HTTP_201_CREATED)


class VehicleDailyLogViewSet(viewsets.ModelViewSet):
    queryset = VehicleDailyLog.objects.select_related('vehicle', 'recorded_by').all()
    serializer_class = VehicleDailyLogSerializer
    permission_classes = [IsAccountantOrPrincipal]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class DriverAdvanceDeductionViewSet(viewsets.ModelViewSet):
    queryset = DriverAdvanceDeduction.objects.select_related('vehicle', 'recorded_by').all()
    serializer_class = DriverAdvanceDeductionSerializer
    permission_classes = [IsAccountantOrPrincipal]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class VehicleMonthlyBillViewSet(viewsets.ModelViewSet):
    queryset = VehicleMonthlyBill.objects.select_related('vehicle', 'settled_by').all()
    serializer_class = VehicleMonthlyBillSerializer
    permission_classes = [IsAccountantOrPrincipal]

    @action(detail=False, methods=['post'], url_path='generate')
    @transaction.atomic
    def generate_monthly_bill(self, request):
        vehicle_id = request.data.get('vehicle_id')
        month = request.data.get('month')
        year = request.data.get('year')

        if not vehicle_id or not month or not year:
            return Response({"success": False, "message": "vehicle_id, month এবং year প্রদান করা আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vehicle = TransportVehicle.objects.get(id=vehicle_id)
        except TransportVehicle.DoesNotExist:
            return Response({"success": False, "message": "প্রদত্ত গাড়িটি খুঁজে পাওয়া যায়নি।"}, status=status.HTTP_404_NOT_FOUND)

        total_days_run = VehicleDailyLog.objects.filter(
            vehicle=vehicle,
            date__year=year,
            date__month=month,
            ran_today=True
        ).count()

        advances_sum = DriverAdvanceDeduction.objects.filter(
            vehicle=vehicle,
            date__year=year,
            date__month=month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        bill, created = VehicleMonthlyBill.objects.update_or_create(
            vehicle=vehicle,
            month=month,
            year=year,
            defaults={
                'total_days_run': total_days_run,
                'daily_rate': vehicle.daily_rate,
                'total_deductions': advances_sum,
            }
        )

        return Response({
            "success": True,
            "message": f"{vehicle.vehicle_number} এর {month}/{year} মাসের নিট বিল সফলভাবে প্রস্তুত হয়েছে।",
            "data": VehicleMonthlyBillSerializer(bill).data
        }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='settle')
    def settle_bill(self, request, pk=None):
        bill = self.get_object()
        bill.status = VehicleMonthlyBill.BillStatus.SETTLED
        bill.settled_by = request.user
        bill.settled_at = timezone.now()
        bill.payment_reference = request.data.get('payment_reference', 'CASH/BANK')
        bill.save()

        return Response({
            "success": True,
            "message": f"গাড়ির নিট বিল ({bill.net_payable} BDT) সফলভাবে পরিশোধিত হয়েছে।",
            "data": VehicleMonthlyBillSerializer(bill).data
        }, status=status.HTTP_200_OK)


class InchargeCashHandoverViewSet(viewsets.ModelViewSet):
    serializer_class = InchargeCashHandoverSerializer
    permission_classes = [IsTeacherOrPrincipal]

    def get_queryset(self):
        user = self.request.user
        queryset = InchargeCashHandover.objects.select_related('in_charge', 'received_by').all()

        if user.role == User.Role.TEACHER:
            return queryset.filter(in_charge=user)
        if user.role in [User.Role.ACCOUNTANT, User.Role.PRINCIPAL] or user.is_superuser:
            return queryset
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.TEACHER:
            raise PermissionDenied("শুধুমাত্র শ্রেণি ইনচার্জ ক্যাশ হস্তান্তরের রিকোয়েস্ট পাঠাতে পারেন।")
        serializer.save(in_charge=self.request.user)

    @action(detail=True, methods=['patch'], permission_classes=[IsAccountantOrPrincipal], url_path='verify-cash')
    def verify_cash(self, request, pk=None):
        handover = self.get_object()
        handover.status = InchargeCashHandover.HandoverStatus.VERIFIED
        handover.received_by = request.user
        handover.received_at = timezone.now()
        handover.notes = request.data.get('notes', handover.notes)
        handover.save()

        return Response({
            "success": True,
            "message": f"শিক্ষক {handover.in_charge.get_full_name()} এর নিকট হতে {handover.amount} টাকা সফলভাবে নগদ গ্রহণ ও ভেরিফাই করা হয়েছে।",
            "data": InchargeCashHandoverSerializer(handover).data
        }, status=status.HTTP_200_OK)


class BankDepositViewSet(viewsets.ModelViewSet):
    queryset = BankDeposit.objects.select_related('deposited_by').all()
    serializer_class = BankDepositSerializer
    permission_classes = [IsAccountantOrPrincipal]

    def perform_create(self, serializer):
        serializer.save(deposited_by=self.request.user)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.annotate(
        total_due_amount=Sum('purchases__due_amount')
    ).all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAccountantOrPrincipal]


class SupplierPurchaseViewSet(viewsets.ModelViewSet):
    queryset = SupplierPurchase.objects.select_related('supplier').prefetch_related('payments').all()
    serializer_class = SupplierPurchaseSerializer
    permission_classes = [IsAccountantOrPrincipal]

    @action(detail=True, methods=['post'], url_path='pay')
    def make_payment(self, request, pk=None):
        purchase = self.get_object()
        serializer = SupplierPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(purchase=purchase, paid_by=request.user)

        return Response({
            "success": True,
            "message": f"ভেন্ডরকে {payment.amount_paid} টাকা পরিশোধ করা হয়েছে। অবশিষ্ট বকেয়া: {purchase.due_amount} টাকা।",
            "purchase_status": SupplierPurchaseSerializer(purchase).data
        }, status=status.HTTP_201_CREATED)


class DailyCashClosingView(APIView):
    """
    GET /api/v1/finance/analytics/daily-closing/?date=YYYY-MM-DD
    দৈনিক ক্যাশ ক্লোজিং অডিট রিপোর্ট (ডাবল-কাউন্টিং মুক্ত নির্ভুল হিসাব)।
    """
    permission_classes = [IsAccountantOrPrincipal]

    def get(self, request):
        date_str = request.query_params.get('date')
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else timezone.localdate()

        # ১. সরাসরি কাউন্টারে জমা হওয়া ক্যাশ (অ্যাকাউন্ট্যান্ট বা প্রিন্সিপাল কর্তৃক সংগৃহীত)
        counter_cash_collected = PaymentTransaction.objects.filter(
            created_at__date=target_date,
            payment_method=PaymentTransaction.PaymentMethod.CASH,
            collected_by__role__in=[User.Role.ACCOUNTANT, User.Role.PRINCIPAL]
        ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')

        # ২. ইনচার্জদের সংগৃহীত ক্যাশ যা আজ ভেরিফাই হয়ে ড্রয়ারে ঢুকেছে
        incharge_handover_cash = InchargeCashHandover.objects.filter(
            handover_date=target_date,
            status=InchargeCashHandover.HandoverStatus.VERIFIED
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # ৩. আজ ক্যাশে পরিশোধিত অনুমোদিত খরচ
        cash_expenses = CollegeExpense.objects.filter(
            expense_date=target_date,
            status=CollegeExpense.ExpenseStatus.APPROVED
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # ৪. আজ ক্যাশ ড্রয়ার থেকে ব্যাংকে জমা হওয়া টাকা
        deposited_to_bank = BankDeposit.objects.filter(
            deposit_date=target_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # ৫. ভেন্ডরদের ক্যাশে পরিশোধিত টাকা
        supplier_paid = SupplierPayment.objects.filter(
            payment_date=target_date,
            payment_method=PaymentTransaction.PaymentMethod.CASH
        ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')

        # নিট ক্লোজিং ক্যাশ হিসাব (কোনো ডাবল কাউন্টিং নেই)
        total_inflow = counter_cash_collected + incharge_handover_cash
        total_outflow = cash_expenses + deposited_to_bank + supplier_paid
        net_cash_in_hand = total_inflow - total_outflow

        return Response({
            "success": True,
            "report_title": "DAILY CASH CLOSING SHEET",
            "date": target_date.strftime('%Y-%m-%d'),
            "cash_summary": {
                "direct_counter_cash_collection": float(counter_cash_collected),
                "incharge_handed_over_cash": float(incharge_handover_cash),
                "total_cash_inflow": float(total_inflow),
                "total_expense_paid_cash": float(cash_expenses),
                "cash_deposited_to_bank": float(deposited_to_bank),
                "supplier_payments_cash": float(supplier_paid),
                "total_cash_outflow": float(total_outflow),
                "net_closing_cash_in_hand": float(net_cash_in_hand),
            }
        }, status=status.HTTP_200_OK)


class MasterDefaulterListView(APIView):
    permission_classes = [IsAccountantOrPrincipal]

    def get(self, request):
        min_due = Decimal(str(request.query_params.get('min_due', '1.00')))
        section_id = request.query_params.get('section')

        invoices = StudentInvoice.objects.filter(due_amount__gte=min_due).select_related('student', 'student__user', 'section')
        if section_id:
            invoices = invoices.filter(section_id=section_id)

        defaulters_map = {}
        for inv in invoices:
            stu_id = inv.student_id
            if stu_id not in defaulters_map:
                defaulters_map[stu_id] = {
                    "student_unique_id": inv.student.student_unique_id,
                    "student_name": inv.student.user.get_full_name(),
                    "roll_number": inv.student.roll_number,
                    "section": str(inv.section),
                    "guardian_phone": inv.student.guardian_phone,
                    "total_unpaid_months": 0,
                    "total_due_amount": Decimal('0.00'),
                }
            defaulters_map[stu_id]['total_unpaid_months'] += 1
            defaulters_map[stu_id]['total_due_amount'] += inv.due_amount

        result_list = list(defaulters_map.values())
        result_list.sort(key=lambda x: x['total_due_amount'], reverse=True)

        total_due_college = sum(item['total_due_amount'] for item in result_list)

        return Response({
            "success": True,
            "total_defaulter_students": len(result_list),
            "total_outstanding_due": float(total_due_college),
            "defaulters": [
                {**item, "total_due_amount": float(item["total_due_amount"])}
                for item in result_list
            ]
        }, status=status.HTTP_200_OK)