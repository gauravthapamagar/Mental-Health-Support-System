"use client";
import Link from "next/link";
import {
  Clock,
  BookmarkPlus,
  Share2,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface ArticleCardProps {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  imageColor: string; // Tailwind gradient classes
  author?: string;
  publishedDate?: string;
  saved?: boolean;
  recommendationReason?: string; // New prop for personalized badges
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
  recommendationReason,
}: ArticleCardProps) {
  const [isSaved, setIsSaved] = useState(saved);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: title,
        text: excerpt,
        url: `/patient/articles/${id}`,
      });
    }
  };

  return (
    <Link href={`/patient/articles/${id}`} className="group block h-full">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Header Image Area */}
        <div className={`h-48 bg-gradient-to-br ${imageColor} relative`}>
          {/* Badge Logic */}
          <div className="absolute top-4 left-4 z-10">
            {recommendationReason ? (
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg">
                {recommendationReason}
              </span>
            ) : (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-900 rounded-full shadow-sm uppercase tracking-wide border border-slate-100">
                {category}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md text-slate-700"
            >
              {isSaved ? (
                <Bookmark size={18} className="text-blue-600 fill-blue-600" />
              ) : (
                <BookmarkPlus size={18} />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md text-slate-700"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>

          <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-1 leading-relaxed">
            {excerpt}
          </p>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock size={14} />
              <span className="font-medium">{readTime} read</span>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {publishedDate}
            </div>
          </div>

          {/* Explicit "Read Article" Action */}
          <div className="mt-4 flex items-center gap-1 text-blue-600 font-bold text-sm">
            <span>Read article</span>
            <ChevronRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
