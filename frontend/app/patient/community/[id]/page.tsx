"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { communityAPI, CommunityPost, PostComment } from "@/lib/api";
import CommentSection from "@/components/patient/community/CommentSection";
import ReportModal from "@/components/patient/community/ReportModal";
import { ArrowLeft, Heart, MessageCircle, Eye, Flag, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = parseInt(params.id as string);

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await communityAPI.getPost(postId);
      setPost(postData);
    } catch (error: any) {
      console.error("Error loading post:", error);
      toast.error("Failed to load post");
      router.push("/patient/community");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      const result = await communityAPI.togglePostLike(post.id);
      setPost({
        ...post,
        is_liked_by_user: result.liked,
        like_count: result.like_count,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to like post");
    }
  };

  const handleDelete = async () => {
    if (!post || !window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeleting(true);
      await communityAPI.deletePost(post.id);
      toast.success("Post deleted successfully");
      router.push("/patient/community");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const handleReport = async (reason: string, details: string) => {
    if (!post) return;

    try {
      await communityAPI.reportPost(post.id, { reason: reason as any, details });
      toast.success("Post reported successfully. Our team will review it.");
      setShowReportModal(false);
    } catch (error: any) {
      console.error("Error reporting post:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to report post");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Community</span>
        </button>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Category Badge */}
          <div className="px-6 pt-6">
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: post.category.color + "20",
                color: post.category.color,
              }}
            >
              {post.category.name}
            </span>
          </div>

          {/* Title */}
          <div className="px-6 pt-4">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
          </div>

          {/* Author & Meta */}
          <div className="px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center space-x-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {post.author.display_name}
                  </span>
                  {post.author.is_therapist && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                      Professional
                    </span>
                  )}
                  {post.is_anonymous && (
                    <span className="text-sm text-gray-500 italic">
                      (Posted Anonymously)
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {post.can_edit && (
                <button
                  onClick={() => router.push(`/patient/community/${post.id}/edit`)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Edit post"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              {post.can_delete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete post"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Report post"
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.is_liked_by_user
                      ? "text-red-500"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className="w-6 h-6"
                    fill={post.is_liked_by_user ? "currentColor" : "none"}
                  />
                  <span className="font-medium">{post.like_count}</span>
                </button>

                {/* Comment Count */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">{post.comment_count}</span>
                </div>

                {/* View Count */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-6 h-6" />
                  <span className="font-medium">{post.view_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <CommentSection postId={post.id} initialComments={post.comments || []} />
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          type="post"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </div>
  );
}