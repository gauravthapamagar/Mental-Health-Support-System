// app/admin/page.tsx - UPDATED VERSION
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

// Import Tab Components
import OverviewTab from "@/components/admin/OverviewTab";
import UsersTab from "@/components/admin/UsersTab";
import TherapistsTab from "@/components/admin/TherapistsTab";
import BlogsTab from "@/components/admin/BlogsTab";
import SurveysTab from "@/components/admin/SurveysTab";
import SettingsTab from "@/components/admin/SettingsTab";

const AdminDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalTherapists: 0,
    verifiedTherapists: 0,
    pendingTherapists: 0,
    totalBlogs: 0,
    pendingBlogs: 0,
    publishedBlogs: 0,
    totalSurveys: 0,
  });

  // Verify admin access
  useEffect(() => {
    const verifyAdmin = async () => {
      // Wait for auth context to load
      if (authLoading) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.replace("/auth/login?redirect=/admin");
        return;
      }

      // If authenticated but not admin, redirect to appropriate dashboard
      if (user && user.role !== "admin") {
        if (user.role === "patient") {
          router.replace("/patient");
        } else if (user.role === "therapist") {
          router.replace("/therapist/dashboard");
        } else {
          router.replace("/");
        }
        return;
      }

      // User is verified as admin
      setIsVerified(true);
      setLoading(false);
    };

    verifyAdmin();
  }, [user, isAuthenticated, authLoading, router]);

  // Fetch stats when verified
  useEffect(() => {
    const fetchStats = async () => {
      if (!isVerified) return;

      const result = await adminApiCall("/admin/stats/");
      if (result?.ok) {
        setStats(result.data);
      }
    };

    if (isVerified) {
      fetchStats();
    }
  }, [isVerified, activeTab]);

  const handleLogout = async () => {
    await logout();
  };

  // Show loading state
  if (loading || authLoading || !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              +
            </div>
            <h1 className="text-xl font-bold text-gray-900">CarePair</h1>
          </div>
          <p className="text-xs text-gray-500 mt-2">Admin Portal</p>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem
            icon={<BarChart3 size={20} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <NavItem
            icon={<UserCheck size={20} />}
            label="Therapists"
            active={activeTab === "therapists"}
            onClick={() => setActiveTab("therapists")}
            badge={stats.pendingTherapists}
          />
          <NavItem
            icon={<FileText size={20} />}
            label="Blogs"
            active={activeTab === "blogs"}
            onClick={() => setActiveTab("blogs")}
            badge={stats.pendingBlogs}
          />
          <NavItem
            icon={<ClipboardList size={20} />}
            label="Surveys"
            active={activeTab === "surveys"}
            onClick={() => setActiveTab("surveys")}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="mb-3 px-2">
            <p className="text-xs text-gray-400 font-medium">Signed in as</p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.full_name || user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.full_name?.split(" ")[0]}
            </h2>
            <p className="text-gray-600">
              Manage your platform from this admin dashboard
            </p>
          </div>

          {/* Tabs Content */}
          {activeTab === "overview" && <OverviewTab stats={stats} />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "therapists" && <TherapistsTab />}
          {activeTab === "blogs" && <BlogsTab />}
          {activeTab === "surveys" && <SurveysTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};

// Internal NavItem Helper
const NavItem = ({ icon, label, active, onClick, badge = 0 }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
      active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    {icon}
    <span className="flex-1 text-left font-medium">{label}</span>
    {badge > 0 && (
      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
        {badge}
      </span>
    )}
  </button>
);

export default AdminDashboard;
