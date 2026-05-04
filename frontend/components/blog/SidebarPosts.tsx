import Link from "next/link";
import { BlogPost } from "@/lib/types/blog";
import { CheckCircle2 } from "lucide-react";

export default function SidebarPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold mb-6">Other featured posts</h3>
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="flex gap-4 group cursor-pointer items-center"
          >
            <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden relative">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h4>
              {post.is_verified && (
                <div className="flex items-center text-xs text-gray-500 pt-1">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-white fill-green-500" />
                  <span>Verified</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
