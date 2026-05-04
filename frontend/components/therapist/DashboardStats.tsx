"use client";
import React from "react";
import { Users, Calendar, Clock, Heart, TrendingUp, Sparkles , FileText} from "lucide-react";

interface DashboardStatsProps {
  data: {
    total_patients?: number;
    total_appointments?: number;
    upcoming?: number;
    hours_this_week?: number;
    success_rate?: number;
    published_blogs?: number;
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
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      accentColor: "text-blue-600",
    },
    {
      title: "Appointments",
      value: data?.total_appointments ?? 0,
      change: `${data?.upcoming ?? 0} upcoming`,
      changeType: "neutral",
      icon: Calendar,
      gradient: "from-teal-500 to-teal-600",
      bgGradient: "from-teal-50 to-teal-100",
      iconBg: "bg-gradient-to-br from-teal-500 to-teal-600",
      accentColor: "text-teal-600",
    },
    {
  title: "Published Blogs",
  value: data?.published_posts ?? 0,     // ← this is the correct field
  change: "Total Published",
  changeType: "positive",
  icon: FileText,                        // nicer icon for blogs (import it)
  gradient: "from-cyan-500 to-cyan-600",
  bgGradient: "from-cyan-50 to-cyan-100",
  iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
  accentColor: "text-cyan-600",
},
    {
      title: "Care Impact",
      value: data?.success_rate ?? 95,
      change: "Success Rate",
      changeType: "positive",
      icon: Heart,
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      accentColor: "text-indigo-600",
      suffix: "%",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Animated background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          
          {/* Floating particles effect */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 delay-100"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl ${stat.iconBg} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <stat.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm ${stat.accentColor} border border-white shadow-sm group-hover:shadow-md transition-shadow`}>
                  {stat.change}
                </span>
                {stat.changeType === "positive" && (
                  <TrendingUp className="w-4 h-4 text-green-500 mt-2 animate-bounce" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <h3 className="text-4xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 origin-left">
                  {stat.value}
                </h3>
                {stat.suffix && (
                  <span className="text-2xl font-bold text-gray-400">{stat.suffix}</span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-2">
                {stat.title}
                {index === 0 && <Sparkles className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: stat.value > 0 ? '100%' : '0%' }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;