import { Sparkles, CheckCircle2, MessageCircleQuestion } from "lucide-react";

export default function TherapeuticActionPlan() {
  const activities = [
    {
      title: "Guided Mindfulness",
      type: "Anxiety Management",
      frequency: "10 mins • Daily",
      source: "AI Companion Suggestion",
    },
    {
      title: "Cognitive Reframing Journal",
      type: "Self-Reflection",
      frequency: "Evening • 3x Week",
      source: "Therapist Assigned",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-600" /> Personalized Care
          Plan
        </h3>
        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase tracking-tighter">
          AI Updated
        </span>
      </div>

      <div className="space-y-4">
        {activities.map((item, i) => (
          <div
            key={i}
            className="group p-4 bg-slate-50 hover:bg-white hover:ring-1 hover:ring-indigo-100 rounded-xl border border-slate-100 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {item.type} —{" "}
                  <span className="font-medium text-slate-700">
                    {item.frequency}
                  </span>
                </p>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {item.source}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                <CheckCircle2 size={14} /> Mark Complete
              </button>
              <button className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                <MessageCircleQuestion size={14} /> Ask AI Companion
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-slate-400 text-center italic">
        "Summaries are based on recent sentiment analysis feedback."
      </p>
    </div>
  );
}
