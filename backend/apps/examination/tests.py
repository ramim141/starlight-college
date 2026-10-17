from datetime import date
from decimal import Decimal

from django.test import TestCase
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.academics.models import AcademicSection, Subject, StudentAttendance
from apps.examination.models import (
    Exam,
    ExamSubjectConfig,
    QuestionPaperSubmission,
    StudentExamResult,
    SubjectMarksEntry,
)
from apps.examination.views import (
    MarksEntryViewSet,
    QuestionPaperSubmissionViewSet,
    StudentExamResultViewSet,
)
from apps.users_auth.models import StudentProfile, User


class SubjectMarksEntryTests(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='teacher',
            password='password',
            role=User.Role.TEACHER,
        )
        self.student_user = User.objects.create_user(
            username='student',
            password='password',
            role=User.Role.STUDENT,
        )
        self.section = AcademicSection.objects.create(
            class_level=AcademicSection.ClassLevel.XI,
            group=AcademicSection.GroupChoices.SCIENCE,
            section_name='A',
            session='2026-2027',
            in_charge_teacher=self.teacher,
        )
        self.student = StudentProfile.objects.create(
            user=self.student_user,
            section=self.section,
            roll_number=1,
            session='2026-2027',
            father_name='Father',
            mother_name='Mother',
            guardian_phone='01700000000',
        )
        self.subject = Subject.objects.create(
            name='Physics',
            code='174',
            class_level=AcademicSection.ClassLevel.XI,
            group=AcademicSection.GroupChoices.SCIENCE,
        )
        self.exam = Exam.objects.create(
            name='Semester 1',
            session='2026-2027',
            class_level=AcademicSection.ClassLevel.XI,
            start_date=date(2026, 1, 1),
            end_date=date(2026, 1, 10),
            has_tutorial_conversion=False,
        )
        ExamSubjectConfig.objects.create(
            exam=self.exam,
            subject=self.subject,
            full_marks=Decimal('100.00'),
            cq_full_marks=Decimal('100.00'),
            mcq_full_marks=Decimal('0.00'),
            practical_full_marks=Decimal('0.00'),
            tutorial_full_marks=Decimal('0.00'),
            pass_marks=Decimal('60.00'),
        )

    def test_configured_pass_marks_control_pass_status(self):
        entry = SubjectMarksEntry.objects.create(
            exam=self.exam,
            subject=self.subject,
            student=self.student,
            section=self.section,
            cq_marks=Decimal('50.00'),
        )

        self.assertEqual(entry.grade_letter, 'B')
        self.assertFalse(entry.is_passed)


class ExaminationSecurityTests(SubjectMarksEntryTests):
    def setUp(self):
        super().setUp()
        self.other_teacher = User.objects.create_user(
            username='other-teacher',
            password='password',
            role=User.Role.TEACHER,
        )
        self.other_section = AcademicSection.objects.create(
            class_level=AcademicSection.ClassLevel.XI,
            group=AcademicSection.GroupChoices.SCIENCE,
            section_name='B',
            session='2026-2027',
            in_charge_teacher=self.other_teacher,
        )
        self.factory = APIRequestFactory()

    def test_teacher_cannot_read_another_teachers_question_paper(self):
        paper = QuestionPaperSubmission.objects.create(
            exam=self.exam,
            subject=self.subject,
            teacher=self.other_teacher,
            question_file='question_papers/test.pdf',
            file_password_hint='secret',
        )
        request = self.factory.get('/api/v1/examination/questions/')
        force_authenticate(request, user=self.teacher)
        response = QuestionPaperSubmissionViewSet.as_view({'get': 'list'})(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 0)
        self.assertNotIn(str(paper.id), str(response.data))

    def test_teacher_cannot_read_another_sections_mark_sheet(self):
        request = self.factory.get('/api/v1/examination/marks/mark-sheet/', {
            'exam': str(self.exam.id),
            'subject': str(self.subject.id),
            'section': str(self.other_section.id),
        })
        force_authenticate(request, user=self.teacher)
        response = MarksEntryViewSet.as_view({'get': 'get_mark_sheet'})(request)

        self.assertEqual(response.status_code, 403)

    def test_teacher_cannot_write_cocurricular_marks_for_another_section(self):
        request = self.factory.post('/api/v1/examination/marks/save-cocurricular/', {
            'exam_id': str(self.exam.id),
            'section_id': str(self.other_section.id),
            'ethics_list': [],
        }, format='json')
        force_authenticate(request, user=self.teacher)
        response = MarksEntryViewSet.as_view({'post': 'save_cocurricular'})(request)

        self.assertEqual(response.status_code, 400)
        self.assertIn('section_id', response.data)


class ResultProcessingTests(SubjectMarksEntryTests):
    def setUp(self):
        super().setUp()
        self.principal = User.objects.create_user(
            username='principal',
            password='password',
            role=User.Role.PRINCIPAL,
        )

    def test_process_creates_and_reprocesses_result(self):
        SubjectMarksEntry.objects.create(
            exam=self.exam,
            subject=self.subject,
            student=self.student,
            section=self.section,
            cq_marks=Decimal('80.00'),
        )
        request = APIRequestFactory().post(
            '/api/v1/examination/results/process/',
            {'exam_id': str(self.exam.id), 'section_id': str(self.section.id)},
            format='json',
        )
        force_authenticate(request, user=self.principal)
        with CaptureQueriesContext(connection) as queries:
            response = StudentExamResultViewSet.as_view(
                {'post': 'process_result'}
            )(request)

        self.assertEqual(response.status_code, 200)
        self.assertLessEqual(len(queries), 30)
        result = StudentExamResult.objects.get(exam=self.exam, student=self.student)
        self.assertTrue(result.is_passed)
        self.assertEqual(result.section_position, 1)

        request = APIRequestFactory().post(
            '/api/v1/examination/results/process/',
            {'exam_id': str(self.exam.id), 'section_id': str(self.section.id)},
            format='json',
        )
        force_authenticate(request, user=self.principal)
        response = StudentExamResultViewSet.as_view(
            {'post': 'process_result'}
        )(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            StudentExamResult.objects.filter(
                exam=self.exam, student=self.student
            ).count(),
            1,
        )
