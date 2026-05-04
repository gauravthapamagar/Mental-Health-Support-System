import { Calendar, Brain, Heart, MessageCircle, Sparkles } from "lucide-react";

const stats = [
  {
    label: "Next Therapy Session",
    value: "Dec 30, 02:00 PM",
    icon: Calendar,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    description: "Dr. Sarah Jenkins",
  },
  {
    label: "AI Match Compatibility",
    value: "94% Match Score",
    icon: Sparkles,
    color: "text-blue-600",
    bg: "bg-blue-50",
    description: "Based on Similarity Score",
  },
  {
    label: "Recent Mood Sentiment",
    value: "Primarily Positive",
    icon: Brain,
    color: "text-teal-600",
    bg: "bg-teal-50",
    description: "Analysis from last response",
  },
  {
    label: "AI Companion Insights",
    value: "3 New Summaries",
    icon: MessageCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    description: "Feedback only • No Diagnosis",
  },
];

export default function PatientStatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-3"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-slate-900 leading-tight">
                {stat.value}
              </p>
            </div>
          </div>

          {/* Detailed description text to show off the AI features */}
          <div className="pt-2 border-t border-slate-50">
            <p className="text-[11px] text-slate-400 font-medium italic">
              {stat.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
