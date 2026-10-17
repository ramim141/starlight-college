from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.academics.views import (
    AcademicHolidayViewSet,
    AcademicSectionViewSet,
    ClassRoutineViewSet,
    HomeworkViewSet,
    StudentAttendanceViewSet,
    StudentViewSet,
    SubjectViewSet,
    SyllabusViewSet,
)

app_name = 'academics'

router = DefaultRouter()
router.register(r'sections', AcademicSectionViewSet, basename='academic-section')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'routines', ClassRoutineViewSet, basename='routine')
router.register(r'syllabi', SyllabusViewSet, basename='syllabus')
router.register(r'homeworks', HomeworkViewSet, basename='homework')
router.register(r'attendance', StudentAttendanceViewSet, basename='attendance')
router.register(r'holidays', AcademicHolidayViewSet, basename='holiday')

urlpatterns = [
    path('', include(router.urls)),
]