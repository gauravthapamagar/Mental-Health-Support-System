"use client";
import React, { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  Video,
  Clock,
  Calendar,
  Sparkles,
  Eye,
} from "lucide-react";
import AppointmentDetailModal from "./AppointmentDetailModal";

interface UpcomingAppointmentsProps {
  therapistId?: number;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ therapistId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await bookingAPI.getTherapistAppointments(activeTab);
      let results = data.results || [];

      if (activeTab === 'pending') {
        results = results.filter((apt: any) => apt.status?.toLowerCase() === 'pending');
      } else if (activeTab === 'upcoming') {
        results = results.filter((apt: any) => 
          apt.status?.toLowerCase() === 'confirmed' || apt.status?.toLowerCase() === 'pending'
        );
      }
      
      setAppointments(results);
    } catch (error) {
      console.error("Error fetching appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    const meeting_link = `https://meet.carepair.com/${Math.random().toString(36).substring(7)}`;
    try {
      await bookingAPI.confirmAppointment(id, {
        meeting_link,
        therapist_notes: "Looking forward to our session.",
      });
      fetchAppointments();
    } catch (error) {
      console.error("Confirmation failed", error);
    }
  };

  const tabs = [
    { id: "upcoming", label: "Upcoming", color: "blue" },
    { id: "pending", label: "Pending", color: "amber" },
    { id: "history", label: "History", color: "slate" },
  ];

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden relative">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Header */}
        <div className="relative z-10 p-8 border-b border-gray-100 bg-gradient-to-r from-white/50 to-blue-50/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                Session Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">Organize and track your healing sessions</p>
            </div>
            
            {/* Enhanced Tabs */}
            <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-md border border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                      tab.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      tab.color === 'amber' ? 'from-amber-500 to-amber-600' :
                      'from-slate-500 to-slate-600'
                    } rounded-xl`}></div>
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full animate-pulse opacity-40"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading sessions...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full blur-2xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-teal-500 p-6 rounded-full">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No sessions scheduled</h3>
              <p className="text-gray-500">Your calendar is clear for this period.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt: any, index) => (
                <div
                  key={apt.id}
                  className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-blue-200 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Enhanced Avatar */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                          {apt.patient?.full_name?.charAt(0) || "P"}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {apt.patient?.full_name || "Anonymous Patient"}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                              apt.status === "confirmed"
                                ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                                : apt.status === "pending" 
                                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                          <span className="flex items-center gap-2 font-medium">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {apt.appointment_date}
                          </span>
                          <span className="flex items-center gap-2 font-medium">
                            <Clock className="w-4 h-4 text-teal-500" />
                            {apt.start_time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center flex-wrap">
                      {/* View Details Button */}
                      <button
                        onClick={() => setSelectedAppointmentId(apt.id)}
                        className="flex items-center px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:border-blue-300 hover:bg-blue-50 transition-all group/btn"
                      >
                        <Eye size={16} className="mr-2 group-hover/btn:text-blue-600 transition-colors" />
                        View
                      </button>

                      {apt.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleConfirm(apt.id)}
                            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <CheckCircle size={16} className="mr-2" />
                            Confirm
                          </button>
                          <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <XCircle size={20} />
                          </button>
                        </>
                      )}

                      {apt.status === "confirmed" && (
                        <button className="flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                          <Video size={16} className="mr-2" />
                          Start Session
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailModal
          appointmentId={selectedAppointmentId}
          onClose={() => setSelectedAppointmentId(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default UpcomingAppointments;