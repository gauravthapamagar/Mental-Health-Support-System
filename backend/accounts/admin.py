from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PatientProfile, TherapistProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'role', 'is_active', 'is_staff', 'created_at']
    list_filter = ['role', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'full_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'phone_number', 'date_of_birth', 'gender')}),
        ('Role', {'fields': ('role',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'full_name', 'role', 'phone_number', 'date_of_birth', 'gender'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'emergency_contact_name', 'terms_accepted', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'emergency_contact_name']
    list_filter = ['terms_accepted', 'created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TherapistProfile)
class TherapistProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'profession_type', 'years_of_experience', 'profile_completed', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'license_id']
    list_filter = ['profession_type', 'profile_completed', 'consultation_mode', 'created_at']
    readonly_fields = ['created_at', 'updated_at']