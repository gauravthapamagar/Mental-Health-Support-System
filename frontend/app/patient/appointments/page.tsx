import AppointmentCard from "@/components/patient/appointments/AppointmentCard";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";

export default function AppointmentsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appointments</h1>
          <p className="text-gray-600">Manage your therapy sessions</p>
        </div>
        <Link
          href="/patient/therapists"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Book New Appointment
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
          Upcoming
        </button>
        <button className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900">
          Past
        </button>
        <button className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900">
          Cancelled
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <AppointmentCard
          id="1"
          therapist="Dr. Sarah Johnson"
          title="Clinical Psychologist"
          date="Dec 30, 2025"
          time="02:00 PM"
          format="Video Call"
          matchScore={98}
          sentiment="Anxious"
        />

        <AppointmentCard
          id="2"
          therapist="Counsellor David Chen"
          title="CBT Specialist"
          date="Jan 05, 2026"
          time="11:30 AM"
          format="In-Person"
          matchScore={85}
          sentiment="Stable"
        />
      </div>

      {/* Empty State (if no appointments) */}
      {/* <div className="text-center py-16">
        <Calendar className="mx-auto mb-4 text-gray-400" size={64} />
        <h3 className="text-xl font-bold mb-2">No upcoming appointments</h3>
        <p className="text-gray-600 mb-6">Book your first session with a therapist</p>
        <Link
          href="/patient/therapists"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Find a Therapist
        </Link>
      </div> */}
    </div>
  );
}
