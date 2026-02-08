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
        ('Personal Info', {
            'fields': (
                'full_name', 'phone_number', 'date_of_birth', 'gender'
            )
        }),
        ('Role', {'fields': ('role',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'password1', 'password2', 'full_name', 'role',
                'phone_number', 'date_of_birth', 'gender'
            ),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 
        'emergency_contact_name', 
        'terms_accepted', 
        'city',              # ← added (useful at a glance)
        'country',           # ← added
        'created_at'
    ]
    list_filter = ['terms_accepted', 'created_at']
    search_fields = [
        'user__email', 
        'user__full_name', 
        'emergency_contact_name',
        'city',              # ← optional but helpful
        'country'
    ]
    
    fieldsets = (
        (None, {
            'fields': (
                'user',
                'emergency_contact_name',
                'emergency_contact_phone',
                'basic_health_info',
                'terms_accepted',
            )
        }),
        ('Address', {          # ← new section
            'fields': (
                'address_line_1',
                'address_line_2',
                'city',
                'state',
                'country',
                'postal_code',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'user']


@admin.register(TherapistProfile)
class TherapistProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'profession_type',
        'years_of_experience',
        'profile_completed',
        'city',               # ← added
        'country',            # ← added
        'created_at'
    ]
    list_filter = [
        'profession_type',
        'profile_completed',
        'consultation_mode',
        'created_at',
        'is_verified',
    ]
    search_fields = [
        'user__email',
        'user__full_name',
        'license_id',
        'city',               # ← optional
        'country'
    ]
    
    fieldsets = (
        (None, {
            'fields': (
                'user',
                'profession_type',
                'license_id',
                'years_of_experience',
                'phone_number',
                'profile_completed',
                'is_verified',
                'verified_at',
                'verified_by',
            )
        }),
        ('Address', {          # ← new section
            'fields': (
                'address_line_1',
                'address_line_2',
                'city',
                'state',
                'country',
                'postal_code',
            )
        }),
        ('Additional Info', {
            'fields': (
                'specialization_tags',
                'languages_spoken',
                'consultation_mode',
                'consultation_fees',
                'availability_slots',
                'bio',
                'profile_picture',
                'certificates',
            ),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = [
        'created_at', 
        'updated_at', 
        'user',
        'profile_completed',
        'is_verified',
        'verified_at',
        'verified_by',
    ]