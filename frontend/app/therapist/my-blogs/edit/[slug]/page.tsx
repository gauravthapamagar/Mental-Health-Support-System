"use client";
import { useState, useEffect } from "react";
import { Save, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { blogAPI } from "@/lib/api/blog";
import { BlogCategory, BlogPost } from "@/lib/types/blog";
import Header from "@/components/Header";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    cover_image: "",
    meta_description: "",
  });

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        const [catsData, blogData] = await Promise.all([
          blogAPI.getCategories(),
          blogAPI.getBlogDetail(slug), // Ensure your API has this method
        ]);

        setCategories(catsData.categories || []);

        if (blogData) {
          setFormData({
            title: blogData.title,
            excerpt: blogData.excerpt,
            content: blogData.content,
            category: blogData.category.value || blogData.category,
            tags: blogData.tags?.join(", ") || "",
            cover_image: blogData.cover_image || "",
            meta_description: blogData.meta_description || "",
          });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [slug]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      await blogAPI.updateBlog(slug, {
        ...formData,
        tags: tagsArray,
      });

      alert("Blog updated successfully!");
      router.push("/therapist/my-blogs");
    } catch (error: any) {
      alert(error.message || "Failed to update blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            Edit Blog Post
          </h1>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reuse the fields from your Create page here */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={15}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-mono text-sm"
                  required
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold"
                >
                  {showPreview ? "Hide" : "Show"} Preview
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Update Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
