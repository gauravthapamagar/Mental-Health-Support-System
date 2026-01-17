from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from .recommender import BlogRecommender
from .models import BlogPost, BlogLike, BlogComment, BlogView
from .serializers import (
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogPostCreateSerializer,
    BlogPostUpdateSerializer,
    BlogApprovalSerializer,
    BlogCommentSerializer,
    BlogCommentCreateSerializer,
    BlogStatsSerializer,
    BlogRecommendationSerializer,
)
from .permissions import (
    IsTherapistOrReadOnly,
    IsBlogAuthorOrReadOnly,
    CanApproveBlogs
)


class BlogPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class BlogPostListView(generics.ListAPIView):
    """
    Public endpoint - List all published blog posts
    Anyone can view (including non-authenticated users)
    """
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = BlogPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'content', 'tags']
    ordering_fields = ['published_at', 'created_at', 'views_count', 'likes_count']
    ordering = ['-published_at']
    
    def get_queryset(self):
        queryset = BlogPost.objects.filter(status='published')
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by tags
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = tags.split(',')
            for tag in tag_list:
                queryset = queryset.filter(tags__contains=[tag.strip()])
        
        # Filter by author
        author_id = self.request.query_params.get('author', None)
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        
        return queryset.select_related('author')


class BlogPostDetailView(generics.RetrieveAPIView):
    """
    Public endpoint - Get blog post details by slug
    Anyone can view (including non-authenticated users)
    """
    serializer_class = BlogPostDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return BlogPost.objects.filter(status='published').select_related('author')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        
        # Track view record
        ip_address = self.get_client_ip(request)
        BlogView.objects.create(
            blog_post=instance,
            user=request.user if request.user.is_authenticated else None,
            ip_address=ip_address
        )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_blog_post(request):
    """
    Create a new blog post
    - Verified therapists: Auto-published (published_at set to NOW)
    - Unverified therapists: Pending approval (published_at remains NULL)
    """
    if request.user.role != 'therapist':
        return Response({
            'error': 'Only therapists can create blog posts'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = BlogPostCreateSerializer(data=request.data)
    if serializer.is_valid():
        # Check if therapist is verified
        is_verified = False
        if hasattr(request.user, 'therapist_profile'):
            is_verified = request.user.therapist_profile.is_verified
        
        # Determine status and publication date
        if is_verified:
            initial_status = 'published'
            pub_date = timezone.now() # THIS ensures it shows up in your list
        else:
            initial_status = 'pending'
            pub_date = None
        
        # Save the blog post with the extra calculated fields
        blog_post = serializer.save(
            author=request.user,
            status=initial_status,
            published_at=pub_date
        )
        
        response_message = (
            'Blog post published successfully!' if is_verified 
            else 'Blog post submitted for approval. It will be reviewed by verified therapists or admins.'
        )
        
        return Response({
            'message': response_message,
            'blog': BlogPostDetailSerializer(blog_post).data,
            'is_verified': is_verified
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_blog_posts(request):
    """Get all blog posts by the authenticated therapist"""
    if request.user.role != 'therapist':
        return Response({
            'error': 'Only therapists can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    blog_posts = BlogPost.objects.filter(author=request.user).order_by('-created_at')
    
    # Apply status filter if provided
    status_filter = request.query_params.get('status', None)
    if status_filter:
        blog_posts = blog_posts.filter(status=status_filter)
    
    paginator = BlogPagination()
    paginated_posts = paginator.paginate_queryset(blog_posts, request)
    serializer = BlogPostListSerializer(paginated_posts, many=True, context={'request': request})
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_blog_post(request, slug):
    """Update a blog post (only by author)"""
    try:
        blog_post = BlogPost.objects.get(slug=slug, author=request.user)
    except BlogPost.DoesNotExist:
        return Response({
            'error': 'Blog post not found or you do not have permission to edit it'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Can't edit published posts that are approved
    if blog_post.status == 'published' and blog_post.approved_by:
        return Response({
            'error': 'Cannot edit approved published posts. Create a new version instead.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = BlogPostUpdateSerializer(blog_post, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Blog post updated successfully',
            'blog': BlogPostDetailSerializer(blog_post).data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_blog_post(request, slug):
    """Delete a blog post (only by author)"""
    try:
        blog_post = BlogPost.objects.get(slug=slug, author=request.user)
    except BlogPost.DoesNotExist:
        return Response({
            'error': 'Blog post not found or you do not have permission to delete it'
        }, status=status.HTTP_404_NOT_FOUND)
    
    blog_post.delete()
    return Response({
        'message': 'Blog post deleted successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([CanApproveBlogs])
def pending_blog_posts(request):
    """Get all pending blog posts for approval (verified therapists and admins only)"""
    pending_posts = BlogPost.objects.filter(
        status='pending'
    ).select_related('author').order_by('-created_at')
    
    paginator = BlogPagination()
    paginated_posts = paginator.paginate_queryset(pending_posts, request)
    serializer = BlogPostDetailSerializer(paginated_posts, many=True, context={'request': request})
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([CanApproveBlogs])
def approve_reject_blog(request, blog_id):
    """Approve or reject a pending blog post"""
    try:
        blog_post = BlogPost.objects.get(id=blog_id, status='pending')
    except BlogPost.DoesNotExist:
        return Response({
            'error': 'Blog post not found or not in pending status'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = BlogApprovalSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    action = serializer.validated_data['action']
    
    if action == 'approve':
        blog_post.status = 'published'
        blog_post.approved_by = request.user
        blog_post.approved_at = timezone.now()
        blog_post.published_at = timezone.now()
        blog_post.rejection_reason = None
        message = 'Blog post approved and published successfully'
    else:  # reject
        blog_post.status = 'rejected'
        blog_post.rejection_reason = serializer.validated_data.get('rejection_reason', '')
        message = 'Blog post rejected'
    
    blog_post.save()
    
    return Response({
        'message': message,
        'blog': BlogPostDetailSerializer(blog_post).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like_blog(request, slug):
    """Like or unlike a blog post"""
    blog_post = get_object_or_404(BlogPost, slug=slug, status='published')
    
    like, created = BlogLike.objects.get_or_create(
        blog_post=blog_post,
        user=request.user
    )
    
    if created:
        # Liked
        blog_post.likes_count += 1
        blog_post.save(update_fields=['likes_count'])
        return Response({
            'message': 'Blog post liked',
            'is_liked': True,
            'likes_count': blog_post.likes_count
        }, status=status.HTTP_200_OK)
    else:
        # Unlike
        like.delete()
        blog_post.likes_count = max(0, blog_post.likes_count - 1)
        blog_post.save(update_fields=['likes_count'])
        return Response({
            'message': 'Blog post unliked',
            'is_liked': False,
            'likes_count': blog_post.likes_count
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, slug):
    """Add a comment to a blog post"""
    blog_post = get_object_or_404(BlogPost, slug=slug, status='published')
    
    serializer = BlogCommentCreateSerializer(data=request.data)
    if serializer.is_valid():
        comment = serializer.save(
            blog_post=blog_post,
            author=request.user
        )
        
        return Response({
            'message': 'Comment added successfully',
            'comment': BlogCommentSerializer(comment).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_blog_stats(request):
    """Get statistics for therapist's blogs"""
    if request.user.role != 'therapist':
        return Response({
            'error': 'Only therapists can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    posts = BlogPost.objects.filter(author=request.user)
    
    stats = {
        'total_posts': posts.count(),
        'published_posts': posts.filter(status='published').count(),
        'pending_posts': posts.filter(status='pending').count(),
        'draft_posts': posts.filter(status='draft').count(),
        'total_views': sum(posts.values_list('views_count', flat=True)),
        'total_likes': sum(posts.values_list('likes_count', flat=True)),
        'total_comments': BlogComment.objects.filter(
            blog_post__author=request.user
        ).count()
    }
    
    serializer = BlogStatsSerializer(stats)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def blog_categories(request):
    """Get all available blog categories"""
    categories = [
        {'value': choice[0], 'label': choice[1]} 
        for choice in BlogPost.CATEGORY_CHOICES
    ]
    return Response({'categories': categories}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    recommender = BlogRecommender()
    user = request.user
    
    # Check if user has any likes
    has_history = BlogLike.objects.filter(user=user).exists()
    
    if has_history:
        # Personalized logic
        blogs = recommender.get_content_based_recommendations(user)
        data = [
            {"blog": blog, "reason": f"Similar to posts you liked in {blog.category}", "type": "personalized"} 
            for blog in blogs
        ]
    else:
        # NEW USER / COLD START logic: Use Survey or Popularity
        # Try to get survey category first
        from surveys.models import Response # adjust based on your actual survey model name
        latest_survey = Response.objects.filter(user=user).last()
        
        if latest_survey:
            # Recommend based on survey result
            topic = latest_survey.primary_concern 
            blogs = BlogPost.objects.filter(category=topic, status='published')[:5]
            data = [{"blog": b, "reason": f"Based on your survey result: {topic}", "type": "survey"} for b in blogs]
        else:
            # Total Cold Start: Popular blogs
            blogs = BlogPost.objects.filter(status='published').order_of('-views_count')[:5]
            data = [{"blog": b, "reason": "Trending on the platform", "type": "trending"} for b in blogs]

    # Serialize the data
    serializer = BlogRecommendationSerializer(data, many=True, context={'request': request})
    return Response(serializer.data)
