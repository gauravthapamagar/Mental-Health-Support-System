import { CheckCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

interface CarePlanItem {
  id: string;
  title: string;
  description: string;
  frequency: string;
  source: "ai" | "therapist";
  completed?: boolean;
}

function CarePlanCard({ item }: { item: CarePlanItem }) {
  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-base">{item.title}</div>
        <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
          {item.source === "ai"
            ? "AI Companion Suggestion"
            : "Therapist Assigned"}
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-3">
        {item.description} — {item.frequency}
      </div>
      {item.source === "ai" && !item.completed && (
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <CheckCircle size={18} />
          Mark Complete
        </button>
      )}
    </div>
  );
}

export default function CarePlan() {
  const carePlanItems: CarePlanItem[] = [
    {
      id: "1",
      title: "Guided Mindfulness",
      description: "Anxiety Management",
      frequency: "10 mins • Daily",
      source: "ai",
    },
    {
      id: "2",
      title: "Cognitive Reframing Journal",
      description: "Self-Reflection",
      frequency: "Evening • 3x Week",
      source: "therapist",
    },
    {
      id: "3",
      title: "Deep Breathing Exercise",
      description: "Stress Management",
      frequency: "5 mins • Twice Daily",
      source: "ai",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Personalized Care Plan</h2>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
          AI UPDATED
        </span>
      </div>

      <div className="space-y-4 mb-6">
        {carePlanItems.map((item) => (
          <CarePlanCard key={item.id} item={item} />
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Link
          href="/patient/care-plan"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          View Full Care Plan
        </Link>
      </div>
    </div>
  );
}
