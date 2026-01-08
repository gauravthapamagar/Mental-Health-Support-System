// app/blog/[slug]/page.tsx
import { blogAPI } from "@/lib/api/blog";
import { BlogPost } from "@/lib/types/blog";
import BlogDetailClient from "@/components/blog/BlogDetailClient";
import Header from "@/components/Header";
import { notFound } from "next/navigation";

// ✅ Metadata with awaited params
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  try {
    const blog = await blogAPI.getBlogBySlug(params.slug);
    return {
      title: `${blog.title} | Smart Mental Health Platform`,
      description: blog.meta_description || blog.excerpt,
      openGraph: {
        images: [blog.cover_image],
      },
    };
  } catch (error) {
    return { title: "Blog Post | Smart Mental Health Platform" };
  }
}

export default async function BlogDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ Unwrap params
  const { slug } = await props.params;

  try {
    // 1. Fetch main blog post
    // Note: This API call triggers 'views_count += 1' in your Django backend
    const blog: BlogPost = await blogAPI.getBlogBySlug(slug);

    if (!blog) notFound();

    // 2. Fetch related posts from the same category
    const relatedBlogsData = await blogAPI.getAllBlogs({
      category: blog.category,
      page_size: 4,
    });

    const relatedPosts = (relatedBlogsData.results || [])
      .filter((post: BlogPost) => post.id !== blog.id)
      .slice(0, 3);

    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pt-20 lg:pt-20">
          <BlogDetailClient blog={blog} relatedPosts={relatedPosts} />
        </main>
      </>
    );
  } catch (error) {
    console.error("Error fetching blog details:", error);
    notFound();
  }
}
