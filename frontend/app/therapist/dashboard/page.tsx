"use client";
import React, { useEffect, useState } from "react";
import DashboardStats from "@/components/therapist/DashboardStats";
import UpcomingAppointments from "@/components/therapist/UpcomingAppointments";
import QuickActions from "@/components/therapist/QuickActions";
import RecentActivity from "@/components/therapist/RecentActivity";
import { authAPI, therapistAPI } from "@/lib/api";

interface User {
  id: number;
  full_name: string;
  role: string;
}

const TherapistDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTherapist = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();

        if (currentUser.role !== "therapist") {
          window.location.href = "/auth/login";
          return;
        }

        setUser(currentUser);
        await therapistAPI.getProfile();
      } catch (error) {
        console.error("Failed to load therapist dashboard", error);
        window.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    };

    loadTherapist();
  }, []);

  if (loading) {
    return (
      <main className="pt-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Page Header with Greeting */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.full_name || "Gaurav Thapa"}
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your practice today.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <DashboardStats therapistId={user?.id} />

        {/* Quick Actions */}
        <div className="mt-8">
          <QuickActions />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Appointments */}
          <div className="lg:col-span-2 space-y-6">
            <UpcomingAppointments therapistId={user?.id} />
          </div>

          {/* Right Column - Activity & Quick Info */}
          <div className="space-y-6">
            <RecentActivity />
          </div>
        </div>
      </div>
    </main>
  );
};

export default TherapistDashboard;
