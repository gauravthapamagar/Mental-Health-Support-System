import React from "react";
import Header from "@/components/Header";
import DashboardStats from "@/components/therapist/DashboardStats";
import UpcomingAppointments from "@/components/therapist/UpcomingAppointments";
import RecentPatients from "@/components/therapist/RecentPatients";

const TherapistDashboard = () => {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Dr. Smith
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your practice today.
            </p>
          </div>

          {/* Dashboard Stats */}
          <DashboardStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left Column - Takes 2/3 width on large screens */}
            <div className="lg:col-span-2 space-y-6">
              <UpcomingAppointments />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TherapistDashboard;
