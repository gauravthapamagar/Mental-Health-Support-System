"use client";
import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Clock,
  User,
  Calendar,
  Search,
  AlertCircle,
} from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const BlogsTab = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = status === "pending" ? "/blog/pending/list/" : "/blog/";
      const res = await adminApiCall(endpoint);
      if (res?.ok) {
        const blogData = res.data.results || res.data || [];
        setBlogs(blogData);
      } else if (res?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (res?.status === 404) {
        setBlogs([]);
      } else {
        setError(res?.data?.error || "Failed to fetch blogs");
        setBlogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      setError("An error occurred. Please try again.");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [status]);

  const handleApprove = async (id: number) => {
    try {
      const res = await adminApiCall(`/blog/approve/${id}/`, {
        method: "POST",
        body: JSON.stringify({ action: "approve" }),
      });
      if (res?.ok) {
        alert("Blog Published Successfully!");
        loadBlogs();
      }
    } catch (error) {
      console.error("Failed to approve blog:", error);
      alert("Failed to approve blog");
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const res = await adminApiCall(`/blog/approve/${id}/`, {
        method: "POST",
        body: JSON.stringify({ action: "reject", rejection_reason: reason }),
      });
      if (res?.ok) {
        alert("Blog Rejected");
        loadBlogs();
      }
    } catch (error) {
      console.error("Failed to reject blog:", error);
      alert("Failed to reject blog");
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="text-red-600" size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Blogs</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => loadBlogs()}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Blog Management</h1>
            <p className="text-blue-100 text-lg">Review and approve blog posts from therapists</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-cyan-300 animate-pulse"></div>
            <span className="text-sm font-medium">{blogs.length} Blogs</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<FileText size={28} />}
          title="Total Blogs"
          value={blogs.length}
          gradient="from-purple-500 to-pink-500"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={<Clock size={28} />}
          title="Pending Review"
          value={blogs.filter((b) => b.status === "pending").length}
          gradient="from-amber-500 to-orange-500"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          icon={<CheckCircle size={28} />}
          title="Published"
          value={blogs.filter((b) => b.status === "published").length}
          gradient="from-green-500 to-emerald-500"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={<TrendingUp size={28} />}
          title="Total Views"
          value={blogs.reduce((sum, b) => sum + (b.views_count || 0), 0)}
          gradient="from-blue-500 to-cyan-500"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
            <option value="all">All Blogs</option>
          </select>
        </div>
      </div>

      {/* Blog List */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-200 rounded-2xl p-16 text-center">
          <div className="p-4 bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FileText className="text-purple-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Blogs Found</h3>
          <p className="text-gray-600">
            {status === "pending"
              ? "No blogs pending approval at this time."
              : "Blogs will appear here once published."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBlogs.map((blog: any) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Cover Image */}
              {blog.cover_image && (
                <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                  <img
                    src={blog.cover_image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                {/* Author & Meta */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {blog.author?.full_name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {blog.author?.full_name || "Unknown Author"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span>
                        {blog.created_at
                          ? new Date(blog.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      blog.status === "published"
                        ? "bg-green-50 text-green-700"
                        : blog.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Eye size={16} className="text-blue-500" />
                    <span>{blog.views_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart size={16} className="text-red-500" />
                    <span>{blog.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={16} className="text-green-500" />
                    <span>{blog.comments_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" />
                    <span>{blog.reading_time || 5} min read</span>
                  </div>
                </div>

                {/* Category & Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-xs font-medium">
                    {blog.category}
                  </span>
                  {blog.tags &&
                    blog.tags.slice(0, 2).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(blog.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(blog.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedBlog(blog)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBlog(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {selectedBlog.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{selectedBlog.author?.full_name}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        {new Date(selectedBlog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{selectedBlog.reading_time || 5} min read</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Cover Image */}
              {selectedBlog.cover_image && (
                <img
                  src={selectedBlog.cover_image}
                  alt={selectedBlog.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}

              {/* Excerpt */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg mb-6">
                <p className="text-gray-700 italic">{selectedBlog.excerpt}</p>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none mb-6">
                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Category
                  </p>
                  <p className="text-sm text-gray-900 font-medium capitalize">
                    {selectedBlog.category}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Status
                  </p>
                  <p className="text-sm text-gray-900 font-medium capitalize">
                    {selectedBlog.status}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Views
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {selectedBlog.views_count || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Likes
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {selectedBlog.likes_count || 0}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlog.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  gradient,
  iconBg,
  iconColor,
}: any) => (
  <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
    <div className={`bg-gradient-to-r ${gradient} h-1`}></div>
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>{React.cloneElement(icon, { className: iconColor })}</div>
      </div>
      <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default BlogsTab;
