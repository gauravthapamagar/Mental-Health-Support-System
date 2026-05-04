import React, { useState } from "react";
import { CommunityPost } from "@/lib/api";
import { CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface ModerationPostCardProps {
  post: CommunityPost;
  onModerate: (
    postId: number,
    action: "approve" | "flag" | "reject",
    notes?: string
  ) => Promise<void>;
}

const ModerationPostCard: React.FC<ModerationPostCardProps> = ({
  post,
  onModerate,
}) => {
  const router = useRouter();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedAction, setSelectedAction] = useState<
    "approve" | "flag" | "reject" | null
  >(null);
  const [processing, setProcessing] = useState(false);

  const handleAction = async (action: "approve" | "flag" | "reject") => {
    if ((action === "flag" || action === "reject") && !showNotes) {
      setSelectedAction(action);
      setShowNotes(true);
      return;
    }

    try {
      setProcessing(true);
      await onModerate(
        post.id,
        action,
        action === "approve" ? undefined : notes
      );
      setShowNotes(false);
      setNotes("");
      setSelectedAction(null);
    } finally {
      setProcessing(false);
    }
  };

  const cancelNotes = () => {
    setShowNotes(false);
    setNotes("");
    setSelectedAction(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        {/* Category & Status */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: post.category.color + "20",
              color: post.category.color,
            }}
          >
            {post.category.name}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              post.status === "pending"
                ? "bg-orange-100 text-orange-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {post.status === "pending" ? "Pending Review" : "Flagged"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>

        {/* Content Preview */}
        <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

        {/* Author & Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">
              {post.is_anonymous ? "Anonymous" : post.author.display_name}
            </span>
            {post.is_anonymous && (
              <span className="text-xs text-gray-400">(Posted anonymously)</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.view_count}</span>
            </div>
          </div>
        </div>

        {/* Notes Input (if shown) */}
        {showNotes && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moderation Notes
              {selectedAction === "reject" && (
                <span className="text-red-500"> *</span>
              )}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={`Explain why you're ${selectedAction === "flag" ? "flagging" : "rejecting"} this post...`}
            />
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() =>
                  selectedAction && handleAction(selectedAction)
                }
                disabled={
                  processing ||
                  (selectedAction === "reject" && notes.trim() === "")
                }
                className={`px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 ${
                  selectedAction === "flag"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processing
                  ? "Processing..."
                  : `Confirm ${selectedAction === "flag" ? "Flag" : "Reject"}`}
              </button>
              <button
                onClick={cancelNotes}
                disabled={processing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!showNotes && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleAction("approve")}
              disabled={processing}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Approve</span>
            </button>

            <button
              onClick={() => handleAction("flag")}
              disabled={processing}
              className="flex-1 flex items-center justify-center space-x-2 bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors font-medium"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Flag</span>
            </button>

            <button
              onClick={() => handleAction("reject")}
              disabled={processing}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
            >
              <XCircle className="w-5 h-5" />
              <span>Reject</span>
            </button>

            <button
              onClick={() => router.push(`/therapist/community/posts/${post.id}`)}
              className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationPostCard;