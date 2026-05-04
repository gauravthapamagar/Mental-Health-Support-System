// app/blog/page.tsx
import { blogAPI } from "@/lib/api/blog";
import { BlogPost } from "@/lib/types/blog";
import Header from "@/components/Header";
import HeroPost from "@/components/blog/HeroPost";
import SidebarPosts from "@/components/blog/SidebarPosts";
import RecentPostsGrid from "@/components/blog/RecentPostsGrid";
import CategoryFilter from "@/components/blog/CategoryFilter";
import {
  Sparkles,
  TrendingUp,
  BookOpen,
  Heart,
  Users,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "Blog | Smart Mental Health Platform",
  description:
    "Insights on mental health technology, AI in therapy, and clinical support.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  try {
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || "1");
    const category =
      resolvedSearchParams.category === "all"
        ? undefined
        : resolvedSearchParams.category;

    // Fetch Blogs from Django Backend
    const blogsData = await blogAPI.getAllBlogs({
      page,
      page_size: 20,
      category,
      ordering: "-published_at",
    });

    const allBlogs: BlogPost[] = blogsData.results || [];

    // Handle empty state
    if (allBlogs.length === 0) {
      return (
        <>
          <Header />
          <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 pt-24">
            <div className="max-w-4xl mx-auto px-6 text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-16 h-16 text-slate-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                No posts found
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Check back later or try a different category to explore our
                mental health insights.
              </p>
              <a
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                View All Posts
              </a>
            </div>
          </main>
        </>
      );
    }

    // Distribute posts for UI sections
    const heroPost =
      allBlogs.find((post) => post.views_count > 100) || allBlogs[0];
    const sidebarPosts = allBlogs
      .filter((post) => post.id !== heroPost?.id)
      .slice(0, 5);
    const recentPosts = allBlogs.filter((post) => post.id !== heroPost?.id);

    // Fetch Categories
    const categoriesData = await blogAPI.getCategories();
    const categories = categoriesData.categories || [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 pb-20">
          {/* Hero Section */}
          <section className="relative pt-24 pb-16 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="text-center mb-12 animate-in slide-in-from-top duration-700">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-2 border-teal-200 px-6 py-2.5 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-teal-700">
                    MENTAL HEALTH INSIGHTS
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                    Expert Perspectives
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                    on Mental Wellness
                  </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Discover evidence-based insights, therapeutic approaches, and
                  mental health strategies from verified professionals
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom duration-700 delay-200">
                {[
                  {
                    icon: BookOpen,
                    value: `${blogsData.count}+`,
                    label: "Articles",
                    gradient: "from-blue-500 to-cyan-500",
                  },
                  {
                    icon: Users,
                    value: "50+",
                    label: "Expert Authors",
                    gradient: "from-teal-500 to-emerald-500",
                  },
                  {
                    icon: Heart,
                    value: "10K+",
                    label: "Readers",
                    gradient: "from-rose-500 to-red-500",
                  },
                  {
                    icon: TrendingUp,
                    value: "Weekly",
                    label: "New Posts",
                    gradient: "from-purple-500 to-pink-500",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-white shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Filter */}
              <div className="animate-in slide-in-from-bottom duration-700 delay-300">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={resolvedSearchParams.category || "all"}
                />
              </div>
            </div>
          </section>

          {/* Content Layout */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 mb-16">
              {/* Main Content */}
              <div className="lg:w-2/3 animate-in slide-in-from-left duration-700">
                {heroPost && <HeroPost post={heroPost} />}
              </div>

              {/* Sidebar */}
              <div className="lg:w-1/3 animate-in slide-in-from-right duration-700">
                <div className="sticky top-24">
                  <SidebarPosts posts={sidebarPosts} />
                </div>
              </div>
            </div>

            {/* Recent Posts Grid */}
            <div className="animate-in slide-in-from-bottom duration-700">
              <RecentPostsGrid posts={recentPosts} />
            </div>

            {/* Pagination */}
            {blogsData.count > 20 && (
              <div className="flex justify-center gap-4 mt-16 animate-in slide-in-from-bottom duration-700">
                {blogsData.previous && (
                  <a
                    href={`/blog?page=${page - 1}${
                      category ? `&category=${category}` : ""
                    }`}
                    className="group px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-white text-slate-700 font-bold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    ← Previous
                  </a>
                )}

                <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl shadow-lg">
                  Page {page}
                </div>

                {blogsData.next && (
                  <a
                    href={`/blog?page=${page + 1}${
                      category ? `&category=${category}` : ""
                    }`}
                    className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Next →
                  </a>
                )}
              </div>
            )}
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return <ErrorState />;
  }
}

function ErrorState() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 pb-20 pt-24">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          {/* Error Icon */}
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-400 rounded-full blur-2xl opacity-30"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Unable to Load Blogs
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            We're having trouble connecting to our content server. Please check
            if the Django backend is running or try again later.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/blog"
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Try Again
            </a>
            <a
              href="/"
              className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-white text-slate-700 font-bold rounded-xl hover:shadow-xl transition-all hover:scale-105"
            >
              Go Home
            </a>
          </div>

          {/* Debug Info */}
          <div className="mt-12 p-6 bg-slate-100 rounded-2xl border-2 border-slate-200 text-left max-w-2xl mx-auto">
            <p className="text-sm font-bold text-slate-900 mb-2">
              Troubleshooting:
            </p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Check if Django server is running on port 8000</li>
              <li>• Verify API endpoint configuration</li>
              <li>• Check network connection</li>
              <li>• Review browser console for errors</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}