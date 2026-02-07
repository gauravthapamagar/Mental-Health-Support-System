from django.contrib import admin
from .models import TherapistMatch


@admin.register(TherapistMatch)
class TherapistMatchAdmin(admin.ModelAdmin):
    list_display = [
        'patient',
        'top_match_1',
        'top_match_1_score',
        'top_match_2',
        'top_match_2_score',
        'matched_at',
    ]
    list_filter = ['matched_at', 'patient']
    search_fields = ['patient__username', 'top_match_1__username']
    readonly_fields = ['matched_at', 'updated_at']
    
    fieldsets = (
        ('Patient & Survey', {
            'fields': ('patient', 'survey_response')
        }),
        ('Top 3 Matches', {
            'fields': (
                ('top_match_1', 'top_match_1_score'),
                ('top_match_2', 'top_match_2_score'),
                ('top_match_3', 'top_match_3_score'),
            )
        }),
        ('Timestamps', {
            'fields': ('matched_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
