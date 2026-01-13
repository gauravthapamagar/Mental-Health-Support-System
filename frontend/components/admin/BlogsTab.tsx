"use client";
import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const BlogsTab = () => {
  const [blogs, setBlogs] = useState([]);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const fetchBlogs = async () => {
      const endpoint = status === "pending" ? "/blog/pending/list/" : "/blog/";
      const res = await adminApiCall(endpoint);
      if (res?.ok) setBlogs(res.data.results || res.data);
    };
    fetchBlogs();
  }, [status]);

  const handleApprove = async (id: number) => {
    const res = await adminApiCall(`/blog/approve/${id}/`, {
      method: "POST",
      body: JSON.stringify({ action: "approve" }),
    });
    if (res?.ok) alert("Blog Published!");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Blog Management</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="pending">Pending</option>
          <option value="published">Published</option>
        </select>
      </div>
      <div className="space-y-4">
        {blogs.map((blog: any) => (
          <div
            key={blog.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {blog.excerpt}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                By {blog.author?.full_name}
              </span>
              <div className="flex space-x-2">
                {status === "pending" && (
                  <button
                    onClick={() => handleApprove(blog.id)}
                    className="text-green-600 hover:bg-green-50 p-2 rounded"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}
                <button className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                  <Eye size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsTab;
