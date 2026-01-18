"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import DashboardStats from "@/components/therapist/DashboardStats";
import UpcomingAppointments from "@/components/therapist/UpcomingAppointments";
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
        // 1️⃣ Get logged-in user
        const currentUser = await authAPI.getCurrentUser();

        // 🔒 Role protection
        if (currentUser.role !== "therapist") {
          window.location.href = "/auth/login";
          return;
        }

        setUser(currentUser);

        // 2️⃣ (Optional) Load therapist profile
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
      <>
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading dashboard...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your practice today.
            </p>
          </div>

          {/* Stats */}
          <DashboardStats therapistId={user?.id} />

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <UpcomingAppointments therapistId={user?.id} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TherapistDashboard;
