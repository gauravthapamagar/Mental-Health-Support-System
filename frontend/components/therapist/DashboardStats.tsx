"use client";
import React from "react";
import { Users, Calendar, Clock, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  data: {
    total_patients?: number;
    total_appointments?: number; // Changed from today_sessions
    upcoming?: number; // We'll use this for the "remaining" label
    hours_this_week?: number;
    success_rate?: number;
  } | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  const stats = [
    {
      title: "Total Patients",
      value: data?.total_patients ?? 0,
      change: "Lifetime",
      changeType: "positive",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Appointments", // Changed label
      value: data?.total_appointments ?? 0, // Using total count
      change: `${data?.upcoming ?? 0} upcoming`, // Shows how many are next
      changeType: "neutral",
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      title: "Hours This Week",
      value: data?.hours_this_week ?? 0,
      change: "Completed",
      changeType: "positive",
      icon: Clock,
      color: "bg-green-500",
    },
    {
      title: "Success Rate",
      value: `${data?.success_rate ?? 0}%`,
      change: "Stable",
      changeType: "positive",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
              {stat.change}
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
