from django.db import models
from django.core.validators import MinLengthValidator
from accounts.models import User, PatientProfile, TherapistProfile
from django.utils.text import slugify
from django.utils import timezone


class CommunityCategory(models.Model):
    """Categories for organizing community posts (e.g., Anxiety, Depression, General Support)"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Icon class name (e.g., 'heart', 'message-circle')")
    color = models.CharField(max_length=7, default="#3B82F6", help_text="Hex color code")
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'community_categories'
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Categories'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class CommunityPost(models.Model):
    """Patient posts in the community forum"""
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('flagged', 'Flagged'),
        ('rejected', 'Rejected'),
    ]
    
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='community_posts',
        limit_choices_to={'role': 'patient'}
    )
    category = models.ForeignKey(
        CommunityCategory, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='posts'
    )
    title = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(5)]
    )
    content = models.TextField(
        validators=[MinLengthValidator(20)],
        help_text="Share your thoughts, feelings, or experiences"
    )
    is_anonymous = models.BooleanField(
        default=False,
        help_text="Post anonymously (your name won't be shown to other patients)"
    )
    
    # Moderation
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    moderated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_posts',
        limit_choices_to={'role': 'therapist'}
    )
    moderated_at = models.DateTimeField(null=True, blank=True)
    moderation_notes = models.TextField(blank=True, null=True)
    
    # Engagement
    view_count = models.IntegerField(default=0)
    
    # Flags and reports
    flag_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'community_posts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['category', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.get_author_display()}"
    
    def get_author_display(self):
        """Return author name or 'Anonymous' based on is_anonymous"""
        if self.is_anonymous:
            return "Anonymous"
        return self.author.full_name
    
    def approve(self, moderator):
        """Approve the post"""
        self.status = 'approved'
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        self.save()
    
    def flag_for_review(self, moderator, notes=''):
        """Flag the post for review"""
        self.status = 'flagged'
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        self.moderation_notes = notes
        self.save()
    
    def reject(self, moderator, notes=''):
        """Reject the post"""
        self.status = 'rejected'
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        self.moderation_notes = notes
        self.save()


class PostLike(models.Model):
    """Likes on community posts"""
    post = models.ForeignKey(
        CommunityPost, 
        on_delete=models.CASCADE, 
        related_name='likes'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='post_likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'community_post_likes'
        unique_together = ('post', 'user')
        indexes = [
            models.Index(fields=['post', 'user']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} likes {self.post.title}"


class PostComment(models.Model):
    """Comments on community posts - can be from patients or therapists"""
    post = models.ForeignKey(
        CommunityPost, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='post_comments'
    )
    content = models.TextField(
        validators=[MinLengthValidator(5)],
        help_text="Share your thoughts or support"
    )
    is_anonymous = models.BooleanField(
        default=False,
        help_text="Comment anonymously (only for patients)"
    )
    
    # Parent comment for threaded replies
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    # Moderation
    is_approved = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    flag_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'community_post_comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.get_author_display()} on {self.post.title}"
    
    def get_author_display(self):
        """Return author name, role badge, or 'Anonymous'"""
        if self.is_anonymous and self.author.role == 'patient':
            return "Anonymous"
        elif self.author.role == 'therapist':
            return f"Dr. {self.author.full_name}"
        return self.author.full_name


class CommentLike(models.Model):
    """Likes on comments"""
    comment = models.ForeignKey(
        PostComment, 
        on_delete=models.CASCADE, 
        related_name='likes'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='comment_likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'community_comment_likes'
        unique_together = ('comment', 'user')
    
    def __str__(self):
        return f"{self.user.full_name} likes comment by {self.comment.author.full_name}"


class PostReport(models.Model):
    """Reports for inappropriate posts"""
    REASON_CHOICES = [
        ('spam', 'Spam or Advertising'),
        ('harassment', 'Harassment or Bullying'),
        ('inappropriate', 'Inappropriate Content'),
        ('misinformation', 'Medical Misinformation'),
        ('self_harm', 'Self-Harm or Suicide Content'),
        ('other', 'Other'),
    ]
    
    post = models.ForeignKey(
        CommunityPost, 
        on_delete=models.CASCADE, 
        related_name='reports'
    )
    reported_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='reports_made'
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    details = models.TextField(blank=True, null=True)
    
    # Resolution
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_resolved',
        limit_choices_to={'role': 'therapist'}
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'community_post_reports'
        unique_together = ('post', 'reported_by')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report for {self.post.title} by {self.reported_by.full_name}"


class CommentReport(models.Model):
    """Reports for inappropriate comments"""
    REASON_CHOICES = [
        ('spam', 'Spam or Advertising'),
        ('harassment', 'Harassment or Bullying'),
        ('inappropriate', 'Inappropriate Content'),
        ('misinformation', 'Medical Misinformation'),
        ('self_harm', 'Self-Harm or Suicide Content'),
        ('other', 'Other'),
    ]
    
    comment = models.ForeignKey(
        PostComment, 
        on_delete=models.CASCADE, 
        related_name='reports'
    )
    reported_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='comment_reports_made'
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    details = models.TextField(blank=True, null=True)
    
    # Resolution
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='comment_reports_resolved',
        limit_choices_to={'role': 'therapist'}
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'community_comment_reports'
        unique_together = ('comment', 'reported_by')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report for comment by {self.reported_by.full_name}"