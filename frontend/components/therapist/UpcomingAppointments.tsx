"use client";
import React, { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  Video,
  Clock,
  Calendar,
  MoreVertical,
} from "lucide-react";

interface UpcomingAppointmentsProps {
  therapistId?: number;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ therapistId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await bookingAPI.getTherapistAppointments(activeTab);
      let results = data.results || [];
      console.log(`[UpcomingAppointments] Fetched ${results.length} results for tab: ${activeTab}`);

      // Client-side filtering safety net
      if (activeTab === 'pending') {
        results = results.filter((apt: any) => apt.status?.toLowerCase() === 'pending');
      } else if (activeTab === 'upcoming') {
        results = results.filter((apt: any) => 
          apt.status?.toLowerCase() === 'confirmed' || apt.status?.toLowerCase() === 'pending'
        );
      }
      
      console.log(`[UpcomingAppointments] After filtering: ${results.length} results`);
      
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Session Management</h2>
          <p className="text-sm text-gray-500">Manage your upcoming sessions</p>
        </div>
        
        {/* Compact Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {["upcoming", "pending", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading schedule...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No appointments found</p>
            <p className="text-xs text-gray-400">Your schedule is empty for this tab.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt: any) => (
              <div
                key={apt.id}
                className="bg-gray-50 rounded-xl p-4 transition-all hover:bg-blue-50/50 border border-transparent hover:border-blue-100"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                     {/* Patient Avatar Initials */}
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-100 shrink-0">
                      {apt.patient?.full_name?.charAt(0) || "P"}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {apt.patient?.full_name || "Anonymous Patient"}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            apt.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : apt.status === "pending" 
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {apt.appointment_date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {apt.start_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {apt.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleConfirm(apt.id)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs hover:bg-blue-700 transition"
                        >
                          <CheckCircle size={14} className="mr-1.5" /> Confirm
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}

                    {apt.status === "confirmed" && (
                      <button className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-xs hover:bg-green-600 transition">
                        <Video size={14} className="mr-1.5" /> Start
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
  );
};

export default UpcomingAppointments;
