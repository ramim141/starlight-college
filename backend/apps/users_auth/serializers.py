from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.users_auth.models import StudentProfile, TeacherProfile, User
from apps.common.validators import validate_upload


class TeacherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = [
            'employee_id',
            'designation',
            'department',
            'qualification',
            'joining_date',
            'base_salary',
            'bio',
            'show_on_website',
        ]


class StudentProfileMinimalSerializer(serializers.ModelSerializer):
    section_details = serializers.SerializerMethodField()
    has_temporary_pin = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'student_unique_id',
            'roll_number',
            'session',
            'section',
            'section_details',
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
            'monthly_transport_fee',
            'has_temporary_pin',
        ]

    def get_section_details(self, obj) -> dict:
        return {
            "id": str(obj.section.id),
            "class_level": obj.section.class_level,
            "class_level_display": obj.section.get_class_level_display(),
            "group": obj.section.group,
            "group_display": obj.section.get_group_display(),
            "section_name": obj.section.section_name,
            "session": obj.section.session,
        }

    def get_has_temporary_pin(self, obj) -> bool:
        return bool(obj.temporary_pin_token)


class UserMinimalSerializer(serializers.ModelSerializer):
    """
    ইউজারের প্রোফাইল, রোল, শিক্ষক প্রোফাইল এবং স্টুডেন্ট প্রোফাইল তথ্য।
    """
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    is_class_incharge = serializers.SerializerMethodField()
    incharge_sections = serializers.SerializerMethodField()
    teacher_profile = TeacherProfileSerializer(read_only=True)
    student_profile = StudentProfileMinimalSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'role',
            'role_display',
            'profile_photo',
            'is_library_manager',
            'is_class_incharge',
            'incharge_sections',
            'teacher_profile',
            'student_profile',
            'is_active',
        ]
        read_only_fields = ['id', 'username', 'role', 'is_library_manager', 'is_active']

    def get_full_name(self, obj) -> str:
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name if full_name else obj.username

    def validate_profile_photo(self, value):
        return validate_upload(value, {'.png', '.jpg', '.jpeg', '.webp'}, max_size_mb=5)

    def get_is_class_incharge(self, obj) -> bool:
        if obj.role == User.Role.TEACHER:
            return obj.incharge_sections.filter(is_active=True).exists()
        return False

    def get_incharge_sections(self, obj) -> list:
        if obj.role == User.Role.TEACHER:
            sections = obj.incharge_sections.filter(is_active=True)
            return [
                {
                    "id": str(sec.id),
                    "class_level": sec.class_level,
                    "class_level_display": sec.get_class_level_display(),
                    "group": sec.group,
                    "group_display": sec.get_group_display(),
                    "section_name": sec.section_name,
                    "session": sec.session,
                    "total_students": sec.students.filter(user__is_active=True).count(),
                }
                for sec in sections
            ]
        return []


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    ssc_roll = serializers.CharField(required=False, allow_blank=True)
    passing_year = serializers.CharField(required=False, allow_blank=True)
    pin = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field].required = False
        self.fields['password'].required = False

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['is_library_manager'] = user.is_library_manager
        return token

    def validate(self, attrs):
        student_login = any(attrs.get(field) for field in ('ssc_roll', 'passing_year', 'pin'))
        if student_login:
            required_fields = ('ssc_roll', 'passing_year', 'pin')
            missing_fields = [field for field in required_fields if not attrs.get(field)]
            if missing_fields:
                raise serializers.ValidationError({
                    field: "এই তথ্যটি প্রদান করা আবশ্যক।" for field in missing_fields
                })

            profile = StudentProfile.objects.select_related('user').filter(
                ssc_roll=attrs['ssc_roll'].strip(),
                passing_year=attrs['passing_year'].strip(),
            ).first()
            if not profile or not profile.user.check_password(attrs['pin']):
                raise serializers.ValidationError("SSC Roll, Passing Year অথবা PIN সঠিক নয়।")
            self.user = profile.user
            data = {}
            refresh = self.get_token(self.user)
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)
        else:
            if not attrs.get('username') or not attrs.get('password'):
                raise serializers.ValidationError({
                    'detail': "Username এবং Password অথবা SSC Roll, Passing Year এবং PIN প্রদান করুন।"
                })
            data = super().validate({
                'username': attrs['username'],
                'password': attrs['password'],
            })

        if not self.user.is_active:
            raise serializers.ValidationError("আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় (Deactivated) রয়েছে।")
        data['user'] = UserMinimalSerializer(self.user, context=self.context).data
        return data


class StaffCreateSerializer(serializers.Serializer):
    """
    প্রিন্সিপাল কর্তৃক শিক্ষক (TEACHER) অথবা অ্যাকাউন্ট্যান্ট (ACCOUNTANT) তৈরির সিরিয়ালাইজার।
    """
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20)
    role = serializers.ChoiceField(choices=[
        (User.Role.TEACHER, 'Teacher'),
        (User.Role.ACCOUNTANT, 'Accountant'),
    ])
    is_library_manager = serializers.BooleanField(default=False)

    employee_id = serializers.CharField(max_length=30, required=False)
    designation = serializers.CharField(max_length=100, required=False)
    department = serializers.CharField(max_length=100, required=False)
    qualification = serializers.CharField(max_length=255, required=False, allow_blank=True)
    joining_date = serializers.DateField(required=False, allow_null=True)
    base_salary = serializers.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    bio = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("এই ইউজারনেম দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।")
        return value

    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("এই ফোন নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে।")
        return value

    def validate(self, attrs):
        if attrs.get('role') == User.Role.TEACHER:
            if not attrs.get('employee_id'):
                raise serializers.ValidationError({"employee_id": "শিক্ষকের জন্য Employee ID প্রদান করা আবশ্যক।"})
            if TeacherProfile.objects.filter(employee_id=attrs['employee_id']).exists():
                raise serializers.ValidationError({"employee_id": "এই Employee ID ইতিমধ্যে অন্য শিক্ষকের জন্য ব্যবহৃত হয়েছে।"})
            if not attrs.get('designation') or not attrs.get('department'):
                raise serializers.ValidationError("শিক্ষকের পদবি (designation) এবং বিভাগ (department) প্রদান করা আবশ্যক।")
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data['role']
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', ''),
            phone=validated_data['phone'],
            role=role,
            is_library_manager=validated_data.get('is_library_manager', False),
        )

        if role == User.Role.TEACHER:
            TeacherProfile.objects.create(
                user=user,
                employee_id=validated_data['employee_id'],
                designation=validated_data['designation'],
                department=validated_data['department'],
                qualification=validated_data.get('qualification', ''),
                joining_date=validated_data.get('joining_date'),
                base_salary=validated_data.get('base_salary', 0.00),
                bio=validated_data.get('bio', ''),
            )
        return user