"use client";
import React, { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { bookingAPI } from "@/lib/api";

interface NextAppointment {
  id: number;
  date: string;
  start_time: string;
  therapist_name: string;
  therapist_id: number;
  session_mode: string;
  appointment_type: string;
}

interface DashboardStats {
  total_appointments: number;
  completed_sessions: number;
  upcoming_sessions: number;
  cancelled_sessions: number;
  completion_rate: number;
  next_appointment: NextAppointment | null;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  href?: string;
  isLoading?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  href,
  isLoading,
}: StatCardProps) {
  const content = (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      {isLoading ? (
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-32 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 w-40 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            {icon}
            <div className="text-xs font-medium text-gray-600 uppercase">
              {label}
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </>
      )}
    </div>
  );

  if (href && !isLoading) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function StatsGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await bookingAPI.getPatientDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Next Appointment */}
      <StatCard
        icon={<Calendar className="text-blue-600" size={24} />}
        label="Next Therapy Session"
        value={
          stats?.next_appointment
            ? `${formatDate(stats.next_appointment.date)}, ${stats.next_appointment.start_time}`
            : "No upcoming"
        }
        subtitle={
          stats?.next_appointment?.therapist_name || "Schedule an appointment"
        }
        href={
          stats?.next_appointment
            ? "/patient/appointments"
            : "/patient/book-appointment"
        }
        isLoading={loading}
      />

      {/* Total Sessions */}
      <StatCard
        icon={<TrendingUp className="text-purple-600" size={24} />}
        label="Total Sessions"
        value={loading ? "..." : stats?.total_appointments.toString() || "0"}
        subtitle={`${stats?.upcoming_sessions || 0} upcoming`}
        href="/patient/appointments"
        isLoading={loading}
      />

      {/* Completed Sessions */}
      <StatCard
        icon={<CheckCircle className="text-green-600" size={24} />}
        label="Completed Sessions"
        value={loading ? "..." : stats?.completed_sessions.toString() || "0"}
        subtitle={`${stats?.completion_rate || 0}% completion rate`}
        isLoading={loading}
      />

      {/* Pending Sessions */}
      <StatCard
        icon={<Clock className="text-orange-600" size={24} />}
        label="Upcoming Sessions"
        value={loading ? "..." : stats?.upcoming_sessions.toString() || "0"}
        subtitle="Scheduled appointments"
        href="/patient/appointments"
        isLoading={loading}
      />
    </div>
  );
}
