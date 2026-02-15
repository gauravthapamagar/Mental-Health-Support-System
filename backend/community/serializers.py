from rest_framework import serializers
from .models import (
    CommunityCategory,
    CommunityPost,
    PostLike,
    PostComment,
    CommentLike,
    PostReport,
    CommentReport
)
from accounts.serializers import UserSerializer
from django.utils import timezone


class CommunityCategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CommunityCategory
        fields = [
            'id', 'name', 'slug', 'description', 
            'icon', 'color', 'is_active', 'post_count'
        ]
    
    def get_post_count(self, obj):
        return obj.posts.filter(status='approved', is_deleted=False).count()


class PostAuthorSerializer(serializers.ModelSerializer):
    """Serializer for post author with anonymity support"""
    display_name = serializers.SerializerMethodField()
    is_therapist = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSerializer.Meta.model
        fields = ['id', 'display_name', 'is_therapist']
    
    def get_display_name(self, obj):
        post = self.context.get('post')
        if post and post.is_anonymous:
            return "Anonymous"
        return obj.full_name
    
    def get_is_therapist(self, obj):
        return obj.role == 'therapist'


class CommentAuthorSerializer(serializers.ModelSerializer):
    """Serializer for comment author with anonymity and role badge"""
    display_name = serializers.SerializerMethodField()
    role = serializers.CharField()
    role_badge = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSerializer.Meta.model
        fields = ['id', 'display_name', 'role', 'role_badge']
    
    def get_display_name(self, obj):
        comment = self.context.get('comment')
        if comment and comment.is_anonymous and obj.role == 'patient':
            return "Anonymous"
        elif obj.role == 'therapist':
            profession = getattr(obj.therapist_profile, 'profession_type', 'Therapist')
            return f"Dr. {obj.full_name}"
        return obj.full_name
    
    def get_role_badge(self, obj):
        if obj.role == 'therapist':
            return {
                'text': 'Professional',
                'color': 'blue',
                'verified': getattr(obj.therapist_profile, 'is_verified', False)
            }
        return None


class CommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentLike
        fields = ['id', 'user', 'created_at']


class PostCommentSerializer(serializers.ModelSerializer):
    author = CommentAuthorSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = PostComment
        fields = [
            'id', 'post', 'author', 'content', 'is_anonymous',
            'parent', 'like_count', 'is_liked_by_user', 
            'replies', 'reply_count', 'created_at', 'updated_at',
            'is_deleted', 'can_delete', 'can_edit'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']
    
    def get_context_with_comment(self, obj):
        """Helper to add comment to context"""
        context = self.context.copy()
        context['comment'] = obj
        return context
    
    def to_representation(self, instance):
        # Add comment to context for author serialization
        self.context['comment'] = instance
        return super().to_representation(instance)
    
    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = obj.replies.filter(is_deleted=False, is_approved=True)[:3]
            return PostCommentSerializer(
                replies, 
                many=True, 
                context=self.context
            ).data
        return []
    
    def get_reply_count(self, obj):
        if obj.parent is None:
            return obj.replies.filter(is_deleted=False, is_approved=True).count()
        return 0
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author == request.user or request.user.role == 'therapist'
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author == request.user


class CommunityPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for post list view"""
    author = PostAuthorSerializer(read_only=True)
    category = CommunityCategorySerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = CommunityPost
        fields = [
            'id', 'title', 'excerpt', 'author', 'category',
            'is_anonymous', 'like_count', 'comment_count',
            'is_liked_by_user', 'view_count', 'created_at',
            'time_ago', 'status'
        ]
    
    def to_representation(self, instance):
        self.context['post'] = instance
        return super().to_representation(instance)
    
    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_excerpt(self, obj):
        """Return first 150 characters of content"""
        if len(obj.content) > 150:
            return obj.content[:150] + '...'
        return obj.content
    
    def get_time_ago(self, obj):
        """Human-readable time difference"""
        from django.utils.timesince import timesince
        return timesince(obj.created_at) + ' ago'


class CommunityPostDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single post view"""
    author = PostAuthorSerializer(read_only=True)
    category = CommunityCategorySerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    moderated_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CommunityPost
        fields = [
            'id', 'title', 'content', 'author', 'category',
            'is_anonymous', 'status', 'like_count', 'comment_count',
            'is_liked_by_user', 'comments', 'view_count',
            'created_at', 'updated_at', 'can_delete', 'can_edit',
            'moderated_by_name', 'moderated_at'
        ]
    
    def to_representation(self, instance):
        self.context['post'] = instance
        return super().to_representation(instance)
    
    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_comments(self, obj):
        # Get only top-level comments (no parent)
        comments = obj.comments.filter(
            parent__isnull=True,
            is_deleted=False,
            is_approved=True
        ).order_by('-created_at')
        return PostCommentSerializer(
            comments, 
            many=True, 
            context=self.context
        ).data
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author == request.user or request.user.role in ['therapist', 'admin']
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author == request.user
    
    def get_moderated_by_name(self, obj):
        if obj.moderated_by:
            return obj.moderated_by.full_name
        return None


class CommunityPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating posts"""
    
    class Meta:
        model = CommunityPost
        fields = [
            'title', 'content', 'category', 'is_anonymous'
        ]
    
    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters long."
            )
        return value.strip()
    
    def validate_content(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError(
                "Content must be at least 20 characters long."
            )
        return value.strip()
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['author'] = request.user
        
        # Set to 'pending' so therapists can moderate before approval
        validated_data['status'] = 'pending'
        
        return super().create(validated_data)


class CommunityPostUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating posts"""
    
    class Meta:
        model = CommunityPost
        fields = ['title', 'content', 'category', 'is_anonymous']
    
    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters long."
            )
        return value.strip()
    
    def validate_content(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError(
                "Content must be at least 20 characters long."
            )
        return value.strip()


class PostCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    
    class Meta:
        model = PostComment
        fields = ['content', 'is_anonymous', 'parent']
    
    def validate_content(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Comment must be at least 5 characters long."
            )
        return value.strip()
    
    def validate_parent(self, value):
        """Ensure parent comment belongs to the same post"""
        if value:
            post_id = self.context.get('post_id')
            if value.post_id != post_id:
                raise serializers.ValidationError(
                    "Parent comment does not belong to this post."
                )
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        post_id = self.context.get('post_id')
        
        validated_data['author'] = request.user
        validated_data['post_id'] = post_id
        validated_data['is_approved'] = True  # Auto-approve, change if needed
        
        return super().create(validated_data)


class PostReportSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.SerializerMethodField()
    post_title = serializers.SerializerMethodField()
    
    class Meta:
        model = PostReport
        fields = [
            'id', 'post', 'post_title', 'reported_by', 
            'reported_by_name', 'reason', 'details',
            'is_resolved', 'created_at'
        ]
        read_only_fields = ['reported_by', 'created_at']
    
    def get_reported_by_name(self, obj):
        return obj.reported_by.full_name
    
    def get_post_title(self, obj):
        return obj.post.title
    
    def validate(self, data):
        request = self.context.get('request')
        post = data.get('post')
        
        # Check if user already reported this post
        if PostReport.objects.filter(post=post, reported_by=request.user).exists():
            raise serializers.ValidationError(
                "You have already reported this post."
            )
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['reported_by'] = request.user
        
        # Increment flag count on post
        post = validated_data['post']
        post.flag_count += 1
        
        # Auto-flag if multiple reports
        if post.flag_count >= 3:
            post.status = 'flagged'
        
        post.save()
        
        return super().create(validated_data)


class CommentReportSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CommentReport
        fields = [
            'id', 'comment', 'reported_by', 'reported_by_name',
            'reason', 'details', 'is_resolved', 'created_at'
        ]
        read_only_fields = ['reported_by', 'created_at']
    
    def get_reported_by_name(self, obj):
        return obj.reported_by.full_name
    
    def validate(self, data):
        request = self.context.get('request')
        comment = data.get('comment')
        
        # Check if user already reported this comment
        if CommentReport.objects.filter(comment=comment, reported_by=request.user).exists():
            raise serializers.ValidationError(
                "You have already reported this comment."
            )
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['reported_by'] = request.user
        
        # Increment flag count on comment
        comment = validated_data['comment']
        comment.flag_count += 1
        
        # Auto-flag if multiple reports
        if comment.flag_count >= 3:
            comment.is_flagged = True
            comment.is_approved = False
        
        comment.save()
        
        return super().create(validated_data)


# Moderation Serializers (for therapists/admins)
class ModerationPostSerializer(serializers.ModelSerializer):
    """Serializer for therapist moderation dashboard"""
    author = UserSerializer(read_only=True)
    category = CommunityCategorySerializer(read_only=True)
    report_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CommunityPost
        fields = [
            'id', 'title', 'content', 'author', 'category',
            'status', 'flag_count', 'report_count',
            'created_at', 'moderated_by', 'moderated_at'
        ]
    
    def get_report_count(self, obj):
        return obj.reports.filter(is_resolved=False).count()


class PostModerationActionSerializer(serializers.Serializer):
    """Serializer for moderation actions"""
    action = serializers.ChoiceField(
        choices=['approve', 'flag', 'reject']
    )
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_action(self, value):
        if value not in ['approve', 'flag', 'reject']:
            raise serializers.ValidationError("Invalid moderation action.")
        return value