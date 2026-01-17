import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookmarkPlus, Share2 } from "lucide-react";

// This would fetch from your API/database
async function getArticle(id: string) {
  // Replace with actual data fetching
  return {
    id,
    title: "Understanding Anxiety Triggers",
    category: "Anxiety Management",
    readTime: "5 min",
    content: `
      <p>Anxiety is a natural response to stress, but understanding what triggers it can help you manage it more effectively...</p>
      <h2>Common Anxiety Triggers</h2>
      <p>Several factors can trigger anxiety episodes...</p>
    `,
    author: "Dr. Sarah Jenkins",
    publishedDate: "Dec 15, 2025",
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/patient/articles"
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Articles
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="mb-6">
          <span className="text-xs font-medium text-blue-600 uppercase">
            {article.category}
          </span>
          <h1 className="text-4xl font-bold mt-2 mb-4">{article.title}</h1>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              By {article.author} • {article.publishedDate} • {article.readTime}{" "}
              read
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <BookmarkPlus size={18} />
                Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">Want to practice what you learned?</h3>
          <p className="text-sm text-gray-700 mb-4">
            Generate flashcards from this article to reinforce key concepts
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Generate Flashcards
          </button>
        </div>
      </div>
    </div>
  );
}
