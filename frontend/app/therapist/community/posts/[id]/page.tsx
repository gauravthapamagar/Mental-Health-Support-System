"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { communityAPI, CommunityPost } from "@/lib/api";
import CommentSection from "@/components/patient/community/CommentSection";
import { ArrowLeft, Heart, MessageCircle, Eye, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TherapistPostViewPage() {
  const router = useRouter();
  const params = useParams();
  const postId = parseInt(params.id as string);

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);

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
      router.push("/therapist/community/moderation");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50 py-8 pt-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Moderation</span>
        </button>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Category & Status Badge */}
          <div className="px-6 pt-6 flex items-center justify-between">
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: post.category.color + "20",
                color: post.category.color,
              }}
            >
              {post.category.name}
            </span>
            {post.status && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  post.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : post.status === "pending"
                    ? "bg-orange-100 text-orange-800"
                    : post.status === "flagged"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </span>
            )}
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
                    {post.is_anonymous ? "Anonymous Patient" : post.author.display_name}
                  </span>
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
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
          </div>

          {/* Moderation Info (if exists) */}
          {(post.moderated_by_name || post.moderated_at) && (
            <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Moderation Information
              </h4>
              <div className="text-sm text-blue-800">
                {post.moderated_by_name && (
                  <p>
                    <span className="font-medium">Moderated by:</span>{" "}
                    {post.moderated_by_name}
                  </p>
                )}
                {post.moderated_at && (
                  <p>
                    <span className="font-medium">Moderated at:</span>{" "}
                    {new Date(post.moderated_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Heart className="w-5 h-5" />
                <span className="font-medium">{post.like_count} likes</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{post.comment_count} comments</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <Eye className="w-5 h-5" />
                <span className="font-medium">{post.view_count} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section - Therapists can view and comment */}
        <div className="mt-6">
          <CommentSection postId={post.id} initialComments={post.comments || []} />
        </div>

        {/* Therapist Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> As a therapist, your comments will display with a
            "Professional" badge. Please provide supportive and professional guidance
            to community members.
          </p>
        </div>
      </div>
    </div>
  );
}