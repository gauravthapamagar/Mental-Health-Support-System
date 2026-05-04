/*
 * FILE LOCATION: components/video/VideoCallButton.tsx
 * 
 * USAGE: Import this in your AppointmentCard component
 * 
 * Example:
 * import VideoCallButton from "@/components/video/VideoCallButton";
 * 
 * <VideoCallButton
 *   appointmentId={appointmentId}
 *   sessionMode="online"
 *   status="confirmed"
 * />
 */

"use client";

import { useRouter } from "next/navigation";
import { Video } from "lucide-react";

interface VideoCallButtonProps {
  appointmentId: number;
  sessionMode: "online" | "offline";
  status: string;
}

export default function VideoCallButton({
  appointmentId,
  sessionMode,
  status,
}: VideoCallButtonProps) {
  const router = useRouter();

  // Only show for online appointments
  if (sessionMode !== "online") {
    return null;
  }

  // Don't show for cancelled appointments
  if (status === "cancelled") {
    return null;
  }

  // Determine role from current URL
  const handleJoinCall = () => {
    const currentPath = window.location.pathname;
    const role = currentPath.includes("/therapist/") ? "therapist" : "patient";
    router.push(`/${role}/appointments/${appointmentId}/video`);
  };

  // Show button for confirmed or completed appointments
  const canJoin = status === "confirmed" || status === "upcoming";

  if (!canJoin) {
    // Disabled state for pending/awaiting payment
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed"
      >
        {status === "pending" ? "Awaiting Confirmation" : "Payment Required"}
      </button>
    );
  }

  // Active button
  return (
    <button
      onClick={handleJoinCall}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      <Video className="inline mr-2" size={18} />
      Join Video Session
    </button>
  );
}