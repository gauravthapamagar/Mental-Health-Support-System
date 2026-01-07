from django.urls import path
from . import views

urlpatterns = [
    # Public endpoints (anyone can access)
    path('', views.BlogPostListView.as_view(), name='blog-list'),
    path('<slug:slug>/', views.BlogPostDetailView.as_view(), name='blog-detail'),
    path('categories/list/', views.blog_categories, name='blog-categories'),
    
    # Therapist endpoints (authenticated therapists)
    path('create/', views.create_blog_post, name='create-blog'),
    path('my-posts/', views.my_blog_posts, name='my-blog-posts'),
    path('update/<slug:slug>/', views.update_blog_post, name='update-blog'),
    path('delete/<slug:slug>/', views.delete_blog_post, name='delete-blog'),
    path('stats/me/', views.my_blog_stats, name='my-blog-stats'),
    
    # Approval endpoints (verified therapists & admins)
    path('pending/list/', views.pending_blog_posts, name='pending-blogs'),
    path('approve/<int:blog_id>/', views.approve_reject_blog, name='approve-reject-blog'),
    
    # Engagement endpoints (authenticated users)
    path('like/<slug:slug>/', views.toggle_like_blog, name='toggle-like'),
    path('comment/<slug:slug>/', views.add_comment, name='add-comment'),
]