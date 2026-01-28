"use client";
import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Eye,
  FileText,
  Activity,
  TrendingUp,
} from "lucide-react";
import { bookingAPI } from "@/lib/api";

interface Patient {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  age: number;
  total_appointments: number;
  completed_sessions: number;
  upcoming_sessions: number;
  cancelled_sessions: number;
  last_appointment_date: string | null;
  next_appointment_date: string | null;
  joined_date: string;
}

const MyPatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatientsList();
  }, [searchQuery, filterStatus, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await bookingAPI.getMyPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatientsList = () => {
    let filtered = patients;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (patient) =>
          patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.phone_number?.includes(searchQuery),
      );
    }

    // Status filter
    if (filterStatus === "active") {
      filtered = filtered.filter((p) => p.upcoming_sessions > 0);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((p) => p.upcoming_sessions === 0);
    }

    setFilteredPatients(filtered);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (patient: Patient) => {
    if (patient.upcoming_sessions > 0) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
        Inactive
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading patients...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Patients</h1>
          <p className="text-gray-600">
            Manage and track your {patients.length} patients
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                Total Patients
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {patients.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-600 font-medium">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {patients.filter((p) => p.upcoming_sessions > 0).length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-500 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                Total Sessions
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {patients.reduce((sum, p) => sum + p.total_appointments, 0)}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-orange-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                Completed
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {patients.reduce((sum, p) => sum + p.completed_sessions, 0)}
            </h3>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filterStatus === "active"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("inactive")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filterStatus === "inactive"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No patients found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "You don't have any patients yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Session
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Next Session
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Patient Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(patient.full_name)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {patient.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {patient.gender} • {patient.age} years
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {patient.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {patient.phone_number || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Sessions */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            Total: {patient.total_appointments}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="text-green-600">
                              ✓ {patient.completed_sessions}
                            </span>
                            <span>•</span>
                            <span className="text-blue-600">
                              → {patient.upcoming_sessions}
                            </span>
                            <span>•</span>
                            <span className="text-red-600">
                              ✕ {patient.cancelled_sessions}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Last Session */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(patient.last_appointment_date)}
                        </div>
                      </td>

                      {/* Next Session */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {formatDate(patient.next_appointment_date)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">{getStatusBadge(patient)}</td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === patient.id ? null : patient.id,
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>

                          {activeMenu === patient.id && (
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                              <button
                                onClick={() =>
                                  (window.location.href = `/therapist/patients/${patient.id}`)
                                }
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() =>
                                  (window.location.href = `/therapist/patients/${patient.id}/notes`)
                                }
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                View Notes
                              </button>
                              <button
                                onClick={() =>
                                  (window.location.href = `/therapist/appointments?patient=${patient.id}`)
                                }
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Calendar className="w-4 h-4" />
                                View Appointments
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyPatientsPage;
