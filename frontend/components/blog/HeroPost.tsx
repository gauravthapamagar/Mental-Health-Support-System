import { BlogPost } from "@/lib/blog-data";
import ApprovalBadge from "./ApprovalBadge";
import { CheckCircle2 } from "lucide-react";

export default function HeroPost({ post }: { post: BlogPost }) {
  return (
    <div className="relative h-[460px] rounded-xl overflow-hidden group cursor-pointer">
      {/* Background Image */}
      <img
        src={post.coverImage}
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 text-white z-10 max-w-2xl">
        {post.category && (
          <span className="inline-block bg-white/20 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>
        )}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {post.title}
        </h2>

        <div className="flex flex-wrap items-center text-sm md:text-base gap-4 opacity-90">
          <div className="flex items-center">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-6 h-6 rounded-full mr-2 border border-white/30"
              />
            )}
            <span>Written by {post.author.name}</span>
          </div>
          <span>•</span>
          <time>Published on {post.date}</time>
          {post.isApproved && (
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-white fill-green-500" />
              <span className="text-sm">Approved by {post.approverName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
