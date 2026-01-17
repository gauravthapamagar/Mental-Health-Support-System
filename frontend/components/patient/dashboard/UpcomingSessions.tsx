import { Video, MapPin, RefreshCw, X } from "lucide-react";
import Link from "next/link";

interface Session {
  id: string;
  therapist: string;
  title: string;
  type: "video" | "in-person" | "phone";
  date: string;
  time: string;
  matchScore: number;
  lastSentiment: string;
  avatar: string;
}

function SessionCard({ session }: { session: Session }) {
  return (
    <div className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-blue-600 text-lg">
            {session.avatar}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg mb-1">{session.therapist}</div>
          <div className="text-sm text-gray-600 mb-1">
            {session.title} •{" "}
            {session.type === "video"
              ? "Video Call"
              : session.type === "in-person"
                ? "In-Person"
                : "Phone Call"}
          </div>
          <div className="text-sm text-gray-500">
            Last Session Sentiment: {session.lastSentiment}
          </div>
        </div>

        <div className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex-shrink-0">
          {session.matchScore}% Match
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <div className="text-right">
          <div className="font-bold text-lg">{session.date}</div>
          <div className="text-sm text-gray-600">{session.time}</div>
        </div>

        <div className="flex gap-2">
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Reschedule"
          >
            <RefreshCw size={20} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Cancel"
          >
            <X size={20} />
          </button>
        </div>

        <Link
          href={`/patient/appointments/${session.id}`}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          Session Details
        </Link>
      </div>
    </div>
  );
}

export default function UpcomingSessions() {
  const sessions: Session[] = [
    {
      id: "1",
      therapist: "Dr. Sarah Johnson",
      title: "Clinical Psychologist",
      type: "video",
      date: "Dec 30, 2025",
      time: "02:00 PM",
      matchScore: 98,
      lastSentiment: "Anxious",
      avatar: "SJ",
    },
    {
      id: "2",
      therapist: "Counsellor David Chen",
      title: "CBT Specialist",
      type: "in-person",
      date: "Jan 05, 2026",
      time: "11:30 AM",
      matchScore: 85,
      lastSentiment: "Stable",
      avatar: "DC",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Upcoming Sessions</h2>
        <Link
          href="/patient/appointments"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          View History
        </Link>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No upcoming sessions</p>
          <Link
            href="/patient/therapists"
            className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Book an Appointment
          </Link>
        </div>
      )}
    </div>
  );
}
