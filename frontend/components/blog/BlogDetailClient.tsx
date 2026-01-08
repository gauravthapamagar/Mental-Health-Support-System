"use client";

import { useState } from "react";
import {
  Calendar,
  User,
  CheckCircle,
  Clock,
  Share2,
  Bookmark,
  ArrowLeft,
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
      // If not authenticated, redirect to login
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
      // Refresh page to show new comment
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
      {/* Back Button */}
      {/* <div className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </button>
        </div>
      </div> */}

      {/* Hero Image */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-6 pb-12">
            <span className="inline-block px-4 py-2 bg-white text-blue-600 rounded-full text-sm font-bold mb-4">
              {blog.category}
            </span>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <span className="font-medium">{blog.author.full_name}</span>
                {blog.author.is_verified && (
                  <CheckCircle className="w-4 h-4 text-blue-400" />
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

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex gap-12">
          {/* Main Content */}
          <div className="flex-1">
            {/* Engagement Bar */}
            <div className="flex items-center gap-6 pb-6 mb-8 border-b border-slate-200">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isLiked
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-semibold">{likesCount}</span>
              </button>
              <div className="flex items-center gap-2 text-slate-600">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">
                  {blog.comments_count || 0} Comments
                </span>
              </div>
            </div>

            {/* Blog Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content || "" }}
              style={{ lineHeight: "1.8" }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <div className="mt-12 p-8 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {blog.author.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    About {blog.author.full_name}
                    {blog.author.is_verified && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {blog.author.is_verified ? "Verified" : ""} Mental Health
                    Professional
                  </p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Comments ({blog.comments_count || 0})
              </h3>

              {/* Add Comment Form */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <h4 className="font-semibold text-slate-900 mb-4">
                  Leave a comment
                </h4>
                <div onSubmit={handleSubmitComment}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={4}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!comment.trim() || isSubmittingComment}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {blog.comments && blog.comments.length > 0 ? (
                <div className="space-y-6">
                  {blog.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.author.full_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-slate-900">
                            {comment.author.full_name}
                          </span>
                          {comment.author.is_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-sm text-slate-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  Share this article
                </h3>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="px-4 py-2 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                    <Bookmark className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gradient-to-b from-white to-slate-50 py-16 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((post) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-white text-blue-600 rounded-full text-xs font-bold">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
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
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
        }
        .prose p {
          color: #475569;
          margin-bottom: 1.5rem;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .prose li {
          color: #475569;
          margin-bottom: 0.75rem;
        }
        .prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #1e293b;
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
}
