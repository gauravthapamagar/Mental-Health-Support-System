import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import BlogPost, BlogLike, BlogView
from django.db.models import Count

class BlogRecommender:
    
    def get_content_based_recommendations(self, user, limit=5):
        interacted_blog_ids = BlogLike.objects.filter(user=user).values_list('blog_post_id', flat=True)

        if not interacted_blog_ids.exists():
            return BlogPost.objects.filter(status='published').order_by('-views_count')[:limit]

        all_blogs = list(BlogPost.objects.filter(status='published'))

        rows = []
        for blog in all_blogs:
            tags_text = " ".join(blog.tags) if blog.tags else ""
            combined_text = f"{blog.title} {blog.excerpt} {blog.category} {tags_text}"
            rows.append({
                "id": blog.id,
                "features": combined_text.lower()
            })

        df = pd.DataFrame(rows)

        tfidf = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2)  # improves meaning
        )
    
        tfidf_matrix = tfidf.fit_transform(df["features"])

        cosine_sim = cosine_similarity(tfidf_matrix)

        liked_indices = df[df["id"].isin(interacted_blog_ids)].index

        if liked_indices.empty:
            return BlogPost.objects.filter(status='published')[:limit]

        sim_scores = cosine_sim[liked_indices].mean(axis=0)

        df["score"] = sim_scores

        recommended_ids = (
            df[~df["id"].isin(interacted_blog_ids)]
            .sort_values(by="score", ascending=False)
            ["id"]
            .tolist()
        )

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
            shared_count=Count('likes')
        ).order_by('-shared_count')[:limit]
        
        return recommended_blogs