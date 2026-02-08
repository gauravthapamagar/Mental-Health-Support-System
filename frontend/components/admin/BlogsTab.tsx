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
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const BlogsTab = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const endpoint = status === "pending" ? "/blog/pending/list/" : "/blog/";
      const res = await adminApiCall(endpoint);
      if (res?.ok) {
        const blogData = res.data.results || res.data || [];
        setBlogs(blogData);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <p className="text-gray-500">Loading blogs...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-purple-600" size={28} />
            Blog Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Review and manage blog posts from therapists
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
            <option value="all">All Blogs</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold uppercase mb-1">
            Total Blogs
          </p>
          <p className="text-2xl font-bold text-purple-900">{blogs.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-600 font-semibold uppercase mb-1">
            Pending Review
          </p>
          <p className="text-2xl font-bold text-amber-900">
            {blogs.filter((b) => b.status === "pending").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase mb-1">
            Published
          </p>
          <p className="text-2xl font-bold text-green-900">
            {blogs.filter((b) => b.status === "published").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
            Total Views
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {blogs.reduce((sum, b) => sum + (b.views_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* Blog List */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No blogs found.</p>
          <p className="text-gray-400 text-sm mt-1">
            {status === "pending"
              ? "No blogs pending approval."
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

export default BlogsTab;
