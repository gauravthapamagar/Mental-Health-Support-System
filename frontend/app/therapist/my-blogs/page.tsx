"use client";

import { useEffect, useState } from "react";
import {
  PenSquare,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { blogAPI } from "@/lib/api/blog";
import { BlogPost } from "@/lib/types/blog";
import Header from "@/components/Header";
import { authAPI } from "@/lib/api"; // Assuming this exists for role check

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Role protection
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser.role !== "therapist") {
          window.location.href = "/login";
          return;
        }
        setUser(currentUser);

        await loadBlogs();
        await loadStats();
      } catch (error) {
        console.error("Failed to load data:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filter]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === "all" ? undefined : filter; // Fixed syntax error
      const response = await blogAPI.getMyBlogs(statusFilter);
      setBlogs(response.results || []);
    } catch (error) {
      console.error("Failed to load blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await blogAPI.getMyStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      await blogAPI.deleteBlog(slug);
      loadBlogs();
      loadStats();
    } catch (error) {
      console.error("Failed to delete blog:", error);
      alert("Failed to delete blog post");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      published: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
      },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
      draft: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
    };
    const config = badges[status as keyof typeof badges] || badges.draft;
    const Icon = config.icon;

    return (
      <span
        className={`flex items-center gap-1 px-3 py-1 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading dashboard...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                My Blog Posts
              </h1>
              <p className="text-slate-600">
                Manage and track your published articles
              </p>
            </div>
            <a
              href="/therapist/my-blogs/create"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Write New Blog
            </a>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">
                  {stats.total_posts}
                </div>
                <div className="text-sm text-slate-600 mt-1">Total Posts</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="text-3xl font-bold text-green-600">
                  {stats.published_posts}
                </div>
                <div className="text-sm text-slate-600 mt-1">Published</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.total_views}
                </div>
                <div className="text-sm text-slate-600 mt-1">Total Views</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.total_likes}
                </div>
                <div className="text-sm text-slate-600 mt-1">Total Likes</div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {["all", "published", "pending", "draft", "rejected"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>

          {/* Blog List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading your blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <PenSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No blog posts yet
              </h3>
              <p className="text-slate-600 mb-6">
                Start sharing your expertise with the community
              </p>
              <a
                href="/therapist/my-blogs/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Write Your First Blog
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <img
                      src={blog.cover_image}
                      alt={blog.title}
                      className="w-32 h-32 object-cover rounded-xl flex-shrink-0"
                    />

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {blog.title}
                          </h3>
                          {getStatusBadge(blog.status)}
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <span>👁️ {blog.views_count} views</span>
                          <span>❤️ {blog.likes_count} likes</span>
                          <span>
                            📅 {new Date(blog.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <a
                            href={`/therapist/my-blogs/edit/${blog.slug}`}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PenSquare className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => handleDelete(blog.slug)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {blog.status === "rejected" && blog.rejection_reason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong>{" "}
                            {blog.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
