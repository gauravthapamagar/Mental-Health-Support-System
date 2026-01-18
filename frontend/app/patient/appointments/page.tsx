// import AppointmentCard from "@/components/patient/appointments/AppointmentCard";
// import { Calendar, Plus } from "lucide-react";
// import Link from "next/link";

// export default function AppointmentsPage() {
//   return (
//     <div>
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold mb-2">Appointments</h1>
//           <p className="text-gray-600">Manage your therapy sessions</p>
//         </div>
//         <Link
//           href="/patient/therapists"
//           className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           <Plus size={20} />
//           Book New Appointment
//         </Link>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-4 mb-6 border-b border-gray-200">
//         <button className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
//           Upcoming
//         </button>
//         <button className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900">
//           Past
//         </button>
//         <button className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900">
//           Cancelled
//         </button>
//       </div>

//       {/* Appointments List */}
//       <div className="space-y-4">
//         <AppointmentCard
//           id="1"
//           therapist="Dr. Sarah Johnson"
//           title="Clinical Psychologist"
//           date="Dec 30, 2025"
//           time="02:00 PM"
//           format="Video Call"
//           matchScore={98}
//           sentiment="Anxious"
//         />

//         <AppointmentCard
//           id="2"
//           therapist="Counsellor David Chen"
//           title="CBT Specialist"
//           date="Jan 05, 2026"
//           time="11:30 AM"
//           format="In-Person"
//           matchScore={85}
//           sentiment="Stable"
//         />
//       </div>

//       {/* Empty State (if no appointments) */}
//       {/* <div className="text-center py-16">
//         <Calendar className="mx-auto mb-4 text-gray-400" size={64} />
//         <h3 className="text-xl font-bold mb-2">No upcoming appointments</h3>
//         <p className="text-gray-600 mb-6">Book your first session with a therapist</p>
//         <Link
//           href="/patient/therapists"
//           className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           <Plus size={20} />
//           Find a Therapist
//         </Link>
//       </div> */}
//     </div>
//   );
// }




"use client";
import { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import AppointmentCard from "@/components/patient/appointments/AppointmentCard";
// ... icons ...

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  const fetchAppointments = async () => {
    try {
      const data = await bookingAPI.getMyAppointments(activeTab);
      // Django pagination returns { results: [...] }
      setAppointments(data.results || []);
    } catch (error) {
      console.error("Failed to fetch", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  return (
    <div>
      {/* ... header and tabs ... */}
      
      <div className="space-y-4">
        {appointments.map((app: any) => (
          <div key={app.id} className="relative">
            {app.status === 'pending' && (
              <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Pending Confirmation
              </span>
            )}
            <AppointmentCard
              id={app.id}
              therapist={app.therapist.full_name}
              title={app.therapist.profession}
              date={app.appointment_date}
              time={app.start_time}
              format={app.appointment_type_label}
              matchScore={90} // Hardcoded or from backend
              sentiment="Stable"
            />
          </div>
        ))}
      </div>
    </div>
  );
}