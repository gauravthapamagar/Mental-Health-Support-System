"use client";
import React, { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import Header from "@/components/Header"; // Import your header
import {
  CheckCircle,
  XCircle,
  Video,
  Clock,
  Calendar,
  MoreVertical,
  Plus,
} from "lucide-react";

const TherapistAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  // 1. Add activeTab to the dependency array so it re-fetches when you click tabs
  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true); // Start loading
    try {
      // 2. Pass the activeTab as a filter to your backend
      const data = await bookingAPI.getTherapistAppointments(activeTab);

      // 3. Access .results because the backend is paginated
      setAppointments(data.results || []);
    } catch (error) {
      console.error("Error fetching appointments", error);
    } finally {
      setLoading(false); // 4. CRITICAL: Turn off loading state
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
    <>
      <Header />
      {/* pt-20 pushes content down from the fixed header */}
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Session Management
              </h1>
              <p className="text-slate-600">
                Review and manage your upcoming patient sessions
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              <Plus className="w-5 h-5" />
              Set Availability
            </button>
          </div>

          {/* Filter Tabs - Matches Blog Dashboard Style */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {["upcoming", "pending", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading your schedule...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No appointments found
              </h3>
              <p className="text-slate-600">
                Your schedule for this section is currently empty.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((apt: any) => (
                <div
                  key={apt.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-6">
                    {/* Patient Avatar Initials */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-100">
                      {apt.patient?.full_name?.charAt(0) || "P"}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-xl">
                          {apt.patient?.full_name || "Anonymous Patient"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            apt.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {apt.status_label || apt.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-600" />
                          {apt.appointment_date}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock size={16} className="text-blue-600" />
                          {apt.start_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {apt.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleConfirm(apt.id)}
                          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                        >
                          <CheckCircle size={18} className="mr-2" /> Confirm
                        </button>
                        <button className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200">
                          <XCircle size={22} />
                        </button>
                      </>
                    )}

                    {apt.status === "confirmed" && (
                      <button className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition shadow-lg shadow-green-100">
                        <Video size={18} className="mr-2" /> Start Session
                      </button>
                    )}

                    <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition border border-slate-200">
                      <MoreVertical size={22} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default TherapistAppointments;
