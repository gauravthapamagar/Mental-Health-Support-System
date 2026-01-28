import React, { useState, useEffect } from "react";
import {
  Clock,
  Video,
  MapPin,
  MoreVertical,
  Phone,
  Calendar,
} from "lucide-react";
import { bookingAPI } from "@/lib/api";

interface Patient {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
}

interface Appointment {
  id: number;
  patient: Patient;
  appointment_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  appointment_type: string;
  appointment_type_label: string;
  status: string;
  status_label: string;
  session_mode: string;
  meeting_link?: string;
  reason_for_visit?: string;
  is_upcoming: boolean;
  can_cancel: boolean;
}

interface UpcomingAppointmentsProps {
  therapistId?: number;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  therapistId,
}) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch upcoming appointments from the API
      const data = await bookingAPI.getTherapistAppointments("upcoming");

      // Get only the first 3 upcoming appointments
      const upcomingAppts = (data.results || []).slice(0, 3);
      setAppointments(upcomingAppts);
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "confirmed") {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          Confirmed
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
        Pending
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (time: string) => {
    // Convert 24h time to 12h format
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleStartSession = (appointment: Appointment) => {
    if (appointment.meeting_link) {
      window.open(appointment.meeting_link, "_blank");
    } else {
      alert("Meeting link not available yet");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Upcoming Appointments
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Upcoming Appointments
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchUpcomingAppointments}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Upcoming Appointments
        </h2>
        <button
          onClick={() => (window.location.href = "/therapist/appointments")}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No appointments today</p>
          <p className="text-sm text-gray-400 mt-1">
            Your schedule is clear for today
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="group relative flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                    {getInitials(appointment.patient.full_name)}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      appointment.status === "confirmed"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                </div>

                {/* Patient Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {appointment.patient.full_name}
                    </h3>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(appointment.start_time)}
                    </span>
                    <span>•</span>
                    <span>{appointment.duration_minutes} min</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {appointment.session_mode === "online" ? (
                        <>
                          <Video className="w-4 h-4" /> Online
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" /> In-person
                        </>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {appointment.appointment_type_label} • Session
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {appointment.session_mode === "online" && (
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleStartSession(appointment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                >
                  Start Session
                </button>
                <button
                  onClick={() =>
                    setActiveMenu(
                      activeMenu === appointment.id ? null : appointment.id,
                    )
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {activeMenu === appointment.id && (
                  <div className="absolute right-4 top-16 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                    <button
                      onClick={() =>
                        (window.location.href = `/therapist/appointments/${appointment.id}`)
                      }
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Reschedule
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointments;
