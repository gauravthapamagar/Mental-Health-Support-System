"use client";

import { useState, useEffect } from "react";
import { Save, Eye, ArrowLeft } from "lucide-react";
import { blogAPI } from "@/lib/api/blog";
import { BlogCategory } from "@/lib/types/blog";
import Header from "@/components/Header";

export default function CreateBlogPage() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await blogAPI.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.content ||
      !formData.excerpt ||
      !formData.category
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the data to match Django's expected format
      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        cover_image: formData.cover_image || undefined,
        meta_description: formData.meta_description || undefined,
      };

      const result = await blogAPI.createBlog(payload);

      // Show the specific message from your backend:
      // "Blog post published successfully!" OR "Blog post submitted for approval..."
      alert(result.message);

      // Redirect based on whether it went live or needs approval
      if (result.is_verified) {
        window.location.href = "/therapist/my-blogs";
      } else {
        window.location.href = "/therapist/my-blogs/pending";
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to My Blogs
            </button>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Write New Blog Post
            </h1>
            <p className="text-slate-600">
              Share your expertise with the community
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter an engaging title..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>

              {/* Category & Cover Image */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
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
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Write a brief summary (150-200 characters)..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors resize-none"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.excerpt.length} characters
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your blog content here... (HTML supported)"
                  rows={15}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors resize-none font-mono text-sm"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  You can use HTML tags for formatting (h2, p, ul, li,
                  blockquote, etc.)
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="mental health, therapy, wellness"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Meta Description (SEO)
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  placeholder="SEO description for search engines..."
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  <Eye className="w-5 h-5" />
                  {showPreview ? "Hide" : "Show"} Preview
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? "Publishing..." : "Publish Blog Post"}
                </button>
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Preview
                </h3>
                <div className="bg-slate-50 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    {formData.title || "Untitled"}
                  </h2>
                  <p className="text-slate-600 mb-6">
                    {formData.excerpt || "No excerpt yet..."}
                  </p>
                  <div
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: formData.content || "<p>No content yet...</p>",
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
