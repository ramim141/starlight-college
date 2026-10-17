from django.test import TestCase
from django.test.utils import CaptureQueriesContext
from django.db import connection
from datetime import date
from decimal import Decimal

from apps.academics.models import AcademicSection, StudentAttendance
from apps.finance.models import StudentInvoice
from apps.finance.serializers import InvoiceGenerateSerializer
from apps.users_auth.models import StudentProfile, User


class InvoiceGenerationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='invoice-admin',
            password='password',
            role=User.Role.PRINCIPAL,
        )
        self.section = AcademicSection.objects.create(
            class_level=AcademicSection.ClassLevel.XI,
            group=AcademicSection.GroupChoices.SCIENCE,
            section_name='A',
            session='2026-2027',
        )
        self.student_user = User.objects.create_user(
            username='invoice-student',
            password='password',
            role=User.Role.STUDENT,
        )
        self.student = StudentProfile.objects.create(
            user=self.student_user,
            section=self.section,
            roll_number=1,
            session='2026-2027',
            father_name='Father',
            mother_name='Mother',
            guardian_phone='01700000000',
            monthly_tuition_fee=Decimal('5000.00'),
            monthly_transport_fee=Decimal('1200.00'),
            uses_transport=True,
        )
        StudentAttendance.objects.create(
            student=self.student,
            section=self.section,
            date=date(2026, 10, 3),
            status=StudentAttendance.AttendanceStatus.ABSENT,
            recorded_by=self.user,
        )

    def test_generation_batches_data_and_skips_existing_invoice(self):
        serializer = InvoiceGenerateSerializer(data={
            'section_id': self.section.id,
            'months': [10, 11],
            'year': 2026,
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)

        with CaptureQueriesContext(connection) as queries:
            created = serializer.generate(self.user)

        self.assertEqual(len(created), 2)
        self.assertLessEqual(len(queries), 6)
        october = StudentInvoice.objects.get(
            student=self.student, month=10, year=2026
        )
        self.assertEqual(october.absence_fine, Decimal('100.00'))
        self.assertEqual(october.total_amount, Decimal('6300.00'))
        self.assertEqual(october.due_amount, Decimal('6300.00'))

        rerun = InvoiceGenerateSerializer(data={
            'section_id': self.section.id,
            'months': [10, 11],
            'year': 2026,
        })
        self.assertTrue(rerun.is_valid(), rerun.errors)
        self.assertEqual(rerun.generate(self.user), [])
        self.assertEqual(
            StudentInvoice.objects.filter(student=self.student, year=2026).count(),
            2,
        )
