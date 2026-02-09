"use client";

import {
  Video,
  MapPin,
  Phone,
  RefreshCw,
  X,
  Calendar,
  Clock,
  Loader2,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";
import { useState } from "react";
import { bookingAPI } from "@/lib/api";

import AppointmentDetailsModal from "./AppointmentDetailsModal";

interface AppointmentCardProps {
  id: string;
  therapist: string;
  title: string;
  date: string;
  time: string;
  format: "video" | "in-person" | "phone";
  matchScore: number;
  sentiment?: string;
  status?: "pending" | "upcoming" | "completed" | "cancelled";
  notes?: string;
  onRefresh?: () => void;
}

export default function AppointmentCard({
  id,
  therapist,
  title,
  date,
  time,
  format,
  matchScore,
  sentiment,
  status = "upcoming",
  notes,
  onRefresh,
}: AppointmentCardProps) {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    reason: "",
  });

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason.");
      return;
    }

    if (cancelReason.trim().length < 10) {
      alert("Cancellation reason must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      console.log("[v0] Sending cancel request with reason:", cancelReason);
      await bookingAPI.cancelAppointment(parseInt(id), cancelReason);
      console.log("[v0] Cancel successful");
      setShowCancelModal(false);
      setCancelReason("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.log("[v0] Cancel error:", err.response?.status, err.response?.data);

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
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      alert("Please select a new date and time.");
      return;
    }
    setLoading(true);
    try {
      // TODO: real reschedule API call when implemented
      alert(`Request sent for ${rescheduleData.date} at ${rescheduleData.time}`);
      setShowRescheduleModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to reschedule.");
    } finally {
      setLoading(false);
    }
  };

  const getFormatIcon = () => {
    switch (format) {
      case "video":
        return <Video size={18} className="text-blue-600" />;
      case "in-person":
        return <MapPin size={18} className="text-green-600" />;
      case "phone":
        return <Phone size={18} className="text-purple-600" />;
    }
  };

  const getFormatLabel = () =>
    format === "video" ? "Video Call" : format === "phone" ? "Phone Call" : "In-Person";

  const getFormatColor = () => {
    switch (format) {
      case "video":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "in-person":
        return "bg-green-50 text-green-700 border-green-200";
      case "phone":
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          label: "Awaiting Confirmation",
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          icon: <Timer size={16} className="text-amber-600" />,
          gradient: "from-amber-400 to-orange-400",
        };
      case "upcoming":
        return {
          label: "Confirmed",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          icon: <CheckCircle2 size={16} className="text-blue-600" />,
          gradient: "from-blue-400 to-cyan-400",
        };
      case "completed":
        return {
          label: "Completed",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          icon: <CheckCircle2 size={16} className="text-green-600" />,
          gradient: "from-green-400 to-emerald-400",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          icon: <XCircle size={16} className="text-red-600" />,
          gradient: "from-red-400 to-pink-400",
        };
      default:
        return {
          label: status,
          bgColor: "bg-slate-50",
          textColor: "text-slate-700",
          borderColor: "border-slate-200",
          icon: null,
          gradient: "from-slate-400 to-slate-500",
        };
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const statusConfig = getStatusConfig();

  return (
    <>
      <div className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusConfig.gradient}`} />
        
        {/* Hover background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Section - Therapist Info */}
            <div className="flex items-start gap-4 flex-1">
              {/* Enhanced Avatar with gradient border */}
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.gradient} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`} />
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl text-white font-bold text-xl group-hover:scale-110 transition-transform">
                  {getInitials(therapist)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {/* Name and Status badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-900">{therapist}</h3>
                  
                  {/* Status Badge */}
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1.5 ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border-2 rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm`}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>

                  {/* Match Score - only for pending/upcoming */}
                  {(status === "pending" || status === "upcoming") && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-2 border-orange-200 rounded-xl text-xs font-bold shadow-sm">
                      {matchScore}% Match
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="text-sm text-slate-600 mb-3 font-medium">{title}</p>

                {/* Date, Time & Format */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Calendar size={16} className="text-blue-600" />
                    </div>
                    <span className="font-semibold">{date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <Clock size={16} className="text-indigo-600" />
                    </div>
                    <span className="font-semibold">{time}</span>
                  </div>
                  
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${getFormatColor()} shadow-sm`}
                  >
                    {getFormatIcon()}
                    <span className="font-semibold text-xs">{getFormatLabel()}</span>
                  </div>
                </div>

                {/* Pending Status Message */}
                {status === "pending" && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 font-medium">
                      Your therapist is reviewing your appointment request. You'll be notified once it's confirmed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3 lg:flex-col lg:items-end">
              {/* PENDING STATUS - Limited Actions */}
              {status === "pending" && (
                <>
                  <button
                    onClick={() => setShowDetailsModal(true)}
                    className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
                  >
                    <Eye size={18} />
                    View Details
                  </button>

                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-2 border-slate-200 hover:border-red-300"
                    title="Cancel Request"
                  >
                    <X size={22} />
                  </button>
                </>
              )}

              {/* UPCOMING STATUS - Full Actions */}
              {status === "upcoming" && (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-2 border-slate-200 hover:border-blue-300"
                      title="Reschedule"
                    >
                      <RefreshCw size={20} />
                    </button>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-2 border-slate-200 hover:border-red-300"
                      title="Cancel"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowDetailsModal(true)}
                    className="w-full lg:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Eye size={18} />
                    Details
                  </button>

                  {format === "video" && (
                    <button className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                      <Video size={18} /> Join Call
                    </button>
                  )}
                </>
              )}

              {/* COMPLETED STATUS */}
              {status === "completed" && (
                <button
                  onClick={() => setShowDetailsModal(true)}
                  className="w-full lg:w-auto px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  Review Session
                </button>
              )}

              {/* CANCELLED STATUS */}
              {status === "cancelled" && (
                <button
                  onClick={() => setShowDetailsModal(true)}
                  className="w-full lg:w-auto px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Reschedule Session</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={rescheduleData.date}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Time</label>
                <input
                  type="time"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={rescheduleData.time}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, time: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason (Optional)</label>
                <textarea
                  placeholder="Why are you rescheduling?"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  value={rescheduleData.reason}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, reason: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  "Confirm Reschedule"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-600">
                {status === "pending" ? "Cancel Request?" : "Cancel Appointment?"}
              </h3>
            </div>

            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              {status === "pending" 
                ? "Your appointment request will be withdrawn and the therapist will be notified."
                : "This action cannot be undone. Please provide a reason for cancellation."}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Cancellation Reason
              </label>
              <textarea
                placeholder="Why are you cancelling? (minimum 10 characters)"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <p
                className={`text-xs font-medium mt-2 ${
                  cancelReason.trim().length < 10 && cancelReason.length > 0
                    ? "text-red-600"
                    : "text-slate-500"
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
                }}
                className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-all"
              >
                Keep {status === "pending" ? "Request" : "Appointment"}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading || cancelReason.trim().length < 10}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-red-600 font-bold transition-all shadow-lg"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  `Cancel ${status === "pending" ? "Request" : "Session"}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <AppointmentDetailsModal
          appointmentId={id}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          therapistName={therapist}
        />
      )}
    </>
  );
}