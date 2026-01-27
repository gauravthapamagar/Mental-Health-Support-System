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
  status?: "upcoming" | "completed" | "cancelled";
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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Section - Therapist Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md text-white font-bold text-lg">
              {getInitials(therapist)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900">{therapist}</h3>
                {status === "upcoming" && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    {matchScore}% Match
                  </span>
                )}
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                    status === "completed"
                      ? "bg-green-100 text-green-700"
                      : status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">{title}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  <span className="font-medium">{date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} />
                  <span className="font-medium">{time}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${getFormatColor()}`}
                >
                  {getFormatIcon()}
                  <span className="font-medium text-xs">{getFormatLabel()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3 lg:flex-col lg:items-end">
            {status === "upcoming" && (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Reschedule"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>
                </div>

                <button
                  onClick={() => setShowDetailsModal(true)}
                  className="w-full lg:w-auto px-6 py-2 bg-black text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <Eye size={16} />
                  Details
                </button>

                {format === "video" && (
                  <button className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    <Video size={16} /> Join Call
                  </button>
                )}
              </>
            )}

            {status === "completed" && (
              <button
                onClick={() => setShowDetailsModal(true)}
                className="w-full lg:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Review
              </button>
            )}

            {status === "cancelled" && (
              <button
                onClick={() => setShowDetailsModal(true)}
                className="w-full lg:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reschedule Session</h3>
            <div className="space-y-4 mb-6">
              <input
                type="date"
                className="w-full p-3 border rounded-lg"
                value={rescheduleData.date}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, date: e.target.value })
                }
              />
              <input
                type="time"
                className="w-full p-3 border rounded-lg"
                value={rescheduleData.time}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, time: e.target.value })
                }
              />
              <textarea
                placeholder="Reason for rescheduling..."
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={rescheduleData.reason}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, reason: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-600 mb-2">Cancel Appointment?</h3>
            <p className="text-gray-600 mb-4 text-sm">
              This action cannot be undone. Please provide a reason for cancellation.
            </p>
            <div className="mb-4">
              <textarea
                placeholder="Why are you cancelling? (minimum 10 characters)"
                className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <p
                className={`text-xs font-medium ${
                  cancelReason.trim().length < 10 && cancelReason.length > 0
                    ? "text-red-600"
                    : "text-gray-500"
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
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={loading || cancelReason.trim().length < 10}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 font-medium"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Cancel Session"}
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
          // You can add more props if your modal already supports / needs them:
          // title={title}
          // date={date}
          // time={time}
          // format={format}
          // status={status}
          // matchScore={matchScore}
          // notes={notes}
        />
      )}
    </>
  );
}