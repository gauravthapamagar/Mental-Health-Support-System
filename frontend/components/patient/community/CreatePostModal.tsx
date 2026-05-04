import React, { useState } from "react";
import { communityAPI, CommunityCategory } from "@/lib/api";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface CreatePostModalProps {
  categories: CommunityCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  categories,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    is_anonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: any = {};
    if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    if (formData.content.length < 20) {
      newErrors.content = "Content must be at least 20 characters";
    }
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await communityAPI.createPost({
        title: formData.title,
        content: formData.content,
        category: parseInt(formData.category),
        is_anonymous: formData.is_anonymous,
      });
      toast.success("Post created successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating post:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast.error("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Create a Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="What's on your mind?"
              maxLength={200}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500">
                {formData.title.length}/200 characters (minimum 5)
              </p>
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.content ? "border-red-500" : "border-gray-300"
              }`}
              rows={8}
              placeholder="Share your thoughts, feelings, or experiences..."
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500">
                {formData.content.length} characters (minimum 20)
              </p>
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="bg-blue-50 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={(e) =>
                  setFormData({ ...formData, is_anonymous: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded mt-0.5"
              />
              <div>
                <span className="block text-gray-900 font-medium">
                  Post anonymously
                </span>
                <span className="block text-sm text-gray-600 mt-1">
                  Your name won't be shown to other patients. Therapists may
                  still see your information for moderation purposes.
                </span>
              </div>
            </label>
          </div>

          {/* Guidelines */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Community Guidelines
            </h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Be respectful and supportive to others</li>
              <li>Share your personal experiences, not medical advice</li>
              <li>Avoid sharing identifying information</li>
              <li>Report harmful or inappropriate content</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post to Community</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;