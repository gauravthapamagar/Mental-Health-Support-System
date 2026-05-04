import React from "react";
import { Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";

interface RecentActivityProps {
  appointments?: any[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ appointments = [] }) => {
  // Derive activities from appointments (limiting to 5)
  // We'll treat "pending" appointments as "New Request" and "confirmed" as "Upcoming"
  // This is a basic derivation. Ideally, we'd have a dedicated activity log.
  
  const activities = appointments.slice(0, 5).map((apt: any) => {
    let type = "appointment";
    let title = "Appointment Update";
    let description = `${apt?.patient?.full_name || 'Patient'} - ${apt?.status || 'Unknown Status'}`;
    let icon = Calendar;
    let iconColor = "text-blue-500";
    let bgColor = "bg-blue-50";

    if (apt?.status === 'pending') {
      type = "request";
      title = "New Appointment Request";
      icon = AlertCircle;
      iconColor = "text-orange-500";
      bgColor = "bg-orange-50";
    } else if (apt?.status === 'confirmed') {
      type = "confirmed";
      title = "Appointment Confirmed";
      icon = CheckCircle;
      iconColor = "text-green-500";
      bgColor = "bg-green-50";
    } else if (apt?.status === 'completed') {
      type = "completed";
      title = "Session Completed";
      icon = CheckCircle;
      iconColor = "text-purple-500";
      bgColor = "bg-purple-50";
    }

    return {
      id: apt?.id,
      type,
      title,
      description: `${apt?.patient?.full_name || 'Patient'} - ${apt?.appointment_date ? new Date(apt.appointment_date + 'T' + (apt.start_time || '00:00')).toLocaleDateString() : 'Date N/A'}`,
      time: apt?.created_at ? new Date(apt.created_at) : new Date(), 
      icon,
      iconColor,
      bgColor,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Appointments</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                  {activity.title}
                </h3>
                <p className="text-xs text-gray-600 mb-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {/* Fallback for time display */}
                  {activity.time ? activity.time.toLocaleDateString() : 'Recently'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No recent activity.</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
