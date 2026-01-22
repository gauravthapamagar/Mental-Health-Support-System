"use client";
import { useEffect, useState, useCallback } from "react";
import { bookingAPI } from "@/lib/api";
import AppointmentCard from "@/components/patient/appointments/AppointmentCard";
import { Calendar, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingAPI.getMyAppointments(activeTab);
      setAppointments(data.results || []);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600">
            View and manage your scheduled therapy
          </p>
        </div>
        <Link
          href="/patient/therapists"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-semibold"
        >
          <Plus size={20} />
          Book New Appointment
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
        {["upcoming", "past", "cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-gray-500 animate-pulse">Loading Appointments...</p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid gap-4">
          {appointments.map((app: any) => (
            <AppointmentCard
              key={app.id}
              id={app.id}
              therapist={app.therapist?.full_name || "Specialist"}
              title={app.therapist?.profession || "Mental Health Professional"}
              date={app.appointment_date}
              time={app.start_time}
              format={app.session_mode === "online" ? "video" : "in-person"}
              matchScore={95}
              status={activeTab as any}
              onRefresh={fetchAppointments} // Pass refresh trigger
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No {activeTab} appointments
          </h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            You don't have any appointments in this category at the moment.
          </p>
          <Link
            href="/patient/therapists"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Browse Therapists
          </Link>
        </div>
      )}
    </div>
  );
}
