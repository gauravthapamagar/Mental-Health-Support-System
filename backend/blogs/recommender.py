import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import BlogPost, BlogLike, BlogView
from django.db.models import Count

class BlogRecommender:
    def get_content_based_recommendations(self, user, limit=5):
        """
        Suggests blogs based on the categories and tags of 
        blogs the user has already liked or viewed.
        """
        # 1. Get blogs the user has interacted with
        interacted_blog_ids = BlogLike.objects.filter(user=user).values_list('blog_post_id', flat=True)
        if not interacted_blog_ids.exists():
            # Fallback to popular blogs if no history
            return BlogPost.objects.filter(status='published').order_by('-views_count')[:limit]

        # 2. Get all published blogs
        all_blogs = BlogPost.objects.filter(status='published')
        df = pd.DataFrame(list(all_blogs.values('id', 'title', 'category', 'tags')))
        
        # Combine features into a single string for vectorization
        df['features'] = df['category'] + " " + df['tags'].apply(lambda x: " ".join(x))
        
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(df['features'])
        
        # Calculate similarity
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        
        # Get indices of blogs the user liked
        liked_indices = df[df['id'].isin(interacted_blog_ids)].index
        
        # Sum similarity scores across all liked blogs
        sim_scores = cosine_sim[liked_indices].sum(axis=0)
        
        # Get top matches
        df['score'] = sim_scores
        recommended_ids = df[~df['id'].isin(interacted_blog_ids)].sort_values(by='score', ascending=False)['id'].tolist()
        
        return BlogPost.objects.filter(id__in=recommended_ids[:limit])

    def get_collaborative_recommendations(self, user, limit=5):
        """
        'Users who liked this also liked...' logic
        """
        liked_blogs = BlogLike.objects.filter(user=user).values_list('blog_post_id', flat=True)
        
        # Find other users who liked the same blogs
        similar_users = BlogLike.objects.filter(
            blog_post_id__in=liked_blogs
        ).exclude(user=user).values_list('user_id', flat=True)
        
        # Find blogs liked by those similar users
        recommended_blogs = BlogPost.objects.filter(
            likes__user_id__in=similar_users,
            status='published'
        ).exclude(
            id__in=liked_blogs
        ).annotate(
            shared_count=Count('id')
        ).order_by('-shared_count')[:limit]
        
        return recommended_blogs