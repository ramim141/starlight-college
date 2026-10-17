from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.examination.views import (
    ExamRoomViewSet,
    ExamSubjectConfigViewSet,
    ExamViewSet,
    ExaminationReportsViewSet,
    InvigilationDutyViewSet,
    MarksEntryViewSet,
    QuestionPaperSubmissionViewSet,
    StudentExamResultViewSet,
)

app_name = 'examination'

router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'configs', ExamSubjectConfigViewSet, basename='exam-config')
router.register(r'marks', MarksEntryViewSet, basename='marks')
router.register(r'results', StudentExamResultViewSet, basename='result')
router.register(r'rooms', ExamRoomViewSet, basename='exam-room')
router.register(r'invigilations', InvigilationDutyViewSet, basename='invigilation')
router.register(r'questions', QuestionPaperSubmissionViewSet, basename='question-paper')
router.register(r'reports', ExaminationReportsViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]