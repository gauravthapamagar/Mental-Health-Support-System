"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { communityAPI, CommunityPost, CommunityCategory } from "@/lib/api";
import { Loader2, Search, MessageCircle, TrendingUp, Shield } from "lucide-react";

export default function TherapistCommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "trending">("all");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, currentPage, viewMode, searchQuery]);

  const loadInitialData = async () => {
    try {
      const categoriesData = await communityAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);

      let postsData;

      if (viewMode === "trending") {
        const trendingPosts = await communityAPI.getTrendingPosts();
        setPosts(trendingPosts);
        setTotalPages(1);
      } else {
        postsData = await communityAPI.getPosts({
          category: selectedCategory || undefined,
          page: currentPage,
          search: searchQuery || undefined,
          ordering: "-created_at",
        });
        setPosts(postsData.results);
        setTotalPages(Math.ceil(postsData.count / 10));
      }
    } catch (error: any) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Community Overview
                </h1>
              </div>
              <p className="text-gray-600">
                Read and engage with patient posts as a professional
              </p>
            </div>
            <button
              onClick={() => router.push("/therapist/community/moderation")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
            >
              Go to Moderation
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* View Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("all")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                viewMode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setViewMode("trending")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                viewMode === "trending"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                selectedCategory === null
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? "text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === cat.slug ? cat.color : undefined,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600">No posts found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => router.push(`/therapist/community/posts/${post.id}`)}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {post.is_anonymous
                          ? "?"
                          : post.author.display_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {post.author.display_name}
                        </p>
                        <p className="text-sm text-gray-500">{post.time_ago}</p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: post.category.color + "20",
                        color: post.category.color,
                      }}
                    >
                      {post.category.name}
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comment_count} comments</span>
                    </div>
                    <div>
                      {post.view_count} views
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}