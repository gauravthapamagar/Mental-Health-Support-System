// lib/api/blog.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const getAuthHeaders = (isFormData: boolean = false) => {
  if (typeof window === "undefined")
    return { "Content-Type": "application/json" };
  const token = localStorage.getItem("access_token");

  return {
    // FIX: If it's FormData, do NOT set Content-Type. Browser sets it automatically.
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const blogAPI = {
  // ============= PUBLIC ENDPOINTS =============
  getAllBlogs: async (params?: any) => {
    // Ensure params is an object and remove undefined values
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined),
        )
      : {};

    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = `${API_BASE}/blog/${queryParams ? `?${queryParams}` : ""}`;

    console.log("Fetching blogs from:", url); // This will show in your terminal/console

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend Error:", errorText);
      throw new Error("Failed to fetch blogs");
    }
    return response.json();
  },

  getBlogBySlug: async (slug: string) => {
    // Matches: path('<slug:slug>/', views.BlogPostDetailView.as_view())
    const response = await fetch(`${API_BASE}/blog/${slug}/`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch blog");
    return response.json();
  },
  getBlogDetail: (slug: string) => blogAPI.getBlogBySlug(slug),
  getCategories: async () => {
    // Matches: path('categories/list/', views.blog_categories)
    const response = await fetch(`${API_BASE}/blog/categories/list/`, {
      cache: "force-cache",
    });
    return response.json();
  },

  // ============= THERAPIST ENDPOINTS =============
  createBlog: async (blogData: any) => {
    // FIX: Detect if we are sending FormData
    const isFormData = blogData instanceof FormData;

    const response = await fetch(`${API_BASE}/blog/create/`, {
      method: "POST",
      headers: getAuthHeaders(isFormData),
      // FIX: Do NOT stringify FormData. Send it as is.
      body: isFormData ? blogData : JSON.stringify(blogData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // This will help you see if it's a validation error (e.g., "title is required")
      // or a permission error.
      const errorMessage =
        typeof errorData === "object"
          ? JSON.stringify(errorData)
          : errorData.detail || errorData.error || "Failed to create blog";

      throw new Error(errorMessage);
    }

    return response.json();
  },
  getMyBlogs: async (status?: string) => {
    // Matches: path('my-posts/', views.my_blog_posts)
    const params = status ? `?status=${status}` : "";
    const response = await fetch(`${API_BASE}/blog/my-posts/${params}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  updateBlog: async (slug: string, updates: any) => {
    // Matches: path('update/<slug:slug>/', views.update_blog_post)
    const isFormData = updates instanceof FormData;
    const response = await fetch(`${API_BASE}/blog/update/${slug}/`, {
      method: "PATCH",
      headers: getAuthHeaders(isFormData),
      body: isFormData ? updates : JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
    return response.json();
  },

  deleteBlog: async (slug: string) => {
    // Matches: path('delete/<slug:slug>/', views.delete_blog_post)
    const response = await fetch(`${API_BASE}/blog/delete/${slug}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getMyStats: async () => {
    // Matches: path('stats/me/', views.my_blog_stats)
    const response = await fetch(`${API_BASE}/blog/stats/me/`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // ============= APPROVAL ENDPOINTS =============
  getPendingBlogs: async () => {
    // Matches: path('pending/list/', views.pending_blog_posts)
    const response = await fetch(`${API_BASE}/blog/pending/list/`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  reviewBlog: async (
    blogId: number,
    action: "approve" | "reject",
    reason?: string,
  ) => {
    // Matches: path('approve/<int:blog_id>/', views.approve_reject_blog)
    const response = await fetch(`${API_BASE}/blog/approve/${blogId}/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, rejection_reason: reason }),
    });
    return response.json();
  },
  toggleLike: async (slug: string) => {
    // UPDATED: 'like' comes before the slug to match your Django urls.py
    const response = await fetch(`${API_BASE}/blog/like/${slug}/`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("401: Unauthorized");
      throw new Error(`Failed to toggle like: ${response.status}`);
    }
    return response.json();
  },

  addComment: async (slug: string, content: string) => {
    // UPDATED: 'comment' comes before the slug to match your Django urls.py
    const response = await fetch(`${API_BASE}/blog/comment/${slug}/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("401: Unauthorized");
      throw new Error(`Failed to add comment: ${response.status}`);
    }
    return response.json();
  },
  // Add this inside the blogAPI object in lib/api/blog.ts
  getRecommendations: async () => {
    const response = await fetch(`${API_BASE}/blog/recommendations/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      // If user is new or unauthorized, return empty array instead of crashing
      return [];
    }
    return response.json();
  },
};
