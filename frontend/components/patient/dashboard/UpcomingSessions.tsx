import { Video, MapPin, RefreshCw, X } from "lucide-react";
import Link from "next/link";



interface UpcomingSessionsProps {
  appointments: any[];
}

function SessionCard({ session }: { session: any }) {
  const therapistName = session.therapist?.full_name || "Unknown Therapist";
  const initials = therapistName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);
  const profession = session.therapist?.therapist_profile?.profession_type || "Therapist";
  
  // Format date and time
  const dateObj = new Date(`${session.appointment_date}T${session.start_time}`);
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-blue-600 text-lg">
            {initials}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg mb-1">{therapistName}</div>
          <div className="text-sm text-gray-600 mb-1">
            {profession} • Video Call
          </div>
          <div className="text-sm text-gray-500">
             Status: <span className="capitalize text-green-600 font-medium">{session.status}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <div className="text-right">
          <div className="font-bold text-lg">{dateStr}</div>
          <div className="text-sm text-gray-600">{timeStr}</div>
        </div>

        <Link
          href={`/patient/appointments/${session.id}`}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          Details
        </Link>
      </div>
    </div>
  );
}

export default function UpcomingSessions({ appointments }: UpcomingSessionsProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Upcoming Sessions</h2>
        <Link
          href="/patient/appointments"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {appointments.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No upcoming sessions</p>
          <Link
            href="/patient/find-therapist"
            className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Find a Therapist
          </Link>
        </div>
      )}
    </div>
  );
}
