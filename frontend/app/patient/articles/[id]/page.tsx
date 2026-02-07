"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { blogAPI } from "@/lib/api";
import { BlogPost } from "@/lib/types/blog";
import BlogDetailClient from "@/components/blog/BlogDetailClient";

export default function ArticleDetailPage() {
  const { id } = useParams(); // This is the slug
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticleData() {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch the blog post by slug
        const data = await blogAPI.getBlogBySlug(id as string);
        setArticle(data);

        // Fetch related posts from the same category
        const related = await blogAPI.getBlogs({
          category: data.category,
          page_size: 4,
        });

        setRelatedPosts(
          (related.results || [])
            .filter((p: BlogPost) => p.slug !== id)
            .slice(0, 3)
        );
      } catch (error) {
        console.error("Error loading article details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticleData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg mb-4">Article not found.</p>
        <Link
          href="/patient/articles"
          className="text-blue-600 hover:underline font-medium"
        >
          Return to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Back Button - Only for patient dashboard */}
      <div className="mb-4">
        <Link
          href="/patient/articles"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Back to Articles
        </Link>
      </div>

      {/* Reuse the same BlogDetailClient component */}
      <BlogDetailClient blog={article} relatedPosts={relatedPosts} />
    </div>
  );
}