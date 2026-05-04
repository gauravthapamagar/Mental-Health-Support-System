"use client";
import { useState, useEffect } from "react";
import { Save, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { blogAPI } from "@/lib/api/blog";
import { BlogCategory } from "@/lib/types/blog";
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
          blogAPI.getBlogBySlug(slug),
        ]);

        setCategories(catsData.categories || []);

        if (blogData) {
          setFormData({
            title: blogData.title,
            excerpt: blogData.excerpt,
            content: blogData.content,
            category: blogData.category?.value || blogData.category || "",
            tags: Array.isArray(blogData.tags) ? blogData.tags.join(", ") : "",
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
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Helper to render content: If it contains HTML tags, use them.
  // If not, preserve line breaks for plain text.
  const renderPreviewContent = (content: string) => {
    if (!content) return "No content yet...";
    const hasHtml = /<[a-z][\s\S]*>/i.test(content);
    if (hasHtml) return content;
    // Basic text-to-html conversion for preview: replace newlines with breaks
    return content.replace(/\n/g, "<br />");
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
        <Loader2 className="animate-spin text-blue-600" />
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
            <ArrowLeft className="w-5 h-5" /> Back to My Blogs
          </button>

          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            Edit Blog Post
          </h1>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <option value="">Select a category</option>
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
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Content (HTML or Plain Text)
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={12}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-mono text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50"
                >
                  <Eye className="w-5 h-5" /> {showPreview ? "Hide" : "Show"}{" "}
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? "Saving..." : "Update Post"}
                </button>
              </div>
            </form>

            {/* PREVIEW SECTION */}
            {showPreview && (
              <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Preview Mode
                </h3>
                <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 prose prose-slate max-w-none">
                  <h1 className="text-3xl font-bold mb-4">
                    {formData.title || "Post Title"}
                  </h1>
                  <p className="text-lg text-slate-600 italic mb-6">
                    {formData.excerpt}
                  </p>
                  <hr className="my-6" />
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderPreviewContent(formData.content),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
