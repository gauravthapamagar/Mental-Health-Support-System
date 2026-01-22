import React from "react";
import { Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "appointment",
      title: "Session completed",
      description: "John Doe - Anxiety therapy",
      time: "2 hours ago",
      icon: CheckCircle,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: 2,
      type: "new_patient",
      title: "New patient registered",
      description: "Sarah Williams joined",
      time: "5 hours ago",
      icon: AlertCircle,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: 3,
      type: "appointment",
      title: "Appointment scheduled",
      description: "Mike Johnson - Tomorrow 3 PM",
      time: "1 day ago",
      icon: Calendar,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      id: 4,
      type: "session",
      title: "Session notes updated",
      description: "Jane Smith's progress notes",
      time: "2 days ago",
      icon: CheckCircle,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
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
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
