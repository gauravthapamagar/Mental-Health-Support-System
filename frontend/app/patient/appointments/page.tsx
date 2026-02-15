"use client";
import { useEffect, useState, useCallback } from "react";
import { bookingAPI, paymentAPI } from "@/lib/api";
import AppointmentCard from "@/components/patient/appointments/AppointmentCard";
import SessionProgressCard from "@/components/patient/SessionProgressCard";
import {
  Calendar,
  Plus,
  Loader2,
  Timer,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [sessionReports, setSessionReports] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [payingAppointmentId, setPayingAppointmentId] = useState<number | null>(null);
  const [tabCounts, setTabCounts] = useState({
    pending: 0,
    pay_now: 0,
    upcoming: 0,
    past: 0,
    cancelled: 0,
  });

  // Fetch appointments based on active tab
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      
      if (activeTab === "pending") {
        const upcomingData = await bookingAPI.getMyAppointments("upcoming");
        const pendingAppts = (upcomingData.results || []).filter(
          (apt: any) => apt.status === "pending"
        );
        setAppointments(pendingAppts);
      } else if (activeTab === "pay_now") {
        const upcomingData = await bookingAPI.getMyAppointments("upcoming");
        const awaitingPayment = (upcomingData.results || []).filter(
          (apt: any) => apt.status === "awaiting_payment"
        );
        setAppointments(awaitingPayment);
      } else if (activeTab === "upcoming") {
        const upcomingData = await bookingAPI.getMyAppointments("upcoming");
        const confirmedUpcoming = (upcomingData.results || []).filter((apt: any) => {
          if (apt.status !== "confirmed") return false;
          const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
          return appointmentDateTime > now;
        });
        setAppointments(confirmedUpcoming);
      } else if (activeTab === "past") {
        try {
          const pastData = await bookingAPI.getMyAppointments("past");
          const pastAppts = pastData.results || pastData || [];
          setAppointments(pastAppts);
        } catch (error) {
          const upcomingData = await bookingAPI.getMyAppointments("upcoming").catch(() => ({ results: [] }));
          const allUpcoming = upcomingData.results || [];
          
          const completedAppts = allUpcoming.filter((apt: any) => {
            if (apt.status !== "confirmed" && apt.status !== "completed") return false;
            const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
            return appointmentDateTime <= now;
          });
          
          setAppointments(completedAppts);
        }
      } else if (activeTab === "cancelled") {
        const cancelledData = await bookingAPI.getMyAppointments("cancelled");
        const cancelledAppts = (cancelledData.results || []).filter(
          (apt: any) => apt.status === "cancelled"
        );
        setAppointments(cancelledAppts);
      } else {
        const data = await bookingAPI.getMyAppointments(activeTab);
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
      const [upcomingData, cancelledData] = await Promise.all([
        bookingAPI.getMyAppointments("upcoming").catch(() => ({ results: [] })),
        bookingAPI.getMyAppointments("cancelled").catch(() => ({ results: [] })),
      ]);

      const allUpcoming = upcomingData.results || [];
      const allCancelled = cancelledData.results || [];
      const now = new Date();

      const pendingCount = allUpcoming.filter(
        (apt: any) => apt.status === "pending"
      ).length;

      const payNowCount = allUpcoming.filter(
        (apt: any) => apt.status === "awaiting_payment"
      ).length;

      const upcomingCount = allUpcoming.filter((apt: any) => {
        if (apt.status !== "confirmed") return false;
        const appointmentDateTime = new Date(
          `${apt.appointment_date}T${apt.start_time}`
        );
        return appointmentDateTime > now;
      }).length;

      let completedCount = 0;
      try {
        const pastData = await bookingAPI.getMyAppointments("past");
        const pastAppts = pastData.results || pastData || [];
        completedCount = pastAppts.length;
      } catch (error) {
        const completedFromUpcoming = allUpcoming.filter((apt: any) => {
          if (apt.status !== "confirmed" && apt.status !== "completed") return false;
          const appointmentDateTime = new Date(
            `${apt.appointment_date}T${apt.start_time}`
          );
          return appointmentDateTime <= now;
        }).length;
        completedCount = completedFromUpcoming;
      }

      const cancelledCount = allCancelled.filter(
        (apt: any) => apt.status === "cancelled"
      ).length;

      setTabCounts({
        pending: pendingCount,
        pay_now: payNowCount,
        upcoming: upcomingCount,
        past: completedCount,
        cancelled: cancelledCount,
      });
    } catch (error) {
      console.error("Failed to fetch tab counts", error);
    }
  }, []);

  // Fetch patient's shared session reports
  const fetchSessionReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const response = await bookingAPI.getPatientProgress();
      const reports = response.results || response || [];
      const visibleReports = reports.filter((r: any) => r.patient_visible === true);
      setSessionReports(visibleReports);
    } catch (error) {
      console.error("Failed to fetch session reports", error);
      setSessionReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // ✅ REMOVED AUTO-REFRESH POLLING
  // Only fetch on component mount and when tab changes
  useEffect(() => {
    fetchAppointments();
    fetchTabCounts();
    fetchSessionReports();
  }, [fetchAppointments, fetchTabCounts, fetchSessionReports]);

  const refreshAppointments = () => {
    fetchAppointments();
    fetchTabCounts();
  };

  // Handle Khalti payment
  const handlePayNow = async (appointmentId: number) => {
    setPayingAppointmentId(appointmentId);
    try {
      console.log("[AppointmentsPage] Initiating payment for appointment:", appointmentId);
      const response = await paymentAPI.initiatePayment(appointmentId);
      console.log("[AppointmentsPage] Payment response:", response);
      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        console.error("[AppointmentsPage] No payment_url in response:", response);
        toast.error("Invalid payment response from server");
      }
    } catch (error: any) {
      console.error("[AppointmentsPage] Payment failed:", error);
      toast.error(error.response?.data?.detail || "Failed to initiate payment. Check backend.");
    } finally {
      setPayingAppointmentId(null);
    }
  };

  // Tab configuration
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
      id: "pay_now",
      label: "Pay Now",
      icon: CreditCard,
      color: "purple",
      activeColor: "bg-purple-500",
      textColor: "text-purple-600",
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
      label: "Completed",
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

  // Status mapping
  const getAppointmentStatus = (
    apt: any
  ): "pending" | "awaiting_payment" | "upcoming" | "completed" | "cancelled" | "confirmed" => {
    if (apt.status === "pending") return "pending";
    if (apt.status === "awaiting_payment") return "awaiting_payment";
    if (apt.status === "cancelled") return "cancelled";

    if (apt.status === "confirmed") {
      const now = new Date();
      const appointmentDateTime = new Date(
        `${apt.appointment_date}T${apt.start_time}`
      );
      return appointmentDateTime <= now ? "completed" : "upcoming";
    }

    return apt.status as any;
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
        <div className="flex gap-3">
          <button
            onClick={refreshAppointments}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-sm font-semibold disabled:opacity-60"
          >
            <Loader2 size={20} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link
            href="/patient/therapists"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-semibold"
          >
            <Plus size={20} />
            Book New Appointment
          </Link>
        </div>
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
                className={
                  activeTab === tab.id ? tab.textColor : "text-gray-400"
                }
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
              <h4 className="font-bold text-amber-900 mb-1">
                Awaiting Therapist Confirmation
              </h4>
              <p className="text-sm text-amber-800">
                Your therapist is reviewing your appointment request. You will
                receive a notification once they confirm your booking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pay Now Tab Info Banner */}
      {activeTab === "pay_now" && appointments.length > 0 && (
        <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold text-purple-900 mb-1">
                Payment Required
              </h4>
              <p className="text-sm text-purple-800">
                Your therapist has confirmed these appointments. Please complete
                payment to finalize your booking. Online consultations require
                payment before the session.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-gray-500 animate-pulse">
            Loading Appointments...
          </p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid gap-4">
          {appointments.map((app: any) => (
            <AppointmentCard
              key={app.id}
              id={app.id.toString()}
              therapist={app.therapist?.full_name || "Specialist"}
              title={
                app.therapist?.profession || "Mental Health Professional"
              }
              date={app.appointment_date}
              time={app.start_time}
              format={app.session_mode === "online" ? "video" : "in-person"}
              matchScore={app.match_score || 95}
              status={getAppointmentStatus(app)}
              notes={app.patient_notes}
              onRefresh={refreshAppointments}
              consultationFee={
                app.therapist?.consultation_fees ||
                app.therapist_profile?.consultation_fees ||
                app.consultation_fee ||
                app.therapist?.profile?.consultation_fees
              }
              onPayNow={() => handlePayNow(app.id)}
              isPaymentLoading={payingAppointmentId === app.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              activeTab === "pending"
                ? "bg-amber-50"
                : activeTab === "pay_now"
                  ? "bg-purple-50"
                  : activeTab === "upcoming"
                    ? "bg-blue-50"
                    : activeTab === "past"
                      ? "bg-green-50"
                      : "bg-red-50"
            }`}
          >
            {(() => {
              const Icon =
                tabs.find((t) => t.id === activeTab)?.icon || Calendar;
              return (
                <Icon
                  className={
                    tabs.find((t) => t.id === activeTab)?.textColor ||
                    "text-gray-400"
                  }
                  size={32}
                />
              );
            })()}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No {activeTab === "pay_now" ? "payments pending" : `${activeTab} appointments`}
          </h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            {activeTab === "pending" &&
              "You don't have any pending appointment requests."}
            {activeTab === "pay_now" &&
              "No appointments are awaiting payment right now."}
            {activeTab === "upcoming" &&
              "You don't have any upcoming appointments scheduled."}
            {activeTab === "past" &&
              "You haven't completed any sessions yet."}
            {activeTab === "cancelled" &&
              "You don't have any cancelled appointments."}
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

      {/* Session Progress Reports Section */}
      {sessionReports.length > 0 && (
        <div className="mt-16 pt-12 border-t-2 border-slate-200">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Your Progress</h2>
                <p className="text-slate-600 mt-1">Session reports shared by your therapist</p>
              </div>
            </div>
          </div>

          {reportsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-slate-500 animate-pulse">Loading your progress...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessionReports.map((report: any) => (
                <SessionProgressCard
                  key={report.id}
                  report={report}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}