import ArticleCard from "@/components/patient/articles/ArticleCard";
import ArticleFilters from "@/components/patient/articles/ArticleFilters";

export default function ArticlesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recommended Articles</h1>
        <p className="text-gray-600">
          Personalized content based on your progress and interests
        </p>
      </div>

      <ArticleFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Map through articles here */}
        <ArticleCard
          id="1"
          title="Understanding Anxiety Triggers"
          category="Anxiety Management"
          excerpt="Learn how to identify and manage your anxiety triggers effectively..."
          readTime="5 min"
          imageColor="from-blue-400 to-purple-500"
        />
        <ArticleCard
          id="2"
          title="Mindfulness Techniques for Daily Life"
          category="Mindfulness"
          excerpt="Simple practices you can incorporate into your routine..."
          readTime="7 min"
          imageColor="from-green-400 to-teal-500"
        />
        <ArticleCard
          id="3"
          title="Coping with Depression"
          category="Depression"
          excerpt="Evidence-based strategies for managing depressive symptoms..."
          readTime="10 min"
          imageColor="from-purple-400 to-pink-500"
        />
      </div>
    </div>
  );
}
