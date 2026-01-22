import React, { useState } from "react";
import { Clock, Video, MapPin, MoreVertical, Phone } from "lucide-react";

interface UpcomingAppointmentsProps {
  therapistId?: number;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  therapistId,
}) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const appointments = [
    {
      id: 1,
      patient: "John Doe",
      time: "10:00 AM",
      duration: "50 min",
      type: "online",
      status: "confirmed",
      avatar: "JD",
      condition: "Anxiety",
      sessionNumber: 5,
    },
    {
      id: 2,
      patient: "Jane Smith",
      time: "11:30 AM",
      duration: "50 min",
      type: "offline",
      status: "confirmed",
      avatar: "JS",
      condition: "Depression",
      sessionNumber: 12,
    },
    {
      id: 3,
      patient: "Mike Johnson",
      time: "2:00 PM",
      duration: "50 min",
      type: "online",
      status: "pending",
      avatar: "MJ",
      condition: "PTSD",
      sessionNumber: 3,
    },
  ];

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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Upcoming Appointments
        </h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>
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
                  {appointment.avatar}
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
                    {appointment.patient}
                  </h3>
                  {getStatusBadge(appointment.status)}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {appointment.time}
                  </span>
                  <span>•</span>
                  <span>{appointment.duration}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {appointment.type === "online" ? (
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
                  {appointment.condition} • Session #{appointment.sessionNumber}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {appointment.type === "online" && (
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md">
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
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
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

      {/* Empty State (if no appointments) */}
      {appointments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No appointments today</p>
          <p className="text-sm text-gray-400 mt-1">
            Your schedule is clear for today
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointments;
