from rest_framework import serializers
from .models import BlogPost, BlogLike, BlogComment, BlogView
from accounts.models import User


class BlogAuthorSerializer(serializers.ModelSerializer):
    """Minimal author info for blog posts"""
    is_verified = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'is_verified']
    
    def get_is_verified(self, obj):
        if hasattr(obj, 'therapist_profile'):
            return obj.therapist_profile.is_verified
        return False


class BlogCommentSerializer(serializers.ModelSerializer):
    author = BlogAuthorSerializer(read_only=True)
    
    class Meta:
        model = BlogComment
        fields = ['id', 'author', 'content', 'is_approved', 'created_at', 'updated_at']
        read_only_fields = ['author', 'is_approved', 'created_at', 'updated_at']


class BlogPostListSerializer(serializers.ModelSerializer):
    """Serializer for blog list view"""
    author = BlogAuthorSerializer(read_only=True)
    reading_time = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'slug', 'title', 'excerpt', 'author', 'category', 'tags',
            'cover_image', 'status', 'views_count', 'likes_count',
            'reading_time', 'published_at', 'created_at', 'is_liked'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return BlogLike.objects.filter(blog_post=obj, user=request.user).exists()
        return False


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed blog view"""
    author = BlogAuthorSerializer(read_only=True)
    reading_time = serializers.IntegerField(read_only=True)
    comments = BlogCommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'slug', 'title', 'content', 'excerpt', 'author', 
            'category', 'tags', 'cover_image', 'status', 'approved_by',
            'approved_by_name', 'approved_at', 'rejection_reason',
            'views_count', 'likes_count', 'reading_time', 'meta_description',
            'published_at', 'created_at', 'updated_at', 'comments',
            'comments_count', 'is_liked'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return BlogLike.objects.filter(blog_post=obj, user=request.user).exists()
        return False
    
    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.full_name
        return None


class BlogPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating blog posts"""
    
    class Meta:
        model = BlogPost
        fields = [
            'title', 'content', 'excerpt', 'category', 'tags',
            'cover_image', 'meta_description'
        ]
    
    def validate_title(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Title must be at least 10 characters long")
        return value
    
    def validate_content(self, value):
        if len(value) < 100:
            raise serializers.ValidationError("Content must be at least 100 characters long")
        return value
    
    def validate_excerpt(self, value):
        if len(value) < 50:
            raise serializers.ValidationError("Excerpt must be at least 50 characters long")
        return value


class BlogPostUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating blog posts"""
    
    class Meta:
        model = BlogPost
        fields = [
            'title', 'content', 'excerpt', 'category', 'tags',
            'cover_image', 'meta_description', 'status'
        ]
        
    def validate_status(self, value):
        # Only allow certain status transitions
        allowed_statuses = ['draft', 'pending']
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Can only update status to: {', '.join(allowed_statuses)}"
            )
        return value


class BlogApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting blogs"""
    action = serializers.ChoiceField(choices=['approve', 'reject'], required=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        if attrs.get('action') == 'reject' and not attrs.get('rejection_reason'):
            raise serializers.ValidationError({
                'rejection_reason': 'Rejection reason is required when rejecting a blog'
            })
        return attrs


class BlogCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    
    class Meta:
        model = BlogComment
        fields = ['content']
    
    def validate_content(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Comment must be at least 3 characters long")
        if len(value) > 1000:
            raise serializers.ValidationError("Comment cannot exceed 1000 characters")
        return value


class BlogStatsSerializer(serializers.Serializer):
    """Serializer for blog statistics"""
    total_posts = serializers.IntegerField()
    published_posts = serializers.IntegerField()
    pending_posts = serializers.IntegerField()
    draft_posts = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_likes = serializers.IntegerField()
    total_comments = serializers.IntegerField()