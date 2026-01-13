"use client";
import React, { useState, useEffect } from "react";
import { Search, Eye, Edit, Trash2 } from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await adminApiCall("/users/");
      if (res?.ok) setUsers(res.data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">User Management</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {/* Fallback to email if full_name is missing */}
                  <div className="font-medium">
                    {user.full_name || "No Name"}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 capitalize">
                  {/* Ensure role is displayed or fallback */}
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                    {user.role || "User"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-2">
                  <button className="p-1 hover:text-blue-600">
                    <Eye size={18} />
                  </button>
                  <button className="p-1 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
