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

interface DashboardStatsData {
  total_patients: number;
  total_appointments: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  today_sessions: number;
  hours_this_week: number;
  success_rate: number;
}

const TherapistDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

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

  // Fetch dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const stats = await therapistAPI.getDashboardStats();
        setStatsData(stats);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setStatsLoading(false);
      }
    };

    // Only fetch stats after user is loaded
    if (user) {
      loadStats();
    }
  }, [user]);

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
                Welcome back, {user?.full_name || "Doctor"}
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
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DashboardStats data={statsData} />
        )}

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
