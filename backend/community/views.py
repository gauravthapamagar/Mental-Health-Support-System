from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import (
    CommunityCategory,
    CommunityPost,
    PostLike,
    PostComment,
    CommentLike,
    PostReport,
    CommentReport
)
from .serializers import (
    CommunityCategorySerializer,
    CommunityPostListSerializer,
    CommunityPostDetailSerializer,
    CommunityPostCreateSerializer,
    CommunityPostUpdateSerializer,
    PostCommentSerializer,
    PostCommentCreateSerializer,
    PostReportSerializer,
    CommentReportSerializer,
    ModerationPostSerializer,
    PostModerationActionSerializer
)
from accounts.permissions import IsPatient, IsTherapist


class CommunityPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class CommunityCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List all active community categories.
    Endpoint: GET /api/community/categories/
    """
    queryset = CommunityCategory.objects.filter(is_active=True)
    serializer_class = CommunityCategorySerializer
    permission_classes = [AllowAny]


class CommunityPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for community posts.
    
    Endpoints:
    - GET /api/community/posts/ - List all approved posts
    - POST /api/community/posts/ - Create new post (patients only)
    - GET /api/community/posts/{id}/ - Get post detail
    - PUT/PATCH /api/community/posts/{id}/ - Update post (author only)
    - DELETE /api/community/posts/{id}/ - Delete post (author or moderator)
    - POST /api/community/posts/{id}/like/ - Toggle like
    """
    pagination_class = CommunityPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'like_count', 'comment_count', 'view_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        # Base queryset - exclude deleted posts
        queryset = CommunityPost.objects.filter(
            is_deleted=False
        ).select_related(
            'author', 'category', 'moderated_by'
        ).prefetch_related(
            'likes', 'comments'
        ).annotate(
            like_count=Count('likes', distinct=True),
            comment_count=Count('comments', filter=Q(comments__is_deleted=False), distinct=True)
        )
        
        # Patients see only approved posts
        if user.is_authenticated and user.role == 'patient':
            # Show approved posts + user's own posts (any status)
            queryset = queryset.filter(
                Q(status='approved') | Q(author=user)
            )
        # Therapists see all posts (for moderation)
        elif user.is_authenticated and user.role in ['therapist', 'admin']:
            pass  # See all posts
        # Anonymous users see only approved
        else:
            queryset = queryset.filter(status='approved')
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Filter by status (for moderation)
        post_status = self.request.query_params.get('status', None)
        if post_status and user.is_authenticated and user.role in ['therapist', 'admin']:
            queryset = queryset.filter(status=post_status)
        
        # My posts filter
        if self.request.query_params.get('my_posts') == 'true' and user.is_authenticated:
            queryset = queryset.filter(author=user)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CommunityPostCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CommunityPostUpdateSerializer
        elif self.action == 'retrieve':
            return CommunityPostDetailSerializer
        return CommunityPostListSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            # Only patients can create posts
            return [IsAuthenticated(), IsPatient()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when post is viewed"""
        instance = self.get_object()
        
        # Increment view count
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Create post with current user as author"""
        serializer.save()
    
    def update(self, request, *args, **kwargs):
        """Only allow author to update their own post"""
        instance = self.get_object()
        
        if instance.author != request.user:
            return Response(
                {'error': 'You can only edit your own posts.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete - author or moderator can delete"""
        instance = self.get_object()
        
        # Check permissions
        if instance.author != request.user and request.user.role not in ['therapist', 'admin']:
            return Response(
                {'error': 'You do not have permission to delete this post.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Soft delete
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()
        
        return Response(
            {'message': 'Post deleted successfully.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """
        Toggle like on a post.
        POST /api/community/posts/{id}/like/
        """
        post = self.get_object()
        user = request.user
        
        try:
            # Check if already liked
            like = PostLike.objects.get(post=post, user=user)
            like.delete()
            
            return Response({
                'message': 'Post unliked successfully.',
                'liked': False,
                'like_count': post.likes.count()
            }, status=status.HTTP_200_OK)
            
        except PostLike.DoesNotExist:
            # Create new like
            PostLike.objects.create(post=post, user=user)
            
            return Response({
                'message': 'Post liked successfully.',
                'liked': True,
                'like_count': post.likes.count()
            }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def report(self, request, pk=None):
        """
        Report a post as inappropriate.
        POST /api/community/posts/{id}/report/
        Body: { "reason": "spam", "details": "..." }
        """
        post = self.get_object()
        
        serializer = PostReportSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save(post=post)
            return Response({
                'message': 'Post reported successfully. Our team will review it.',
                'report': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsPatient])
    def my_posts(self, request):
        """
        Get current user's posts.
        GET /api/community/posts/my_posts/
        """
        queryset = self.get_queryset().filter(author=request.user)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def trending(self, request):
        """
        Get trending posts (most liked/commented in last 7 days).
        GET /api/community/posts/trending/
        """
        from datetime import timedelta
        
        week_ago = timezone.now() - timedelta(days=7)
        
        queryset = self.get_queryset().filter(
            created_at__gte=week_ago
        ).order_by('-like_count', '-comment_count', '-view_count')[:10]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PostCommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for post comments.
    
    Endpoints:
    - GET /api/community/posts/{post_id}/comments/ - List comments
    - POST /api/community/posts/{post_id}/comments/ - Add comment
    - PUT/PATCH /api/community/comments/{id}/ - Update comment
    - DELETE /api/community/comments/{id}/ - Delete comment
    - POST /api/community/comments/{id}/like/ - Toggle like
    """
    serializer_class = PostCommentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CommunityPagination
    
    def get_queryset(self):
        # Get post from URL
        post_id = self.kwargs.get('post_pk')
        
        if post_id:
            # Filter comments for specific post, exclude deleted
            return PostComment.objects.filter(
                post_id=post_id,
                is_deleted=False,
                is_approved=True,
                parent__isnull=True  # Only top-level comments in list
            ).select_related(
                'author', 'post'
            ).prefetch_related(
                'likes', 'replies'
            ).annotate(
                like_count=Count('likes', distinct=True)
            ).order_by('-created_at')
        
        return PostComment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PostCommentCreateSerializer
        return PostCommentSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a comment on a post"""
        post_id = self.kwargs.get('post_pk')
        
        # Verify post exists and is accessible
        try:
            post = CommunityPost.objects.get(id=post_id, is_deleted=False)
        except CommunityPost.DoesNotExist:
            return Response(
                {'error': 'Post not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request, 'post_id': post_id}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'message': 'Comment added successfully.',
                    'comment': PostCommentSerializer(
                        serializer.instance,
                        context={'request': request}
                    ).data
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Only allow author to update their comment"""
        instance = self.get_object()
        
        if instance.author != request.user:
            return Response(
                {'error': 'You can only edit your own comments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete - author or moderator can delete"""
        instance = self.get_object()
        
        # Check permissions
        if instance.author != request.user and request.user.role not in ['therapist', 'admin']:
            return Response(
                {'error': 'You do not have permission to delete this comment.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Soft delete
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()
        
        return Response(
            {'message': 'Comment deleted successfully.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None, post_pk=None):
        """
        Toggle like on a comment.
        POST /api/community/comments/{id}/like/
        """
        comment = self.get_object()
        user = request.user
        
        try:
            # Check if already liked
            like = CommentLike.objects.get(comment=comment, user=user)
            like.delete()
            
            return Response({
                'message': 'Comment unliked successfully.',
                'liked': False,
                'like_count': comment.likes.count()
            }, status=status.HTTP_200_OK)
            
        except CommentLike.DoesNotExist:
            # Create new like
            CommentLike.objects.create(comment=comment, user=user)
            
            return Response({
                'message': 'Comment liked successfully.',
                'liked': True,
                'like_count': comment.likes.count()
            }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def report(self, request, pk=None, post_pk=None):
        """
        Report a comment as inappropriate.
        POST /api/community/comments/{id}/report/
        """
        comment = self.get_object()
        
        serializer = CommentReportSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save(comment=comment)
            return Response({
                'message': 'Comment reported successfully. Our team will review it.',
                'report': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def replies(self, request, pk=None, post_pk=None):
        """
        Get all replies to a comment.
        GET /api/community/comments/{id}/replies/
        """
        comment = self.get_object()
        
        replies = comment.replies.filter(
            is_deleted=False,
            is_approved=True
        ).select_related('author').annotate(
            like_count=Count('likes')
        ).order_by('created_at')
        
        serializer = PostCommentSerializer(
            replies,
            many=True,
            context={'request': request}
        )
        
        return Response(serializer.data)


# Moderation Views (Therapist/Admin Only)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTherapist])
def moderation_dashboard(request):
    """
    Get moderation dashboard statistics.
    GET /api/community/moderation/dashboard/
    """
    pending_posts = CommunityPost.objects.filter(
        status='pending',
        is_deleted=False
    ).count()
    
    flagged_posts = CommunityPost.objects.filter(
        status='flagged',
        is_deleted=False
    ).count()
    
    unresolved_reports = PostReport.objects.filter(
        is_resolved=False
    ).count()
    
    flagged_comments = PostComment.objects.filter(
        is_flagged=True,
        is_deleted=False
    ).count()
    
    return Response({
        'pending_posts': pending_posts,
        'flagged_posts': flagged_posts,
        'unresolved_reports': unresolved_reports,
        'flagged_comments': flagged_comments,
        'total_requiring_attention': pending_posts + flagged_posts + unresolved_reports
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTherapist])
def pending_posts_list(request):
    """
    Get all pending posts for moderation.
    GET /api/community/moderation/posts/pending/
    """
    posts = CommunityPost.objects.filter(
        status='pending',
        is_deleted=False
    ).select_related('author', 'category').annotate(
        like_count=Count('likes'),
        comment_count=Count('comments')
    ).order_by('-created_at')
    
    serializer = ModerationPostSerializer(posts, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTherapist])
def flagged_posts_list(request):
    """
    Get all flagged posts.
    GET /api/community/moderation/posts/flagged/
    """
    posts = CommunityPost.objects.filter(
        status='flagged',
        is_deleted=False
    ).select_related('author', 'category').annotate(
        like_count=Count('likes'),
        comment_count=Count('comments')
    ).order_by('-flag_count', '-created_at')
    
    serializer = ModerationPostSerializer(posts, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTherapist])
def moderate_post(request, post_id):
    """
    Moderate a post (approve/flag/reject).
    POST /api/community/moderation/posts/{post_id}/moderate/
    Body: { "action": "approve|flag|reject", "notes": "..." }
    """
    try:
        post = CommunityPost.objects.get(id=post_id, is_deleted=False)
    except CommunityPost.DoesNotExist:
        return Response(
            {'error': 'Post not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = PostModerationActionSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    action = serializer.validated_data['action']
    notes = serializer.validated_data.get('notes', '')
    
    if action == 'approve':
        post.approve(request.user)
        message = 'Post approved successfully.'
    elif action == 'flag':
        post.flag_for_review(request.user, notes)
        message = 'Post flagged for review.'
    elif action == 'reject':
        post.reject(request.user, notes)
        message = 'Post rejected.'
    
    return Response({
        'message': message,
        'post': ModerationPostSerializer(post).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTherapist])
def unresolved_reports_list(request):
    """
    Get all unresolved post reports.
    GET /api/community/moderation/reports/
    """
    reports = PostReport.objects.filter(
        is_resolved=False
    ).select_related('post', 'reported_by').order_by('-created_at')
    
    serializer = PostReportSerializer(reports, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTherapist])
def resolve_report(request, report_id):
    """
    Resolve a post report.
    POST /api/community/moderation/reports/{report_id}/resolve/
    Body: { "notes": "..." }
    """
    try:
        report = PostReport.objects.get(id=report_id)
    except PostReport.DoesNotExist:
        return Response(
            {'error': 'Report not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    report.is_resolved = True
    report.resolved_by = request.user
    report.resolved_at = timezone.now()
    report.resolution_notes = request.data.get('notes', '')
    report.save()
    
    return Response({
        'message': 'Report resolved successfully.',
        'report': PostReportSerializer(report).data
    })


# Community Stats (for dashboard)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def community_stats(request):
    """
    Get community statistics for user dashboard.
    GET /api/community/stats/
    """
    user = request.user
    
    if user.role == 'patient':
        my_posts = CommunityPost.objects.filter(
            author=user,
            is_deleted=False
        ).count()
        
        my_comments = PostComment.objects.filter(
            author=user,
            is_deleted=False
        ).count()
        
        my_likes = PostLike.objects.filter(user=user).count()
        
        return Response({
            'my_posts': my_posts,
            'my_comments': my_comments,
            'my_likes': my_likes,
            'total_posts': CommunityPost.objects.filter(
                status='approved',
                is_deleted=False
            ).count()
        })
    
    elif user.role == 'therapist':
        return Response({
            'total_posts': CommunityPost.objects.filter(is_deleted=False).count(),
            'pending_moderation': CommunityPost.objects.filter(
                status='pending',
                is_deleted=False
            ).count(),
            'flagged_posts': CommunityPost.objects.filter(
                status='flagged',
                is_deleted=False
            ).count(),
            'my_moderations': CommunityPost.objects.filter(
                moderated_by=user
            ).count()
        })
    
    return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)