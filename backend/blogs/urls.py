# blog/urls.py - KEEP AS IS (looks correct)
from django.urls import path
from . import views

urlpatterns = [
    # Public endpoints
    path('', views.BlogPostListView.as_view(), name='blog-list'),  # /api/blog/
    path('<slug:slug>/', views.BlogPostDetailView.as_view(), name='blog-detail'),  # /api/blog/slug/
    path('categories/list/', views.blog_categories, name='blog-categories'),  # /api/blog/categories/list/
    
    # Therapist endpoints
    path('create/', views.create_blog_post, name='create-blog'),
    path('my-posts/', views.my_blog_posts, name='my-blog-posts'),
    path('update/<slug:slug>/', views.update_blog_post, name='update-blog'),
    path('delete/<slug:slug>/', views.delete_blog_post, name='delete-blog'),
    path('stats/me/', views.my_blog_stats, name='my-blog-stats'),
    
    # Approval endpoints
    path('pending/list/', views.pending_blog_posts, name='pending-blogs'),
    path('approve/<int:blog_id>/', views.approve_reject_blog, name='approve-reject-blog'),
    
    # Engagement endpoints
    path('like/<slug:slug>/', views.toggle_like_blog, name='toggle-like'),
    path('comment/<slug:slug>/', views.add_comment, name='add-comment'),
]