"use client";
import React, { useState } from "react";
import { Settings, Shield, Bell, Globe, Save } from "lucide-react";

const SettingsTab = () => {
  const [notifs, setNotifs] = useState(true);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h2>

      <div className="grid gap-6">
        {/* Platform Config */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold">Security & Access</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="font-medium text-gray-900">
                  New User Registration
                </p>
                <p className="text-sm text-gray-500">
                  Allow new patients to create accounts
                </p>
              </div>
              <input
                type="checkbox"
                className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 cursor-pointer transition-colors relative"
                defaultChecked
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">
                  Therapist Self-Verification
                </p>
                <p className="text-sm text-gray-500">
                  Allow therapists to upload documents
                </p>
              </div>
              <input
                type="checkbox"
                className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 cursor-pointer transition-colors"
                defaultChecked
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="text-orange-500" size={24} />
            <h3 className="text-lg font-semibold">Admin Alerts</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={notifs}
                onChange={() => setNotifs(!notifs)}
                className="rounded text-blue-600 w-4 h-4"
              />
              <span className="text-gray-700">
                Email me when a new therapist applies
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-shadow shadow-md">
            <Save size={18} />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
