# blogs/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # 1. Static/Fixed paths MUST come first
    path('categories/list/', views.blog_categories, name='blog-categories'),
    path('create/', views.create_blog_post, name='create-blog'),
    path('my-posts/', views.my_blog_posts, name='my-blog-posts'),
    path('stats/me/', views.my_blog_stats, name='my-blog-stats'),
    path('pending/list/', views.pending_blog_posts, name='pending-blogs'),
    
    # 2. Public List (empty string)
    path('', views.BlogPostListView.as_view(), name='blog-list'),
    path('recommendations/', views.get_recommendations, name='get-recommendations'),
    # 3. Dynamic/Slug paths MUST come last
    # If this is at the top, it "eats" the 'create/' request
    path('<slug:slug>/', views.BlogPostDetailView.as_view(), name='blog-detail'),
    
    # 4. Action paths with slugs
    path('like/<slug:slug>/', views.toggle_like_blog, name='toggle-like'),
    path('comment/<slug:slug>/', views.add_comment, name='add-comment'),
    path('update/<slug:slug>/', views.update_blog_post, name='update-blog'),
    path('delete/<slug:slug>/', views.delete_blog_post, name='delete-blog'),
    path('approve/<int:blog_id>/', views.approve_reject_blog, name='approve-reject-blog'),
]