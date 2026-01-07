import {
  Calendar,
  User,
  CheckCircle,
  Clock,
  Share2,
  Bookmark,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

// Mock blog post data
const blogPost = {
  id: 1,
  title: "Breaking Mental Health Stigma with AI-Powered Support",
  category: "Mental Health",
  image:
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=600&fit=crop",
  author: "Dr. Sarah Williams",
  authorImage:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  date: "15 December 2024",
  readTime: "8 min read",
  approved: "Clinical Team",
  content: `
    <h2>Understanding Mental Health in the Digital Age</h2>
    <p>Mental health awareness has grown significantly in recent years, yet stigma remains a major barrier preventing people from seeking help. According to recent studies, nearly 60% of people with mental health conditions don't receive treatment, often due to fear of judgment or lack of access to care.</p>
    
    <h2>The Role of AI in Breaking Down Barriers</h2>
    <p>Artificial Intelligence is revolutionizing mental healthcare by providing innovative solutions that address traditional barriers. AI-powered platforms can offer:</p>
    <ul>
      <li>24/7 availability for immediate support</li>
      <li>Anonymous assessment tools that reduce stigma</li>
      <li>Personalized matching with therapists based on compatibility</li>
      <li>Data-driven insights for better treatment outcomes</li>
    </ul>
    
    <h2>How Smart Matching Works</h2>
    <p>Our platform uses advanced AI algorithms to analyze multiple factors including personality traits, communication preferences, therapeutic needs, and past experiences. This ensures that patients are connected with therapists who truly understand their unique situation.</p>
    
    <blockquote>"The integration of AI in mental healthcare isn't about replacing human connection—it's about enhancing it and making it more accessible to everyone who needs it."</blockquote>
    
    <h2>Real Impact on Patient Care</h2>
    <p>Studies show that patients matched with therapists using AI-driven compatibility assessments report 40% higher satisfaction rates and better treatment outcomes. The technology helps eliminate the trial-and-error process that often discourages people from continuing therapy.</p>
    
    <h2>Looking Forward</h2>
    <p>As technology continues to evolve, we're committed to using innovation to make mental healthcare more accessible, effective, and stigma-free. The future of mental health support lies in the perfect balance between human empathy and technological efficiency.</p>
  `,
  tags: ["Mental Health", "AI Technology", "Stigma", "Healthcare Innovation"],
};

const relatedPosts = [
  {
    id: 2,
    title: "How AI Matching Connects You with the Right Therapist",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop",
    category: "Technology",
  },
  {
    id: 3,
    title: "Understanding Your Mental Health Assessment Results",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
    category: "Wellness",
  },
  {
    id: 4,
    title: "5 Signs You Should Consider Therapy",
    image:
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop",
    category: "Mental Health",
  },
];

export default function BlogPostDetail() {
  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={blogPost.image}
          alt={blogPost.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-6 pb-12">
            <span className="inline-block px-4 py-2 bg-white text-blue-600 rounded-full text-sm font-bold mb-4">
              {blogPost.category}
            </span>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              {blogPost.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white">
              <div className="flex items-center gap-3">
                <img
                  src={blogPost.authorImage}
                  alt={blogPost.author}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <span className="font-medium">{blogPost.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{blogPost.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blogPost.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Approved by {blogPost.approved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
              style={{
                lineHeight: "1.8",
              }}
            />

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-12 p-8 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100">
              <div className="flex gap-6">
                <img
                  src={blogPost.authorImage}
                  alt={blogPost.author}
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    About {blogPost.author}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Clinical Psychologist with 15+ years of experience in mental
                    health care. Passionate about leveraging technology to make
                    therapy more accessible and effective.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-8 space-y-6">
              {/* Share Buttons */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  Share this article
                </h3>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="px-4 py-2 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                    <Bookmark className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Table of Contents */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  In this article
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Understanding Mental Health
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      The Role of AI
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      How Smart Matching Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Real Impact on Care
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Related Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white text-blue-600 rounded-full text-xs font-bold">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .prose h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
        }
        .prose p {
          color: #475569;
          margin-bottom: 1.5rem;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .prose li {
          color: #475569;
          margin-bottom: 0.75rem;
        }
        .prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #1e293b;
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
}
