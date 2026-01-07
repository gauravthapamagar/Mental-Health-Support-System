from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import BlogPost, BlogLike, BlogComment, BlogView


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'title_short', 'author', 'category', 'status',
        'author_verified', 'views_count', 'likes_count', 'published_at'
    ]
    list_filter = ['status', 'category', 'created_at', 'published_at']
    search_fields = ['title', 'content', 'author__full_name', 'author__email']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views_count', 'likes_count', 'created_at', 'updated_at', 'published_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('author', 'title', 'slug', 'excerpt', 'content')
        }),
        ('Categorization', {
            'fields': ('category', 'tags', 'cover_image')
        }),
        ('Status & Approval', {
            'fields': ('status', 'approved_by', 'approved_at', 'rejection_reason')
        }),
        ('Engagement', {
            'fields': ('views_count', 'likes_count')
        }),
        ('SEO', {
            'fields': ('meta_description',)
        }),
        ('Timestamps', {
            'fields': ('published_at', 'created_at', 'updated_at')
        }),
    )
    
    actions = ['approve_blogs', 'reject_blogs', 'publish_blogs']
    
    def title_short(self, obj):
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    title_short.short_description = 'Title'
    
    def author_verified(self, obj):
        if hasattr(obj.author, 'therapist_profile'):
            is_verified = obj.author.therapist_profile.is_verified
            if is_verified:
                return format_html('<span style="color: green;">✓ Verified</span>')
            return format_html('<span style="color: orange;">⚠ Unverified</span>')
        return '-'
    author_verified.short_description = 'Author Status'
    
    def approve_blogs(self, request, queryset):
        updated = queryset.filter(status='pending').update(
            status='published',
            approved_by=request.user,
            approved_at=timezone.now(),
            published_at=timezone.now()
        )
        self.message_user(request, f'{updated} blog post(s) approved and published.')
    approve_blogs.short_description = 'Approve selected blogs'
    
    def reject_blogs(self, request, queryset):
        updated = queryset.filter(status='pending').update(
            status='rejected',
            rejection_reason='Rejected by admin'
        )
        self.message_user(request, f'{updated} blog post(s) rejected.')
    reject_blogs.short_description = 'Reject selected blogs'
    
    def publish_blogs(self, request, queryset):
        updated = queryset.filter(status='draft').update(
            status='published',
            published_at=timezone.now()
        )
        self.message_user(request, f'{updated} blog post(s) published.')
    publish_blogs.short_description = 'Publish selected blogs'


@admin.register(BlogLike)
class BlogLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'blog_post_title', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['blog_post__title', 'user__full_name', 'user__email']
    readonly_fields = ['created_at']
    
    def blog_post_title(self, obj):
        return obj.blog_post.title[:50]
    blog_post_title.short_description = 'Blog Post'


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'blog_post_title', 'author', 'content_short', 'is_approved', 'is_flagged', 'created_at']
    list_filter = ['is_approved', 'is_flagged', 'created_at']
    search_fields = ['blog_post__title', 'author__full_name', 'content']
    readonly_fields = ['created_at', 'updated_at']
    
    actions = ['approve_comments', 'flag_comments']
    
    def blog_post_title(self, obj):
        return obj.blog_post.title[:40]
    blog_post_title.short_description = 'Blog Post'
    
    def content_short(self, obj):
        return obj.content[:60] + '...' if len(obj.content) > 60 else obj.content
    content_short.short_description = 'Comment'
    
    def approve_comments(self, request, queryset):
        updated = queryset.update(is_approved=True, is_flagged=False)
        self.message_user(request, f'{updated} comment(s) approved.')
    approve_comments.short_description = 'Approve selected comments'
    
    def flag_comments(self, request, queryset):
        updated = queryset.update(is_flagged=True)
        self.message_user(request, f'{updated} comment(s) flagged.')
    flag_comments.short_description = 'Flag selected comments'


@admin.register(BlogView)
class BlogViewAdmin(admin.ModelAdmin):
    list_display = ['id', 'blog_post_title', 'user', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['blog_post__title', 'user__full_name', 'ip_address']
    readonly_fields = ['viewed_at']
    
    def blog_post_title(self, obj):
        return obj.blog_post.title[:50]
    blog_post_title.short_description = 'Blog Post'