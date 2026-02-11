from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils import timezone
from .models import User, PatientProfile, TherapistProfile, VerificationDocument


class VerificationDocumentInline(admin.TabularInline):
    model = VerificationDocument
    extra = 1
    fields = ('document_type', 'document_file', 'is_verified', 'verified_by', 'uploaded_at', 'verified_at')
    readonly_fields = ('uploaded_at', 'verified_at')


@admin.register(VerificationDocument)
class VerificationDocumentAdmin(admin.ModelAdmin):
    list_display = ['therapist_profile', 'document_type', 'is_verified', 'uploaded_at']
    list_filter = ['document_type', 'is_verified', 'uploaded_at']
    search_fields = ['therapist_profile__user__full_name', 'therapist_profile__user__email']
    readonly_fields = ['uploaded_at', 'id', 'verified_at']
    
    fieldsets = (
        ('Document Info', {
            'fields': ('therapist_profile', 'document_type', 'document_file')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verified_by', 'verified_at')
        }),
        ('Timestamps', {
            'fields': ('uploaded_at', 'id'),
            'classes': ('collapse',),
        }),
    )

    def save_model(self, request, obj, form, change):
        """Custom save to set verified_by and verified_at when marking document as verified"""
        if obj.is_verified and not obj.verified_by:
            obj.verified_by = request.user
            obj.verified_at = timezone.now()
            print(f"[v0] Admin {request.user.full_name} verified document: {obj.document_type}")
        elif not obj.is_verified:
            obj.verified_by = None
            obj.verified_at = None
            print(f"[v0] Admin {request.user.full_name} unverified document: {obj.document_type}")
        
        super().save_model(request, obj, form, change)


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
        'city',
        'country',
        'created_at'
    ]
    list_filter = ['terms_accepted', 'created_at']
    search_fields = [
        'user__email', 
        'user__full_name', 
        'emergency_contact_name',
        'city',
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
        ('Address', {
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
    inlines = [VerificationDocumentInline]
    list_display = [
        'user',
        'profession_type',
        'years_of_experience',
        'profile_completed',
        'is_verified',
        'city',
        'country',
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
        'city',
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
            )
        }),
        ('Verification Status', {
            'fields': (
                'is_verified',
                'verified_at',
                'verified_by',
            ),
            'description': 'Check "Is Verified" to manually verify this therapist. Therapists are also auto-verified when all required documents are verified.'
        }),
        ('Address', {
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
        'verified_at',
        'verified_by',
    ]

    def save_model(self, request, obj, form, change):
        """Custom save to set verified_by and verified_at when marking therapist as verified"""
        if obj.is_verified and not obj.verified_by:
            # Only set verified_by if it's not already set (to avoid overwriting)
            obj.verified_by = request.user
            obj.verified_at = timezone.now()
            print(f"[v0] Admin {request.user.full_name} manually verified therapist: {obj.user.full_name}")
        elif not obj.is_verified:
            # If manually unverifying, clear the verification info
            obj.verified_by = None
            obj.verified_at = None
            print(f"[v0] Admin {request.user.full_name} removed verification from therapist: {obj.user.full_name}")
        
        super().save_model(request, obj, form, change)
