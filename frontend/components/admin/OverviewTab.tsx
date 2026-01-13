"use client";
import React from "react";
import {
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  TrendingUp,
  Activity,
  CheckCircle,
} from "lucide-react";

const OverviewTab = ({ stats }: any) => {
  // If stats is null or hasn't loaded, show a loading state or empty values
  if (!stats) return <div className="text-gray-500">Loading statistics...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users size={24} />}
          title="Total Users"
          value={stats.totalUsers ?? 0}
          trend="+12%" // This can be made dynamic if your backend calculates growth
          color="blue"
        />
        <StatCard
          icon={<UserCheck size={24} />}
          title="Verified Therapists"
          value={stats.verifiedTherapists ?? 0}
          subtitle={`${stats.pendingTherapists ?? 0} pending`}
          color="green"
        />
        <StatCard
          icon={<FileText size={24} />}
          title="Published Blogs"
          value={stats.totalBlogs ?? 0}
          subtitle="Updated recently"
          color="purple"
        />
        <StatCard
          icon={<ClipboardList size={24} />}
          title="Total Surveys"
          value={stats.totalSurveys ?? 0}
          trend="+8%"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* NOTE: To make Recent Activity truly dynamic, 
               you would need an 'activities' array from your backend.
            */}
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity: any, index: number) => (
                <ActivityItem
                  key={index}
                  icon={<UserCheck className="text-green-600" size={20} />}
                  title={activity.message}
                  time={activity.time}
                />
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">
                No recent activity recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, trend, subtitle, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className={`p-3 w-fit rounded-lg mb-4 ${colors[color]}`}>{icon}</div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <span className="text-green-600 text-xs flex items-center">
            <TrendingUp size={12} className="mr-1" />
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

const ActivityItem = ({ icon, title, time }: any) => (
  <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
    <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
    <div className="flex-1 text-sm font-medium">{title}</div>
    <span className="text-xs text-gray-400">{time}</span>
  </div>
);

export default OverviewTab;
