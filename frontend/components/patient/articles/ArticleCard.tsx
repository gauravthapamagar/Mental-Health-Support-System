"use client";
import Link from "next/link";
import {
  Clock,
  BookmarkPlus,
  Share2,
  Bookmark,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";

interface ArticleCardProps {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  image?: string; // Changed from imageColor to image
  author?: string;
  publishedDate?: string;
  saved?: boolean;
  recommendationReason?: string;
}

export default function ArticleCard({
  id,
  title,
  category,
  excerpt,
  readTime,
  image,
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
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col shadow-sm">
        {/* Header Image Area - NOW SUPPORTS ACTUAL IMAGES */}
        <div className="h-48 bg-slate-100 relative overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <ImageIcon className="text-blue-200" size={40} />
            </div>
          )}

          {/* Badge Logic */}
          <div className="absolute top-4 left-4 z-10">
            {recommendationReason ? (
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg">
                {recommendationReason}
              </span>
            ) : (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-900 rounded-full shadow-sm uppercase tracking-wide border border-slate-100">
                {category}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors shadow-md text-slate-700"
            >
              {isSaved ? (
                <Bookmark size={18} className="text-blue-600 fill-blue-600" />
              ) : (
                <BookmarkPlus size={18} />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors shadow-md text-slate-700"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            {title}
          </h3>

          <p className="text-sm text-slate-500 mb-4 line-clamp-3 flex-1 leading-relaxed">
            {excerpt}
          </p>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Clock size={12} />
              <span>{readTime}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {publishedDate}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1 text-blue-600 font-bold text-sm">
            <span>Read Article</span>
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
