from django.contrib import admin
from apps.operations.models import (
    AlumniRecord,
    AssetCategory,
    CollegeAsset,
    MarkerRequest,
    MarkerStock,
    Notice,
    PersonalNote,
    StudentLeaveApplication,
    TeacherAttendance,
)
from apps.operations.models import CertificateRequest, StudentComplaint
from apps.operations.models import ParentCommunicationLog, TeacherLeave
from apps.operations.models import (
    Club,
    ClubEvent,
    ClubMembership,
    EventRegistration,
    SMSBroadcastLog,
)
from apps.operations.models import DevicePushSubscription, InAppNotification

from apps.operations.models import WhatsAppMessageLog, WhatsAppTemplate

@admin.register(TeacherAttendance)
class TeacherAttendanceAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'date', 'check_in_time', 'check_out_time', 'is_late', 'approval_status', 'approved_by')
    list_filter = ('date', 'is_late', 'approval_status')
    search_fields = ('teacher__username', 'teacher__first_name', 'teacher__last_name')


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'audience', 'target_section', 'created_by', 'is_pinned', 'is_active', 'created_at')
    list_filter = ('audience', 'is_pinned', 'is_active')
    search_fields = ('title', 'content')


@admin.register(PersonalNote)
class PersonalNoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'is_pinned', 'updated_at')
    search_fields = ('title', 'user__username')


@admin.register(AlumniRecord)
class AlumniRecordAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'passing_year', 'group', 'hsc_roll', 'hsc_registration_no', 'status', 'verified_by')
    list_filter = ('status', 'passing_year', 'group')
    search_fields = ('full_name', 'hsc_roll', 'hsc_registration_no', 'phone')


@admin.register(MarkerStock)
class MarkerStockAdmin(admin.ModelAdmin):
    list_display = ('color', 'available_stock', 'total_stock', 'updated_at')
    list_filter = ('color',)
    
@admin.register(MarkerRequest)
class MarkerRequestAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'marker_color', 'quantity', 'status', 'is_acknowledged', 'issued_by', 'created_at')
    list_filter = ('status', 'is_acknowledged', 'marker_color')
    search_fields = ('teacher__username', 'purpose')


@admin.register(StudentLeaveApplication)
class StudentLeaveApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'section', 'start_date', 'end_date', 'incharge_status', 'principal_status', 'created_at')
    list_filter = ('incharge_status', 'principal_status', 'section__class_level')
    search_fields = ('student__student_unique_id', 'student__user__first_name', 'reason')

@admin.register(AssetCategory)
class AssetCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)

@admin.register(CollegeAsset)
class CollegeAssetAdmin(admin.ModelAdmin):
    list_display = ('asset_code', 'name', 'category', 'quantity', 'room_or_location', 'condition', 'unit_cost')
    list_filter = ('category', 'condition', 'room_or_location')
    search_fields = ('asset_code', 'name', 'room_or_location')


@admin.register(CertificateRequest)
class CertificateRequestAdmin(admin.ModelAdmin):
    list_display = ('student', 'certificate_type', 'fee_amount', 'is_fee_paid', 'status', 'certificate_number', 'created_at')
    list_filter = ('certificate_type', 'status', 'is_fee_paid')
    search_fields = ('student__student_unique_id', 'certificate_number')


@admin.register(StudentComplaint)
class StudentComplaintAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'student', 'status', 'created_at')
    list_filter = ('category', 'status', 'created_at')
    search_fields = ('title', 'student__student_unique_id', 'student__user__first_name')


@admin.register(ParentCommunicationLog)
class ParentCommunicationLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'in_charge', 'call_date', 'category', 'guardian_phone_called', 'follow_up_needed')
    list_filter = ('call_date', 'category', 'follow_up_needed')
    search_fields = ('student__student_unique_id', 'student__user__first_name', 'in_charge__username')


@admin.register(TeacherLeave)
class TeacherLeaveAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'leave_type', 'start_date', 'end_date', 'total_days', 'proxy_teacher', 'status', 'reviewed_by')
    list_filter = ('status', 'leave_type', 'start_date')
    search_fields = ('teacher__username', 'teacher__first_name', 'proxy_teacher__username')


@admin.register(SMSBroadcastLog)
class SMSBroadcastLogAdmin(admin.ModelAdmin):
    list_display = ('target_group', 'recipients_count', 'sender', 'created_at')
    list_filter = ('target_group', 'created_at')


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'moderator_teacher', 'is_active', 'created_at')
    search_fields = ('name',)


@admin.register(ClubMembership)
class ClubMembershipAdmin(admin.ModelAdmin):
    list_display = ('student', 'club', 'status', 'reviewed_by', 'created_at')
    list_filter = ('status', 'club')


@admin.register(ClubEvent)
class ClubEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'club', 'event_date', 'venue', 'registration_deadline', 'is_active')
    list_filter = ('event_date', 'club')


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('student', 'event', 'registered_at', 'attended')


@admin.register(WhatsAppTemplate)
class WhatsAppTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'template_type', 'is_active', 'updated_at')
    list_filter = ('template_type', 'is_active')


@admin.register(WhatsAppMessageLog)
class WhatsAppMessageLogAdmin(admin.ModelAdmin):
    list_display = ('recipient_name', 'recipient_phone', 'sender', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('recipient_name', 'recipient_phone', 'message_content')


@admin.register(InAppNotification)
class InAppNotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('recipient__username', 'title', 'body')
    date_hierarchy = 'created_at'


@admin.register(DevicePushSubscription)
class DevicePushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_type', 'is_active', 'created_at')
    list_filter = ('device_type', 'is_active')
    search_fields = ('user__username', 'endpoint')