import Link from "next/link";
import { LucideIcon, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  questions: number;
  icon: LucideIcon;
  iconColor: string;
  lastTaken?: string;
  lastScore?: string;
  recommendedBy?: string;
  estimatedTime?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}

export default function QuizCard({
  id,
  title,
  description,
  questions,
  icon: Icon,
  iconColor,
  lastTaken,
  lastScore,
  recommendedBy,
  estimatedTime = `${Math.ceil(questions * 0.5)} min`,
  difficulty = "Easy",
}: QuizCardProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Hard":
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor.replace("text-", "bg-").replace("600", "100")}`}
            >
              <Icon className={iconColor} size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor()}`}
                >
                  {difficulty}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600 font-medium">
                  {questions} questions
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">{description}</p>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{estimatedTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="space-y-3 mb-4 flex-1">
        {lastTaken && lastScore && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-blue-600" />
              <span className="text-sm font-bold text-blue-900">
                Last Assessment
              </span>
            </div>
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Score: {lastScore}</div>
              <div className="text-xs text-blue-600">Taken on {lastTaken}</div>
            </div>
          </div>
        )}

        {recommendedBy && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={18} className="text-purple-600" />
              <span className="text-sm font-bold text-purple-900">
                Recommended
              </span>
            </div>
            <div className="text-sm text-purple-800">By {recommendedBy}</div>
          </div>
        )}

        {!lastTaken && !recommendedBy && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              Take this assessment to track your progress
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Link
        href={`/patient/quizzes/${id}`}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium flex items-center justify-center gap-2"
      >
        {lastTaken ? "Retake Quiz" : "Take Quiz"}
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
}
