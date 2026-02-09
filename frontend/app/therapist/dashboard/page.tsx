"use client";
import React, { useEffect, useState } from "react";
import DashboardStats from "@/components/therapist/DashboardStats";
import UpcomingAppointments from "@/components/therapist/UpcomingAppointments";
import QuickActions from "@/components/therapist/QuickActions";
import RecentActivity from "@/components/therapist/RecentActivity";
import { authAPI, therapistAPI, bookingAPI } from "@/lib/api";
import { Sparkles, Sun, Moon } from "lucide-react";
import { blogAPI } from "@/lib/api/blog";
interface User {
  id: number;
  full_name: string;
  role: string;
}

const TherapistDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);

  useEffect(() => {
    const loadTherapist = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();

        if (currentUser.role !== "therapist") {
          window.location.href = "/auth/login";
          return;
        }

        setUser(currentUser);
        
        const [profileRes, statsRes,blogStatsRes, appointmentsRes] = await Promise.all([
          therapistAPI.getProfile(),
          therapistAPI.getDashboardStats(),
          blogAPI.getMyStats(),
          bookingAPI.getTherapistAppointments("all")
        ]);

        setStats({
        ...statsRes,
        ...blogStatsRes,                    // blog stats will override if keys conflict
      });
        setRecentAppointments(appointmentsRes.results || []);

      } catch (error) {
        console.error("Failed to load therapist dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadTherapist();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: Sun };
    if (hour < 18) return { text: "Good Afternoon", icon: Sparkles };
    return { text: "Good Evening", icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  

  if (loading) {
    return (
      <main className="pt-20 flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          {/* Animated loader */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full animate-pulse opacity-20"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full animate-spin"></div>
            <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading your sanctuary...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing your healing space</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Page Header with Greeting */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl shadow-lg animate-float">
                  <GreetingIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 tracking-wide uppercase">
                    {greeting.text}
                  </p>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-teal-600 to-cyan-700 bg-clip-text text-transparent">
                    {user?.full_name || "Therapist"}
                  </h1>
                </div>
              </div>
              <p className="text-gray-600 ml-14 text-lg">
                Your healing practice awaits. Let's make today meaningful. ✨
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/50 shadow-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Date</p>
                <p className="text-lg font-bold text-gray-800">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section with Stagger Animation */}
        <div className="animate-slide-up">
          <DashboardStats data={stats} />
        </div>

        {/* Quick Actions with Hover Effects */}
        <div className="mt-8 animate-slide-up animation-delay-200">
          <QuickActions />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Appointments Widget */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up animation-delay-400">
            <UpcomingAppointments therapistId={user?.id} />
          </div>

          {/* Right Column - Activity & Quick Info */}
          <div className="space-y-6 animate-slide-up animation-delay-600">
            <RecentActivity appointments={recentAppointments} />
            
            {/* Mindfulness Quote Card */}
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative">
                <Sparkles className="w-8 h-8 mb-4 opacity-80" />
                <p className="text-lg font-medium mb-2 leading-relaxed">
                  "The greatest healing therapy is friendship and love."
                </p>
                <p className="text-sm opacity-80">— Hubert H. Humphrey</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </main>
  );
};

export default TherapistDashboard;