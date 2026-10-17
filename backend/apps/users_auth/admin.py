from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from apps.users_auth.models import StudentProfile, TeacherProfile, User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'get_full_name', 'role', 'phone', 'is_library_manager', 'is_active', 'created_at')
    list_filter = ('role', 'is_library_manager', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'phone', 'email')
    ordering = ('-created_at',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('College ERP Role & Info', {
            'fields': ('role', 'phone', 'profile_photo', 'is_library_manager'),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('College ERP Role & Info', {
            'fields': ('first_name', 'last_name', 'email', 'role', 'phone', 'is_library_manager'),
        }),
    )

@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'user', 'designation', 'department', 'base_salary', 'joining_date')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'department')
    list_filter = ('department', 'designation')

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('student_unique_id', 'roll_number', 'user', 'gender', 'section', 'assigned_vehicle', 'uses_transport')
    search_fields = ('student_unique_id', 'user__first_name', 'user__last_name', 'roll_number')
    list_filter = ('gender', 'section', 'uses_transport', 'assigned_vehicle')