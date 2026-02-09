"use client";
import { useEffect, useState, useCallback } from "react";
import { bookingAPI } from "@/lib/api";
import AppointmentCard from "@/components/patient/appointments/AppointmentCard";
import { Calendar, Plus, Loader2, Timer, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [tabCounts, setTabCounts] = useState({
    pending: 0,
    upcoming: 0,
    past: 0,
    cancelled: 0,
  });

  // Fetch appointments based on active tab
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      
      if (activeTab === "pending") {
        // For pending, we need to fetch and filter by status
        const upcomingData = await bookingAPI.getMyAppointments("upcoming");
        const allUpcoming = upcomingData.results || [];
        // Filter for pending status only
        const pendingAppts = allUpcoming.filter((apt: any) => apt.status === "pending");
        setAppointments(pendingAppts);
      } else if (activeTab === "upcoming") {
        // For upcoming, fetch and exclude pending appointments
        const upcomingData = await bookingAPI.getMyAppointments("upcoming");
        const allUpcoming = upcomingData.results || [];
        // Only show confirmed appointments (exclude pending)
        const confirmedUpcoming = allUpcoming.filter((apt: any) => apt.status === "confirmed");
        setAppointments(confirmedUpcoming);
      } else {
        // For other tabs (past, cancelled), use the API as is
        data = await bookingAPI.getMyAppointments(activeTab);
        setAppointments(data.results || []);
      }
    } catch (error) {
      console.error("Failed to fetch appointments", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch counts for all tabs
  const fetchTabCounts = useCallback(async () => {
    try {
      const [upcomingData, pastData, cancelledData] = await Promise.all([
        bookingAPI.getMyAppointments("upcoming").catch(() => ({ results: [] })),
        bookingAPI.getMyAppointments("past").catch(() => ({ results: [] })),
        bookingAPI.getMyAppointments("cancelled").catch(() => ({ results: [] })),
      ]);

      const allUpcoming = upcomingData.results || [];
      const now = new Date();
      
      // Count pending from upcoming with status "pending"
      const pendingCount = allUpcoming.filter((apt: any) => apt.status === "pending").length;
      
      // Count confirmed upcoming (future dates with status "confirmed")
      const upcomingCount = allUpcoming.filter((apt: any) => {
        if (apt.status !== "confirmed") return false;
        const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
        return appointmentDateTime > now;
      }).length;

      setTabCounts({
        pending: pendingCount,
        upcoming: upcomingCount,
        past: (pastData.results || []).length,
        cancelled: (cancelledData.results || []).length,
      });
    } catch (error) {
      console.error("Failed to fetch tab counts", error);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchTabCounts();
  }, [fetchAppointments, fetchTabCounts]);

  const refreshAppointments = () => {
    fetchAppointments();
    fetchTabCounts();
  };

  // Tab configuration with icons and colors
  const tabs = [
    {
      id: "pending",
      label: "Pending",
      icon: Timer,
      color: "amber",
      activeColor: "bg-amber-500",
      textColor: "text-amber-600",
    },
    {
      id: "upcoming",
      label: "Upcoming",
      icon: Clock,
      color: "blue",
      activeColor: "bg-blue-600",
      textColor: "text-blue-600",
    },
    {
      id: "past",
      label: "Past",
      icon: CheckCircle2,
      color: "green",
      activeColor: "bg-green-600",
      textColor: "text-green-600",
    },
    {
      id: "cancelled",
      label: "Cancelled",
      icon: XCircle,
      color: "red",
      activeColor: "bg-red-600",
      textColor: "text-red-600",
    },
  ];

  // Determine status for AppointmentCard based on appointment data and active tab
  const getAppointmentStatus = (apt: any): "pending" | "upcoming" | "completed" | "cancelled" => {
    if (activeTab === "pending") return "pending";
    if (activeTab === "cancelled") return "cancelled";
    if (activeTab === "past") return "completed";
    if (activeTab === "upcoming") return "upcoming";
    
    // Fallback logic
    if (apt.status === "pending") return "pending";
    if (apt.status === "cancelled") return "cancelled";
    
    const now = new Date();
    const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
    
    if (apt.status === "confirmed") {
      return appointmentDateTime <= now ? "completed" : "upcoming";
    }
    
    return "upcoming";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600">
            View and manage your scheduled therapy sessions
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

      {/* Enhanced Tabs with Icons and Counts */}
      <div className="flex gap-2 mb-8 p-1.5 bg-gray-100 rounded-xl w-fit flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = tabCounts[tab.id as keyof typeof tabCounts];
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-2.5 rounded-lg font-semibold capitalize transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon 
                size={18} 
                className={activeTab === tab.id ? tab.textColor : "text-gray-400"} 
              />
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? `${tab.activeColor} text-white`
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pending Tab Info Banner */}
      {activeTab === "pending" && appointments.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <Timer className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Awaiting Therapist Confirmation</h4>
              <p className="text-sm text-amber-800">
                Your therapist is reviewing your appointment request. You'll receive a notification once they confirm your booking.
              </p>
            </div>
          </div>
        </div>
      )}

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
              id={app.id.toString()}
              therapist={app.therapist?.full_name || "Specialist"}
              title={app.therapist?.profession || "Mental Health Professional"}
              date={app.appointment_date}
              time={app.start_time}
              format={app.session_mode === "online" ? "video" : "in-person"}
              matchScore={app.match_score || 95}
              status={getAppointmentStatus(app)}
              notes={app.patient_notes}
              onRefresh={refreshAppointments}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            activeTab === "pending" ? "bg-amber-50" :
            activeTab === "upcoming" ? "bg-blue-50" :
            activeTab === "past" ? "bg-green-50" :
            "bg-red-50"
          }`}>
            {(() => {
              const Icon = tabs.find(t => t.id === activeTab)?.icon || Calendar;
              return <Icon className={tabs.find(t => t.id === activeTab)?.textColor || "text-gray-400"} size={32} />;
            })()}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No {activeTab} appointments
          </h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            {activeTab === "pending" && "You don't have any pending appointment requests."}
            {activeTab === "upcoming" && "You don't have any upcoming appointments scheduled."}
            {activeTab === "past" && "You haven't completed any sessions yet."}
            {activeTab === "cancelled" && "You don't have any cancelled appointments."}
          </p>
          {(activeTab === "pending" || activeTab === "upcoming") && (
            <Link
              href="/patient/therapists"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold"
            >
              <Plus size={20} />
              Browse Therapists
            </Link>
          )}
        </div>
      )}
    </div>
  );
}