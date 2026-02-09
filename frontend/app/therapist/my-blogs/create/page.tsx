"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Eye, ArrowLeft, Upload, X, Sparkles, FileText, Tag, Image as ImageIcon, AlignLeft, CheckCircle2 } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState<string | null>(null);

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

      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("excerpt", formData.excerpt.trim());
      data.append("content", formData.content.trim());
      data.append("category", formData.category);
      data.append("meta_description", formData.meta_description || "");

      if (formData.tags) {
        const tagsArray = formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== "");
        tagsArray.forEach((tag) => data.append("tags", tag));
      } else {
        data.append("tags", "");
      }

      if (selectedImage) {
        data.append("cover_image", selectedImage);
      }

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

  const isFieldComplete = (field: string) => {
    if (field === 'image') return !!imagePreviewUrl;
    return !!formData[field as keyof typeof formData];
  };

  const completionPercentage = () => {
    const fields = ['title', 'category', 'excerpt', 'content'];
    const completed = fields.filter(f => isFieldComplete(f)).length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-all duration-300"
            >
              <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md group-hover:bg-blue-50 transition-all duration-300">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Back to My Blogs</span>
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Create New Blog Post
                  </h1>
                </div>
                <p className="text-slate-600 text-lg">Share your insights and help others on their mental health journey</p>
              </div>
              
              {/* Progress Indicator */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 min-w-[200px]">
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {completionPercentage()}%
                    </div>
                    <div className="text-sm text-slate-500 font-medium">Completion</div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full"
                      style={{ width: `${completionPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Sidebar - Steps Guide */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Writing Steps
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'title', label: 'Title', icon: FileText },
                    { id: 'category', label: 'Category', icon: Tag },
                    { id: 'image', label: 'Cover Image', icon: ImageIcon },
                    { id: 'excerpt', label: 'Excerpt', icon: AlignLeft },
                    { id: 'content', label: 'Content', icon: FileText },
                  ].map((step, index) => (
                    <div 
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        isFieldComplete(step.id) 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isFieldComplete(step.id) 
                          ? 'bg-green-500 text-white' 
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {isFieldComplete(step.id) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <step.icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          isFieldComplete(step.id) ? 'text-green-900' : 'text-slate-600'
                        }`}>
                          {step.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-9">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Title Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Blog Title</h2>
                      <p className="text-sm text-slate-500">Create an engaging headline</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    onFocus={() => setActiveSection('title')}
                    onBlur={() => setActiveSection(null)}
                    placeholder="Enter your compelling title here..."
                    className={`w-full px-5 py-4 text-lg border-2 rounded-xl outline-none transition-all duration-300 ${
                      activeSection === 'title' 
                        ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    required
                  />
                </div>

                {/* Category & Cover Image */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Category */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-purple-100 rounded-lg">
                        <Tag className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Category</h2>
                        <p className="text-sm text-slate-500">Select topic area</p>
                      </div>
                    </div>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onFocus={() => setActiveSection('category')}
                      onBlur={() => setActiveSection(null)}
                      className={`w-full px-5 py-4 border-2 rounded-xl outline-none transition-all duration-300 bg-white ${
                        activeSection === 'category' 
                          ? 'border-purple-500 bg-purple-50/50 shadow-lg shadow-purple-100' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      required
                    >
                      <option value="">Choose a category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cover Image */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-indigo-100 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Cover Image</h2>
                        <p className="text-sm text-slate-500">Optional visual</p>
                      </div>
                    </div>
                    
                    {!imagePreviewUrl ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300 group"
                      >
                        <div className="p-3 bg-slate-100 rounded-full group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 group-hover:text-indigo-600">
                          Click to upload image
                        </span>
                      </button>
                    ) : (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-slate-200 group">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={removeImage}
                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all duration-300 shadow-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
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

                {/* Excerpt */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-teal-100 rounded-lg">
                      <AlignLeft className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Brief Summary</h2>
                      <p className="text-sm text-slate-500">Short excerpt for preview (150-200 characters recommended)</p>
                    </div>
                  </div>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    onFocus={() => setActiveSection('excerpt')}
                    onBlur={() => setActiveSection(null)}
                    rows={3}
                    placeholder="Write a compelling summary that captures the essence of your blog post..."
                    className={`w-full px-5 py-4 border-2 rounded-xl outline-none transition-all duration-300 resize-none ${
                      activeSection === 'excerpt' 
                        ? 'border-teal-500 bg-teal-50/50 shadow-lg shadow-teal-100' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    required
                  />
                  <div className="mt-2 flex justify-between items-center text-xs text-slate-400">
                    <span>Keep it concise and engaging</span>
                    <span>{formData.excerpt.length} characters</span>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-orange-100 rounded-lg">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Main Content</h2>
                        <p className="text-sm text-slate-500">Write your blog post (HTML supported)</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">
                      {formData.content.split(/\s+/).filter(w => w).length} words
                    </div>
                  </div>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    onFocus={() => setActiveSection('content')}
                    onBlur={() => setActiveSection(null)}
                    rows={16}
                    placeholder="Start writing your blog content here... You can use HTML tags for formatting."
                    className={`w-full px-5 py-4 border-2 rounded-xl outline-none transition-all duration-300 font-mono text-sm resize-none ${
                      activeSection === 'content' 
                        ? 'border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-100' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    required
                  />
                </div>

                {/* Tags & Meta */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-pink-100 rounded-lg">
                        <Tag className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Tags</h2>
                        <p className="text-sm text-slate-500">Comma-separated keywords</p>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="wellness, therapy, mindfulness"
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl outline-none hover:border-slate-300 focus:border-pink-500 focus:bg-pink-50/50 transition-all duration-300"
                    />
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-cyan-100 rounded-lg">
                        <FileText className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">SEO Description</h2>
                        <p className="text-sm text-slate-500">Optional meta description</p>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      placeholder="Brief description for search engines"
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl outline-none hover:border-slate-300 focus:border-cyan-500 focus:bg-cyan-50/50 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 hover:shadow-lg transition-all duration-300"
                  >
                    <Eye className="w-5 h-5" />
                    {showPreview ? "Hide Preview" : "Preview Post"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Publish Blog Post
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Preview Section */}
              {showPreview && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                      <div className="flex items-center gap-3 text-white">
                        <Eye className="w-6 h-6" />
                        <h3 className="text-2xl font-bold">Live Preview</h3>
                      </div>
                    </div>
                    
                    <div className="p-8 lg:p-12">
                      {imagePreviewUrl && (
                        <div className="mb-8 -mx-8 lg:-mx-12">
                          <img
                            src={imagePreviewUrl}
                            alt="Cover"
                            className="w-full h-80 object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="max-w-4xl mx-auto">
                        {formData.category && (
                          <div className="mb-4">
                            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                              {categories.find(c => c.value === formData.category)?.label || formData.category}
                            </span>
                          </div>
                        )}
                        
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                          {formData.title || "Untitled Post"}
                        </h1>
                        
                        {formData.excerpt && (
                          <p className="text-xl text-slate-600 mb-8 leading-relaxed border-l-4 border-blue-500 pl-6 italic">
                            {formData.excerpt}
                          </p>
                        )}
                        
                        <div
                          className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
                          dangerouslySetInnerHTML={{
                            __html: renderPreviewContent(formData.content),
                          }}
                        />
                        
                        {formData.tags && (
                          <div className="mt-12 pt-8 border-t border-slate-200">
                            <div className="flex flex-wrap gap-2">
                              {formData.tags.split(',').map((tag, idx) => (
                                <span 
                                  key={idx}
                                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                                >
                                  #{tag.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}