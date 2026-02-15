import React from "react";
import { CommunityPost } from "@/lib/api";
import { Heart, MessageCircle, Eye, Sparkles } from "lucide-react";
import Image from "next/image";

interface PostCardProps {
  post: CommunityPost;
  onLike: (postId: number) => void;
  onClick: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onClick }) => {
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };

  return (
    <div
      onClick={() => onClick(post.id)}
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              {post.is_anonymous ? (
                <Sparkles className="w-6 h-6" />
              ) : (
                post.author.display_name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {post.author.display_name}
              </p>
              <p className="text-sm text-gray-500">{post.time_ago}</p>
            </div>
          </div>

          {/* Category Badge */}
          <span
            className="px-4 py-1.5 rounded-full text-sm font-medium shadow-sm"
            style={{
              backgroundColor: post.category.color + "15",
              color: post.category.color,
              border: `1.5px solid ${post.category.color}30`,
            }}
          >
            {post.category.name}
          </span>
        </div>

        {/* Professional Badge */}
        {post.author.is_therapist && (
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">
              Professional Therapist
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Read More Indicator */}
        <div className="text-blue-600 font-medium text-sm mb-4 group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
          <span>Read full story</span>
          <span>→</span>
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all group/like ${
                post.is_liked_by_user
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <div className="relative">
                <Heart
                  className={`w-5 h-5 transition-all ${
                    post.is_liked_by_user
                      ? "fill-current scale-110"
                      : "group-hover/like:scale-110"
                  }`}
                />
                {post.is_liked_by_user && (
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-30 animate-pulse"></div>
                )}
              </div>
              <span className="font-semibold">{post.like_count}</span>
            </button>

            {/* Comment Count */}
            <div className="flex items-center gap-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{post.comment_count}</span>
            </div>

            {/* View Count */}
            <div className="flex items-center gap-2 text-gray-500">
              <Eye className="w-5 h-5" />
              <span className="font-semibold">{post.view_count}</span>
            </div>
          </div>

          {/* Anonymous Badge */}
          {post.is_anonymous && (
            <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full font-medium">
              Posted Anonymously
            </span>
          )}
        </div>
      </div>

      {/* Hover Effect Bar */}
      <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
    </div>
  );
};

export default PostCard;