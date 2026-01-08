"use client";
import { useState, useEffect } from "react";
import {
  getTherapistProfile,
  updateTherapistProfile,
} from "@/lib/api/therapist";
import {
  User,
  Mail,
  Phone,
  Award,
  BookOpen,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Camera,
  DollarSign,
  Clock,
  FileText,
} from "lucide-react";

export default function TherapistProfile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    specialization: "",
    experience: "",
    bio: "",
    hourlyRate: "",
    startTime: "",
    endTime: "",
    availableMonday: false,
    availableTuesday: false,
    availableWednesday: false,
    availableThursday: false,
    availableFriday: false,
    availableSaturday: false,
    availableSunday: false,
  });
  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const data = await getTherapistProfile(token);
        setProfile(data);
        setFormData({
          fullName: data.user?.full_name || "",

          email: data.user?.email || "",
          phone: data.phone_number || "",

          licenseNumber: data.license_id || "",
          specialization: data.profession_type || "",
          experience: data.years_of_experience?.toString() || "",
          bio: data.bio || "",
          hourlyRate: data.hourly_rate?.toString() || "",
          startTime: data.start_time || "",
          endTime: data.end_time || "",

          availableMonday: data.available_days?.includes("Monday") || false,
          availableTuesday: data.available_days?.includes("Tuesday") || false,
          availableWednesday:
            data.available_days?.includes("Wednesday") || false,
          availableThursday: data.available_days?.includes("Thursday") || false,
          availableFriday: data.available_days?.includes("Friday") || false,
          availableSaturday: data.available_days?.includes("Saturday") || false,
          availableSunday: data.available_days?.includes("Sunday") || false,
        });
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const payload = {
        license_id: formData.licenseNumber,
        profession_type: formData.specialization,
        years_of_experience: Number(formData.experience),
        bio: formData.bio,
        hourly_rate: Number(formData.hourlyRate),
        start_time: formData.startTime,
        end_time: formData.endTime,
        available_days: [
          formData.availableMonday && "Monday",
          formData.availableTuesday && "Tuesday",
          formData.availableWednesday && "Wednesday",
          formData.availableThursday && "Thursday",
          formData.availableFriday && "Friday",
          formData.availableSaturday && "Saturday",
          formData.availableSunday && "Sunday",
        ].filter(Boolean),
      };

      await updateTherapistProfile(token, payload);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const tabs = [
    {
      id: "personal",
      label: "Personal Info",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "professional",
      label: "Professional",
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: "availability",
      label: "Availability",
      icon: <Clock className="w-4 h-4" />,
    },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
  ];

  const daysOfWeek = [
    { key: "availableMonday", label: "Monday" },
    { key: "availableTuesday", label: "Tuesday" },
    { key: "availableWednesday", label: "Wednesday" },
    { key: "availableThursday", label: "Thursday" },
    { key: "availableFriday", label: "Friday" },
    { key: "availableSaturday", label: "Saturday" },
    { key: "availableSunday", label: "Sunday" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">
            Manage your professional profile and settings
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-200">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {formData.fullName
                      ?.split(" ")
                      .map((n) => n[0]?.toUpperCase())
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <Camera className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-900">
                  {formData.fullName}
                </h3>
                <p className="text-sm text-slate-500">Therapist</p>
                {profile?.is_verified && (
                  <span className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Verified
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-purple-50 text-purple-700 font-semibold"
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
                        fullName
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
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
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
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
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Tab */}
              {activeTab === "professional" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                      Professional Details
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                      Manage your credentials and professional information
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        License Number
                      </label>
                      <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Years of Experience
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Specialization
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          placeholder="e.g., Clinical Psychology, CBT, Trauma"
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Professional Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Hourly Rate ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          name="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Upload Documents
                      </label>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-purple-500 transition-colors text-slate-600 hover:text-purple-600">
                        <FileText className="w-5 h-5" />
                        <span className="text-sm font-semibold">
                          Upload License/Certificates
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Availability Tab */}
              {activeTab === "availability" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                      Availability Schedule
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                      Set your working hours and available days
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-4">
                        Available Days
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {daysOfWeek.map((day) => (
                          <label
                            key={day.key}
                            className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              formData[day.key]
                                ? "border-purple-500 bg-purple-50"
                                : "border-slate-200 hover:border-purple-300"
                            }`}
                          >
                            <span className="text-sm font-medium text-slate-700">
                              {day.label}
                            </span>
                            <input
                              type="checkbox"
                              name={day.key}
                              checked={formData[day.key]}
                              onChange={handleInputChange}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                          </label>
                        ))}
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
                          className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
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
                          className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
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
                          className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
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
                      Choose how you want to receive updates
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-purple-300 transition-colors">
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
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-purple-300 transition-colors">
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Booking Notifications
                        </h4>
                        <p className="text-sm text-slate-600">
                          New patient bookings
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="bookingNotifications"
                          checked={formData.bookingNotifications}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-purple-300 transition-colors">
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Cancellation Alerts
                        </h4>
                        <p className="text-sm text-slate-600">
                          Patient cancellations
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="cancelNotifications"
                          checked={formData.cancelNotifications}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
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
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
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
