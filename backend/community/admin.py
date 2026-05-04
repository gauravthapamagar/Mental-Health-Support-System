from django.contrib import admin
from django.utils.html import format_html
from .models import (
    CommunityCategory,
    CommunityPost,
    PostLike,
    PostComment,
    CommentLike,
    PostReport,
    CommentReport
)


@admin.register(CommunityCategory)
class CommunityCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color_badge', 'is_active', 'post_count', 'display_order']
    list_editable = ['is_active', 'display_order']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['display_order', 'name']
    
    def color_badge(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 5px 10px; color: white; border-radius: 3px;">{}</span>',
            obj.color,
            obj.color
        )
    color_badge.short_description = 'Color'
    
    def post_count(self, obj):
        return obj.posts.filter(status='approved', is_deleted=False).count()
    post_count.short_description = 'Posts'


@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author_name', 'category', 'status_badge', 
        'like_count', 'comment_count', 'view_count', 
        'is_anonymous', 'created_at'
    ]
    list_filter = [
        'status', 'is_anonymous', 'is_deleted', 
        'category', 'created_at'
    ]
    search_fields = ['title', 'content', 'author__full_name', 'author__email']
    readonly_fields = [
        'view_count', 'flag_count', 'created_at', 'updated_at',
        'moderated_by', 'moderated_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Post Information', {
            'fields': ('title', 'content', 'author', 'category', 'is_anonymous')
        }),
        ('Moderation', {
            'fields': (
                'status', 'moderated_by', 'moderated_at', 
                'moderation_notes', 'flag_count'
            )
        }),
        ('Engagement', {
            'fields': ('view_count',)
        }),
        ('Deletion', {
            'fields': ('is_deleted', 'deleted_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def author_name(self, obj):
        if obj.is_anonymous:
            return format_html('<em>Anonymous ({})</em>', obj.author.full_name)
        return obj.author.full_name
    author_name.short_description = 'Author'
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'approved': '#28A745',
            'flagged': '#DC3545',
            'rejected': '#6C757D'
        }
        return format_html(
            '<span style="background-color: {}; padding: 5px 10px; color: white; border-radius: 3px;">{}</span>',
            colors.get(obj.status, '#6C757D'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def like_count(self, obj):
        return obj.likes.count()
    like_count.short_description = 'Likes'
    
    def comment_count(self, obj):
        return obj.comments.filter(is_deleted=False).count()
    comment_count.short_description = 'Comments'
    
    actions = ['approve_posts', 'flag_posts', 'reject_posts']
    
    def approve_posts(self, request, queryset):
        for post in queryset:
            post.approve(request.user)
        self.message_user(request, f'{queryset.count()} posts approved successfully.')
    approve_posts.short_description = 'Approve selected posts'
    
    def flag_posts(self, request, queryset):
        for post in queryset:
            post.flag_for_review(request.user)
        self.message_user(request, f'{queryset.count()} posts flagged for review.')
    flag_posts.short_description = 'Flag selected posts'
    
    def reject_posts(self, request, queryset):
        for post in queryset:
            post.reject(request.user)
        self.message_user(request, f'{queryset.count()} posts rejected.')
    reject_posts.short_description = 'Reject selected posts'


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = [
        'comment_preview', 'author_name', 'post', 
        'is_approved', 'is_flagged', 'like_count',
        'created_at'
    ]
    list_filter = [
        'is_approved', 'is_flagged', 'is_deleted',
        'is_anonymous', 'created_at'
    ]
    search_fields = ['content', 'author__full_name', 'post__title']
    readonly_fields = ['flag_count', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    def comment_preview(self, obj):
        preview = obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
        return preview
    comment_preview.short_description = 'Comment'
    
    def author_name(self, obj):
        if obj.is_anonymous and obj.author.role == 'patient':
            return format_html('<em>Anonymous ({})</em>', obj.author.full_name)
        elif obj.author.role == 'therapist':
            return format_html('<strong>Dr. {}</strong>', obj.author.full_name)
        return obj.author.full_name
    author_name.short_description = 'Author'
    
    def like_count(self, obj):
        return obj.likes.count()
    like_count.short_description = 'Likes'
    
    actions = ['approve_comments', 'flag_comments']
    
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True, is_flagged=False)
        self.message_user(request, f'{queryset.count()} comments approved.')
    approve_comments.short_description = 'Approve selected comments'
    
    def flag_comments(self, request, queryset):
        queryset.update(is_flagged=True, is_approved=False)
        self.message_user(request, f'{queryset.count()} comments flagged.')
    flag_comments.short_description = 'Flag selected comments'


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__full_name', 'post__title']
    date_hierarchy = 'created_at'


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'comment_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__full_name', 'comment__content']
    date_hierarchy = 'created_at'
    
    def comment_preview(self, obj):
        preview = obj.comment.content[:50] + '...' if len(obj.comment.content) > 50 else obj.comment.content
        return preview
    comment_preview.short_description = 'Comment'


@admin.register(PostReport)
class PostReportAdmin(admin.ModelAdmin):
    list_display = [
        'post', 'reported_by', 'reason', 
        'is_resolved', 'created_at'
    ]
    list_filter = [
        'reason', 'is_resolved', 'created_at'
    ]
    search_fields = [
        'post__title', 'reported_by__full_name', 
        'details', 'resolution_notes'
    ]
    readonly_fields = ['created_at', 'resolved_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Report Information', {
            'fields': ('post', 'reported_by', 'reason', 'details')
        }),
        ('Resolution', {
            'fields': (
                'is_resolved', 'resolved_by', 
                'resolved_at', 'resolution_notes'
            )
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['resolve_reports']
    
    def resolve_reports(self, request, queryset):
        from django.utils import timezone
        queryset.update(
            is_resolved=True,
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
        self.message_user(request, f'{queryset.count()} reports resolved.')
    resolve_reports.short_description = 'Resolve selected reports'


@admin.register(CommentReport)
class CommentReportAdmin(admin.ModelAdmin):
    list_display = [
        'comment_preview', 'reported_by', 'reason',
        'is_resolved', 'created_at'
    ]
    list_filter = [
        'reason', 'is_resolved', 'created_at'
    ]
    search_fields = [
        'comment__content', 'reported_by__full_name',
        'details', 'resolution_notes'
    ]
    readonly_fields = ['created_at', 'resolved_at']
    date_hierarchy = 'created_at'
    
    def comment_preview(self, obj):
        preview = obj.comment.content[:50] + '...' if len(obj.comment.content) > 50 else obj.comment.content
        return preview
    comment_preview.short_description = 'Comment'
    
    actions = ['resolve_reports']
    
    def resolve_reports(self, request, queryset):
        from django.utils import timezone
        queryset.update(
            is_resolved=True,
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
        self.message_user(request, f'{queryset.count()} reports resolved.')
    resolve_reports.short_description = 'Resolve selected reports'