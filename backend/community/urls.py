from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

# Main router for community
router = DefaultRouter()
router.register(r'categories', views.CommunityCategoryViewSet, basename='category')
router.register(r'posts', views.CommunityPostViewSet, basename='post')

# Nested router for comments under posts
posts_router = routers.NestedDefaultRouter(router, r'posts', lookup='post')
posts_router.register(r'comments', views.PostCommentViewSet, basename='post-comments')

urlpatterns = [
    # Main router URLs
    path('', include(router.urls)),
    path('', include(posts_router.urls)),
    
    # Comment operations (not nested, for direct access)
    path('comments/<int:pk>/like/', views.PostCommentViewSet.as_view({'post': 'like'}), name='comment-like'),
    path('comments/<int:pk>/report/', views.PostCommentViewSet.as_view({'post': 'report'}), name='comment-report'),
    
    # Moderation endpoints (therapist only)
    path('moderation/dashboard/', views.moderation_dashboard, name='moderation-dashboard'),
    path('moderation/posts/pending/', views.pending_posts_list, name='pending-posts'),
    path('moderation/posts/flagged/', views.flagged_posts_list, name='flagged-posts'),
    path('moderation/posts/<int:post_id>/moderate/', views.moderate_post, name='moderate-post'),
    path('moderation/reports/', views.unresolved_reports_list, name='unresolved-reports'),
    path('moderation/reports/<int:report_id>/resolve/', views.resolve_report, name='resolve-report'),
    
    # Community stats
    path('stats/', views.community_stats, name='community-stats'),
]