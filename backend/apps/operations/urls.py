from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.operations.views import (
    AlumniRecordViewSet,
    MarkerRequestViewSet,
    NoticeViewSet,
    PersonalNoteViewSet,
    StudentLeaveApplicationViewSet,
    TeacherAttendanceViewSet,
    AssetCategoryViewSet,
    CollegeAssetViewSet,
    MarkerStockViewSet,
    CertificateRequestViewSet,
    StudentComplaintViewSet,
    ParentCommunicationLogViewSet,
    TeacherLeaveViewSet,
    ClubEventViewSet,
    ClubMembershipViewSet,
    ClubViewSet,
    SMSBroadcastViewSet,

)
from apps.operations.views import WhatsAppNotificationViewSet
from apps.operations.views import NotificationViewSet
app_name = 'operations'

router = DefaultRouter()
router.register(r'teacher-attendance', TeacherAttendanceViewSet, basename='teacher-attendance')
router.register(r'notices', NoticeViewSet, basename='notice')
router.register(r'personal-notes', PersonalNoteViewSet, basename='personal-note')
router.register(r'alumni', AlumniRecordViewSet, basename='alumni')
router.register(r'markers', MarkerRequestViewSet, basename='marker')
router.register(r'leaves', StudentLeaveApplicationViewSet, basename='leave')
router.register(r'marker-stocks', MarkerStockViewSet, basename='marker-stock')
router.register(r'asset-categories', AssetCategoryViewSet, basename='asset-category')
router.register(r'assets', CollegeAssetViewSet, basename='asset')
router.register(r'certificates', CertificateRequestViewSet, basename='certificate')
router.register(r'complaints', StudentComplaintViewSet, basename='complaint')
router.register(r'parent-calls', ParentCommunicationLogViewSet, basename='parent-call')
router.register(r'teacher-leaves', TeacherLeaveViewSet, basename='teacher-leave')
router.register(r'sms', SMSBroadcastViewSet, basename='sms-broadcast')
router.register(r'clubs', ClubViewSet, basename='club')
router.register(r'club-memberships', ClubMembershipViewSet, basename='club-membership')
router.register(r'club-events', ClubEventViewSet, basename='club-event')
router.register(r'whatsapp', WhatsAppNotificationViewSet, basename='whatsapp')
router.register(r'notifications', NotificationViewSet, basename='notification')


urlpatterns = [
    path('', include(router.urls)),
]