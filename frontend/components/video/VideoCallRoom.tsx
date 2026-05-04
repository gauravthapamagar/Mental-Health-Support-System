/*
 * FILE: components/video/VideoCallRoom.tsx
 * FIXED VERSION - Better error handling and allows joining active sessions
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Loader2, AlertCircle } from "lucide-react";
import { bookingAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface VideoCallRoomProps {
  appointmentId: number;
  userRole: "patient" | "therapist";
}

export default function VideoCallRoom({
  appointmentId,
  userRole,
}: VideoCallRoomProps) {
  const router = useRouter();

  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [cameraWarning, setCameraWarning] = useState(false);

  useEffect(() => {
    initializeAgora();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAgora = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      console.log("[Video] Starting initialization...");

      // Get token
      const tokenData = await bookingAPI.generateVideoToken(appointmentId);
      console.log("[Video] ✅ Token received");
      console.log("[Video] UID:", tokenData.uid);
      console.log("[Video] Channel:", tokenData.channel_name);

      if (!tokenData.can_start) {
        throw new Error(tokenData.error || "Cannot start session");
      }

      // Create client
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      console.log("[Video] ✅ Client created");

      // Event listeners
      agoraClient.on("user-published", async (user, mediaType) => {
        console.log("[Video] Remote user published:", user.uid, mediaType);
        try {
          await agoraClient.subscribe(user, mediaType);
          console.log("[Video] ✅ Subscribed to:", user.uid, mediaType);
          
          if (mediaType === "video") {
            setRemoteUsers((prev) => {
              if (prev.find((u) => u.uid === user.uid)) return prev;
              return [...prev, user];
            });
            toast.success("Other participant joined!");
          }
          
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        } catch (error) {
          console.error("[Video] Subscribe error:", error);
        }
      });

      agoraClient.on("user-unpublished", (user, mediaType) => {
        console.log("[Video] User unpublished:", user.uid, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        }
      });

      agoraClient.on("user-left", (user) => {
        console.log("[Video] User left:", user.uid);
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        toast("Other participant left");
      });

      // Join channel
      console.log("[Video] Joining channel with UID:", tokenData.uid);
      await agoraClient.join(
        tokenData.app_id,
        tokenData.channel_name,
        tokenData.token,
        tokenData.uid
      );
      console.log("[Video] ✅ Joined channel!");

      setClient(agoraClient);

      // Create tracks
      let audioTrack = null;
      let videoTrack = null;

      // Audio
      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        console.log("[Video] ✅ Audio track created");
        setLocalAudioTrack(audioTrack);
      } catch (error: any) {
        console.error("[Video] ⚠️ Audio failed:", error.message);
        toast.error("Microphone not available");
      }

      // Video
      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        console.log("[Video] ✅ Video track created");
        setLocalVideoTrack(videoTrack);
        setIsVideoEnabled(true);
      } catch (error: any) {
        console.error("[Video] ⚠️ Video failed:", error.message);
        setCameraWarning(true);
        setIsVideoEnabled(false);
        
        if (error.message?.includes("in use") || error.code === "NOT_READABLE") {
          toast("Camera in use - joining with audio only", { icon: "⚠️" });
        } else {
          toast.error("Camera not available");
        }
      }

      // Publish tracks
      const tracks = [];
      if (audioTrack) tracks.push(audioTrack);
      if (videoTrack) tracks.push(videoTrack);

      if (tracks.length > 0) {
        await agoraClient.publish(tracks);
        console.log("[Video] ✅ Published", tracks.length, "track(s)");
      } else {
        console.log("[Video] ⚠️ No tracks to publish");
        toast("Joined in audio-only mode", { icon: "🎧" });
      }

      // Play local video
      if (videoTrack) {
        videoTrack.play("local-player");
      }

      setIsConnecting(false);

      // Mark session started
      try {
        await bookingAPI.startVideoSession(appointmentId);
        console.log("[Video] ✅ Session marked as started");
      } catch (error) {
        console.error("[Video] Failed to mark session started:", error);
      }

      toast.success("Connected!");

    } catch (error: any) {
      console.error("[Video] ❌ Error:", error);
      
      let errorMsg = "Connection failed";
      
      if (error.code === "UID_CONFLICT") {
        errorMsg = "Session already active in another tab. Please close other tabs and refresh.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setConnectionError(errorMsg);
      setIsConnecting(false);
      toast.error(errorMsg);
    }
  };

  const toggleAudio = async () => {
    if (!localAudioTrack) {
      toast.error("Microphone not available");
      return;
    }
    
    if (isAudioEnabled) {
      await localAudioTrack.setEnabled(false);
      setIsAudioEnabled(false);
      toast("Muted", { icon: "🔇" });
    } else {
      await localAudioTrack.setEnabled(true);
      setIsAudioEnabled(true);
      toast("Unmuted", { icon: "🔊" });
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrack) {
      toast.error("Camera not available");
      return;
    }
    
    if (isVideoEnabled) {
      await localVideoTrack.setEnabled(false);
      setIsVideoEnabled(false);
      toast("Camera off", { icon: "📷" });
    } else {
      await localVideoTrack.setEnabled(true);
      setIsVideoEnabled(true);
      toast("Camera on", { icon: "📹" });
    }
  };

  const endCall = async () => {
    try {
      await bookingAPI.endVideoSession(appointmentId);
      toast.success("Session ended");
      await cleanup();
      router.push(`/${userRole}/appointments`);
    } catch (error) {
      console.error("[Video] End call error:", error);
      toast.error("Error ending session");
      await cleanup();
      router.back();
    }
  };

  const cleanup = async () => {
    console.log("[Video] Cleaning up...");
    if (localAudioTrack) localAudioTrack.close();
    if (localVideoTrack) localVideoTrack.close();
    if (client) await client.leave();
    
    setClient(null);
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setRemoteUsers([]);
  };

  // Play remote video
  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        const elementId = `remote-player-${user.uid}`;
        try {
          user.videoTrack.play(elementId);
        } catch (error) {
          console.error("[Video] Play remote error:", error);
        }
      }
    });
  }, [remoteUsers]);

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600" size={32} />
            <h2 className="text-xl font-bold">Connection Error</h2>
          </div>
          <p className="mb-6 text-gray-700">{connectionError}</p>
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 text-white">
        <h1 className="text-xl font-bold">
          Video Session - {userRole === "patient" ? "Patient" : "Therapist"}
        </h1>
        <p className="text-sm">
          {isConnecting ? "Connecting..." : "Connected ✓"}
        </p>
        {cameraWarning && (
          <p className="text-yellow-400 text-xs mt-1">
            ⚠️ Camera unavailable - audio only
          </p>
        )}
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Remote Video */}
        <div className="relative bg-gray-800 rounded overflow-hidden min-h-[400px]">
          {remoteUsers.length > 0 ? (
            <div
              id={`remote-player-${remoteUsers[0].uid}`}
              className="w-full h-full"
            ></div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              {isConnecting ? (
                <div className="text-center">
                  <Loader2 className="animate-spin mx-auto mb-2" size={48} />
                  <p>Connecting...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg">Waiting for other participant...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    They can join anytime
                  </p>
                </div>
              )}
            </div>
          )}
          
          {remoteUsers.length > 0 && (
            <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded text-white">
              Other Participant
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="relative bg-gray-800 rounded overflow-hidden min-h-[400px]">
          <div id="local-player" className="w-full h-full"></div>
          
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white">
              <div className="text-center">
                <VideoOff size={48} className="mx-auto mb-2" />
                <p>Camera is off</p>
                {cameraWarning && (
                  <p className="text-sm text-yellow-400 mt-2">
                    Camera unavailable
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded text-white">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mic */}
          <button
            onClick={toggleAudio}
            disabled={!localAudioTrack}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isAudioEnabled ? "bg-gray-700" : "bg-red-500"
            } text-white disabled:opacity-50`}
            title={isAudioEnabled ? "Mute" : "Unmute"}
          >
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleVideo}
            disabled={!localVideoTrack}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isVideoEnabled ? "bg-gray-700" : "bg-red-500"
            } text-white disabled:opacity-50`}
            title={isVideoEnabled ? "Camera off" : "Camera on"}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          {/* End */}
          <button
            onClick={endCall}
            className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700"
            title="End call"
          >
            <PhoneOff size={24} />
          </button>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-4">
          Click red button to end session
        </p>
      </div>
    </div>
  );
}