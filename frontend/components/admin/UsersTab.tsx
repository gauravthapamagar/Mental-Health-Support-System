"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Shield,
} from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const UsersTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await adminApiCall("/users/");
        if (res?.ok) setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []); // Run only on mount

  // Client-side filtering
  const filteredUsers = users.filter((user) => {
    // Role Filter
    if (roleFilter !== "all") {
      if (!user.role || user.role.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }
    }

    // Status Filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "true";
      if (user.is_active !== isActive) return false;
    }

    // Search Filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = user.full_name?.toLowerCase().includes(searchLower);
      const matchesEmail = user.email?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesEmail) return false;
    }

    return true;
  });

  // Debugging logs
  useEffect(() => {
    console.log("State Updated:", { roleFilter, statusFilter, searchTerm });
    console.log("Total Users:", users.length);
    console.log("Filtered Users:", filteredUsers.length);
    if (users.length > 0) {
      console.log("Sample User Role:", users[0].role);
    }
  }, [roleFilter, statusFilter, searchTerm, users, filteredUsers.length]);

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      admin: { bg: "bg-red-50", text: "text-red-700" },
      therapist: { bg: "bg-green-50", text: "text-green-700" },
      patient: { bg: "bg-blue-50", text: "text-blue-700" },
    };
    return config[role] || config.patient;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="text-blue-600" size={28} />
            User Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage all platform users and their roles
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:flex-none">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="therapist">Therapists</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                Total Users
              </p>
              <p className="text-2xl font-bold text-blue-900">{users.length}</p> {/* Keep Total relative to ALL users */}
            </div>
            <UsersIcon className="text-blue-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-semibold uppercase mb-1">
                Active Users
              </p>
              <p className="text-2xl font-bold text-green-900">
                {users.filter((u) => u.is_active).length}
              </p>
            </div>
            <UserCheck className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-semibold uppercase mb-1">
                Therapists
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {users.filter((u) => u.role === "therapist").length}
              </p>
            </div>
            <Shield className="text-purple-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-semibold uppercase mb-1">
                Patients
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {users.filter((u) => u.role === "patient").length}
              </p>
            </div>
            <UsersIcon className="text-orange-400" size={32} />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <UsersIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No users found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your filters or search term.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user: any) => {
                  const roleBadge = getRoleBadge(user.role);
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {user.full_name || "No Name"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Mail size={12} className="text-gray-400" />
                            <span className="truncate max-w-[150px]">
                              {user.email}
                            </span>
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Phone size={12} className="text-gray-400" />
                              <span>{user.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleBadge.bg} ${roleBadge.text}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.is_active ? (
                            <UserCheck size={12} />
                          ) : (
                            <UserX size={12} />
                          )}
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar size={12} className="text-gray-400" />
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                    {selectedUser.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedUser.full_name || "Unknown User"}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Role" value={selectedUser.role} />
                  <InfoItem
                    label="Status"
                    value={selectedUser.is_active ? "Active" : "Inactive"}
                  />
                  <InfoItem
                    label="Phone"
                    value={selectedUser.phone_number || "N/A"}
                  />
                  <InfoItem
                    label="Gender"
                    value={selectedUser.gender || "N/A"}
                  />
                  <InfoItem
                    label="Date of Birth"
                    value={
                      selectedUser.date_of_birth
                        ? new Date(
                            selectedUser.date_of_birth,
                          ).toLocaleDateString()
                        : "N/A"
                    }
                  />
                  <InfoItem
                    label="Joined"
                    value={
                      selectedUser.created_at
                        ? new Date(selectedUser.created_at).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Permissions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <PermissionBadge
                    label="Staff Access"
                    enabled={selectedUser.is_staff}
                  />
                  <PermissionBadge
                    label="Superuser"
                    enabled={selectedUser.is_superuser}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
      {label}
    </p>
    <p className="text-sm text-gray-900 font-medium capitalize">{value}</p>
  </div>
);

const PermissionBadge = ({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) => (
  <div
    className={`p-3 rounded-lg border-2 ${
      enabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {enabled ? (
        <UserCheck className="text-green-600" size={18} />
      ) : (
        <UserX className="text-gray-400" size={18} />
      )}
    </div>
  </div>
);

export default UsersTab;
