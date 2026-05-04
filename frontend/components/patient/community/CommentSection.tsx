import React, { useState, useEffect } from "react";
import { communityAPI, PostComment } from "@/lib/api";
import { Heart, Reply, Trash2, Loader2, Flag } from "lucide-react";
import { toast } from "react-hot-toast";
import ReportModal from "./ReportModal";

interface CommentSectionProps {
  postId: number;
  initialComments: PostComment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  initialComments,
}) => {
  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  );
  const [reportingComment, setReportingComment] = useState<number | null>(null);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newComment.trim().length < 5) {
      toast.error("Comment must be at least 5 characters");
      return;
    }

    try {
      setLoading(true);
      const result = await communityAPI.createComment(postId, {
        content: newComment,
        is_anonymous: isAnonymous,
      });

      setComments([result.comment, ...comments]);
      setNewComment("");
      setIsAnonymous(false);
      toast.success("Comment added successfully!");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(
        error.response?.data?.error || "Failed to add comment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId: number) => {
    if (replyContent.trim().length < 5) {
      toast.error("Reply must be at least 5 characters");
      return;
    }

    try {
      setLoading(true);
      const result = await communityAPI.createComment(postId, {
        content: replyContent,
        parent: parentId,
        is_anonymous: isAnonymous,
      });

      // Update the parent comment's replies
      setComments(
        comments.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), result.comment],
                reply_count: (comment.reply_count || 0) + 1,
              }
            : comment
        )
      );

      setReplyingTo(null);
      setReplyContent("");
      setIsAnonymous(false);
      toast.success("Reply added successfully!");
    } catch (error: any) {
      console.error("Error adding reply:", error);
      toast.error(error.response?.data?.error || "Failed to add reply");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      const result = await communityAPI.toggleCommentLike(commentId);

      // Update comment in state
      const updateCommentLike = (comments: PostComment[]): PostComment[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              is_liked_by_user: result.liked,
              like_count: result.like_count,
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLike(comment.replies),
            };
          }
          return comment;
        });
      };

      setComments(updateCommentLike(comments));
    } catch (error) {
      console.error("Error toggling comment like:", error);
      toast.error("Failed to like comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await communityAPI.deleteComment(postId, commentId);
      setComments(comments.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const loadReplies = async (commentId: number) => {
    try {
      setLoadingReplies(commentId);
      const replies = await communityAPI.getCommentReplies(commentId);

      setComments(
        comments.map((comment) =>
          comment.id === commentId ? { ...comment, replies } : comment
        )
      );

      setExpandedComments(new Set([...expandedComments, commentId]));
    } catch (error) {
      console.error("Error loading replies:", error);
      toast.error("Failed to load replies");
    } finally {
      setLoadingReplies(null);
    }
  };

  const handleReportComment = async (reason: string, details: string) => {
    if (!reportingComment) return;

    try {
      await communityAPI.reportComment(reportingComment, {
        reason: reason as any,
        details,
      });
      toast.success("Comment reported successfully");
      setReportingComment(null);
    } catch (error: any) {
      console.error("Error reporting comment:", error);
      toast.error(
        error.response?.data?.error || "Failed to report comment"
      );
    }
  };

  const renderComment = (comment: PostComment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? "ml-8 mt-3" : "mt-4"} bg-gray-50 rounded-lg p-4`}
    >
      {/* Comment Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">
            {comment.author.display_name}
          </span>
          {comment.author.role_badge && (
            <span
              className="px-2 py-1 text-xs rounded font-medium"
              style={{
                backgroundColor:
                  comment.author.role_badge.color === "blue"
                    ? "#DBEAFE"
                    : "#FEE2E2",
                color:
                  comment.author.role_badge.color === "blue"
                    ? "#1E40AF"
                    : "#991B1B",
              }}
            >
              {comment.author.role_badge.text}
              {comment.author.role_badge.verified && " ✓"}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {new Date(comment.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Comment Content */}
      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
        {comment.content}
      </p>

      {/* Comment Actions */}
      <div className="flex items-center space-x-4 text-sm">
        <button
          onClick={() => handleLikeComment(comment.id)}
          className={`flex items-center space-x-1 transition-colors ${
            comment.is_liked_by_user
              ? "text-red-500"
              : "text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart
            className="w-4 h-4"
            fill={comment.is_liked_by_user ? "currentColor" : "none"}
          />
          <span>{comment.like_count}</span>
        </button>

        {!isReply && (
          <button
            onClick={() => setReplyingTo(comment.id)}
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>
        )}

        {comment.can_delete && (
          <button
            onClick={() => handleDeleteComment(comment.id)}
            className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        )}

        <button
          onClick={() => setReportingComment(comment.id)}
          className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
        >
          <Flag className="w-4 h-4" />
          <span>Report</span>
        </button>
      </div>

      {/* Show Replies Button */}
      {!isReply &&
        comment.reply_count &&
        comment.reply_count > 0 &&
        !expandedComments.has(comment.id) && (
          <button
            onClick={() => loadReplies(comment.id)}
            disabled={loadingReplies === comment.id}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            {loadingReplies === comment.id ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading replies...</span>
              </>
            ) : (
              <span>
                View {comment.reply_count} {comment.reply_count === 1 ? "reply" : "replies"}
              </span>
            )}
          </button>
        )}

      {/* Replies */}
      {comment.replies &&
        comment.replies.length > 0 &&
        expandedComments.has(comment.id) &&
        comment.replies.map((reply) => renderComment(reply, true))}

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleReply(comment.id);
          }}
          className="mt-3 space-y-2"
        >
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Write a reply..."
            autoFocus
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-600">Reply anonymously</span>
            </label>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Posting..." : "Reply"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {/* New Comment Form */}
      <form onSubmit={handleAddComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Add a thoughtful comment..."
        />
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-600">Comment anonymously</span>
          </label>
          <button
            type="submit"
            disabled={loading || newComment.trim().length < 5}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Posting..." : "Comment"}
          </button>
        </div>
        {newComment.trim().length > 0 && newComment.trim().length < 5 && (
          <p className="text-sm text-red-500 mt-1">
            Comment must be at least 5 characters
          </p>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-500">No comments yet</p>
            <p className="text-gray-400 text-sm">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* Report Modal */}
      {reportingComment && (
        <ReportModal
          type="comment"
          onClose={() => setReportingComment(null)}
          onSubmit={handleReportComment}
        />
      )}
    </div>
  );
};

export default CommentSection;