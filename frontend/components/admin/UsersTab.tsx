"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Users as UsersIcon,
  UserCheck,
  Shield,
  AlertCircle,
  Mail,
  Calendar,
} from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const UsersTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiCall("/users/");
      if (res?.ok) {
        setUsers(res.data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((user) => {
    if (
      roleFilter !== "all" &&
      user.role?.toLowerCase() !== roleFilter.toLowerCase()
    ) {
      return false;
    }
    if (
      statusFilter !== "all" &&
      user.is_active !== (statusFilter === "true")
    ) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !user.full_name?.toLowerCase().includes(searchLower) &&
        !user.email?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      admin: { bg: "bg-red-100", text: "text-red-700" },
      therapist: { bg: "bg-purple-100", text: "text-purple-700" },
      patient: { bg: "bg-blue-100", text: "text-blue-700" },
    };
    return config[role] || config.patient;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 flex items-start gap-4">
        <AlertCircle className="text-red-600 flex-shrink-0" size={28} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">
            Failed to Load Users
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => loadUsers()}
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
            <h1 className="text-4xl font-bold mb-2">User Management</h1>
            <p className="text-blue-100 text-lg">
              Manage all platform users and their roles
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-cyan-300 animate-pulse"></div>
            <span className="text-sm font-medium">{users.length} Users</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<UsersIcon size={28} />}
          title="Total Users"
          value={users.length}
          gradient="from-blue-500 to-cyan-500"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<UserCheck size={28} />}
          title="Active Users"
          value={users.filter((u) => u.is_active).length}
          gradient="from-green-500 to-emerald-500"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={<Shield size={28} />}
          title="Therapists"
          value={users.filter((u) => u.role === "therapist").length}
          gradient="from-purple-500 to-pink-500"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={<UsersIcon size={28} />}
          title="Patients"
          value={users.filter((u) => u.role === "patient").length}
          gradient="from-orange-500 to-red-500"
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="therapist">Therapists</option>
            <option value="patient">Patients</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-2xl p-16 text-center">
          <div className="p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="text-blue-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Users Found
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "No users match your search."
              : "Adjust your filters to see users."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => {
            const roleBadge = getRoleBadge(user.role);

            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* User Name & Email */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      User
                    </p>
                    <p className="font-semibold text-gray-900">
                      {user.full_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1 mt-1">
                      <Mail size={14} className="text-gray-400" />
                      {user.email}
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Role
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}
                    >
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Joined Date */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Joined
                    </p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  {/* Staff Access */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Access
                    </p>
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${user.is_staff ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {user.is_staff ? "Staff" : "User"}
                      </span>
                    </div>
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

const StatCard = ({ icon, title, value, gradient, iconBg, iconColor }: any) => (
  <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
    <div className={`bg-gradient-to-r ${gradient} h-1`}></div>
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          {React.cloneElement(icon, { className: iconColor })}
        </div>
      </div>
      <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default UsersTab;
