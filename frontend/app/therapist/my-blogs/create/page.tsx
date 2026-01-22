"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Eye, ArrowLeft, Upload, X } from "lucide-react";
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
    meta_description: "",
  });

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // States for Local Image Upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderPreviewContent = (content: string) => {
    if (!content)
      return "<p class='text-slate-400 italic'>No content yet...</p>";
    const hasHtml = /<[a-z][\s\S]*>/i.test(content);
    return hasHtml ? content : content.replace(/\n/g, "<br />");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Frontend Validation
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

      // 2. Create FormData object
      const data = new FormData();

      // Append text fields
      data.append("title", formData.title.trim());
      data.append("excerpt", formData.excerpt.trim());
      data.append("content", formData.content.trim());
      data.append("category", formData.category);
      data.append("meta_description", formData.meta_description || "");

      // 3. Handle Tags
      if (formData.tags) {
        const tagsArray = formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== "");

        // Append each tag individually to the same key
        tagsArray.forEach((tag) => data.append("tags", tag));
      } else {
        // If no tags, append an empty string or nothing
        data.append("tags", "");
      }

      // 4. Append Image
      if (selectedImage) {
        data.append("cover_image", selectedImage);
      }

      // 5. API Call
      // FIXED: Passing the 'data' (FormData) object to blogAPI.createBlog
      const result = await blogAPI.createBlog(data);

      alert(result.message || "Blog created successfully!");

      if (result.is_verified) {
        window.location.href = "/therapist/my-blogs";
      } else {
        window.location.href = "/therapist/my-blogs/pending";
      }
    } catch (error: any) {
      console.error("Submission error details:", error);

      if (typeof error.response?.data === "object") {
        alert("Validation Error: " + JSON.stringify(error.response.data));
      } else {
        alert(error.message || "Failed to submit blog post");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-6 py-12">
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
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8"
          >
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

              {/* Category & Image */}
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
                    Cover Image
                  </label>
                  <div className="relative">
                    {!imagePreviewUrl ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-500"
                      >
                        <Upload className="w-5 h-5" /> Upload Image
                      </button>
                    ) : (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-slate-200">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
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
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                  required
                />
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
                  rows={12}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                  required
                />
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
                  placeholder="wellness, therapy, health"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  <Eye className="w-5 h-5" /> {showPreview ? "Hide" : "Show"}{" "}
                  Preview
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? "Publishing..." : "Publish Blog Post"}
                </button>
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200">
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
                      alt="Cover"
                      className="w-full h-64 object-cover rounded-xl mb-6 shadow-sm"
                    />
                  )}
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    {formData.title || "Untitled Post"}
                  </h2>
                  <div
                    className="prose prose-blue max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderPreviewContent(formData.content),
                    }}
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </>
  );
}
