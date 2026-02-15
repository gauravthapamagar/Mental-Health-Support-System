"use client";

import { useState } from "react";
import { Video, Loader2 } from "lucide-react";
import { bookingAPI } from "@/lib/api";

interface VideoCallButtonProps {
  appointmentId: number;
  sessionMode?: string;
  status?: string;
  appointmentDate?: string;
  startTime?: string;
}

export default function TherapistVideoCallButton({
  appointmentId,
  sessionMode = "online",
  status,
  appointmentDate,
  startTime,
}: VideoCallButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinCall = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("[TherapistVideoCallButton] Joining call for appointment:", appointmentId);

      // Verify session can be started by checking video status first
      const statusData = await bookingAPI.getVideoSessionStatus(appointmentId);

      if (!statusData.can_start) {
        throw new Error(statusData.can_start_reason || "Cannot start video session at this time");
      }

      console.log("[TherapistVideoCallButton] Session can start, opening video call room");
      // Redirect to therapist video call room page
      window.location.href = `/therapist/appointments/${appointmentId}/video`;
    } catch (err: any) {
      console.error("[TherapistVideoCallButton] Error:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to join call";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionMode !== "online") {
    return null;
  }

  return (
    <div>
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handleJoinCall}
        disabled={isLoading}
        className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Joining...
          </>
        ) : (
          <>
            <Video size={18} className="mr-2" />
            Join Video Call
          </>
        )}
      </button>
    </div>
  );
}
