// app/blog/page.tsx
import { blogAPI } from "@/lib/api/blog";
import { BlogPost } from "@/lib/types/blog";
import Header from "@/components/Header";
import HeroPost from "@/components/blog/HeroPost";
import SidebarPosts from "@/components/blog/SidebarPosts";
import RecentPostsGrid from "@/components/blog/RecentPostsGrid";
import CategoryFilter from "@/components/blog/CategoryFilter";

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

    // 1️⃣ Fetch Blogs from Django Backend
    // Django returns: { count: total, next: url, previous: url, results: [] }
    const blogsData = await blogAPI.getAllBlogs({
      page,
      page_size: 20,
      category,
      ordering: "-published_at",
    });

    const allBlogs: BlogPost[] = blogsData.results || [];

    // 2️⃣ Logic to handle empty state gracefully
    if (allBlogs.length === 0) {
      return (
        <>
          <Header />
          <main className="min-h-screen bg-white pt-24 text-center">
            <h2 className="text-xl font-semibold text-slate-800">
              No posts found
            </h2>
            <p className="text-slate-500 mt-2">
              Check back later or try a different category.
            </p>
            <a
              href="/blog"
              className="text-blue-600 underline mt-4 inline-block"
            >
              View all posts
            </a>
          </main>
        </>
      );
    }

    // 3️⃣ Distribute posts for UI sections
    // Hero post: Best performing or most recent
    const heroPost =
      allBlogs.find((post) => post.views_count > 100) || allBlogs[0];

    const sidebarPosts = allBlogs
      .filter((post) => post.id !== heroPost?.id)
      .slice(0, 5);

    const recentPosts = allBlogs.filter((post) => post.id !== heroPost?.id);

    // 4️⃣ Fetch Categories from: views.blog_categories
    const categoriesData = await blogAPI.getCategories();
    const categories = categoriesData.categories || [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={resolvedSearchParams.category || "all"}
            />

            {/* Content Layout */}
            <div className="flex flex-col lg:flex-row gap-12 mt-8">
              <div className="lg:w-2/3">
                {heroPost && <HeroPost post={heroPost} />}
              </div>
              <div className="lg:w-1/3">
                <SidebarPosts posts={sidebarPosts} />
              </div>
            </div>

            <RecentPostsGrid posts={recentPosts} />

            {/* Pagination using backend metadata */}
            {blogsData.count > 20 && (
              <div className="flex justify-center gap-4 mt-12">
                {blogsData.previous && (
                  <a
                    href={`/blog?page=${page - 1}${
                      category ? `&category=${category}` : ""
                    }`}
                    className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Previous
                  </a>
                )}

                {blogsData.next && (
                  <a
                    href={`/blog?page=${page + 1}${
                      category ? `&category=${category}` : ""
                    }`}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    Next
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
      <main className="min-h-screen bg-white pb-20 pt-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Unable to Load Blogs
          </h2>
          <p className="text-slate-600 mb-6">
            Backend connection failed. Is the Django server running at 8000?
          </p>
          <a
            href="/blog"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Retry
          </a>
        </div>
      </main>
    </>
  );
}
