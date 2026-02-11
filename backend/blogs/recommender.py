import pandas as pd
from django.db.models import Count, Case, When
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .models import BlogPost, BlogLike, BlogView


class BlogRecommender:

    def get_content_based_recommendations(self, user, limit=5):
        # ----------------------------
        # 1. Collect user interactions
        # ----------------------------
        liked_ids = set(
            BlogLike.objects.filter(user=user)
            .values_list("blog_post_id", flat=True)
        )

        viewed_ids = set(
            BlogView.objects.filter(user=user)
            .values_list("blog_post_id", flat=True)
        )

        interacted_blog_ids = liked_ids | viewed_ids

        # ----------------------------
        # 2. Cold start → popular blogs
        # ----------------------------
        if not interacted_blog_ids:
            return BlogPost.objects.filter(
                status="published"
            ).order_by("-views_count", "-likes_count")[:limit]

        blogs = list(
            BlogPost.objects.filter(status="published")
        )

        # ----------------------------
        # 3. Build TF-IDF dataset
        # ----------------------------
        rows = []
        for blog in blogs:
            tags_text = " ".join(
                str(tag) for tag in blog.tags if isinstance(tag, str)
            )

            combined_text = f"""
            {blog.title}
            {blog.excerpt}
            {blog.category}
            {tags_text}
            """.lower()

            rows.append({
                "id": blog.id,
                "features": combined_text,
                "category": blog.category
            })

        df = pd.DataFrame(rows)

        tfidf = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=5000
        )

        tfidf_matrix = tfidf.fit_transform(df["features"])
        cosine_sim = cosine_similarity(tfidf_matrix)

        interacted_indices = df[df["id"].isin(interacted_blog_ids)].index
        if interacted_indices.empty:
            return BlogPost.objects.filter(status="published")[:limit]

        # ----------------------------
        # 4. Similarity calculation
        # ----------------------------
        sim_scores = cosine_sim[interacted_indices].mean(axis=0)
        df["score"] = sim_scores

        # ----------------------------
        # 5. Category boosting
        # ----------------------------
        preferred_categories = set(
            BlogPost.objects.filter(id__in=interacted_blog_ids)
            .values_list("category", flat=True)
        )

        df["score"] = df.apply(
            lambda row: row["score"] * 1.4
            if row["category"] in preferred_categories
            else row["score"],
            axis=1
        )

        # ----------------------------
        # 6. Similarity threshold (CRITICAL FIX)
        # ----------------------------
        SIMILARITY_THRESHOLD = 0.15

        recommended_ids = (
            df[
                (~df["id"].isin(interacted_blog_ids)) &
                (df["score"] >= SIMILARITY_THRESHOLD)
            ]
            .sort_values(by="score", ascending=False)["id"]
            .tolist()
        )

        # ----------------------------
        # 7. Fallback → same category only
        # ----------------------------
        if not recommended_ids:
            return BlogPost.objects.filter(
                status="published",
                category__in=preferred_categories
            ).exclude(
                id__in=interacted_blog_ids
            ).order_by("-views_count", "-likes_count")[:limit]

        # ----------------------------
        # 8. Preserve ranking order
        # ----------------------------
        top_ids = recommended_ids[:limit]
        preserved_order = Case(
            *[When(id=pk, then=pos) for pos, pk in enumerate(top_ids)]
        )

        return BlogPost.objects.filter(
            id__in=top_ids
        ).order_by(preserved_order)

    # --------------------------------------------------

    def get_collaborative_recommendations(self, user, limit=5):
        liked_blogs = BlogLike.objects.filter(
            user=user
        ).values_list("blog_post_id", flat=True)

        if not liked_blogs.exists():
            return BlogPost.objects.none()

        similar_users = BlogLike.objects.filter(
            blog_post_id__in=liked_blogs
        ).exclude(
            user=user
        ).values_list("user_id", flat=True)

        recommended_blogs = BlogPost.objects.filter(
            likes__user_id__in=similar_users,
            status="published"
        ).exclude(
            id__in=liked_blogs
        ).annotate(
            shared_count=Count("likes")
        ).order_by(
            "-shared_count",
            "-views_count"
        )[:limit]

        return recommended_blogs
