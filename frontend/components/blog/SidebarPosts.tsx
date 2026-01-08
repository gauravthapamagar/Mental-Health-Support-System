import { BlogPost } from "@/lib/blog";
import { CheckCircle2 } from "lucide-react";

export default function SidebarPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold mb-6">Other featured posts</h3>
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            // CHANGE: changed items-start to items-center to center text vertically with image
            className="flex gap-4 group cursor-pointer items-center"
          >
            <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden relative">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            {/* CHANGE: Removed gap-5 to bring title and approval badge together */}
            <div className="flex flex-col justify-center">
              <h4 className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h4>
              {post.isApproved && (
                // CHANGE: Removed mt-2 to keep it tight with the title
                <div className="flex items-center text-xs text-gray-500 pt-1">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-white fill-green-500" />
                  <span>Approved by {post.approverName}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
