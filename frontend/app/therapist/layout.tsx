"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import { authAPI } from "@/lib/api";

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyTherapist = async () => {
      try {
        const user = await authAPI.getCurrentUser();

        if (user.role !== "therapist") {
          router.push("/auth/login");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/auth/login");
      }
    };

    verifyTherapist();
  }, [router]);

  if (loading) {
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
