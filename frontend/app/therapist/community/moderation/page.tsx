"use client";

import { useState, useEffect } from "react";
import { communityAPI, CommunityPost, ModerationDashboard } from "@/lib/api";
import ModerationPostCard from "@/components/therapist/community/ModerationPostCard";
import { Loader2, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TherapistModerationPage() {
  const [stats, setStats] = useState<ModerationDashboard | null>(null);
  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<CommunityPost[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "flagged">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, pendingData, flaggedData] = await Promise.all([
        communityAPI.getModerationDashboard(),
        communityAPI.getPendingPosts(),
        communityAPI.getFlaggedPosts(),
      ]);

      setStats(statsData);
      setPendingPosts(pendingData);
      setFlaggedPosts(flaggedData);
    } catch (error) {
      console.error("Error loading moderation data:", error);
      toast.error("Failed to load moderation data");
    } finally {
      setLoading(false);
    }
  };

  const handleModeratePost = async (
    postId: number,
    action: "approve" | "flag" | "reject",
    notes?: string
  ) => {
    try {
      await communityAPI.moderatePost(postId, action, notes);
      
      const actionMessages = {
        approve: "Post approved successfully",
        flag: "Post flagged for review",
        reject: "Post rejected",
      };
      
      toast.success(actionMessages[action]);
      
      // Reload data
      loadData();
    } catch (error: any) {
      console.error("Error moderating post:", error);
      toast.error(error.response?.data?.error || "Failed to moderate post");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentPosts = activeTab === "pending" ? pendingPosts : flaggedPosts;

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Community Moderation
          </h1>
          <p className="text-gray-600 mt-1">
            Review and moderate community posts
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Posts</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.pending_posts}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Flagged Posts</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.flagged_posts}
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Unresolved Reports
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.unresolved_reports}
                  </p>
                </div>
                <XCircle className="w-12 h-12 text-yellow-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total Requiring Attention
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.total_requiring_attention}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "pending"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pending Posts ({pendingPosts.length})
            </button>
            <button
              onClick={() => setActiveTab("flagged")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "flagged"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Flagged Posts ({flaggedPosts.length})
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {currentPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-600">
                {activeTab === "pending"
                  ? "No posts pending moderation"
                  : "No flagged posts to review"}
              </p>
            </div>
          ) : (
            currentPosts.map((post) => (
              <ModerationPostCard
                key={post.id}
                post={post}
                onModerate={handleModeratePost}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}