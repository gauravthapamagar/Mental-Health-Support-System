from django.contrib import admin
from .models import JournalEntry

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'patient', 'mood', 'mood_intensity', 'created_at')
    list_filter = ('mood', 'created_at', 'mood_intensity')
    search_fields = ('title', 'content', 'patient__user__full_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Content', {
            'fields': ('patient', 'title', 'content', 'tags')
        }),
        ('Mood', {
            'fields': ('mood', 'mood_intensity')
        }),
        ('Privacy', {
            'fields': ('is_public',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Restrict non-superuser admins to their own entries
        return qs.filter(patient__user=request.user)