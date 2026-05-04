"use client";
import { useState, useEffect } from "react";
import { blogAPI } from "@/lib/api";
import ArticleCard from "@/components/patient/articles/ArticleCard";
import ArticleFilters from "@/components/patient/articles/ArticleFilters";
import { Loader2, Sparkles } from "lucide-react";

export default function ArticlesPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const recData = await blogAPI.getRecommendations();
        const uniqueRecs = recData.filter(
          (item: any, index: number, self: any[]) =>
            index === self.findIndex((t) => t.blog.id === item.blog.id),
        );
        setRecommendations(uniqueRecs);

        const blogData = await blogAPI.getBlogs();
        setAllBlogs(blogData.results || []);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="w-full">
      {/* HEADER SECTION - Aligned with PatientLayout style */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">
          Recommended Articles
        </h1>
        <p className="text-gray-600">
          Personalized content based on your progress and interests
        </p>
      </div>

      {/* RECOMMENDATIONS SECTION */}
      {recommendations.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-amber-500 w-5 h-5" />
            <h2 className="text-xl font-bold text-slate-800">Picked for You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item: any) => (
              <div key={`rec-${item.blog.id}`} className="relative">
                <span className="absolute -top-3 left-4 z-10 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 shadow-sm">
                  {item.reason}
                </span>
                <ArticleCard
                  id={item.blog.slug}
                  title={item.blog.title}
                  category={item.blog.category}
                  excerpt={item.blog.excerpt}
                  readTime={`${item.blog.reading_time || 5} min`}
                  image={item.blog.cover_image}
                  views={item.blog.views_count}
                  likes={item.blog.likes_count}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ALL ARTICLES SECTION */}
      <div className="pt-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-slate-800">
            Explore All Articles
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Browse our complete library of mental health resources
          </p>
          <ArticleFilters />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {allBlogs.length > 0 ? (
            allBlogs.map((blog: any) => (
              <ArticleCard
                key={`all-${blog.id}`}
                id={blog.slug}
                title={blog.title}
                category={blog.category}
                excerpt={blog.excerpt}
                readTime={`${blog.reading_time || 5} min`}
                image={blog.cover_image}
                views={blog.views_count}
                likes={blog.likes_count}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-gray-500">
                No articles found in this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
