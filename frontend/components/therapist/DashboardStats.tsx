import React from "react";
import { Users, Calendar, Clock, TrendingUp } from "lucide-react";

const DashboardStats = () => {
  const stats = [
    {
      title: "Total Patients",
      value: "48",
      change: "+12%",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Today's Sessions",
      value: "8",
      change: "3 remaining",
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      title: "Hours This Week",
      value: "32",
      change: "+5 hours",
      icon: Clock,
      color: "bg-green-500",
    },
    {
      title: "Success Rate",
      value: "94%",
      change: "+2%",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-green-600 font-medium">
              {stat.change}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stat.value}
          </h3>
          <p className="text-sm text-gray-600">{stat.title}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
