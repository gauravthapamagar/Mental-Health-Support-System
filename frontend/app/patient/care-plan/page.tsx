import ActivityCard from "@/components/patient/care-plan/ActivityCard";
import { Star, TrendingUp, Target, MessageSquare, X } from "lucide-react";

export default function CarePlanPage() {
  const activities = [
    {
      id: "1",
      title: "Guided Mindfulness Meditation",
      description:
        "Practice daily mindfulness to reduce anxiety and improve focus",
      frequency: "Daily",
      duration: "10 minutes",
      type: "mindfulness" as const,
      source: "ai" as const,
      status: "active" as const,
      progress: 75,
    },
    {
      id: "2",
      title: "Cognitive Reframing Journal",
      description:
        "Write about anxious thoughts and practice reframing them positively",
      frequency: "3x per week",
      duration: "15 minutes",
      type: "journal" as const,
      source: "therapist" as const,
      status: "active" as const,
      assignedBy: "Dr. Sarah Johnson",
      progress: 60,
    },
    {
      id: "3",
      title: "Deep Breathing Exercise",
      description: "Box breathing technique for acute stress management",
      frequency: "Twice daily",
      duration: "5 minutes",
      type: "mindfulness" as const,
      source: "ai" as const,
      status: "active" as const,
      progress: 85,
    },
    {
      id: "4",
      title: "Weekly Therapy Session",
      description: "Individual CBT session with your therapist",
      frequency: "Weekly",
      duration: "50 minutes",
      type: "therapy" as const,
      source: "therapist" as const,
      status: "active" as const,
      assignedBy: "Dr. Sarah Johnson",
    },
    {
      id: "5",
      title: "Morning Walk",
      description: "Light physical activity to boost mood and reduce stress",
      frequency: "5x per week",
      duration: "20 minutes",
      type: "exercise" as const,
      source: "ai" as const,
      status: "completed" as const,
      progress: 100,
    },
    {
      id: "6",
      title: "Gratitude Journaling",
      description: "Write three things you're grateful for each day",
      frequency: "Daily",
      duration: "5 minutes",
      type: "journal" as const,
      source: "ai" as const,
      status: "active" as const,
      progress: 45,
    },
  ];

  const activeActivities = activities.filter((a) => a.status === "active");
  const completedActivities = activities.filter(
    (a) => a.status === "completed"
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Personalized Care Plan</h1>
        <p className="text-gray-600">
          Your customized path to better mental health
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="text-blue-600" size={20} />
            </div>
            <div className="text-gray-600 font-medium">Active Activities</div>
          </div>
          <div className="text-3xl font-bold">{activeActivities.length}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div className="text-gray-600 font-medium">Completed Today</div>
          </div>
          <div className="text-3xl font-bold">3</div>
          <div className="text-sm text-green-600 font-medium mt-1">
            Great job!
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div className="text-gray-600 font-medium">Overall Progress</div>
          </div>
          <div className="text-3xl font-bold">73%</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="text-yellow-600" size={20} />
            </div>
            <div className="text-gray-600 font-medium">Current Streak</div>
          </div>
          <div className="text-3xl font-bold">12</div>
          <div className="text-sm text-gray-600 mt-1">Days</div>
        </div>
      </div>

      {/* Active Activities */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Active Activities</h2>
        <div className="space-y-4">
          {activeActivities.map((activity) => (
            <ActivityCard key={activity.id} {...activity} />
          ))}
        </div>
      </div>

      {/* Completed Activities */}
      {completedActivities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Recently Completed</h2>
          <div className="space-y-4">
            {completedActivities.map((activity) => (
              <ActivityCard key={activity.id} {...activity} />
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquare className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">AI Companion Suggestion</h3>
            <p className="text-sm text-gray-700 mb-4">
              Based on your recent progress, consider adding a progressive
              muscle relaxation exercise to your evening routine. This could
              help improve your sleep quality and reduce physical tension from
              stress.
            </p>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                Add to Plan
              </button>
              <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-white font-medium transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-bold text-lg mb-4">This Week's Goals</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                5/7
              </div>
              <span className="font-medium">
                Complete all mindfulness sessions
              </span>
            </div>
            <div className="text-sm text-gray-600">71% complete</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3/3
              </div>
              <span className="font-medium">Attend all therapy sessions</span>
            </div>
            <div className="text-sm text-green-600 font-medium">✓ Complete</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2/3
              </div>
              <span className="font-medium">Journal entries this week</span>
            </div>
            <div className="text-sm text-gray-600">67% complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}
