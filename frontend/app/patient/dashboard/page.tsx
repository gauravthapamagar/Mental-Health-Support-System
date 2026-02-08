"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import StatsGrid from "@/components/patient/dashboard/StatsGrid";
import UpcomingSessions from "@/components/patient/dashboard/UpcomingSessions";
import { matchingAPI, journalAPI, bookingAPI } from "@/lib/api";

interface DashboardData {
  upcomingAppointments: any[];
  matchScore: number | null;
  moodSentiment: string;
  insightCount: number;
  loading: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good morning");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    upcomingAppointments: [],
    matchScore: null,
    moodSentiment: "",
    insightCount: 0,
    loading: true
  });

  // Get the first name from the full_name string
  const firstName = user?.full_name?.split(" ")[0] || "User";

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    };

    setGreeting(getGreeting());
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use Promise.allSettled to ensure one failure doesn't break everything
      const [appointmentsRes, matchRes, journalRes] = await Promise.allSettled([
        bookingAPI.getMyAppointments('upcoming'),
        matchingAPI.getLatestMatch(),
        journalAPI.getSummary()
      ]);

      const upcomingAppointments = appointmentsRes.status === 'fulfilled' 
        ? (appointmentsRes.value.results || []) 
        : [];
      
      const matchScore = (matchRes.status === 'fulfilled' && matchRes.value?.data?.top_match_1_score)
        ? Math.round(matchRes.value.data.top_match_1_score)
        : null;

      // Journal summary structure depends on backend, assuming safe defaults
      const moodSentiment = journalRes.status === 'fulfilled' 
        ? (journalRes.value?.dominant_mood || "Stable") // Adjust based on actual API
        : "";
      
      const insightCount = journalRes.status === 'fulfilled'
        ? (journalRes.value?.total_entries || 0)
        : 0;

      setDashboardData({
        upcomingAppointments,
        matchScore,
        moodSentiment,
        insightCount,
        loading: false
      });

    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {firstName}
        </h1>
        <p className="text-gray-600">
          Here is what is happening with your health today.
        </p>
      </div>

      <StatsGrid stats={{
        nextSession: dashboardData.upcomingAppointments[0],
        matchScore: dashboardData.matchScore,
        moodSentiment: dashboardData.moodSentiment,
        insightCount: dashboardData.insightCount
      }} />

      <div className="mt-8">
        <UpcomingSessions appointments={dashboardData.upcomingAppointments} />
      </div>
    </div>
  );
}
