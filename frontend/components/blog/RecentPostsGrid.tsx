import { BlogPost } from "@/lib/blog";
import { CheckCircle2 } from "lucide-react";

export default function RecentPostsGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Recent Posts</h3>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          All Posts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group cursor-pointer flex flex-col h-full"
          >
            <div className="rounded-xl overflow-hidden h-60 mb-4 relative">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col flex-grow">
              <h4 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                {post.title}
              </h4>
              <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                {post.excerpt}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between font-medium">
                {post.isApproved && (
                  <div className="flex items-center text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-white fill-green-500" />
                    <span>Approved by {post.approverName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
