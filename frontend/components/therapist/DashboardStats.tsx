import React from "react";
import { Users, Calendar, Clock, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  therapistId?: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ therapistId }) => {
  const stats = [
    {
      title: "Total Patients",
      value: "48",
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
    },
    {
      title: "Today's Sessions",
      value: "8",
      change: "3 remaining",
      changeType: "neutral",
      icon: Calendar,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
    },
    {
      title: "Hours This Week",
      value: "32",
      change: "+5 hours",
      changeType: "positive",
      icon: Clock,
      color: "bg-green-500",
      lightColor: "bg-green-50",
    },
    {
      title: "Success Rate",
      value: "94%",
      change: "+2%",
      changeType: "positive",
      icon: TrendingUp,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
    },
  ];

  const getChangeColor = (type: string) => {
    if (type === "positive") return "text-green-600 bg-green-50";
    if (type === "negative") return "text-red-600 bg-red-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <span
              className={`text-sm font-medium px-2.5 py-1 rounded-full ${getChangeColor(
                stat.changeType,
              )}`}
            >
              {stat.change}
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
          </div>

          {/* Mini progress indicator */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">vs last week</span>
              <div className="flex items-center gap-1">
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.color} rounded-full`}
                    style={{ width: "70%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
