import { heroPost, sidebarPosts, recentPosts } from "@/lib/blog-data";
import HeroPost from "@/components/blog/HeroPost";
import SidebarPosts from "@/components/blog/SidebarPosts";
import RecentPostsGrid from "@/components/blog/RecentPostsGrid";
import Header from "@/components/Header";

export const metadata = {
  title: "Blog | Smart Mental Health Platform",
  description:
    "Insights on mental health technology, AI in therapy, and clinical UX.",
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-20">
        {/* CHANGE: Changed py-12 to pt-24 pb-12 to give more space below the header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Top Section: Hero + Sidebar Layout */}
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3 font-sans">
              <HeroPost post={heroPost} />
            </div>

            <div className="lg:w-1/3">
              <SidebarPosts posts={sidebarPosts} />
            </div>
          </div>

          {/* Bottom Section: Recent Posts Grid */}
          <RecentPostsGrid posts={recentPosts} />
        </div>
      </main>
    </>
  );
}
