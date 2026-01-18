"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookmarkPlus, Share2, Loader2 } from "lucide-react";

export default function ArticleDetailPage() {
  const { id } = useParams(); // This is the slug
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/blog/${id}/`);
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchArticle();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!article)
    return <div className="p-20 text-center">Article not found.</div>;

  return (
    <div>
      {/* Back Button Aligned with Page Start */}
      <div className="mb-8">
        <Link
          href="/patient/articles"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4"
        >
          <ArrowLeft size={20} /> Back to Articles
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Read Article</h1>
        <p className="text-gray-600">
          Explore mental health insights and guides
        </p>
      </div>

      <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {article.cover_image && (
          <img
            src={article.cover_image}
            alt=""
            className="w-full h-80 object-cover"
          />
        )}

        <div className="p-8 md:p-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            {article.category}
          </span>
          <h2 className="text-4xl font-bold mt-2 mb-6 text-slate-900 leading-tight">
            {article.title}
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-slate-100 mb-8">
            <div className="text-sm text-slate-500">
              By{" "}
              <span className="font-semibold text-slate-900">
                {article.author.full_name}
              </span>{" "}
              • {new Date(article.published_at).toLocaleDateString()} •{" "}
              {article.reading_time} min read
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-50 rounded-full border border-slate-200 transition-colors">
                <BookmarkPlus size={20} className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-full border border-slate-200 transition-colors">
                <Share2 size={20} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div
            className="prose prose-blue max-w-none text-slate-700 leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  );
}
