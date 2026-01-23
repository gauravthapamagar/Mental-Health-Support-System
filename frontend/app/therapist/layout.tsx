// app/therapist/layout.tsx - UPDATED VERSION
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=" + pathname);
      return;
    }

    // If authenticated but not a therapist, redirect to appropriate dashboard
    if (user && user.role !== "therapist") {
      if (user.role === "patient") {
        router.replace("/patient");
      } else if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
      return;
    }

    // User is verified as therapist
    setIsVerified(true);
  }, [user, isAuthenticated, loading, pathname, router]);

  // Show loading state
  if (loading || !isVerified) {
    return (
      <>
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        {children}
      </div>
    </>
  );
}
