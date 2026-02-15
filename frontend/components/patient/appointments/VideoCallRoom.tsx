"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  AlertCircle,
  Users,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { bookingAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

interface VideoCallRoomProps {
  appointmentId: number;
  patientName?: string;
  therapistName?: string;
  userRole: "patient" | "therapist";
}

export default function VideoCallRoom({
  appointmentId,
  patientName,
  therapistName,
  userRole,
}: VideoCallRoomProps) {
  const router = useRouter();

  // Agora state
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  // UI state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [cameraWarning, setCameraWarning] = useState<string | null>(null);
  const [audioWarning, setAudioWarning] = useState<string | null>(null);

  // Initialize and join channel
  useEffect(() => {
    initializeAgora();

    return () => {
      cleanup();
    };
  }, []);

  // Timer for session duration
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - sessionStartTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const initializeAgora = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      setCameraWarning(null);
      setAudioWarning(null);

      console.log("[VideoCall] Starting initialization for appointment:", appointmentId);

      // Get video token from backend
      let tokenData;
      try {
        tokenData = await bookingAPI.generateVideoToken(appointmentId);
        console.log("[VideoCall] Token received:", {
          channel: tokenData.channel_name,
          uid: tokenData.uid,
          role: tokenData.role,
        });
      } catch (error: any) {
        console.error("[VideoCall] Token fetch error:", error);
        
        const errorMsg = error.response?.data?.error || 
                        error.response?.data?.message || 
                        "Failed to get video session token";
        
        setConnectionError(errorMsg);
        setIsConnecting(false);
        toast.error(errorMsg);
        return;
      }

      if (!tokenData.can_start) {
        const errorMsg = tokenData.error || "Cannot start session";
        setConnectionError(errorMsg);
        setIsConnecting(false);
        toast.error(errorMsg);
        return;
      }

      // Create Agora client
      const agoraClient = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      console.log("[VideoCall] Agora client created");

      // Set up event listeners
      agoraClient.on("user-published", async (user, mediaType) => {
        console.log("[VideoCall] Remote user published:", user.uid, mediaType);
        
        try {
          await agoraClient.subscribe(user, mediaType);
          console.log("[VideoCall] Subscribed to:", user.uid, mediaType);
          
          if (mediaType === "video") {
            setRemoteUsers((prev) => {
              const exists = prev.find((u) => u.uid === user.uid);
              if (exists) return prev;
              return [...prev, user];
            });
          }

          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
          
          const remoteName = userRole === "patient" ? therapistName : patientName;
          toast.success(`${remoteName || "Participant"} joined`);
        } catch (error) {
          console.error("[VideoCall] Subscribe error:", error);
        }
      });

      agoraClient.on("user-unpublished", (user, mediaType) => {
        console.log("[VideoCall] User unpublished:", user.uid, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        }
      });

      agoraClient.on("user-left", (user) => {
        console.log("[VideoCall] User left:", user.uid);
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        const remoteName = userRole === "patient" ? therapistName : patientName;
        toast.info(`${remoteName || "Participant"} left`);
      });

      agoraClient.on("connection-state-change", (curState, prevState) => {
        console.log("[VideoCall] Connection:", prevState, "→", curState);
        
        if (curState === "DISCONNECTED") {
          toast.error("Connection lost");
        } else if (curState === "CONNECTED") {
          console.log("[VideoCall] Successfully connected!");
        }
      });

      // Join channel FIRST (before creating tracks)
      console.log("[VideoCall] Joining channel...");
      try {
        await agoraClient.join(
          tokenData.app_id,
          tokenData.channel_name,
          tokenData.token,
          tokenData.uid
        );
        console.log("[VideoCall] ✅ Joined channel with UID:", tokenData.uid);
      } catch (joinError: any) {
        console.error("[VideoCall] Join failed:", joinError);
        
        let errorMsg = "Failed to join session";
        
        if (joinError.code === "UID_CONFLICT") {
          errorMsg = "This session is already active in another tab. Please close other tabs and refresh this page.";
        } else if (joinError.message) {
          errorMsg = joinError.message;
        }
        
        setConnectionError(errorMsg);
        setIsConnecting(false);
        toast.error(errorMsg);
        return;
      }

      // Update client state early
      setClient(agoraClient);

      // Now try to create local tracks (audio/video might fail)
      console.log("[VideoCall] Creating local tracks...");
      let audioTrack = null;
      let videoTrack = null;
      
      // Try creating audio track
      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        console.log("[VideoCall] ✅ Audio track created");
        setLocalAudioTrack(audioTrack);
      } catch (audioError: any) {
        console.error("[VideoCall] Audio failed:", audioError);
        setAudioWarning("Microphone not available. You can still join without audio.");
        toast.warning("Could not access microphone");
      }
      
      // Try creating video track
      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        console.log("[VideoCall] ✅ Video track created");
        setLocalVideoTrack(videoTrack);
        setIsVideoEnabled(true);
      } catch (videoError: any) {
        console.error("[VideoCall] Video failed:", videoError);
        
        let warningMsg = "Camera not available";
        
        if (videoError.message?.includes("in use")) {
          warningMsg = "Camera is being used by another app. You can still join with audio only.";
        } else if (videoError.message?.includes("permission")) {
          warningMsg = "Camera permission denied. You can still join with audio only.";
        }
        
        setCameraWarning(warningMsg);
        setIsVideoEnabled(false);
        toast.warning(warningMsg, { duration: 4000 });
      }

      // Publish whatever tracks we have
      try {
        const tracksToPublish = [];
        if (audioTrack) tracksToPublish.push(audioTrack);
        if (videoTrack) tracksToPublish.push(videoTrack);
        
        if (tracksToPublish.length > 0) {
          await agoraClient.publish(tracksToPublish);
          console.log("[VideoCall] ✅ Published", tracksToPublish.length, "track(s)");
        } else {
          console.log("[VideoCall] ⚠️ No tracks to publish - audio-only mode or viewer mode");
          toast.info("Joined session in viewer mode");
        }
      } catch (publishError: any) {
        console.error("[VideoCall] Publish failed:", publishError);
        toast.error("Failed to publish media");
      }

      // Play local video if available
      if (videoTrack) {
        try {
          videoTrack.play("local-player");
          console.log("[VideoCall] ✅ Playing local video");
        } catch (playError) {
          console.error("[VideoCall] Failed to play local video:", playError);
        }
      }

      setIsConnecting(false);

      // Mark session as started
      try {
        await bookingAPI.startVideoSession(appointmentId);
        setSessionStartTime(new Date());
        console.log("[VideoCall] ✅ Session marked as started");
      } catch (startError) {
        console.error("[VideoCall] Failed to mark session started:", startError);
      }

      toast.success("Connected to video session!");
    } catch (error: any) {
      console.error("[VideoCall] Unexpected error:", error);

      const errorMessage = error.message || "Unexpected error occurred";
      setConnectionError(errorMessage);
      setIsConnecting(false);
      toast.error(errorMessage);
    }
  };

  const toggleAudio = async () => {
    if (!localAudioTrack) {
      toast.error("Microphone not available");
      return;
    }

    try {
      if (isAudioEnabled) {
        await localAudioTrack.setEnabled(false);
        setIsAudioEnabled(false);
        toast.success("Muted");
      } else {
        await localAudioTrack.setEnabled(true);
        setIsAudioEnabled(true);
        toast.success("Unmuted");
      }
    } catch (error) {
      console.error("Toggle audio error:", error);
      toast.error("Failed to toggle microphone");
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrack) {
      toast.error("Camera not available");
      return;
    }

    try {
      if (isVideoEnabled) {
        await localVideoTrack.setEnabled(false);
        setIsVideoEnabled(false);
        toast.success("Camera off");
      } else {
        await localVideoTrack.setEnabled(true);
        setIsVideoEnabled(true);
        toast.success("Camera on");
      }
    } catch (error) {
      console.error("Toggle video error:", error);
      toast.error("Failed to toggle camera");
    }
  };

  const endCall = async () => {
    try {
      const loadingToast = toast.loading("Ending session...");
      
      await bookingAPI.endVideoSession(appointmentId);
      
      toast.dismiss(loadingToast);
      toast.success("Session ended");
      
      await cleanup();
      
      setTimeout(() => {
        router.push(userRole === "patient" ? "/patient/appointments" : "/therapist/appointments");
      }, 500);
    } catch (error) {
      console.error("End call error:", error);
      toast.error("Error ending session");
      
      await cleanup();
      setTimeout(() => router.back(), 500);
    }
  };

  const cleanup = async () => {
    console.log("[VideoCall] Cleaning up...");
    
    try {
      if (localAudioTrack) {
        localAudioTrack.close();
        console.log("[VideoCall] Audio track closed");
      }
      if (localVideoTrack) {
        localVideoTrack.close();
        console.log("[VideoCall] Video track closed");
      }

      if (client) {
        await client.leave();
        console.log("[VideoCall] Left channel");
      }

      setClient(null);
      setLocalAudioTrack(null);
      setLocalVideoTrack(null);
      setRemoteUsers([]);
    } catch (error) {
      console.error("[VideoCall] Cleanup error:", error);
    }
  };

  const handleRetry = () => {
    setConnectionError(null);
    initializeAgora();
  };

  // Render remote video
  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        const elementId = `remote-player-${user.uid}`;
        try {
          user.videoTrack.play(elementId);
          console.log("[VideoCall] Playing remote video:", user.uid);
        } catch (error) {
          console.error("[VideoCall] Failed to play remote video:", error);
        }
      }
    });
  }, [remoteUsers]);

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-6">{connectionError}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200"
            >
              Go Back
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">
              {userRole === "patient"
                ? `Session with ${therapistName || "Therapist"}`
                : `Session with ${patientName || "Patient"}`}
            </h1>
            <p className="text-gray-400 text-sm">
              {isConnecting ? "Connecting..." : `Duration: ${elapsedTime}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isConnecting && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Connected</span>
            </>
          )}
        </div>
      </div>

      {/* Warnings */}
      {(cameraWarning || audioWarning) && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="flex items-start gap-2 text-sm text-yellow-800">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              {cameraWarning && <p className="font-medium">{cameraWarning}</p>}
              {audioWarning && <p className="font-medium">{audioWarning}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Remote Video */}
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden min-h-[400px]">
          {remoteUsers.length > 0 ? (
            <div id={`remote-player-${remoteUsers[0].uid}`} className="w-full h-full"></div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isConnecting ? (
                    <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                  ) : (
                    <Users className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-400 font-medium">
                  {isConnecting
                    ? "Connecting..."
                    : `Waiting for ${userRole === "patient" ? therapistName || "therapist" : patientName || "patient"}...`}
                </p>
              </div>
            </div>
          )}

          {remoteUsers.length > 0 && (
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white font-medium">
                {userRole === "patient" ? therapistName || "Therapist" : patientName || "Patient"}
              </p>
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden min-h-[400px]">
          <div id="local-player" className="w-full h-full"></div>

          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white font-medium">You</p>
          </div>

          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoOff className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-400">Camera is off</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-6 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            disabled={!localAudioTrack}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isAudioEnabled
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <button
            onClick={toggleVideo}
            disabled={!localVideoTrack}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isVideoEnabled
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <button
            onClick={endCall}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all"
          >
            <PhoneOff size={24} className="text-white" />
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          Click the red button to end the session
        </p>
      </div>
    </div>
  );
}