import {
  CheckCircle,
  Clock,
  Calendar,
  MessageSquare,
  LucideIcon,
} from "lucide-react";

interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
  frequency: string;
  duration: string;
  type: "mindfulness" | "exercise" | "therapy" | "journal" | "medication";
  source: "ai" | "therapist";
  status: "active" | "completed" | "pending";
  progress?: number;
  assignedBy?: string;
}

export default function ActivityCard({
  title,
  description,
  frequency,
  duration,
  type,
  source,
  status,
  progress,
  assignedBy,
}: ActivityCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "mindfulness":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "exercise":
        return "bg-green-100 text-green-700 border-green-200";
      case "therapy":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "journal":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "medication":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-bold">{title}</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(type)}`}
            >
              {type}
            </span>
            {source === "ai" && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                AI Suggested
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-3">{description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{frequency}</span>
            </div>
            {assignedBy && (
              <div className="flex items-center gap-1">
                <MessageSquare size={16} />
                <span>By {assignedBy}</span>
              </div>
            )}
          </div>
        </div>

        {status === "active" && (
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
            <CheckCircle size={18} />
            Complete
          </button>
        )}

        {status === "completed" && (
          <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg">
            <CheckCircle size={18} />
            Completed
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
