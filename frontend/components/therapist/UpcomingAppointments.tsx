import React from "react";
import { Clock, Video, MapPin } from "lucide-react";

const UpcomingAppointments = () => {
  const appointments = [
    {
      id: 1,
      patient: "John Doe",
      time: "10:00 AM",
      duration: "50 min",
      type: "online",
      status: "confirmed",
    },
    {
      id: 2,
      patient: "Jane Smith",
      time: "11:30 AM",
      duration: "50 min",
      type: "offline",
      status: "confirmed",
    },
    {
      id: 3,
      patient: "Mike Johnson",
      time: "2:00 PM",
      duration: "50 min",
      type: "online",
      status: "pending",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Upcoming Appointments
      </h2>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {appointment.patient.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {appointment.patient}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
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
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Start Session
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingAppointments;
