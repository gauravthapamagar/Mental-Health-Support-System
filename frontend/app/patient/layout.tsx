// app/patient/layout.tsx - FIXED VERSION
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/patient/shared/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  // Check if current page is the landing page
  const isLandingPage = pathname === "/patient";

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=" + pathname);
      return;
    }

    // If authenticated but not a patient, redirect to appropriate dashboard
    if (user && user.role !== "patient") {
      if (user.role === "therapist") {
        router.replace("/therapist/dashboard");
      } else if (user.role === "admin") {
        router.replace("/admin");
      }
    }
  }, [user, isAuthenticated, loading, pathname, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or wrong role, don't render (redirect in progress)
  if (!isAuthenticated || (user && user.role !== "patient")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Get page title for non-landing pages
  const getPageTitle = () => {
    const pathParts = pathname.split("/").filter((part) => part !== "");
    const lastPart = pathParts[pathParts.length - 1] || "Dashboard";
    return (
      lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, " ")
    );
  };

  const pageTitle = getPageTitle();

  // Render landing page without sidebar
  if (isLandingPage) {
    return <>{children}</>;
  }

  // Render dashboard pages with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-8">
          <header className="py-6">
            <nav className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              User Portal / <span className="text-gray-600">{pageTitle}</span>
            </nav>
          </header>

          <main className="pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
