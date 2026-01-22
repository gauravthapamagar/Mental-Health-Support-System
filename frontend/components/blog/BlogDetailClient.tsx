"use client";

import { useState } from "react";
import {
  Calendar,
  User,
  CheckCircle,
  Clock,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import { BlogPost } from "@/lib/types/blog";
import { blogAPI } from "@/lib/api/blog";

interface Props {
  blog: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogDetailClient({ blog, relatedPosts }: Props) {
  const [isLiked, setIsLiked] = useState(blog.is_liked);
  const [likesCount, setLikesCount] = useState(blog.likes_count);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleLike = async () => {
    try {
      const result = await blogAPI.toggleLike(blog.slug);
      setIsLiked(result.is_liked);
      setLikesCount(result.likes_count);
    } catch (error) {
      console.error("Error toggling like:", error);
      if (error instanceof Error && error.message.includes("401")) {
        window.location.href = "/auth/login";
      }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setIsSubmittingComment(true);
      await blogAPI.addComment(blog.slug, comment);
      setComment("");
      window.location.reload();
    } catch (error) {
      console.error("Error adding comment:", error);
      if (error instanceof Error && error.message.includes("401")) {
        window.location.href = "/auth/login";
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative h-[400px] lg:h-[500px] w-full">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-12">
            <div className="max-w-4xl">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold mb-4">
                {blog.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Meta Info Row - Matches screenshot style */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-white/90 text-sm md:text-base border-t border-white/20 pt-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{blog.author.full_name}</span>
                  {blog.author.is_verified && (
                    <CheckCircle className="w-4 h-4 text-blue-400 fill-white" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(blog.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{blog.reading_time} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          {/* Left: Content (8 Columns) */}
          <div className="lg:col-span-8">
            {/* Quick Engagement Stats */}
            <div className="flex items-center gap-6 mb-8 text-slate-500 border-b border-slate-100 pb-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:text-red-500 transition-colors ${isLiked ? "text-red-500 bg-red-50" : ""}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-bold">{likesCount}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-bold">
                  {blog.comments_count || 0} Comments
                </span>
              </div>
            </div>

            {/* Prose Content - Fixed Single Paragraph Issue */}
            <article className="prose prose-lg max-w-none prose-slate">
              <div
                className="whitespace-pre-wrap leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: blog.content || "" }}
              />
            </article>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Form */}
            <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Discussion
              </h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What are your thoughts?"
                rows={4}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none mb-4"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!comment.trim() || isSubmittingComment}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>

            {/* Comments List */}
            <div className="mt-8 space-y-6">
              {blog.comments?.map((c) => (
                <div
                  key={c.id}
                  className="flex gap-4 p-4 rounded-xl border border-slate-100"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {c.author.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">
                        {c.author.full_name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <p className="text-slate-600">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sticky Sidebar (4 Columns) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Share Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4">
                  Share this article
                </h4>
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="px-3 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <Bookmark className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Author Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {blog.author.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {blog.author.full_name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Verified Professional
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Regular contributor focusing on{" "}
                  {blog.category?.toLowerCase() || "mental wellness"}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles Footer */}
      {relatedPosts.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Continue Reading
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((post) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all"
                >
                  <img
                    src={post.cover_image}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-6">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {post.category}
                    </span>
                    <h3 className="font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <style jsx global>{`
        .prose h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
        }
        .prose p {
          margin-bottom: 1.5rem;
          color: #334155;
          line-height: 1.8;
        }
        .prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          font-style: italic;
          color: #1e293b;
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
}
