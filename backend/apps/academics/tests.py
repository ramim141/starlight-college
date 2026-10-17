from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.academics.models import AcademicSection
from apps.academics.views import StudentViewSet
from apps.users_auth.models import StudentProfile, User


class StudentProfileSecurityTests(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='teacher',
            password='password',
            role=User.Role.TEACHER,
        )
        self.other_teacher = User.objects.create_user(
            username='other-teacher',
            password='password',
            role=User.Role.TEACHER,
        )
        self.section = AcademicSection.objects.create(
            class_level=AcademicSection.ClassLevel.XI,
            group=AcademicSection.GroupChoices.SCIENCE,
            section_name='A',
            session='2026-2027',
            in_charge_teacher=self.teacher,
        )
        self.other_section = AcademicSection.objects.create(
            class_level=AcademicSection.ClassLevel.XI,
            group=AcademicSection.GroupChoices.SCIENCE,
            section_name='B',
            session='2026-2027',
            in_charge_teacher=self.other_teacher,
        )
        self.student_user = User.objects.create_user(
            username='student',
            password='password',
            role=User.Role.STUDENT,
        )
        self.other_student_user = User.objects.create_user(
            username='other-student',
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
        )
        self.other_student = StudentProfile.objects.create(
            user=self.other_student_user,
            section=self.other_section,
            roll_number=1,
            session='2026-2027',
            father_name='Other Father',
            mother_name='Other Mother',
            guardian_phone='01700000001',
        )
        self.factory = APIRequestFactory()

    def test_teacher_list_is_limited_to_incharge_section(self):
        request = self.factory.get('/api/v1/academics/students/')
        force_authenticate(request, user=self.teacher)
        response = StudentViewSet.as_view({'get': 'list'})(request)

        self.assertEqual(response.status_code, 200)
        returned_ids = {item['id'] for item in response.data['results']}
        self.assertIn(str(self.student.id), returned_ids)
        self.assertNotIn(str(self.other_student.id), returned_ids)
