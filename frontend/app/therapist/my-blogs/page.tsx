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
  TrendingUp,
  Heart,
  
  Sparkles,
  FileText,
  Search,
  
  Calendar,
  ArrowRight,
  
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { blogAPI } from "@/lib/api/blog";
import { BlogPost } from "@/lib/types/blog";
import Header from "@/components/Header";
import { authAPI } from "@/lib/api";

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser.role !== "therapist") {
          window.location.href = "/auth/login";
          return;
        }
        setUser(currentUser);

        await loadBlogs();
        await loadStats();
      } catch (error) {
        console.error("Failed to load data:", error);
        window.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filter]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === "all" ? undefined : filter;
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
    try {
      await blogAPI.deleteBlog(slug);
      setShowDeleteModal(false);
      setBlogToDelete(null);
      loadBlogs();
      loadStats();
    } catch (error) {
      console.error("Failed to delete blog:", error);
      alert("Failed to delete blog post");
    }
  };

  const openDeleteModal = (slug: string) => {
    setBlogToDelete(slug);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      published: {
        gradient: "from-emerald-500 to-teal-500",
        bg: "from-emerald-50 to-teal-50",
        icon: CheckCircle,
      },
      pending: {
        gradient: "from-amber-500 to-orange-500",
        bg: "from-amber-50 to-orange-50",
        icon: Clock,
      },
      rejected: {
        gradient: "from-rose-500 to-red-500",
        bg: "from-rose-50 to-red-50",
        icon: XCircle,
      },
      draft: {
        gradient: "from-slate-500 to-gray-500",
        bg: "from-slate-50 to-gray-50",
        icon: FileText,
      },
    };
    const config = badges[status as keyof typeof badges] || badges.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${config.bg} border-2 border-white rounded-xl text-xs font-bold shadow-sm`}
      >
        <Icon className={`w-3.5 h-3.5 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`} />
        <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </span>
    );
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin mx-auto"></div>
              <Heart className="w-6 h-6 text-teal-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-slate-600 font-medium">Loading dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Delete Blog Post?
                </h3>
                <p className="text-slate-600">
                  This action cannot be undone. Your blog post will be
                  permanently removed.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => blogToDelete && handleDelete(blogToDelete)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="mb-12 animate-in slide-in-from-top duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-2 border-teal-200 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-teal-700">
                    CONTENT DASHBOARD
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    My Blog Posts
                  </span>
                </h1>
                <p className="text-lg text-slate-600">
                  Manage and track your published articles
                </p>
              </div>
              <a
                href="/therapist/my-blogs/create"
                className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Write New Blog
                </span>
              </a>
            </div>
          </div>

          {/* Improved Stats Cards */}
{stats && (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
    {[
      {
        value: stats.total_posts,
        label: "Total Posts",
        icon: FileText,
        color: "blue",
      },
      {
        value: stats.published_posts,
        label: "Published",
        icon: CheckCircle,
        color: "emerald",
      },
      {
        value: stats.total_views,
        label: "Total Views",
        icon: TrendingUp,
        color: "violet",
      },
      {
        value: stats.total_likes,
        label: "Total Likes",
        icon: Heart,
        color: "rose",
      },
    ].map((stat, index) => {
      const colorMap = {
        blue: {
          bg: "from-blue-50 to-cyan-50",
          accent: "from-blue-500 to-cyan-600",
          icon: "text-blue-600",
          hover: "hover:border-blue-200",
        },
        emerald: {
          bg: "from-emerald-50 to-teal-50",
          accent: "from-emerald-500 to-teal-600",
          icon: "text-emerald-600",
          hover: "hover:border-emerald-200",
        },
        violet: {
          bg: "from-violet-50 to-purple-50",
          accent: "from-violet-500 to-purple-600",
          icon: "text-violet-600",
          hover: "hover:border-violet-200",
        },
        rose: {
          bg: "from-rose-50 to-pink-50",
          accent: "from-rose-500 to-pink-600",
          icon: "text-rose-600",
          hover: "hover:border-rose-200",
        },
      };

      const theme = colorMap[stat.color as keyof typeof colorMap];

      return (
        <div
          key={index}
          className={`
            group relative overflow-hidden
            bg-white rounded-2xl p-6 md:p-8
            border border-gray-100 ${theme.hover}
            shadow-sm hover:shadow-md
            transition-all duration-300
            hover:-translate-y-1
            animate-in fade-in slide-in-from-bottom
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div
            className={`
              absolute inset-0 bg-gradient-to-br ${theme.bg}
              opacity-40 group-hover:opacity-60
              transition-opacity duration-400
            `}
          />

          <div className="relative flex flex-col items-start">
            <div
              className={`
                mb-5 rounded-xl p-3.5
                bg-gradient-to-br ${theme.accent}
                text-white
                transition-transform duration-300
                group-hover:scale-110
              `}
            >
              <stat.icon className="w-7 h-7" />
            </div>

            <div
              className={`
                text-3xl md:text-4xl font-bold
                bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent
                mb-1.5
              `}
            >
              {stat.value.toLocaleString()}
            </div>

            <div className="text-base md:text-lg font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
              {stat.label}
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-6 animate-in slide-in-from-top duration-700 delay-200">
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border-2 border-white shadow-lg">
                  <input
                    type="text"
                    placeholder="Search your blogs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-4 pl-14 rounded-xl outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { id: "all", label: "All Posts", icon: FileText },
                { id: "published", label: "Published", icon: CheckCircle },
                { id: "pending", label: "Pending", icon: Clock },
                { id: "draft", label: "Drafts", icon: PenSquare },
                { id: "rejected", label: "Rejected", icon: XCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 ${
                    filter === tab.id
                      ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg scale-105"
                      : "bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-white hover:border-teal-200 hover:shadow-md"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Blog List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
                <Heart className="w-6 h-6 text-teal-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="mt-4 text-slate-600 font-medium">
                Loading your blogs...
              </p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-300">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <PenSquare className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No blog posts yet
              </h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Start sharing your expertise and insights with the community
              </p>
              <a
                href="/therapist/my-blogs/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Write Your First Blog
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden animate-in slide-in-from-bottom"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Hover Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative flex flex-col md:flex-row gap-6">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 overflow-hidden rounded-2xl group/img">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 opacity-0 group-hover/img:opacity-20 transition-opacity duration-500 z-10"></div>
                      <img
                        src={blog.cover_image}
                        alt={blog.title}
                        className="w-full md:w-48 h-48 object-cover transform group-hover/img:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors duration-300">
                            {blog.title}
                          </h3>
                          {getStatusBadge(blog.status)}
                        </div>
                      </div>

                      <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-semibold">
                              {blog.views_count}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-red-100 rounded-lg flex items-center justify-center">
                              <Heart className="w-4 h-4 text-rose-600" />
                            </div>
                            <span className="font-semibold">
                              {blog.likes_count}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-semibold">
                              {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="group/btn p-3 bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 hover:from-blue-500 hover:to-cyan-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <a
                            href={`/therapist/my-blogs/edit/${blog.slug}`}
                            className="group/btn p-3 bg-gradient-to-br from-slate-100 to-gray-100 text-slate-600 hover:from-slate-500 hover:to-gray-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg"
                            title="Edit"
                          >
                            <PenSquare className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => openDeleteModal(blog.slug)}
                            className="group/btn p-3 bg-gradient-to-br from-red-100 to-rose-100 text-red-600 hover:from-red-500 hover:to-rose-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {blog.status === "rejected" && blog.rejection_reason && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <XCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-red-900 mb-1">
                                Rejection Reason
                              </p>
                              <p className="text-sm text-red-800">
                                {blog.rejection_reason}
                              </p>
                            </div>
                          </div>
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