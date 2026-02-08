"use client";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MapPin,
  Globe,
  Eye,
  Loader2,
  Search,
  Filter,
  FileText,
  User,
} from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const TherapistsTab = () => {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("unverified");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const isVerified = filter === "verified";
      const endpoint = isVerified
        ? "/public/therapists/"
        : "/therapists/unverified/";
      
      console.log(`Loading data for filter: ${filter}, Endpoint: ${endpoint}`);

      const res = await adminApiCall(endpoint);
      if (res?.ok) {
        if (isVerified) {
          // Handle public endpoint format (ListAPIView)
          const results = Array.isArray(res.data) ? res.data : (res.data.results || []);
          const mappedData = results.map((item: any) => ({
             id: item.user.id, // Map User ID correctly
             full_name: item.user.full_name,
             email: item.user.email,
             phone_number: item.phone_number || item.user.phone_number,
             profession_type: item.profession_type,
             license_id: item.license_id,
             years_of_experience: item.years_of_experience,
             profile_completed: item.profile_completed,
             is_verified: item.is_verified,
             created_at: item.created_at,
             specialization_tags: item.specialization_tags,
             languages_spoken: item.languages_spoken,
             consultation_fees: item.consultation_fees,
             consultation_mode: item.consultation_mode,
             bio: item.bio,
          }));
          setTherapists(mappedData);
        } else {
          // Handle admin endpoint format (Custom Dictionary)
          setTherapists(res.data.therapists || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch therapists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleAction = async (id: number, action: string) => {
    const endpoint =
      action === "verify"
        ? `/therapists/${id}/verify/`
        : `/therapists/${id}/unverify/`;

    try {
      const res = await adminApiCall(endpoint, { method: "POST" });
      if (res?.ok) {
        alert(res.data.message || "Action successful");
        loadData();
      } else {
        alert(res?.data?.error || "Action failed");
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const filteredTherapists = therapists.filter(
    (t) =>
      t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.profession_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <p className="text-gray-500">Loading therapists...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="text-green-600" size={28} />
            Therapist Verification
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Review and approve professional credentials for therapists
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search therapists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="unverified">Pending Verification</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase mb-1">
            Total Therapists
          </p>
          <p className="text-2xl font-bold text-green-900">
            {therapists.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-600 font-semibold uppercase mb-1">
            Pending Verification
          </p>
          <p className="text-2xl font-bold text-amber-900">
            {filter === "unverified" ? therapists.length : 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
            Avg Experience
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {therapists.length > 0
              ? Math.round(
                  therapists.reduce(
                    (sum, t) => sum + (t.years_of_experience || 0),
                    0,
                  ) / therapists.length,
                )
              : 0}{" "}
            yrs
          </p>
        </div>
      </div>

      {/* Therapist List */}
      {filteredTherapists.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <CheckCircle className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">
            {filter === "unverified"
              ? "No pending verification requests."
              : "No verified therapists found."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTherapists.map((therapist: any) => (
            <div
              key={therapist.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                      {therapist.full_name?.charAt(0)?.toUpperCase() || "T"}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {therapist.full_name}
                        </h3>
                        {!therapist.profile_completed && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                            Incomplete Profile
                          </span>
                        )}
                        {therapist.is_verified && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <CheckCircle size={12} />
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Award size={14} className="text-green-500" />
                          <span className="font-medium">
                            {therapist.profession_type ||
                              "General Practitioner"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail size={14} className="text-gray-400" />
                          <span>{therapist.email}</span>
                        </div>
                        {therapist.phone_number && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={14} className="text-gray-400" />
                            <span>{therapist.phone_number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          <span>
                            Joined{" "}
                            {new Date(
                              therapist.created_at,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full md:w-auto">
                    {filter === "unverified" ? (
                      <>
                        <button
                          onClick={() => handleAction(therapist.id, "verify")}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm"
                        >
                          <CheckCircle size={16} />
                          Verify
                        </button>
                        <button
                          onClick={() => handleAction(therapist.id, "unverify")}
                          className="flex-1 md:flex-none bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAction(therapist.id, "unverify")}
                        className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm"
                      >
                        <XCircle size={16} />
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTherapist(therapist)}
                      className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm"
                    >
                      <Eye size={16} />
                      Details
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                      Experience
                    </p>
                    <p className="text-sm text-blue-900 font-bold">
                      {therapist.years_of_experience || 0} years
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 font-semibold uppercase mb-1">
                      License ID
                    </p>
                    <p className="text-sm text-purple-900 font-bold truncate">
                      {therapist.license_id || "N/A"}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 font-semibold uppercase mb-1">
                      Consultation Fee
                    </p>
                    <p className="text-sm text-green-900 font-bold">
                      ${therapist.consultation_fees || "N/A"}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600 font-semibold uppercase mb-1">
                      Mode
                    </p>
                    <p className="text-sm text-orange-900 font-bold capitalize">
                      {therapist.consultation_mode || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Specializations */}
                {therapist.specialization_tags &&
                  therapist.specialization_tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                        Specializations
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {therapist.specialization_tags.map(
                          (tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Therapist Detail Modal */}
      {selectedTherapist && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTherapist(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                    {selectedTherapist.full_name?.charAt(0)?.toUpperCase() ||
                      "T"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedTherapist.full_name}
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      {selectedTherapist.profession_type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTherapist(null)}
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
              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Email
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {selectedTherapist.email}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {selectedTherapist.phone_number || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Professional Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      License ID
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {selectedTherapist.license_id || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Experience
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {selectedTherapist.years_of_experience || 0} years
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Consultation Fee
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      ${selectedTherapist.consultation_fees || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Consultation Mode
                    </p>
                    <p className="text-sm text-gray-900 font-medium capitalize">
                      {selectedTherapist.consultation_mode || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedTherapist.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                    Biography
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedTherapist.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Specializations */}
              {selectedTherapist.specialization_tags &&
                selectedTherapist.specialization_tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTherapist.specialization_tags.map(
                        (tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Languages */}
              {selectedTherapist.languages_spoken &&
                selectedTherapist.languages_spoken.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                      Languages Spoken
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTherapist.languages_spoken.map(
                        (lang: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {lang}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistsTab;
