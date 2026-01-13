"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Award, Mail } from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const TherapistsTab = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from the backend GET /therapists/unverified/
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApiCall("/therapists/unverified/");
      if (res?.ok) {
        // Backend returns: { "count": X, "therapists": [...] }
        setTherapists(res.data.therapists || []);
      }
    } catch (error) {
      console.error("Failed to fetch therapists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Verify/Unverify actions
  const handleAction = async (id, action) => {
    // FIXED: Changed '/therapist/' to '/therapists/' to match accounts/urls.py
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
        alert(res.data?.error || "Action failed");
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Clock className="animate-spin text-gray-400 mr-2" />
        <p className="text-gray-500">Loading unverified therapists...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Therapist Verification
        </h2>
        <p className="text-gray-500 mt-2">
          Review and approve professional credentials for new therapists.
        </p>
      </div>

      {therapists.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <CheckCircle className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">
            No pending verification requests.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {therapists.map((t) => (
            <div
              key={t.id}
              className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-gray-900">
                    {t.full_name}
                  </h3>
                  {!t.profile_completed && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                      Incomplete Profile
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Award size={14} className="mr-1 text-blue-500" />
                    {t.profession_type || "General Practitioner"}
                  </span>
                  <span className="flex items-center">
                    <Mail size={14} className="mr-1 text-gray-400" />
                    {t.email}
                  </span>
                  <span className="text-gray-400 font-mono">
                    ID: {t.license_id || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {t.years_of_experience} Years Experience
                  </p>
                  <p className="text-xs text-gray-400">
                    Joined: {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                <button
                  onClick={() => handleAction(t.id, "verify")}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
                >
                  <CheckCircle size={18} className="mr-2" /> Verify
                </button>
                <button
                  onClick={() => handleAction(t.id, "unverify")}
                  className="flex-1 md:flex-none bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
                >
                  <XCircle size={18} className="mr-2" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistsTab;
