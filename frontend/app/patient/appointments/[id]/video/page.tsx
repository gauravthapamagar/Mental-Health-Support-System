/*
 * FILE LOCATION: app/patient/appointments/[id]/video/page.tsx
 * 
 * Patient video call page
 * This is the page that opens when patient clicks "Join Video Session"
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import VideoCallRoom from "@/components/video/VideoCallRoom";
import { Loader2 } from "lucide-react";

export default function PatientVideoPage() {
  const params = useParams();
  const appointmentId = parseInt(params.id as string);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure everything is ready
    setTimeout(() => setLoading(false), 100);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p>Loading video session...</p>
        </div>
      </div>
    );
  }

  return <VideoCallRoom appointmentId={appointmentId} userRole="patient" />;
}