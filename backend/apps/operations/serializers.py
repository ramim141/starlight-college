from rest_framework import serializers

from apps.operations.models import (
    AlumniRecord,
    AssetCategory,
    CertificateRequest,
    Club,
    ClubEvent,
    ClubMembership,
    CollegeAsset,
    DevicePushSubscription,
    EventRegistration,
    InAppNotification,
    MarkerRequest,
    MarkerStock,
    Notice,
    ParentCommunicationLog,
    PersonalNote,
    SMSBroadcastLog,
    StudentComplaint,
    StudentLeaveApplication,
    TeacherAttendance,
    TeacherLeave,
    WhatsAppMessageLog,
    WhatsAppTemplate,
    AdmissionInquiry,
    HomepageAbout,
    HomepageAdmission,
    HomepageAdmissionStep,
    HomepageContact,
    HomepageDepartment,
    HomepageFAQ,
    HomepageHero,
    HomepageService,
)
from apps.users_auth.models import User


class TeacherAttendanceSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    employee_id = serializers.CharField(source='teacher.teacher_profile.employee_id', read_only=True, default=None)
    department = serializers.CharField(source='teacher.teacher_profile.department', read_only=True, default=None)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherAttendance
        fields = [
            'id',
            'teacher',
            'teacher_name',
            'employee_id',
            'department',
            'date',
            'check_in_time',
            'check_out_time',
            'is_late',
            'remarks',
            'approval_status',
            'approval_status_display',
            'approved_by',
            'approved_by_name',
            'approved_at',
            'created_at',
        ]
        read_only_fields = [
            'id', 'teacher', 'date', 'check_in_time', 'check_out_time',
            'is_late', 'approval_status', 'approved_by', 'approved_at', 'created_at'
        ]

    def get_teacher_name(self, obj) -> str:
        return obj.teacher.get_full_name() or obj.teacher.username

    def get_approved_by_name(self, obj) -> str | None:
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.username
        return None


class NoticeSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    created_by_role = serializers.CharField(source='created_by.get_role_display', read_only=True)
    audience_display = serializers.CharField(source='get_audience_display', read_only=True)
    target_section_display = serializers.CharField(source='target_section.__str__', read_only=True, default=None)

    class Meta:
        model = Notice
        fields = [
            'id',
            'title',
            'content',
            'attachment',
            'audience',
            'audience_display',
            'target_section',
            'target_section_display',
            'is_pinned',
            'is_active',
            'created_by',
            'created_by_name',
            'created_by_role',
            'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def get_created_by_name(self, obj) -> str:
        return obj.created_by.get_full_name() or obj.created_by.username

    def validate(self, attrs):
        audience = attrs.get('audience', getattr(self.instance, 'audience', Notice.AudienceType.ALL))
        target_section = attrs.get('target_section', getattr(self.instance, 'target_section', None))

        if audience == Notice.AudienceType.SECTION and not target_section:
            raise serializers.ValidationError({
                "target_section": "নির্দিষ্ট শ্রেণি বা শাখার নোটিশ দেওয়ার জন্য 'target_section' আইডি প্রদান করা আবশ্যক।"
            })
        if audience != Notice.AudienceType.SECTION:
            attrs['target_section'] = None

        return attrs


class HomepageHeroSerializer(serializers.ModelSerializer):
    background_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = HomepageHero
        fields = '__all__'


class HomepageServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageService
        fields = '__all__'


class HomepageDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageDepartment
        fields = '__all__'


class HomepageAboutSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageAbout
        fields = '__all__'


class HomepageAdmissionStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageAdmissionStep
        fields = '__all__'


class HomepageFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageFAQ
        fields = '__all__'


class HomepageAdmissionSerializer(serializers.ModelSerializer):
    steps = HomepageAdmissionStepSerializer(many=True, read_only=True)
    faqs = HomepageFAQSerializer(many=True, read_only=True)

    class Meta:
        model = HomepageAdmission
        fields = '__all__'


class HomepageContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageContact
        fields = '__all__'


class AdmissionInquirySerializer(serializers.ModelSerializer):
    group_display = serializers.CharField(source='get_group_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    contacted_by_name = serializers.CharField(source='contacted_by.get_full_name', read_only=True)

    class Meta:
        model = AdmissionInquiry
        fields = [
            'id',
            'name',
            'phone',
            'group',
            'group_display',
            'message',
            'status',
            'status_display',
            'notes',
            'contacted_by',
            'contacted_by_name',
            'contacted_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'contacted_by_name']

    def validate_name(self, value):
        val = (value or '').strip()
        if not val:
            raise serializers.ValidationError('আপনার বা শিক্ষার্থীর পূর্ণ নাম আবশ্যক।')
        return val

    def validate_phone(self, value):
        val = (value or '').strip()
        if not val:
            raise serializers.ValidationError('মোবাইল নম্বর আবশ্যক।')
        # বাংলা সংখ্যাকে ইংরেজি সংখ্যায় রূপান্তর
        bengali_digits = '০১২৩৪৫৬৭৮৯'
        clean_phone = ''
        for ch in val:
            idx = bengali_digits.find(ch)
            clean_phone += str(idx) if idx != -1 else ch
        clean_phone = ''.join(c for c in clean_phone if c.isdigit() or c == '+')
        if len(clean_phone) < 11:
            raise serializers.ValidationError('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।')
        return clean_phone


class PersonalNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalNote
        fields = [
            'id',
            'title',
            'content',
            'color_code',
            'is_pinned',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AlumniRecordSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    verified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AlumniRecord
        fields = [
            'id',
            'full_name',
            'phone',
            'email',
            'passing_year',
            'group',
            'ssc_roll',
            'hsc_roll',
            'hsc_registration_no',
            'current_institution_or_workplace',
            'designation_or_department',
            'photo',
            'status',
            'status_display',
            'verified_by',
            'verified_by_name',
            'verified_at',
            'rejection_reason',
            'created_at',
        ]
        read_only_fields = [
            'id', 'status', 'verified_by', 'verified_at', 'rejection_reason', 'created_at'
        ]

    def get_verified_by_name(self, obj) -> str | None:
        if obj.verified_by:
            return obj.verified_by.get_full_name() or obj.verified_by.username
        return None


class MarkerRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    color_display = serializers.CharField(source='get_marker_color_display', read_only=True)

    class Meta:
        model = MarkerRequest
        fields = [
            'id',
            'teacher',
            'teacher_name',
            'marker_color',
            'color_display',
            'quantity',
            'purpose',
            'status',
            'status_display',
            'is_acknowledged',
            'acknowledged_at',
            'issued_by',
            'issued_by_name',
            'issued_at',
            'returned_at',
            'remarks',
            'created_at',
        ]
        read_only_fields = [
            'id', 'teacher', 'status', 'is_acknowledged', 'acknowledged_at',
            'issued_by', 'issued_at', 'returned_at', 'created_at'
        ]

    def get_teacher_name(self, obj) -> str:
        return obj.teacher.get_full_name() or obj.teacher.username

    def get_issued_by_name(self, obj) -> str | None:
        if obj.issued_by:
            return obj.issued_by.get_full_name() or obj.issued_by.username
        return None


class StudentLeaveApplicationSerializer(serializers.ModelSerializer):
    student_unique_id = serializers.CharField(source='student.student_unique_id', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    section_display = serializers.CharField(source='section.__str__', read_only=True)
    incharge_status_display = serializers.CharField(source='get_incharge_status_display', read_only=True)
    principal_status_display = serializers.CharField(source='get_principal_status_display', read_only=True)
    reviewed_by_incharge_name = serializers.SerializerMethodField()
    approved_by_principal_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentLeaveApplication
        fields = [
            'id',
            'student',
            'student_unique_id',
            'student_name',
            'roll_number',
            'section',
            'section_display',
            'start_date',
            'end_date',
            'reason',
            'attachment',
            'incharge_status',
            'incharge_status_display',
            'incharge_remarks',
            'reviewed_by_incharge',
            'reviewed_by_incharge_name',
            'incharge_reviewed_at',
            'principal_status',
            'principal_status_display',
            'principal_remarks',
            'approved_by_principal',
            'approved_by_principal_name',
            'principal_reviewed_at',
            'created_at',
        ]
        read_only_fields = [
            'id', 'student', 'section', 'incharge_status', 'incharge_remarks',
            'reviewed_by_incharge', 'incharge_reviewed_at', 'principal_status',
            'principal_remarks', 'approved_by_principal', 'principal_reviewed_at', 'created_at'
        ]

    def get_reviewed_by_incharge_name(self, obj) -> str | None:
        if obj.reviewed_by_incharge:
            return obj.reviewed_by_incharge.get_full_name() or obj.reviewed_by_incharge.username
        return None

    def get_approved_by_principal_name(self, obj) -> str | None:
        if obj.approved_by_principal:
            return obj.approved_by_principal.get_full_name() or obj.approved_by_principal.username
        return None

    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        if start and end and start > end:
            raise serializers.ValidationError("ছুটি শুরুর তারিখ শেষ তারিখের চেয়ে আগের হতে হবে।")
        return attrs


class MarkerStockSerializer(serializers.ModelSerializer):
    color_display = serializers.CharField(source='get_color_display', read_only=True)

    class Meta:
        model = MarkerStock
        fields = ['id', 'color', 'color_display', 'total_stock', 'available_stock', 'updated_at']


class AssetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCategory
        fields = '__all__'


class CollegeAssetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CollegeAsset
        fields = [
            'id', 'name', 'asset_code', 'category', 'category_name', 
            'quantity', 'room_or_location', 'condition', 'condition_display', 
            'purchase_date', 'unit_cost', 'remarks', 'recorded_by', 'recorded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'recorded_by', 'created_at']

    def get_recorded_by_name(self, obj) -> str | None:
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.username
        return None


class CertificateRequestSerializer(serializers.ModelSerializer):
    student_unique_id = serializers.CharField(source='student.student_unique_id', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    cert_type_display = serializers.CharField(source='get_certificate_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CertificateRequest
        fields = [
            'id', 'student', 'student_unique_id', 'student_name', 'roll_number', 
            'certificate_type', 'cert_type_display', 'fee_amount', 'is_fee_paid', 
            'reason', 'status', 'status_display', 'certificate_number', 
            'approved_by', 'approved_at', 'rejection_reason', 'created_at'
        ]
        read_only_fields = ['id', 'student', 'status', 'certificate_number', 'approved_by', 'approved_at', 'rejection_reason', 'created_at']


class StudentComplaintSerializer(serializers.ModelSerializer):
    student_details = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = StudentComplaint
        fields = [
            'id', 'category', 'category_display', 'title', 'description', 
            'attachment', 'status', 'status_display', 'principal_remarks', 
            'action_taken_at', 'student_details', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'principal_remarks', 'action_taken_at', 'created_at']

    def get_student_details(self, obj) -> dict | None:
        request = self.context.get('request')
        if request and (request.user.role == User.Role.PRINCIPAL or request.user.is_superuser):
            return {
                "student_name": obj.student.user.get_full_name(),
                "student_unique_id": obj.student.student_unique_id,
                "roll_number": obj.student.roll_number,
                "section": str(obj.student.section),
                "student_phone": obj.student.user.phone,
                "guardian_phone": obj.student.guardian_phone,
            }
        return None


class ParentCommunicationLogSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_unique_id = serializers.CharField(source='student.student_unique_id', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    in_charge_name = serializers.CharField(source='in_charge.get_full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ParentCommunicationLog
        fields = [
            'id', 'student', 'student_unique_id', 'roll_number', 'student_name', 
            'in_charge', 'in_charge_name', 'call_date', 'category', 'category_display', 
            'guardian_phone_called', 'discussion_summary', 'guardian_response', 
            'follow_up_needed', 'created_at'
        ]
        read_only_fields = ['id', 'in_charge', 'created_at']


class TeacherLeaveSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    employee_id = serializers.CharField(source='teacher.teacher_profile.employee_id', read_only=True)
    proxy_teacher_name = serializers.CharField(source='proxy_teacher.get_full_name', read_only=True)
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherLeave
        fields = [
            'id', 'teacher', 'teacher_name', 'employee_id', 'leave_type', 
            'leave_type_display', 'start_date', 'end_date', 'total_days', 
            'reason', 'proxy_teacher', 'proxy_teacher_name', 'status', 
            'status_display', 'reviewed_by', 'reviewed_by_name', 'reviewed_at', 
            'principal_remarks', 'created_at'
        ]
        read_only_fields = ['id', 'teacher', 'total_days', 'status', 'reviewed_by', 'reviewed_at', 'principal_remarks', 'created_at']

    def get_reviewed_by_name(self, obj) -> str | None:
        if obj.reviewed_by:
            return obj.reviewed_by.get_full_name() or obj.reviewed_by.username
        return None

    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        if start and end and start > end:
            raise serializers.ValidationError("ছুটি শুরুর তারিখ শেষ তারিখের চেয়ে আগের হতে হবে।")
        return attrs


class SMSBroadcastLogSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    target_group_display = serializers.CharField(source='get_target_group_display', read_only=True)

    class Meta:
        model = SMSBroadcastLog
        fields = '__all__'


class ClubSerializer(serializers.ModelSerializer):
    moderator_name = serializers.SerializerMethodField()
    total_members = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = ['id', 'name', 'description', 'moderator_teacher', 'moderator_name', 'total_members', 'is_active', 'created_at']

    def get_moderator_name(self, obj) -> str:
        if obj.moderator_teacher:
            return obj.moderator_teacher.get_full_name() or obj.moderator_teacher.username
        return "মনোনীত হয়নি"

    def get_total_members(self, obj) -> int:
        if hasattr(obj, 'approved_member_count'):
            return obj.approved_member_count
        return obj.memberships.filter(
            status=ClubMembership.MembershipStatus.APPROVED
        ).count()


class ClubMembershipSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_unique_id = serializers.CharField(source='student.student_unique_id', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ClubMembership
        fields = ['id', 'club', 'club_name', 'student', 'student_unique_id', 'roll_number', 'student_name', 'reason', 'status', 'status_display', 'reviewed_by', 'reviewed_at', 'created_at']
        read_only_fields = ['id', 'student', 'status', 'reviewed_by', 'reviewed_at', 'created_at']


class ClubEventSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name', read_only=True)
    total_participants = serializers.SerializerMethodField()

    class Meta:
        model = ClubEvent
        fields = ['id', 'club', 'club_name', 'title', 'description', 'event_date', 'venue', 'registration_deadline', 'total_participants', 'is_active', 'created_at']

    def get_total_participants(self, obj) -> int:
        if hasattr(obj, 'participant_count'):
            return obj.participant_count
        return obj.registrations.count()


class EventRegistrationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = EventRegistration
        fields = ['id', 'event', 'event_title', 'student', 'student_name', 'registered_at', 'attended']
        read_only_fields = ['id', 'student', 'registered_at']


class WhatsAppTemplateSerializer(serializers.ModelSerializer):
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)

    class Meta:
        model = WhatsAppTemplate
        fields = ['id', 'title', 'template_type', 'template_type_display', 'body_template', 'is_active', 'created_at']


class WhatsAppMessageLogSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = WhatsAppMessageLog
        fields = [
            'id', 'sender', 'sender_name', 'student', 'recipient_name', 
            'recipient_phone', 'message_content', 'status', 'status_display', 
            'created_at'
        ]
        read_only_fields = '__all__'


class InAppNotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)

    class Meta:
        model = InAppNotification
        fields = [
            'id', 'recipient', 'title', 'body', 'notification_type', 
            'type_display', 'action_url', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'recipient', 'title', 'body', 'notification_type', 'action_url', 'created_at']


class DevicePushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DevicePushSubscription
        fields = ['id', 'device_type', 'endpoint', 'p256dh_key', 'auth_key', 'fcm_token']