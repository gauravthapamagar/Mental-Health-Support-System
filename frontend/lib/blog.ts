// lib/api/blog.ts

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const blogAPI = {
  getAllBlogs: async (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const res = await fetch(`${API_BASE}/blog/?${queryParams.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch blogs");
    return res.json();
  },

  getCategories: async () => {
    const res = await fetch(`${API_BASE}/blog/categories/list/`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },

  // ============= THERAPIST ENDPOINTS (Auth Required) =============

  // Create new blog post
  createBlog: async (blogData: {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
    cover_image?: string;
    meta_description?: string;
  }) => {
    const response = await fetch(`${API_BASE}/blog/create/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create blog");
    }

    return response.json();
  },

  // Get my blog posts (therapist only)
  getMyBlogs: async (status?: string) => {
    const params = status ? `?status=${status}` : "";
    const response = await fetch(`${API_BASE}/blog/my-posts/${params}`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch your blogs");
    }

    return response.json();
  },

  // Update blog post
  updateBlog: async (
    slug: string,
    updates: Partial<{
      title: string;
      content: string;
      excerpt: string;
      category: string;
      tags: string[];
      cover_image: string;
      meta_description: string;
      status: string;
    }>
  ) => {
    const response = await fetch(`${API_BASE}/blog/update/${slug}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update blog");
    }

    return response.json();
  },

  // Delete blog post
  deleteBlog: async (slug: string) => {
    const response = await fetch(`${API_BASE}/blog/delete/${slug}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete blog");
    }

    return response.json();
  },

  // Get my blog statistics
  getMyStats: async () => {
    const response = await fetch(`${API_BASE}/blog/stats/me/`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch statistics");
    }

    return response.json();
  },

  // ============= APPROVAL ENDPOINTS (Verified Therapists & Admins) =============

  // Get pending blogs for approval
  getPendingBlogs: async () => {
    const response = await fetch(`${API_BASE}/blog/pending/list/`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pending blogs");
    }

    return response.json();
  },

  // Approve or reject a blog
  reviewBlog: async (
    blogId: number,
    action: "approve" | "reject",
    rejectionReason?: string
  ) => {
    const response = await fetch(`${API_BASE}/blog/approve/${blogId}/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action,
        ...(action === "reject" &&
          rejectionReason && { rejection_reason: rejectionReason }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to review blog");
    }

    return response.json();
  },

  // ============= ENGAGEMENT ENDPOINTS (Auth Required) =============

  // Like/Unlike a blog
  toggleLike: async (slug: string) => {
    const response = await fetch(`${API_BASE}/blog/like/${slug}/`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to toggle like");
    }

    return response.json();
  },

  // Add comment to blog
  addComment: async (slug: string, content: string) => {
    const response = await fetch(`${API_BASE}/blog/comment/${slug}/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to add comment");
    }

    return response.json();
  },
};

export default blogAPI;
