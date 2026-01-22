"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkPlus,
  Share2,
  Loader2,
  Eye,
  Heart,
  Calendar,
  User,
} from "lucide-react";
import { blogAPI } from "@/lib/api";
import ArticleCard from "@/components/patient/articles/ArticleCard";

export default function ArticleDetailPage() {
  const { id } = useParams(); // This is the slug
  const [article, setArticle] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Like States ---
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const fetchArticleData = async () => {
    setLoading(true);
    try {
      const data = await blogAPI.getBlogBySlug(id as string);
      setArticle(data);
      setIsLiked(data.is_liked_by_user || false);
      setLikesCount(data.likes_count || 0);

      const related = await blogAPI.getBlogs({
        category: data.category,
        page_size: 4,
      });

      setRelatedPosts(
        (related.results || []).filter((p: any) => p.slug !== id).slice(0, 3),
      );
    } catch (error) {
      console.error("Error loading article details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (isLiking || !id) return;
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? prev - 1 : prev + 1));
    setIsLiking(true);

    try {
      await blogAPI.toggleLike(id as string);
    } catch (error) {
      console.error("Failed to like article:", error);
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    if (id) fetchArticleData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-20">
        <p className="text-gray-500">Article not found.</p>
        <Link
          href="/patient/articles"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Return to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section - Matched to Therapist Page Alignment */}
      <div className="mb-8">
        <Link
          href="/patient/articles"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Articles
        </Link>
        <h1 className="text-3xl font-bold mb-2">Read Article</h1>
        <p className="text-gray-600">
          Explore mental health insights and guides
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {article.cover_image && (
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-[400px] object-cover"
              />
            )}

            <div className="p-6 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {article.category}
                </span>
                <div className="flex items-center gap-4 text-gray-400 text-sm border-l pl-4 border-gray-200">
                  <span className="flex items-center gap-1.5">
                    <Eye size={16} /> {article.views_count}
                  </span>
                  <button
                    onClick={handleToggleLike}
                    disabled={isLiking}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isLiked
                        ? "text-red-500 font-medium"
                        : "hover:text-red-400"
                    }`}
                  >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                    {likesCount}
                  </button>
                </div>
              </div>

              <h2 className="text-4xl font-bold mb-8 text-slate-900 leading-tight">
                {article.title}
              </h2>

              {/* Author Info Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl mb-8 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
                    {article.author?.full_name?.charAt(0) || <User size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">
                      {article.author?.full_name || "Medical Professional"}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                      <span>• {article.reading_time} min read</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleToggleLike}
                    disabled={isLiking}
                    className={`p-2.5 rounded-lg border transition-all shadow-sm ${
                      isLiked
                        ? "bg-red-50 border-red-200 text-red-500 shadow-red-100"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                  <button className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-lg border border-gray-200 transition-all shadow-sm">
                    <Share2 size={20} />
                  </button>
                  <button className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-lg border border-gray-200 transition-all shadow-sm">
                    <BookmarkPlus size={20} />
                  </button>
                </div>
              </div>

              {/* Article Content */}
              <div
                className="prose prose-blue max-w-none text-slate-700 leading-relaxed text-lg 
                prose-headings:text-slate-900 prose-strong:text-slate-900 prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </article>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Related Articles
            </h3>

            <div className="space-y-6">
              {relatedPosts.length > 0 ? (
                relatedPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    id={post.slug}
                    title={post.title}
                    category={post.category}
                    excerpt={post.excerpt}
                    readTime={`${post.reading_time} min`}
                    image={post.cover_image}
                    compact={true}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No related articles in this category.
                </p>
              )}
            </div>

            <Link
              href="/patient/articles"
              className="w-full mt-8 py-3 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all block text-sm font-medium"
            >
              View Full Library
            </Link>
          </div>

          {/* Quick Action Card - Aligned with Therapists' Page visual style */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
            <h4 className="font-bold text-xl mb-2">Need Professional Help?</h4>
            <p className="text-blue-100 text-sm mb-6">
              Our licensed therapists are available for one-on-one sessions to
              discuss these topics further.
            </p>
            <Link
              href="/patient/therapists"
              className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors block text-center"
            >
              Book a Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
