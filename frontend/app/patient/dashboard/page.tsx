"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/authcontext"; // Adjust this path if your file name is different
import StatsGrid from "@/components/patient/dashboard/StatsGrid";
import UpcomingSessions from "@/components/patient/dashboard/UpcomingSessions";
import CarePlan from "@/components/patient/dashboard/CarePlan";

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good morning");

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
  }, []);

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

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <UpcomingSessions />
        </div>
        <div>
          <CarePlan />
        </div>
      </div>
    </div>
  );
}
