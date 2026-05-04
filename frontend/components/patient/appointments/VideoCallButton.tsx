"use client";

import { useRouter } from "next/navigation";
import { Video, Clock } from "lucide-react";

interface VideoCallButtonProps {
  appointmentId: number;
  sessionMode: "online" | "offline";
  status: string;
  appointmentDate: string;
  startTime: string;
  paymentStatus?: string;
}

export default function VideoCallButton({
  appointmentId,
  sessionMode,
  status,
}: VideoCallButtonProps) {
  const router = useRouter();

  const handleJoinCall = () => {
    // Determine role from URL
    const currentPath = window.location.pathname;
    const role = currentPath.includes("/therapist/") ? "therapist" : "patient";

    // Navigate to video call page
    router.push(`/${role}/appointments/${appointmentId}/video`);
  };

  // ✅ SIMPLE LOGIC: Show button if online + not cancelled
  const canJoin = sessionMode === "online" && status !== "cancelled";

  // Don't show button for non-online appointments
  if (sessionMode !== "online") {
    return null;
  }

  // Cancelled appointments
  if (status === "cancelled") {
    return null;
  }

  // Show for: pending, awaiting_payment, confirmed, completed (if not ended)
  if (status === "pending" || status === "awaiting_payment") {
    return (
      <button
        disabled
        className="w-full lg:w-auto px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
        title={status === "pending" ? "Waiting for confirmation" : "Payment required"}
      >
        <Clock size={18} />
        {status === "pending" ? "Awaiting Confirmation" : "Payment Required"}
      </button>
    );
  }

  // For confirmed or completed - ALWAYS show join button
  if (status === "confirmed" || status === "upcoming") {
    return (
      <button
        onClick={handleJoinCall}
        className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
      >
        <Video size={18} />
        Join Video Session
      </button>
    );
  }

  // Fallback - don't show
  return null;
}