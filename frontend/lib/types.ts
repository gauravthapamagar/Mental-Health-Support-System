// lib/types/blog.ts

export interface BlogAuthor {
  id: number;
  full_name: string;
  is_verified: boolean;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: BlogAuthor;
  category: string;
  tags: string[];
  cover_image: string;
  status: "draft" | "pending" | "approved" | "rejected" | "published";
  views_count: number;
  likes_count: number;
  reading_time: number;
  published_at: string;
  created_at: string;
  updated_at?: string;
  is_liked: boolean;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  meta_description?: string;
  comments?: BlogComment[];
  comments_count?: number;
}

export interface BlogComment {
  id: number;
  author: BlogAuthor;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPost[];
}

export interface BlogCategory {
  value: string;
  label: string;
}

export interface BlogStats {
  total_posts: number;
  published_posts: number;
  pending_posts: number;
  draft_posts: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
}
