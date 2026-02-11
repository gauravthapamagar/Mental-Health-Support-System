"use client";
import { useState, useEffect } from "react";
import React from "react";
import { Upload } from "lucide-react"; // Import Upload icon

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
  Home,
  Locate,
  Building,
  X,
  Globe,
  Clock,
  MapPin,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  Award,
  Heart,
} from "lucide-react";
import { therapistAPI, therapistVerificationAPI } from "@/lib/api";

export default function TherapistProfile() {
  const [activeTab, setActiveTab] = useState("professional");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verificationDocuments, setVerificationDocuments] = useState<
    { type: string; file: File | null; uploaded: boolean }[]
  >([
    { type: 'citizenship', file: null, uploaded: false },
    { type: 'license', file: null, uploaded: false },
    { type: 'education', file: null, uploaded: false },
    { type: 'other', file: null, uploaded: false },
  ]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [existingCertificate, setExistingCertificate] = useState<string | null>(null);

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
    availability_slots: "" as string,
    is_verified: false,
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
  });

  const [newTag, setNewTag] = useState("");
  const [newLang, setNewLang] = useState("");

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateFile(file);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await therapistAPI.getProfile();
        // Ensure all fields have default empty strings instead of null
        setFormData({
          full_name: data.full_name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          profession_type: data.profession_type || "",
          license_id: data.license_id || "",
          years_of_experience: data.years_of_experience || 0,
          bio: data.bio || "",
          consultation_fees: data.consultation_fees || "",
          consultation_mode: data.consultation_mode || "online",
          specialization_tags: data.specialization_tags || [],
          languages_spoken: data.languages_spoken || [],
          availability_slots: data.availability_slots || "",
          is_verified: data.is_verified || false,
          address_line_1: data.address_line_1 || "",
          address_line_2: data.address_line_2 || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          postal_code: data.postal_code || "",
        });
        if (data.profile_picture) {
          setPreviewUrl(data.profile_picture);
        }
        
        // Fetch verification documents
        const docs = await therapistVerificationAPI.getVerificationDocuments();
        console.log("[v0] Fetched verification documents:", docs);
        if (docs && Array.isArray(docs)) {
          console.log("[v0] Documents is array, updating state");
          setVerificationDocuments((prev) =>
            prev.map((doc) => {
              const uploadedDoc = docs.find((d: any) => d.document_type === doc.type);
              console.log("[v0] Doc type:", doc.type, "Found:", !!uploadedDoc);
              return {
                ...doc,
                uploaded: uploadedDoc ? true : false
              };
            })
          );
        } else {
          console.log("[v0] Documents is not an array:", typeof docs);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch profile");
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
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDocumentChange = (
    docType: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setVerificationDocuments((prev) =>
        prev.map((doc) =>
          doc.type === docType ? { ...doc, file } : doc
        )
      );
    }
  };

  const handleUploadDocument = async (docType: string) => {
    const doc = verificationDocuments.find((d) => d.type === docType);
    if (!doc || !doc.file) return;

    setUploadingDoc(docType);
    try {
      const formData = new FormData();
      formData.append('document_type', docType);
      formData.append('document_file', doc.file);

      const response = await therapistVerificationAPI.uploadVerificationDocument(formData);

      setVerificationDocuments((prev) =>
        prev.map((d) =>
          d.type === docType ? { ...d, uploaded: true, file: null } : d
        )
      );

      setSuccessMessage(`${docType} document uploaded successfully!`);
    } catch (err: any) {
      console.error("[v0] Upload error:", err);
      setError(
        err.message || `Failed to upload ${docType} document`
      );
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Step 1: Upload verification documents that have been selected
      const docsToUpload = verificationDocuments.filter((doc) => doc.file && !doc.uploaded);
      
      console.log("[v0] Documents to upload:", docsToUpload.length);
      
      if (docsToUpload.length > 0) {
        for (const doc of docsToUpload) {
          if (doc.file) {
            console.log("[v0] Uploading document:", doc.type);
            const docFormData = new FormData();
            docFormData.append('document_type', doc.type);
            docFormData.append('document_file', doc.file);

            try {
              await therapistVerificationAPI.uploadVerificationDocument(docFormData);
              console.log("[v0] Successfully uploaded:", doc.type);
              
              // Update local state to mark as uploaded
              setVerificationDocuments((prev) =>
                prev.map((d) =>
                  d.type === doc.type ? { ...d, uploaded: true, file: null } : d
                )
              );
            } catch (docErr: any) {
              console.error("[v0] Failed to upload", doc.type, docErr);
              // Continue with other documents instead of failing completely
              setError(`Failed to upload ${doc.type} document: ${docErr.message}`);
            }
          }
        }
      }

      // Step 2: Update therapist profile
      const dataToSend = new FormData();

      if (profilePicture instanceof File) {
        dataToSend.append("profile_picture", profilePicture);
      }
      if (certificateFile instanceof File) {
        dataToSend.append("certificates", certificateFile);
      }

      dataToSend.append("phone_number", formData.phone_number || "");
      dataToSend.append("license_id", formData.license_id || "");
      dataToSend.append(
        "years_of_experience",
        String(formData.years_of_experience || 0)
      );
      dataToSend.append("bio", formData.bio || "");
      dataToSend.append(
        "consultation_fees",
        String(formData.consultation_fees || 0)
      );
      dataToSend.append("consultation_mode", formData.consultation_mode || "");

      dataToSend.append(
        "specialization_tags",
        JSON.stringify(formData.specialization_tags || [])
      );
      dataToSend.append(
        "languages_spoken",
        JSON.stringify(formData.languages_spoken || [])
      );

      dataToSend.append("availability_slots", formData.availability_slots || "");

      // Address fields
      dataToSend.append("address_line_1", formData.address_line_1 || "");
      dataToSend.append("address_line_2", formData.address_line_2 || "");
      dataToSend.append("city", formData.city || "");
      dataToSend.append("state", formData.state || "");
      dataToSend.append("country", formData.country || "");
      dataToSend.append("postal_code", formData.postal_code || "");

      await therapistAPI.updateProfile(dataToSend);

      // Show jaw-dropping success modal
      setShowSuccessModal(true);

      // Auto-hide after 5 seconds
      setTimeout(() => setShowSuccessModal(false), 5000);
    } catch (err: any) {
      setError(err.message || "Update failed. Please check your data.");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin mx-auto"></div>
            <Heart className="w-6 h-6 text-teal-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
      {/* Success Modal - Jaw Dropping */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            {/* Animated Background Circles */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-75"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center space-y-6">
              {/* Success Icon with Animation */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
                <Sparkles className="w-4 h-4 text-blue-400 absolute -bottom-1 -left-1 animate-bounce delay-100" />
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">
                  Profile Updated Successfully!
                </h3>
                <p className="text-slate-600">
                  Your professional profile has been updated and is ready to
                  help more people on their mental health journey.
                </p>
              </div>

              {/* Stats or Additional Info */}
              <div className="grid grid-cols-3 gap-3 py-4">
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-3 border border-teal-100/50">
                  <Award className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">
                    Professional
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-3 border border-blue-100/50">
                  <Heart className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">
                    Verified
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-3 border border-purple-100/50">
                  <Sparkles className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Active</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-25 md:pb-16">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Professional Profile
            </h1>
          </div>
          <p className="text-slate-600 ml-14">
            Manage your professional information to help clients find the right
            care
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/60 p-6 sticky top-6 hover:shadow-xl transition-all duration-300">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-8 pb-6 border-b border-slate-100">
                <div className="relative group mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                    {previewUrl ? (
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                        {formData.full_name?.charAt(0)}
                      </div>
                    )}
                    {formData.is_verified && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                        <BadgeCheck className="w-5 h-5 text-teal-500" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-teal-100 cursor-pointer hover:bg-teal-50 transition-all hover:scale-110">
                    <Camera className="w-4 h-4 text-teal-600" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {formData.full_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-teal-600 font-semibold uppercase tracking-wide">
                    {formData.profession_type}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1.5">
                {[{
                  id: "professional",
                  label: "Personal Info",
                  icon: <User className="w-4 h-4" />,
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  id: "practice",
                  label: "Practice Details",
                  icon: <Stethoscope className="w-4 h-4" />,
                  gradient: "from-teal-500 to-emerald-500",
                },
                {
                  id: "expertise",
                  label: "Expertise",
                  icon: <Award className="w-4 h-4" />,
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  id: "credentials",
                  label: "Credentials",
                  icon: <FileText className="w-4 h-4" />,
                  gradient: "from-amber-500 to-orange-500",
                },
                {
                  id: "availability",
                  label: "Availability",
                  icon: <Clock className="w-4 h-4" />,
                  gradient: "from-rose-500 to-red-500",
                }].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === tab.id ? "bg-gradient-to-r " + tab.gradient + " text-white shadow-lg scale-105" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <div
                      className={`${activeTab === tab.id ? "" : "group-hover:scale-110 transition-transform"}`}
                    >
                      {tab.icon}
                    </div>
                    <span className="text-sm font-semibold">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Form Body */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/60 p-6 md:p-10 hover:shadow-xl transition-shadow duration-300">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {activeTab === "professional" && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Personal Information
                        </h2>
                        <p className="text-sm text-slate-600">
                          Your basic contact and professional details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        Phone Number
                      </label>
                      <input
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        Profession Type
                      </label>
                      <select
                        name="profession_type"
                        value={formData.profession_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300 bg-white"
                      >
                        <option value="psychologist">Psychologist</option>
                        <option value="psychiatrist">Psychiatrist</option>
                        <option value="counselor">Counselor</option>
                        <option value="social_worker">Social Worker</option>
                        <option value="therapist">Therapist</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Address Section */}
                    <div className="md:col-span-2 border-t-2 border-slate-100 pt-8 mt-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">
                            Practice Location
                          </h4>
                          <p className="text-sm text-slate-600">
                            Where you provide care to your clients
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 group">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Address Line 1
                          </label>
                          <div className="relative">
                            <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                            <input
                              name="address_line_1"
                              value={formData.address_line_1}
                              onChange={handleInputChange}
                              placeholder="Street address, clinic name, building"
                              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 group">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Address Line 2{" "}
                            <span className="text-slate-400 font-normal">
                              (optional)
                            </span>
                          </label>
                          <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                            <input
                              name="address_line_2"
                              value={formData.address_line_2}
                              onChange={handleInputChange}
                              placeholder="Suite, floor, apartment"
                              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            City
                          </label>
                          <div className="relative">
                            <Locate className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                            <input
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            State / Province
                          </label>
                          <div className="relative">
                            <Locate className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                            <input
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Country
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                            <input
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              placeholder="e.g. Nepal, United States"
                              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Postal Code
                          </label>
                          <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                            <input
                              name="postal_code"
                              value={formData.postal_code}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-100 pt-8 mt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Professional Bio
                        </h3>
                        <p className="text-sm text-slate-600">
                          Share your approach and what makes you unique
                        </p>
                      </div>
                    </div>
                    <textarea
                      name="bio"
                      rows={6}
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell potential clients about your therapeutic approach, areas of focus, and what they can expect from working with you..."
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 hover:border-slate-300 resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "practice" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Practice Details
                      </h2>
                      <p className="text-sm text-slate-600">
                        Your clinical information and consultation settings
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        License ID
                      </label>
                      <input
                        name="license_id"
                        value={formData.license_id}
                        onChange={handleInputChange}
                        placeholder="e.g. PSY-123456"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        Consultation Mode
                      </label>
                      <select
                        name="consultation_mode"
                        value={formData.consultation_mode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300 bg-white"
                      >
                        <option value="online">Online Only</option>
                        <option value="offline">In-Person Only</option>
                        <option value="both">Both Online & In-Person</option>
                      </select>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        Consultation Fee
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                        <input
                          name="consultation_fees"
                          value={formData.consultation_fees}
                          onChange={handleInputChange}
                          placeholder="e.g. 100 or negotiable"
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all duration-300 group-hover:border-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "expertise" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Areas of Expertise
                      </h2>
                      <p className="text-sm text-slate-600">
                        Your specializations and languages
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-100">
                      <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        Specializations
                      </label>
                      <div className="flex gap-2 mb-4">
                        <input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addItem("tags");
                            }
                          }}
                          placeholder="e.g. Anxiety, Depression, Trauma..."
                          className="flex-1 px-4 py-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all bg-white"
                        />
                        <button
                          onClick={() => addItem("tags")}
                          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.specialization_tags.map((tag, i) => (
                          <span
                            key={i}
                            className="group flex items-center gap-2 bg-white border-2 border-teal-200 text-teal-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-teal-400 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            {tag}
                            <X
                              className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  specialization_tags:
                                    p.specialization_tags.filter(
                                      (_, idx) => idx !== i
                                    ),
                                }))
                              }
                            />
                          </span>
                        ))}
                        {formData.specialization_tags.length === 0 && (
                          <p className="text-sm text-slate-500 italic">
                            No specializations added yet
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                      <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-600" />
                        Languages Spoken
                      </label>
                      <div className="flex gap-2 mb-4">
                        <input
                          value={newLang}
                          onChange={(e) => setNewLang(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addItem("langs");
                            }
                          }}
                          placeholder="e.g. English, Spanish, Nepali..."
                          className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all bg-white"
                        />
                        <button
                          onClick={() => addItem("langs")}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.languages_spoken.map((lang, i) => (
                          <span
                            key={i}
                            className="group flex items-center gap-2 bg-white border-2 border-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-purple-400 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            {lang}
                            <X
                              className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  languages_spoken: p.languages_spoken.filter(
                                    (_, idx) => idx !== i
                                  ),
                                }))
                              }
                            />
                          </span>
                        ))}
                        {formData.languages_spoken.length === 0 && (
                          <p className="text-sm text-slate-500 italic">
                            No languages added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "availability" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-rose-100 to-red-100 rounded-lg">
                      <Clock className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Weekly Schedule
                      </h2>
                      <p className="text-sm text-slate-600">
                        Set your recurring consultation hours
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {DAYS_OF_WEEK.map((day, dayIndex) => (
                      <div
                        key={day}
                        className="group p-5 border-2 border-slate-200 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-slate-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                              {day.substring(0, 2)}
                            </div>
                            {day}
                          </h4>
                          <button
                            onClick={() => addTimeSlot(day)}
                            className="flex items-center gap-2 bg-white border-2 border-teal-200 text-teal-600 px-4 py-2 rounded-xl hover:bg-teal-50 hover:border-teal-400 transition-all duration-300 font-semibold text-sm shadow-sm hover:shadow-md"
                          >
                            <Plus className="w-4 h-4" />
                            Add Slot
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {schedule[day] && schedule[day].length > 0 ? (
                            schedule[day].map((slot, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-white p-3 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300"
                              >
                                <Clock className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                <input
                                  type="text"
                                  value={slot}
                                  placeholder="09:00 AM - 10:00 AM"
                                  onChange={(e) =>
                                    updateTimeSlot(day, index, e.target.value)
                                  }
                                  className="text-sm font-semibold text-slate-700 outline-none w-44 bg-transparent"
                                />
                                <button
                                  onClick={() => removeTimeSlot(day, index)}
                                  className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400 italic py-2">
                              No availability set for this day
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "credentials" && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Verification Documents
                        </h2>
                        <p className="text-sm text-slate-600">
                          Upload required documents to get verified
                        </p>
                      </div>
                    </div>

                    {/* Required Documents Section */}
                    <div className="mb-10">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Required Documents
                      </h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        {verificationDocuments
                          .filter((doc) => doc.type !== 'other')
                          .map((doc) => (
                            <div
                              key={doc.type}
                              className="p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-teal-400 transition-all"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-700 capitalize">
                                  {doc.type === 'citizenship' && 'Citizenship/ID'}
                                  {doc.type === 'license' && 'Professional License'}
                                  {doc.type === 'education' && 'Educational Certificate'}
                                </h3>
                                {doc.uploaded && (
                                  <div className="text-green-600">
                                    <CheckCircle2 size={20} />
                                  </div>
                                )}
                              </div>

                              <label className="block cursor-pointer mb-4">
                                <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-center">
                                  <Plus size={24} className="mx-auto text-slate-400 mb-2" />
                                  <p className="text-sm text-slate-600">
                                    {doc.file?.name || "Click to upload"}
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleDocumentChange(doc.type, e)}
                                />
                              </label>

                              {doc.file && (
                                <button
                                  onClick={() => handleUploadDocument(doc.type)}
                                  disabled={uploadingDoc === doc.type}
                                  className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 rounded-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                  {uploadingDoc === doc.type ? (
                                    <>
                                      <Loader2 size={16} className="animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={16} />
                                      Upload
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Optional Documents Section */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        Other Documents
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        You can upload additional documents to strengthen your profile. These are not required for verification.
                      </p>
                      <div className="max-w-md">
                        {verificationDocuments
                          .filter((doc) => doc.type === 'other')
                          .map((doc) => (
                            <div
                              key={doc.type}
                              className="p-6 border-2 border-dashed border-amber-300 rounded-2xl hover:border-amber-400 transition-all bg-amber-50/50"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-700">
                                  Other Documents
                                </h3>
                                {doc.uploaded && (
                                  <div className="text-green-600">
                                    <CheckCircle2 size={20} />
                                  </div>
                                )}
                              </div>

                              <label className="block cursor-pointer mb-4">
                                <div className="p-4 bg-white rounded-xl hover:bg-slate-50 transition-all text-center border-2 border-amber-200">
                                  <Plus size={24} className="mx-auto text-amber-400 mb-2" />
                                  <p className="text-sm text-slate-600">
                                    {doc.file?.name || "Click to upload"}
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleDocumentChange(doc.type, e)}
                                />
                              </label>

                              {doc.file && (
                                <button
                                  onClick={() => handleUploadDocument(doc.type)}
                                  disabled={uploadingDoc === doc.type}
                                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                  {uploadingDoc === doc.type ? (
                                    <>
                                      <Loader2 size={16} className="animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={16} />
                                      Upload
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>


                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">
                          Document Guidelines
                        </h4>
                        <ul className="text-sm text-slate-700 space-y-1">
                          <li>License must be current and valid</li>
                          <li>Document should be clearly legible</li>
                          <li>Maximum file size: 10MB</li>
                          <li>
                            Accepted formats: PDF, DOC, DOCX, JPG, PNG
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-end gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="group relative px-12 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden hover:scale-105"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  {saving ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                      <span className="relative z-10">Updating Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6 relative z-10" />
                      <span className="relative z-10">Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}