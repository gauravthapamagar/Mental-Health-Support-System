"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import Header from "@/components/Header";
import SessionReportModal from "@/components/therapist/SessionReportModal";
import AppointmentDetailModal from "@/components/therapist/AppointmentDetailModal";
import {
  CheckCircle,
  XCircle,
  Video,
  Clock,
  Calendar,
  Plus,
  Eye,
  Sparkles,
  Filter,
  AlertTriangle,
} from "lucide-react";

const TherapistAppointments = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAppointmentId, setDetailAppointmentId] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportAppointmentId, setReportAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const filterAppointments = (data: any[]) => {
    const now = new Date();
    const filtered = data.filter((apt: any) => {
      if (apt.status === "cancelled") {
        return false;
      }
      if (activeTab === "pending") {
        return apt.status === "pending";
      } else if (activeTab === "upcoming") {
        const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
        // Include both confirmed AND awaiting_payment in upcoming for therapist view
        return (apt.status === "confirmed" || apt.status === "awaiting_payment") && appointmentDateTime > now;
      } else if (activeTab === "confirmed") {
        // Show all confirmed appointments regardless of date
        return apt.status === "confirmed";
      } else if (activeTab === "history") {
        const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
        // Show only completed appointments in history
        return apt.status === "completed" && appointmentDateTime <= now;
      }
      return false;
    });

    // Sort appointments based on the active tab
    return filtered.sort((a: any, b: any) => {
      if (activeTab === "pending") {
        // For pending: newest requests first (sort by created_at or id descending)
        // If you have a created_at field, use that. Otherwise, use id as a proxy
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        // Fallback to ID if created_at doesn't exist (higher ID = more recent)
        return (b.id || 0) - (a.id || 0);
      } else if (activeTab === "upcoming" || activeTab === "confirmed") {
        // For upcoming and confirmed: earliest appointment first (sort by date and time ascending)
        const dateTimeA = new Date(`${a.appointment_date}T${a.start_time}`).getTime();
        const dateTimeB = new Date(`${b.appointment_date}T${b.start_time}`).getTime();
        return dateTimeA - dateTimeB;
      } else if (activeTab === "history") {
        // For history: most recent sessions first (sort by date and time descending)
        const dateTimeA = new Date(`${a.appointment_date}T${a.start_time}`).getTime();
        const dateTimeB = new Date(`${b.appointment_date}T${b.start_time}`).getTime();
        return dateTimeB - dateTimeA;
      }

      return 0;
    });
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await bookingAPI.getTherapistAppointments(activeTab);
      const allAppointments = data.results || [];
      const filteredAppointments = filterAppointments(allAppointments);
      setAppointments(filteredAppointments);
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

  const canCancelAppointment = (appointmentDate: string, startTime: string): boolean => {
    try {
      const appointmentDateTime = new Date(`${appointmentDate}T${startTime}`);
      const currentTime = new Date();
      const timeDifference = appointmentDateTime.getTime() - currentTime.getTime();
      const hoursRemaining = timeDifference / (1000 * 60 * 60);
      return hoursRemaining > 24;
    } catch (error) {
      console.error("Error calculating time difference:", error);
      return false;
    }
  };

  const openCancelModal = (id: number) => {
    setSelectedAppointmentId(id);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const openDetailModal = (id: number) => {
    setDetailAppointmentId(id);
    setShowDetailModal(true);
  };

  const handleWriteReport = (id: number) => {
    setReportAppointmentId(id);
    setShowReportModal(true);
  };

  const handleReportSubmitted = () => {
    setShowReportModal(false);
    setReportAppointmentId(null);
    fetchAppointments();
  };

  const handleCancel = async () => {
    const selectedAppointment = appointments.find((apt: any) => apt.id === selectedAppointmentId);

    if (!selectedAppointment) {
      alert("Appointment not found.");
      return;
    }

    if (!canCancelAppointment(selectedAppointment.appointment_date, selectedAppointment.start_time)) {
      alert("You can only cancel appointments that are more than 24 hours away.");
      return;
    }

    if (!cancelReason.trim() || cancelReason.trim().length < 10) {
      alert("Cancellation reason must be at least 10 characters.");
      return;
    }

    setCancelLoading(true);
    try {
      await bookingAPI.cancelAppointment(selectedAppointmentId!, cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedAppointmentId(null);
      fetchAppointments();
    } catch (err: any) {
      let errorMsg = "Failed to cancel appointment. Please try again.";
      const responseData = err.response?.data;

      if (responseData?.cancellation_reason) {
        errorMsg = Array.isArray(responseData.cancellation_reason)
          ? responseData.cancellation_reason[0]
          : responseData.cancellation_reason;
      } else if (responseData?.error) {
        errorMsg = responseData.error;
      } else if (responseData?.detail) {
        errorMsg = responseData.detail;
      }

      alert(errorMsg);
    } finally {
      setCancelLoading(false);
    }
  };

  const tabs = [
    { id: "upcoming", label: "Upcoming", color: "blue", count: appointments.length },
    { id: "confirmed", label: "Confirmed", color: "teal", count: appointments.length },
    { id: "pending", label: "Pending", color: "amber", count: appointments.length },
    { id: "history", label: "History", color: "slate", count: appointments.length },
  ];

  return (
    <>
      <Header />

      <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl shadow-lg animate-float">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-teal-600 to-cyan-700 bg-clip-text text-transparent">
                    All Sessions
                  </h1>
                </div>
                <p className="text-gray-600 text-lg ml-14">
                  Manage and review all your patient sessions in one place
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/therapist/session-reports")}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Eye className="w-5 h-5" />
                  View Reports
                </button>
                <button
                  onClick={() => router.push("/therapist/profile")}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Set Availability
                </button>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8 animate-slide-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50 inline-flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {activeTab === tab.id && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        tab.color === "blue"
                          ? "from-blue-500 to-blue-600"
                          : tab.color === "amber"
                          ? "from-amber-500 to-amber-600"
                          : "from-slate-500 to-slate-600"
                      } rounded-xl`}
                    ></div>
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs font-bold">
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full animate-pulse opacity-40"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full animate-spin"></div>
                <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <p className="text-gray-600 font-medium text-lg">Loading your schedule...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 animate-scale-in">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full blur-2xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-teal-500 p-6 rounded-full">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">Your schedule for this section is currently empty.</p>
            </div>
          ) : (
            <div className="grid gap-5 animate-slide-up animation-delay-200">
              {appointments.map((apt: any, index) => (
                <div
                  key={apt.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-transparent hover:border-blue-200 hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-5 flex-1">
                      {/* Enhanced Patient Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform">
                          {apt.patient?.full_name?.charAt(0) || "P"}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-xl">
                            {apt.patient?.full_name || "Anonymous Patient"}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                              apt.status === "confirmed"
                                ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                                : "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
                            }`}
                          >
                            {apt.status_label || apt.status}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                              apt.session_mode === "online"
                                ? "bg-gradient-to-r from-purple-400 to-blue-400 text-white"
                                : "bg-gradient-to-r from-orange-400 to-red-400 text-white"
                            }`}
                          >
                            {apt.session_mode === "online" ? "Online" : "In-Person"}
                          </span>
                          {apt.has_survey && (
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 text-xs rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                              <CheckCircle size={14} />
                              Assessment
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm font-medium text-gray-600 flex-wrap">
                          <span className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500" />
                            {apt.appointment_date}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock size={16} className="text-teal-500" />
                            {apt.start_time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* View Details Button */}
                      <button
                        onClick={() => openDetailModal(apt.id)}
                        className="flex items-center px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:border-blue-300 hover:bg-blue-50 transition-all group/btn"
                      >
                        <Eye size={18} className="mr-2 group-hover/btn:text-blue-600 transition-colors" />
                        View Details
                      </button>

                      {apt.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleConfirm(apt.id)}
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <CheckCircle size={18} className="mr-2" />
                            Confirm
                          </button>
                          <button
                            onClick={() => openCancelModal(apt.id)}
                            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-2 border-gray-200"
                          >
                            <XCircle size={22} />
                          </button>
                        </>
                      )}

                      {apt.status === "completed" && (
                        <>
                          {/* Write Report Button for History Tab */}
                          {activeTab === "history" && (
                            <button
                              onClick={() => handleWriteReport(apt.id)}
                              className="flex items-center px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <Sparkles size={18} className="mr-2" />
                              Write Report
                            </button>
                          )}
                          
                          <div className="relative group/cancel">
                            <button
                              onClick={() => {
                                if (canCancelAppointment(apt.appointment_date, apt.start_time)) {
                                  openCancelModal(apt.id);
                                }
                              }}
                              disabled={!canCancelAppointment(apt.appointment_date, apt.start_time)}
                              className={`p-3 rounded-xl transition-all border-2 ${
                                canCancelAppointment(apt.appointment_date, apt.start_time)
                                  ? "text-gray-400 hover:text-red-600 hover:bg-red-50 border-gray-200 cursor-pointer"
                                  : "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                              }`}
                              title={
                                canCancelAppointment(apt.appointment_date, apt.start_time)
                                  ? "Cancel appointment"
                                  : "Cannot cancel within 24 hours of appointment"
                              }
                            >
                              <XCircle size={22} />
                            </button>
                            {!canCancelAppointment(apt.appointment_date, apt.start_time) && (
                              <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-900 text-white text-xs rounded-xl whitespace-nowrap opacity-0 group-hover/cancel:opacity-100 transition-opacity pointer-events-none shadow-xl">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle size={14} />
                                  Cannot cancel within 24 hours
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ──────────────────────────────────────────────── */}
        {/*             Modals moved outside z-10             */}
        {/* ──────────────────────────────────────────────── */}

        {/* Detail Modal */}
        {showDetailModal && detailAppointmentId && (
          <AppointmentDetailModal
            appointmentId={detailAppointmentId}
            onClose={() => {
              setShowDetailModal(false);
              setDetailAppointmentId(null);
            }}
            onConfirm={handleConfirm}
          />
        )}

        {/* Session Report Modal */}
        {showReportModal && reportAppointmentId && 
          (() => {
            const apt = appointments.find((a: any) => a.id === reportAppointmentId);
            return apt ? (
              <SessionReportModal
                isOpen={showReportModal}
                appointmentId={reportAppointmentId}
                patientName={apt.patient_name || "Patient"}
                appointmentDate={new Date(`${apt.appointment_date}T${apt.start_time}`).toLocaleDateString()}
                onClose={() => {
                  setShowReportModal(false);
                  setReportAppointmentId(null);
                }}
                onSuccess={handleReportSubmitted}
              />
            ) : null;
          })()
        }

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-scale-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Cancel Session</h3>
              </div>

              <p className="text-gray-600 mb-6">
                This action cannot be undone. Please provide a reason for cancellation to notify the patient.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Cancellation Reason</label>
                <textarea
                  placeholder="Why are you cancelling this session?"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  rows={4}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                <p
                  className={`text-xs font-medium mt-2 ${
                    cancelReason.trim().length < 10 && cancelReason.length > 0 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {cancelReason.trim().length}/10 characters minimum
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                    setSelectedAppointmentId(null);
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all"
                >
                  Keep Session
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading || cancelReason.trim().length < 10}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-red-600 font-bold transition-all shadow-lg"
                >
                  {cancelLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    "Cancel Session"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </>
  );
};

export default TherapistAppointments;
