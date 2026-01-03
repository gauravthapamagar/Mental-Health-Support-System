import {
  Video,
  MapPin,
  MoreVertical,
  RefreshCw,
  XCircle,
  Zap,
} from "lucide-react";

const appointments = [
  {
    therapist: "Dr. Sarah Johnson",
    specialty: "Clinical Psychologist",
    date: "Dec 30, 2025",
    time: "02:00 PM",
    type: "Video Call",
    matchScore: 98,
    lastSentiment: "Anxious", // From Sentiment Analysis feature
  },
  {
    therapist: "Counsellor David Chen",
    specialty: "CBT Specialist",
    date: "Jan 05, 2026",
    time: "11:30 AM",
    type: "In-Person",
    matchScore: 85,
    lastSentiment: "Stable",
  },
];

export default function UpcomingTherapySessions() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800">Upcoming Sessions</h3>
          <p className="text-[11px] text-slate-500 font-medium italic">
            Managed by AI Match & Scheduling
          </p>
        </div>
        <button className="text-sm text-indigo-600 font-semibold hover:text-indigo-700">
          View History
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {appointments.map((app, i) => (
          <div
            key={i}
            className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors"
          >
            {/* Therapist Info & Match Score */}
            <div className="flex gap-4">
              <div className="relative h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                {app.therapist.charAt(0)}
                <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                  {app.type === "Video Call" ? (
                    <Video size={14} className="text-blue-500" />
                  ) : (
                    <MapPin size={14} className="text-emerald-500" />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{app.therapist}</p>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">
                    <Zap size={10} fill="currentColor" /> {app.matchScore}%
                    Match
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {app.specialty} •{" "}
                  <span className="text-indigo-600">{app.type}</span>
                </p>
                <p className="text-[10px] mt-1 text-slate-400 font-medium">
                  Last Session Sentiment:{" "}
                  <span className="text-slate-600">{app.lastSentiment}</span>
                </p>
              </div>
            </div>

            {/* Date/Time & Actions */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
              <div className="lg:text-right border-l-2 lg:border-l-0 lg:border-r-2 border-indigo-100 px-3">
                <p className="text-sm font-bold text-slate-900">{app.date}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase">
                  {app.time}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Reschedule/Cancel/Details Actions */}
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors title='Reschedule'">
                  <RefreshCw size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors title='Cancel'">
                  <XCircle size={18} />
                </button>
                <button className="ml-2 px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-sm">
                  Session Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
