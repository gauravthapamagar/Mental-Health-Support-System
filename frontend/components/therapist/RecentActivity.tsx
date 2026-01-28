import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  XCircle,
} from "lucide-react";
import { bookingAPI } from "@/lib/api";

interface Activity {
  id: number;
  action: string;
  appointment_id: number;
  patient_name: string;
  notes: string;
  created_at: string;
  old_status?: string;
  new_status?: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingAPI.getRecentActivity();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      setError("Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  const getActivityConfig = (action: string, newStatus?: string) => {
    switch (action) {
      case "completed":
        return {
          title: "Session completed",
          icon: CheckCircle,
          iconColor: "text-green-500",
          bgColor: "bg-green-50",
        };
      case "created":
        return {
          title: "Appointment scheduled",
          icon: Calendar,
          iconColor: "text-purple-500",
          bgColor: "bg-purple-50",
        };
      case "confirmed":
        return {
          title: "Appointment confirmed",
          icon: CheckCircle,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50",
        };
      case "cancelled":
        return {
          title: "Appointment cancelled",
          icon: XCircle,
          iconColor: "text-red-500",
          bgColor: "bg-red-50",
        };
      case "notes_updated":
        return {
          title: "Session notes updated",
          icon: FileText,
          iconColor: "text-green-500",
          bgColor: "bg-green-50",
        };
      default:
        return {
          title: action.charAt(0).toUpperCase() + action.slice(1),
          icon: AlertCircle,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50",
        };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getDescription = (activity: Activity) => {
    // If notes exist and contain useful info, use them
    if (activity.notes && activity.notes.trim()) {
      return `${activity.patient_name} - ${activity.notes}`;
    }

    // Otherwise create a description based on action
    switch (activity.action) {
      case "created":
        return `${activity.patient_name} booked an appointment`;
      case "confirmed":
        return `Confirmed appointment with ${activity.patient_name}`;
      case "completed":
        return `Completed session with ${activity.patient_name}`;
      case "cancelled":
        return `Appointment with ${activity.patient_name} was cancelled`;
      case "notes_updated":
        return `Updated notes for ${activity.patient_name}`;
      default:
        return `${activity.patient_name} - ${activity.action}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
              <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-48 h-3 bg-gray-200 rounded"></div>
                <div className="w-20 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchRecentActivity}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <button
          onClick={fetchRecentActivity}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => {
            const config = getActivityConfig(
              activity.action,
              activity.new_status,
            );
            const IconComponent = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() =>
                  (window.location.href = `/therapist/appointments/${activity.appointment_id}`)
                }
              >
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                    {config.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1 truncate">
                    {getDescription(activity)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(activity.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
