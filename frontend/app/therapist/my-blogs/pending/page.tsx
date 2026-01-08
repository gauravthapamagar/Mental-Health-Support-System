"use client";
import { useEffect, useState } from "react";
import { Clock, ArrowLeft, AlertCircle } from "lucide-react";
import { blogAPI } from "@/lib/api/blog";
import { BlogPost } from "@/lib/types/blog";
import Header from "@/components/Header";

export default function PendingBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        // Specifically filter for pending status
        const response = await blogAPI.getMyBlogs("pending");
        setBlogs(response.results || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <a
            href="/therapist/my-blogs"
            className="flex items-center gap-2 text-slate-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Blogs
          </a>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Pending Approval
              </h1>
              <p className="text-slate-600">
                These posts are being reviewed by our editorial team.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">Loading...</div>
          ) : blogs.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed text-center">
              <p className="text-slate-500">No pending posts at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white p-6 rounded-xl border border-slate-200 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Submitted on{" "}
                      {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-4 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-100">
                    In Review
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
