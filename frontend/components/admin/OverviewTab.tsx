"use client";
import React from "react";
import {
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  TrendingUp,
  Calendar,
  BookOpen,
} from "lucide-react";

const OverviewTab = ({ stats }: any) => {
  if (!stats) return <div className="text-gray-500">Loading statistics...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-blue-100 text-lg">
              Welcome back! Here's what's happening on your platform today.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-cyan-300 animate-pulse"></div>
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Stats - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={28} />}
          title="Total Users"
          value={stats.totalUsers ?? 0}
          gradient="from-blue-500 to-cyan-500"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<UserCheck size={28} />}
          title="Total Therapists"
          value={stats.totalTherapists ?? 0}
          gradient="from-purple-500 to-pink-500"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={<Calendar size={28} />}
          title="Total Appointments"
          value={stats.totalAppointments ?? 0}
          gradient="from-amber-500 to-orange-500"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          icon={<TrendingUp size={28} />}
          title="Active Sessions"
          value={Math.floor((stats.totalUsers ?? 0) * 0.65)}
          gradient="from-green-500 to-emerald-500"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Stats - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<BookOpen size={28} />}
          title="Journal Entries"
          value={stats.totalJournals ?? 0}
          gradient="from-teal-500 to-cyan-500"
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
        />
        <StatCard
          icon={<ClipboardList size={28} />}
          title="Survey Responses"
          value={stats.totalSurveys ?? 0}
          gradient="from-indigo-500 to-purple-500"
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={<FileText size={28} />}
          title="Blog Posts"
          value={stats.totalBlogs ?? 0}
          gradient="from-pink-500 to-red-500"
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Therapist Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Therapist Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-gray-700 font-medium">Verified</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.verifiedTherapists ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-gray-700 font-medium">
                Pending Verification
              </span>
              <span className="text-2xl font-bold text-amber-600">
                {stats.pendingTherapists ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Content Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Content Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-gray-700 font-medium">Published Blogs</span>
              <span className="text-2xl font-bold text-blue-600">
                {stats.publishedBlogs ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <span className="text-gray-700 font-medium">
                Pending Approval
              </span>
              <span className="text-2xl font-bold text-orange-600">
                {stats.pendingBlogs ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, gradient, iconBg, iconColor }: any) => (
  <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
    <div className={`bg-gradient-to-r ${gradient} h-1`}></div>
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          {React.cloneElement(icon, { className: iconColor })}
        </div>
      </div>
      <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default OverviewTab;
