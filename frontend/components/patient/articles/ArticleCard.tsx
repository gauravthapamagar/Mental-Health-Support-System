"use client";
import Link from "next/link";
import { Clock, BookmarkPlus, Share2, Bookmark } from "lucide-react";
import { useState } from "react";

interface ArticleCardProps {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  imageColor: string; // Tailwind gradient classes like "from-blue-400 to-purple-500"
  author?: string;
  publishedDate?: string;
  saved?: boolean;
}

export default function ArticleCard({
  id,
  title,
  category,
  excerpt,
  readTime,
  imageColor,
  author = "CarePair Team",
  publishedDate = "Recent",
  saved = false,
}: ArticleCardProps) {
  const [isSaved, setIsSaved] = useState(saved);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking bookmark
    setIsSaved(!isSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: title,
        text: excerpt,
        url: `/patient/articles/${id}`,
      });
    }
  };

  return (
    <Link href={`/patient/articles/${id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Image/Gradient Header */}
        <div className={`h-48 bg-gradient-to-br ${imageColor} relative`}>
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900 rounded-full shadow-md uppercase tracking-wide">
              {category}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
              title={isSaved ? "Remove from saved" : "Save article"}
            >
              {isSaved ? (
                <Bookmark size={18} className="text-blue-600 fill-blue-600" />
              ) : (
                <BookmarkPlus size={18} className="text-gray-700" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
              title="Share article"
            >
              <Share2 size={18} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
            {excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={14} />
              <span className="font-medium">{readTime} read</span>
            </div>

            <div className="text-xs text-gray-500">{publishedDate}</div>
          </div>

          {/* Read More Link */}
          <div className="mt-4">
            <span className="text-blue-600 font-semibold text-sm group-hover:underline inline-flex items-center gap-1">
              Read article
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
