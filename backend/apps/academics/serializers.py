from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.academics.models import (
    AcademicHoliday,
    AcademicSection,
    ClassRoutine,
    Homework,
    StudentAttendance,
    Subject,
    Syllabus,
)
from apps.finance.models import TransportVehicle
from apps.users_auth.models import StudentProfile, User
from apps.common.validators import validate_upload


class AcademicSectionSerializer(serializers.ModelSerializer):
    class_level_display = serializers.CharField(source='get_class_level_display', read_only=True)
    group_display = serializers.CharField(source='get_group_display', read_only=True)
    in_charge_teacher_name = serializers.SerializerMethodField()
    total_students = serializers.SerializerMethodField()

    class Meta:
        model = AcademicSection
        fields = [
            'id',
            'class_level',
            'class_level_display',
            'group',
            'group_display',
            'section_name',
            'session',
            'in_charge_teacher',
            'in_charge_teacher_name',
            'total_students',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_in_charge_teacher_name(self, obj) -> str | None:
        if obj.in_charge_teacher:
            full_name = obj.in_charge_teacher.get_full_name()
            return full_name if full_name else obj.in_charge_teacher.username
        return None

    def get_total_students(self, obj) -> int:
        if hasattr(obj, 'student_count'):
            return obj.student_count
        return obj.students.count()

    def validate_in_charge_teacher(self, value):
        if value and value.role != User.Role.TEACHER:
            raise serializers.ValidationError("শুধুমাত্র একজন শিক্ষককেই (TEACHER) শ্রেণি ইনচার্জ হিসেবে নিযুক্ত করা যাবে।")
        return value


class StudentDetailSerializer(serializers.ModelSerializer):
    """
    স্টুডেন্টের সম্পূর্ণ তথ্য দেখানোর এবং আপডেট করার সিরিয়ালাইজার।
    """
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    full_name = serializers.SerializerMethodField()
    phone = serializers.CharField(source='user.phone', required=False, allow_null=True, allow_blank=True)
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)
    is_active = serializers.BooleanField(source='user.is_active', required=False)
    section_name_display = serializers.CharField(source='section.__str__', read_only=True)
    class_level = serializers.CharField(source='section.class_level', read_only=True, default='')
    class_level_display = serializers.CharField(source='section.get_class_level_display', read_only=True, default='')
    group = serializers.CharField(source='section.group', read_only=True, default='')
    group_display = serializers.CharField(source='section.get_group_display', read_only=True, default='')
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    assigned_vehicle_number = serializers.CharField(source='assigned_vehicle.vehicle_number', read_only=True, default=None)
    created_by_name = serializers.SerializerMethodField()
    temporary_pin = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'user_id',
            'student_unique_id',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'gender',
            'gender_display',
            'phone',
            'email',
            'section',
            'section_name_display',
            'class_level',
            'class_level_display',
            'group',
            'group_display',
            'roll_number',
            'session',
            'ssc_roll',
            'passing_year',
            'hsc_registration_no',
            'father_name',
            'mother_name',
            'guardian_phone',
            'guardian_whatsapp_number',
            'student_whatsapp_number',
            'present_address',
            'monthly_tuition_fee',
            'uses_transport',
            'assigned_vehicle',
            'assigned_vehicle_number',
            'monthly_transport_fee',
            'is_active',
            'created_by',
            'created_by_name',
            'created_at',
            'temporary_pin',
        ]
        read_only_fields = ['id', 'user_id', 'student_unique_id', 'username', 'session', 'created_by', 'created_at']

    def get_full_name(self, obj) -> str:
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else obj.user.username

    def get_created_by_name(self, obj) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None

    def get_temporary_pin(self, obj) -> str:
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == User.Role.PRINCIPAL:
            return obj.get_temporary_pin()
        return ''

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        return super().update(instance, validated_data)


class StudentEnrollmentSerializer(serializers.Serializer):
    """
    শ্রেণি ইনচার্জ বা প্রিন্সিপাল কর্তৃক নতুন স্টুডেন্ট অ্যাকাউন্ট তৈরির সিরিয়ালাইজার।
    """
    username = serializers.CharField(
        max_length=150, 
        required=False, 
        allow_blank=True,
        help_text="খালি রাখলে স্টুডেন্টের Unique ID স্বয়ংক্রিয়ভাবে Username হিসেবে সেট হবে।"
    )
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    gender = serializers.ChoiceField(choices=StudentProfile.GenderChoices.choices, default=StudentProfile.GenderChoices.MALE)
    phone = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    section = serializers.PrimaryKeyRelatedField(queryset=AcademicSection.objects.filter(is_active=True))
    roll_number = serializers.IntegerField(min_value=1)
    ssc_roll = serializers.CharField(max_length=30, required=False, allow_blank=True)
    passing_year = serializers.CharField(max_length=4, required=False, allow_blank=True)
    hsc_registration_no = serializers.CharField(max_length=50, required=False, allow_blank=True)

    father_name = serializers.CharField(max_length=150)
    mother_name = serializers.CharField(max_length=150)
    guardian_phone = serializers.CharField(max_length=20)
    guardian_whatsapp_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    student_whatsapp_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    present_address = serializers.CharField(required=False, allow_blank=True)

    monthly_tuition_fee = serializers.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    uses_transport = serializers.BooleanField(default=False)
    assigned_vehicle = serializers.PrimaryKeyRelatedField(queryset=TransportVehicle.objects.filter(is_active=True), required=False, allow_null=True)
    monthly_transport_fee = serializers.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def validate(self, attrs):
        section = attrs['section']
        roll_number = attrs['roll_number']
        phone = attrs.get('phone') or None
        attrs['phone'] = phone

        if StudentProfile.objects.filter(section=section, roll_number=roll_number).exists():
            raise serializers.ValidationError({
                "roll_number": f"'{section}' শাখায় রোল নম্বর {roll_number} দিয়ে ইতিমধ্যে একজন শিক্ষার্থী ভর্তি রয়েছে।"
            })

        if attrs.get('ssc_roll') and attrs.get('passing_year') and StudentProfile.objects.filter(
            ssc_roll=attrs['ssc_roll'],
            passing_year=attrs['passing_year'],
        ).exists():
            raise serializers.ValidationError({
                "ssc_roll": "এই SSC Roll এবং Passing Year ইতিমধ্যে ব্যবহৃত হয়েছে।"
            })

        year_prefix = section.session.split('-')[0].strip()
        generated_unique_id = (
            f"{year_prefix}-{section.class_level}-"
            f"{section.group}-{section.section_name}-"
            f"{int(roll_number):04d}"
        ).upper()

        username = attrs.get('username', '').strip() or generated_unique_id
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                "username": f"'{username}' ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে।"
            })

        if phone and User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError({
                "phone": "শিক্ষার্থীর এই ব্যক্তিগত ফোন নম্বরটি ইতিমধ্যে অন্য অ্যাকাউন্টে ব্যবহৃত হয়েছে।"
            })

        attrs['username'] = username
        attrs['generated_unique_id'] = generated_unique_id
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get('request')
        creator = request.user if request else None
        section = validated_data['section']

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', ''),
            phone=validated_data.get('phone'),
            role=User.Role.STUDENT,
        )

        student_profile = StudentProfile.objects.create(
            user=user,
            student_unique_id=validated_data['generated_unique_id'],
            gender=validated_data.get('gender', StudentProfile.GenderChoices.MALE),
            section=section,
            roll_number=validated_data['roll_number'],
            session=section.session,
            ssc_roll=validated_data.get('ssc_roll', ''),
            passing_year=validated_data.get('passing_year', ''),
            hsc_registration_no=validated_data.get('hsc_registration_no', ''),
            father_name=validated_data['father_name'],
            mother_name=validated_data['mother_name'],
            guardian_phone=validated_data['guardian_phone'],
            guardian_whatsapp_number=validated_data.get('guardian_whatsapp_number', ''),
            student_whatsapp_number=validated_data.get('student_whatsapp_number', ''),
            present_address=validated_data.get('present_address', ''),
            monthly_tuition_fee=validated_data.get('monthly_tuition_fee', 0.00),
            uses_transport=validated_data.get('uses_transport', False),
            assigned_vehicle=validated_data.get('assigned_vehicle', None),
            monthly_transport_fee=validated_data.get('monthly_transport_fee', 0.00),
            created_by=creator,
        )
        return student_profile


class SubjectSerializer(serializers.ModelSerializer):
    class_level_display = serializers.CharField(source='get_class_level_display', read_only=True)
    group_display = serializers.CharField(source='get_group_display', read_only=True)
    default_teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            'id',
            'name',
            'code',
            'class_level',
            'class_level_display',
            'group',
            'group_display',
            'default_teacher',
            'default_teacher_name',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_default_teacher_name(self, obj) -> str | None:
        if obj.default_teacher:
            return obj.default_teacher.get_full_name() or obj.default_teacher.username
        return None


class ClassRoutineSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    section_display = serializers.CharField(source='section.__str__', read_only=True)

    class Meta:
        model = ClassRoutine
        fields = [
            'id',
            'section',
            'section_display',
            'subject',
            'subject_name',
            'subject_code',
            'teacher',
            'teacher_name',
            'day_of_week',
            'day_name',
            'start_time',
            'end_time',
            'room_number',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_teacher_name(self, obj) -> str:
        return obj.teacher.get_full_name() or obj.teacher.username

    def validate(self, attrs):
        instance = ClassRoutine(**attrs)
        if self.instance:
            instance.pk = self.instance.pk
        instance.clean()
        return attrs


class SyllabusSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Syllabus
        fields = [
            'id',
            'subject',
            'subject_name',
            'session',
            'title',
            'file',
            'uploaded_by',
            'uploaded_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at']

    def get_uploaded_by_name(self, obj) -> str | None:
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name() or obj.uploaded_by.username
        return None

    def validate_file(self, value):
        return validate_upload(value, {'.pdf', '.doc', '.docx'}, max_size_mb=10)


class HomeworkSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    section_display = serializers.CharField(source='section.__str__', read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Homework
        fields = [
            'id',
            'section',
            'section_display',
            'subject',
            'subject_name',
            'teacher',
            'teacher_name',
            'title',
            'description',
            'due_date',
            'attachment',
            'created_at',
        ]
        read_only_fields = ['id', 'teacher', 'created_at']

    def get_teacher_name(self, obj) -> str:
        return obj.teacher.get_full_name() or obj.teacher.username

    def validate_attachment(self, value):
        return validate_upload(
            value, {'.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'}, max_size_mb=10
        )


class StudentAttendanceRecordSerializer(serializers.ModelSerializer):
    student_id = serializers.UUIDField(source='student.id')
    student_unique_id = serializers.CharField(source='student.student_unique_id', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)

    class Meta:
        model = StudentAttendance
        fields = [
            'id',
            'student_id',
            'student_unique_id',
            'roll_number',
            'student_name',
            'status',
            'remarks',
        ]


class SingleAttendanceItemSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    status = serializers.ChoiceField(choices=StudentAttendance.AttendanceStatus.choices, default=StudentAttendance.AttendanceStatus.PRESENT)
    remarks = serializers.CharField(max_length=255, required=False, allow_blank=True)


class BulkAttendanceCreateSerializer(serializers.Serializer):
    section_id = serializers.UUIDField()
    date = serializers.DateField(default=timezone.localdate)
    attendance_records = SingleAttendanceItemSerializer(many=True)

    def validate_section_id(self, value):
        if not AcademicSection.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("প্রদত্ত শ্রেণি বা শাখাটি খুঁজে পাওয়া যায়নি।")
        return value

    def validate(self, attrs):
        section_id = attrs['section_id']
        records = attrs.get('attendance_records', [])
        
        if not records:
            raise serializers.ValidationError({"attendance_records": "কমপক্ষে একজন শিক্ষার্থীর হাজিরা ডেটা পাঠানো আবশ্যক।"})

        student_ids = [item['student_id'] for item in records]
        if len(student_ids) != len(set(student_ids)):
            raise serializers.ValidationError({"attendance_records": "একই শিক্ষার্থীর একাধিক এন্ট্রি তালিকায় রয়েছে।"})

        valid_student_count = StudentProfile.objects.filter(
            id__in=student_ids,
            section_id=section_id
        ).count()

        if valid_student_count != len(student_ids):
            raise serializers.ValidationError("তালিকায় এমন শিক্ষার্থী রয়েছে যারা এই শাখার অন্তর্ভুক্ত নয়।")

        return attrs

    @transaction.atomic
    def save_bulk(self, recorder_user):
        section_id = self.validated_data['section_id']
        attendance_date = self.validated_data['date']
        records = self.validated_data['attendance_records']

        section = AcademicSection.objects.get(id=section_id)
        saved_instances = []

        for item in records:
            attendance, _ = StudentAttendance.objects.update_or_create(
                student_id=item['student_id'],
                date=attendance_date,
                defaults={
                    'section': section,
                    'status': item['status'],
                    'remarks': item.get('remarks', ''),
                    'recorded_by': recorder_user,
                }
            )
            saved_instances.append(attendance)

        return saved_instances


class AcademicHolidaySerializer(serializers.ModelSerializer):
    holiday_type_display = serializers.CharField(source='get_holiday_type_display', read_only=True)

    class Meta:
        model = AcademicHoliday
        fields = '__all__'