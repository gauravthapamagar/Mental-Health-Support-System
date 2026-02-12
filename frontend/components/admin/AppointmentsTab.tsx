"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Search,
  Clock,
  Video,
  MapPin,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  Filter,
} from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; icon: any }
> = {
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  confirmed: { label: "Confirmed", bg: "bg-blue-50", text: "text-blue-700", icon: CheckCircle },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", icon: AlertCircle },
  awaiting_payment: { label: "Awaiting Payment", bg: "bg-purple-50", text: "text-purple-700", icon: AlertCircle },
  no_show: { label: "No Show", bg: "bg-gray-100", text: "text-gray-600", icon: AlertCircle },
};

const typeLabels: Record<string, string> = {
  initial: "Initial Consultation",
  followup: "Follow-up Session",
  emergency: "Emergency Session",
};

const AppointmentsTab = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchTerm) params.set("search", searchTerm);

      const res = await adminApiCall(
        `/admin/appointments/?${params.toString()}`,
      );

      if (res?.ok) {
        setAppointments(res.data.appointments || res.data || []);
      } else if (res?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (res?.status === 404) {
        setAppointments([]);
      } else {
        setError(res?.data?.error || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [statusFilter, searchTerm, loadData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="text-red-600" size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Appointments</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Appointments</h1>
            <p className="text-blue-100 text-lg">Monitor and manage all platform appointments</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-cyan-300 animate-pulse"></div>
            <span className="text-sm font-medium">{appointments.length} Appointments</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total"
          value={appointments.length}
          color="blue"
        />
        <StatCard
          label="Pending"
          value={appointments.filter((a) => a.status === "pending").length}
          color="amber"
        />
        <StatCard
          label="Confirmed"
          value={appointments.filter((a) => a.status === "confirmed").length}
          color="green"
        />
        <StatCard
          label="Completed"
          value={appointments.filter((a) => a.status === "completed").length}
          color="emerald"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient or therapist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="awaiting_payment">Awaiting Payment</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-2xl p-16 text-center">
          <div className="p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-blue-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Appointments Found</h3>
          <p className="text-gray-600">
            {searchTerm ? "No appointments match your search." : "Appointments will appear here once patients book sessions."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => {
            const sc = statusConfig[appointment.status] || statusConfig.pending;
            const StatusIcon = sc.icon;

            return (
              <div
                key={appointment.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Patient */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Patient</p>
                    <p className="font-semibold text-gray-900">{appointment.patient_name}</p>
                    <p className="text-sm text-gray-500 truncate">{appointment.patient_email}</p>
                  </div>

                  {/* Therapist */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Therapist</p>
                    <p className="font-semibold text-gray-900">{appointment.therapist_name}</p>
                    <p className="text-sm text-gray-500 truncate">{appointment.therapist_email}</p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date & Time</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> {appointment.start_time}
                    </p>
                  </div>

                  {/* Type & Mode */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Details</p>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {typeLabels[appointment.appointment_type] || appointment.appointment_type}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      {appointment.session_mode === "online" ? (
                        <>
                          <Video size={14} className="text-blue-500" />
                          Online
                        </>
                      ) : (
                        <>
                          <MapPin size={14} className="text-orange-500" />
                          In-Person
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-end">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium ${sc.bg} ${sc.text}`}>
                      <StatusIcon size={16} />
                      {sc.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }: any) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    amber: "bg-amber-50 border-amber-200 text-amber-600",
    green: "bg-green-50 border-green-200 text-green-600",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default AppointmentsTab;
