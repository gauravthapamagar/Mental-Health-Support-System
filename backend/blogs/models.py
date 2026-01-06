from django.db import models
from accounts.models import User
from django.utils.text import slugify


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('published', 'Published'),
    ]
    
    CATEGORY_CHOICES = [
        ('mental_health', 'Mental Health'),
        ('anxiety', 'Anxiety'),
        ('depression', 'Depression'),
        ('stress', 'Stress Management'),
        ('relationships', 'Relationships'),
        ('self_care', 'Self Care'),
        ('therapy', 'Therapy & Counseling'),
        ('wellness', 'Wellness'),
        ('other', 'Other'),
    ]
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blog_posts',
        limit_choices_to={'role': 'therapist'}
    )
    
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    
    # Blog content
    content = models.TextField(help_text="Main blog content in markdown or HTML")
    excerpt = models.TextField(max_length=500, help_text="Short description/summary")
    
    # Categorization
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='mental_health')
    tags = models.JSONField(default=list, blank=True, help_text="List of tags")
    
    # Cover image (URL or path)
    cover_image = models.URLField(blank=True, null=True)
    
    # Status and approval
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # For verified therapists, auto-published. For unverified, needs approval
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_blogs',
        limit_choices_to={'role__in': ['therapist', 'admin']}
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Engagement metrics
    views_count = models.IntegerField(default=0)
    likes_count = models.IntegerField(default=0)
    
    # SEO
    meta_description = models.CharField(max_length=160, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'blog_posts'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['slug']),
            models.Index(fields=['author']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.author.full_name} ({self.status})"
    
    def save(self, *args, **kwargs):
        # Auto-generate slug if not provided
        if not self.slug:
            self.slug = slugify(self.title)
            # Ensure unique slug
            original_slug = self.slug
            counter = 1
            while BlogPost.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        
        super().save(*args, **kwargs)
    
    @property
    def is_published(self):
        return self.status == 'published'
    
    @property
    def reading_time(self):
        """Calculate estimated reading time in minutes"""
        words = len(self.content.split())
        minutes = words // 200  # Average reading speed
        return max(1, minutes)


class BlogLike(models.Model):
    """Track users who liked a blog post"""
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_blogs')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'blog_likes'
        unique_together = ['blog_post', 'user']
    
    def __str__(self):
        return f"{self.user.full_name} likes {self.blog_post.title}"


class BlogComment(models.Model):
    """Comments on blog posts"""
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_comments')
    
    content = models.TextField()
    
    # Comment moderation
    is_approved = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'blog_comments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.author.full_name} on {self.blog_post.title}"


class BlogView(models.Model):
    """Track blog post views"""
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='view_records')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'blog_views'
    
    def __str__(self):
        return f"View on {self.blog_post.title}"