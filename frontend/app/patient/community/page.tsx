"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { communityAPI, CommunityPost, CommunityCategory } from "@/lib/api";
import PostCard from "@/components/patient/community/PostCard";
import CategoryFilter from "@/components/patient/community/CategoryFilter";
import CreatePostModal from "@/components/patient/community/CreatePostModal";
import { Loader2, Plus, TrendingUp, Sparkles, Filter, Search } from "lucide-react";

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("-created_at");
  const [viewMode, setViewMode] = useState<"all" | "my-posts" | "trending">("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, currentPage, sortBy, viewMode, searchQuery]);

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
      } else if (viewMode === "my-posts") {
        postsData = await communityAPI.getMyPosts(currentPage);
        setPosts(postsData.results);
        setTotalPages(Math.ceil(postsData.count / 10));
      } else {
        postsData = await communityAPI.getPosts({
          category: selectedCategory || undefined,
          page: currentPage,
          search: searchQuery || undefined,
          ordering: sortBy,
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

  const handleLike = async (postId: number) => {
    try {
      await communityAPI.togglePostLike(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked_by_user: !post.is_liked_by_user,
              like_count: post.is_liked_by_user ? post.like_count - 1 : post.like_count + 1
            }
          : post
      ));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handlePostCreated = () => {
    setShowCreateModal(false);
    setViewMode("all");
    setCurrentPage(1);
    loadPosts();
  };

  const handlePostClick = (postId: number) => {
    router.push(`/patient/community/${postId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Community Hub
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect, share experiences, and support each other on your mental wellness journey
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Share Your Story</span>
              </button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2 mt-4 border-t pt-4">
            <button
              onClick={() => setViewMode("all")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium transition-all ${
                viewMode === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setViewMode("trending")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                viewMode === "trending"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setViewMode("my-posts")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium transition-all ${
                viewMode === "my-posts"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              My Stories
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className={`lg:col-span-1 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Sort Options */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Sort By
              </h3>
              <div className="space-y-2">
                {[
                  { value: "-created_at", label: "Latest First", icon: "🕐" },
                  { value: "-like_count", label: "Most Liked", icon: "❤️" },
                  { value: "-comment_count", label: "Most Discussed", icon: "💬" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                      sortBy === option.value
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-3">💡 Community Guidelines</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Be kind and supportive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Share your experiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Respect privacy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>No medical advice</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading inspiring stories...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {viewMode === "my-posts"
                    ? "You haven't shared any stories yet. Be the first to inspire others!"
                    : "Be the first to share your thoughts and start the conversation!"}
                </p>
                {viewMode === "my-posts" && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-medium inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Share Your First Story
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onClick={() => handlePostClick(post.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-xl font-medium transition-all ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                : "bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  );
}