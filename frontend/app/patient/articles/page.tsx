"use client";
import { useState, useEffect } from "react";
import { blogAPI, RecommendedBlog } from "@/lib/api";
import ArticleCard from "@/components/patient/articles/ArticleCard";
import ArticleFilters from "@/components/patient/articles/ArticleFilters";
import { Loader2, Sparkles } from "lucide-react";

export default function ArticlesPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const recRes = await fetch(
          "http://127.0.0.1:8000/api/blog/recommendations/",
          { headers }
        );
        const recData = await recRes.json();
        setRecommendations(recData);

        const blogRes = await fetch("http://127.0.0.1:8000/api/blog/");
        const blogData = await blogRes.json();
        setAllBlogs(blogData.results);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div>
      {/* Header Alignment matching Appointments */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recommended Articles</h1>
        <p className="text-gray-600">
          Personalized content based on your progress and interests
        </p>
      </div>

      {/* RECOMMENDATIONS SECTION */}
      {recommendations.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-amber-500 w-6 h-6" />
            <h2 className="text-xl font-bold">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item: any) => (
              <div key={item.blog.id} className="relative">
                <span className="absolute -top-3 left-4 z-10 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 shadow-sm">
                  {item.reason}
                </span>
                <ArticleCard
                  id={item.blog.slug}
                  title={item.blog.title}
                  category={item.blog.category}
                  excerpt={item.blog.excerpt}
                  readTime={`${item.blog.reading_time} min`}
                  image={item.blog.cover_image}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ALL ARTICLES SECTION */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Explore All Articles</h2>
        </div>
        <ArticleFilters />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {allBlogs.map((blog: any) => (
          <ArticleCard
            key={blog.id}
            id={blog.slug}
            title={blog.title}
            category={blog.category}
            excerpt={blog.excerpt}
            readTime={`${blog.reading_time} min`}
            image={blog.cover_image}
          />
        ))}
      </div>
    </div>
  );
}
