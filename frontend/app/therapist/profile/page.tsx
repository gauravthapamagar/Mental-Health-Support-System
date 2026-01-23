"use client";
import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Save,
  Camera,
  Loader2,
  AlertCircle,
  Briefcase,
  Stethoscope,
  DollarSign,
  BadgeCheck,
  Calendar,
  Plus,
  X,
  Globe,
  Clock,
  MapPin,
} from "lucide-react";
import { therapistAPI } from "@/lib/api";

export default function TherapistProfile() {
  const [activeTab, setActiveTab] = useState("professional");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    profession_type: "",
    license_id: "",
    years_of_experience: 0,
    bio: "",
    consultation_fees: "",
    consultation_mode: "online",
    specialization_tags: [] as string[],
    languages_spoken: [] as string[],
    availability_slots: "" as string, // Matching your admin's text area/structure
    is_verified: false,
  });

  const [newTag, setNewTag] = useState("");
  const [newLang, setNewLang] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await therapistAPI.getProfile();
        setFormData({
          full_name: data.user?.full_name || "",
          email: data.user?.email || "",
          phone_number: data.phone_number || "",
          profession_type: data.profession_type || "therapist",
          license_id: data.license_id || "",
          years_of_experience: data.years_of_experience || 0,
          bio: data.bio || "",
          consultation_fees: data.consultation_fees || "",
          consultation_mode: data.consultation_mode || "online",
          specialization_tags: data.specialization_tags || [],
          languages_spoken: data.languages_spoken || [],
          availability_slots:
            typeof data.availability_slots === "string"
              ? data.availability_slots
              : JSON.stringify(data.availability_slots, null, 2),
          is_verified: data.is_verified || false,
        });

        // Set profile picture preview if it exists from backend
        if (data.profile_picture) {
          setPreviewUrl(data.profile_picture);
        }
      } catch (err: any) {
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      // Local preview for immediate feedback
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

    const handleSave = async () => {
  setSaving(true);
  setError(null);
  try {
    const dataToSend = new FormData();

    // 1. Handle Profile Picture - ONLY append if it's a NEW File object
    if (profilePicture instanceof File) {
      console.log("✅ Appending new profile picture file:", profilePicture.name);
      dataToSend.append("profile_picture", profilePicture);
    } else {
      console.log("ℹ️ No new profile picture to upload");
    }

    // 2. Append Standard Fields
    dataToSend.append("phone_number", formData.phone_number || "");
    dataToSend.append("license_id", formData.license_id || "");
    dataToSend.append(
      "years_of_experience",
      String(formData.years_of_experience || 0),
    );
    dataToSend.append("bio", formData.bio || "");
    dataToSend.append(
      "consultation_fees",
      String(formData.consultation_fees || 0),
    );
    dataToSend.append("consultation_mode", formData.consultation_mode || "");

    // 3. JSON stringify array fields
    dataToSend.append(
      "specialization_tags",
      JSON.stringify(formData.specialization_tags || []),
    );
    dataToSend.append(
      "languages_spoken",
      JSON.stringify(formData.languages_spoken || []),
    );

    // 4. Use the 'schedule' state directly
    dataToSend.append("availability_slots", JSON.stringify(schedule || {}));

    // Debug: Log all FormData entries
    console.log("📦 FormData contents:");
    for (let pair of dataToSend.entries()) {
      console.log(`  ${pair[0]}:`, pair[1]);
    }

    // 5. API Call
    console.log("🚀 Sending request...");
    const response = await therapistAPI.updateProfile(dataToSend);
    console.log("✅ Response received:", response);
    
    alert("Profile updated successfully!");
    window.location.reload();
  } catch (err: any) {
    console.error("❌ Full error object:", err);
    console.error("❌ Error response:", err.response);
    console.error("❌ Error response data:", err.response?.data);
    console.error("❌ Error response status:", err.response?.status);
    console.error("❌ Error message:", err.message);
    
    const errorData = err.response?.data;
    
    setError(
      errorData && Object.keys(errorData).length > 0
        ? JSON.stringify(errorData, null, 2)
        : err.message || "Update failed. Please check your data.",
    );
  } finally {
    setSaving(false);
  }
};
  const addItem = (type: "tags" | "langs") => {
    if (type === "tags" && newTag) {
      setFormData((prev) => ({
        ...prev,
        specialization_tags: [...prev.specialization_tags, newTag],
      }));
      setNewTag("");
    } else if (type === "langs" && newLang) {
      setFormData((prev) => ({
        ...prev,
        languages_spoken: [...prev.languages_spoken, newLang],
      }));
      setNewLang("");
    }
  };
  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [schedule, setSchedule] = useState<{ [key: string]: string[] }>({});
  useEffect(() => {
    if (formData.availability_slots) {
      try {
        const parsed =
          typeof formData.availability_slots === "string"
            ? JSON.parse(formData.availability_slots)
            : formData.availability_slots;
        setSchedule(parsed || {});
      } catch (e) {
        setSchedule({});
      }
    }
  }, [formData.availability_slots]);
  const addTimeSlot = (day: string) => {
    const updated = {
      ...schedule,
      [day]: [...(schedule[day] || []), "09:00 - 10:00"],
    };
    setSchedule(updated);
    setFormData((prev) => ({
      ...prev,
      availability_slots: JSON.stringify(updated),
    }));
  };

  const updateTimeSlot = (day: string, index: number, value: string) => {
    const updatedDay = [...schedule[day]];
    updatedDay[index] = value;
    const updatedSchedule = { ...schedule, [day]: updatedDay };
    setSchedule(updatedSchedule);
    setFormData((prev) => ({
      ...prev,
      availability_slots: JSON.stringify(updatedSchedule),
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    const updatedDay = schedule[day].filter((_, i) => i !== index);
    const updatedSchedule = { ...schedule, [day]: updatedDay };
    setSchedule(updatedSchedule);
    setFormData((prev) => ({
      ...prev,
      availability_slots: JSON.stringify(updatedSchedule),
    }));
  };
  if (loading)
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Professional Profile
        </h1>
        <p className="text-slate-600">
          Update your clinical details and practice settings
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-200">
              <div className="relative group">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold relative mb-4 overflow-hidden border-2 border-white shadow-sm">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    formData.full_name?.charAt(0)
                  )}
                  {formData.is_verified && (
                    <BadgeCheck className="absolute top-0 right-0 w-5 h-5 text-blue-500 fill-white z-10" />
                  )}
                </div>
                <label className="absolute bottom-4 -right-1 p-1.5 bg-white rounded-full shadow-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <Camera className="w-4 h-4 text-slate-600" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <h3 className="font-bold text-slate-900">{formData.full_name}</h3>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                {formData.profession_type}
              </p>
            </div>

            <nav className="space-y-1">
              {[
                {
                  id: "professional",
                  label: "Basic Info",
                  icon: <User className="w-4 h-4" />,
                },
                {
                  id: "practice",
                  label: "Clinical & Fees",
                  icon: <Stethoscope className="w-4 h-4" />,
                },
                {
                  id: "expertise",
                  label: "Expertise",
                  icon: <Globe className="w-4 h-4" />,
                },
                {
                  id: "availability",
                  label: "Schedule",
                  icon: <Clock className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.icon} <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Form Body */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {activeTab === "professional" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={5}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Profession Type
                    </label>
                    <select
                      name="profession_type"
                      value={formData.profession_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    >
                      <option value="psychologist">Psychologist</option>
                      <option value="psychiatrist">Psychiatrist</option>
                      <option value="counselor">Counselor</option>
                      <option value="social_worker">Social Worker</option>
                      <option value="therapist">Therapist</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "practice" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Clinical Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      License ID
                    </label>
                    <input
                      name="license_id"
                      value={formData.license_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="years_of_experience"
                      value={formData.years_of_experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Consultation Mode
                    </label>
                    <select
                      name="consultation_mode"
                      value={formData.consultation_mode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Consultation Fee ($)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="consultation_fees"
                        value={formData.consultation_fees}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "expertise" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Expertise & Languages
                  </h2>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Specializations
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add specialty..."
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={() => addItem("tags")}
                      className="p-2 bg-blue-600 text-white rounded-xl"
                    >
                      <Plus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.specialization_tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100"
                      >
                        {tag}{" "}
                        <X
                          className="w-4 h-4 cursor-pointer"
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              specialization_tags: p.specialization_tags.filter(
                                (_, idx) => idx !== i,
                              ),
                            }))
                          }
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Languages Spoken
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                      placeholder="Add language..."
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={() => addItem("langs")}
                      className="p-2 bg-blue-600 text-white rounded-xl"
                    >
                      <Plus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages_spoken.map((lang, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200"
                      >
                        {lang}{" "}
                        <X
                          className="w-4 h-4 cursor-pointer"
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              languages_spoken: p.languages_spoken.filter(
                                (_, idx) => idx !== i,
                              ),
                            }))
                          }
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "availability" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Weekly Availability
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Set your recurring weekly consultation hours.
                  </p>
                </div>

                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day}
                      className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" /> {day}
                        </h4>
                        <button
                          onClick={() => addTimeSlot(day)}
                          className="text-xs flex items-center gap-1 bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-sm"
                        >
                          <Plus className="w-3 h-3" /> Add Slot
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {schedule[day] && schedule[day].length > 0 ? (
                          schedule[day].map((slot, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm"
                            >
                              <input
                                type="text"
                                value={slot}
                                placeholder="e.g. 9:00 AM - 10:00 AM"
                                onChange={(e) =>
                                  updateTimeSlot(day, index, e.target.value)
                                }
                                className="text-sm font-medium text-slate-600 outline-none w-40"
                              />
                              <button
                                onClick={() => removeTimeSlot(day, index)}
                                className="text-red-400 hover:text-red-600 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            No slots added for this day.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? "Updating Profile..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
