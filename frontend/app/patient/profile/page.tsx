"use client";
import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Camera,
} from "lucide-react";

export default function PatientProfile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "john_doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1995-06-15",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    smsNotifications: false,
    sessionReminders: true,
    emergencyContact: "+1 (555) 987-6543",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    console.log("Saving profile data:", formData);
    alert("Profile updated successfully!");
  };

  const tabs = [
    {
      id: "personal",
      label: "Personal Info",
      icon: <User className="w-4 h-4" />,
    },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    { id: "privacy", label: "Privacy", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-200">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    JD
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <Camera className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-900">
                  {formData.username}
                </h3>
                <p className="text-sm text-slate-500">Patient</p>
              </div>

              {/* Tabs */}
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              {/* Personal Info Tab */}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                      Personal Information
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                      Update your personal details and contact information
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Emergency Contact
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                      Security Settings
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                      Manage your password and security preferences
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Password requirements:</strong> At least 8
                        characters, including uppercase, lowercase, number, and
                        special character.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                      Notification Preferences
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                      Choose how you want to receive updates and reminders
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Email Notifications
                        </h4>
                        <p className="text-sm text-slate-600">
                          Receive updates via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          SMS Notifications
                        </h4>
                        <p className="text-sm text-slate-600">
                          Receive text messages
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="smsNotifications"
                          checked={formData.smsNotifications}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Session Reminders
                        </h4>
                        <p className="text-sm text-slate-600">
                          Get reminded before appointments
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="sessionReminders"
                          checked={formData.sessionReminders}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                      Privacy & Data
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                      Manage your privacy settings and data preferences
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 border-2 border-slate-200 rounded-xl">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Data Sharing
                      </h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Control how your data is shared with therapists and
                        healthcare providers
                      </p>
                      <button className="text-sm text-blue-600 font-semibold hover:underline">
                        Manage Data Sharing
                      </button>
                    </div>

                    <div className="p-6 border-2 border-slate-200 rounded-xl">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Download Your Data
                      </h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Request a copy of all your personal data
                      </p>
                      <button className="text-sm text-blue-600 font-semibold hover:underline">
                        Request Data Export
                      </button>
                    </div>

                    <div className="p-6 border-2 border-red-200 rounded-xl bg-red-50">
                      <h4 className="font-semibold text-red-900 mb-2">
                        Delete Account
                      </h4>
                      <p className="text-sm text-red-700 mb-4">
                        Permanently delete your account and all associated data
                      </p>
                      <button className="text-sm text-red-600 font-semibold hover:underline">
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-4">
                <button className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
