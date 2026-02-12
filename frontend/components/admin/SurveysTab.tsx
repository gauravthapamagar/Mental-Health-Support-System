"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  User,
} from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const SurveysTab = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);

  const loadSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (riskFilter !== "all") params.set("risk_level", riskFilter);
      if (searchTerm) params.set("search", searchTerm);

      const res = await adminApiCall(`/admin/surveys/?${params.toString()}`);
      if (res?.ok) {
        setSurveys(res.data.surveys || res.data || []);
      } else if (res?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (res?.status === 404) {
        setSurveys([]);
      } else {
        setError(res?.data?.error || "Failed to fetch surveys");
      }
    } catch (error) {
      console.error("Failed to fetch surveys:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, riskFilter, searchTerm]);

  useEffect(() => {
    loadSurveys();
  }, [statusFilter, riskFilter, searchTerm, loadSurveys]);

  const getRiskBadge = (riskLevel: string) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      low: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
      medium: { bg: "bg-amber-50", text: "text-amber-700", icon: AlertCircle },
      high: { bg: "bg-red-50", text: "text-red-700", icon: AlertCircle },
    };
    return config[riskLevel] || config.low;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading survey responses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="text-red-600" size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Surveys</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => loadSurveys()}
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
            <h1 className="text-4xl font-bold mb-2">Survey Responses</h1>
            <p className="text-blue-100 text-lg">Monitor patient mental health assessments and risk levels</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-cyan-300 animate-pulse"></div>
            <span className="text-sm font-medium">{surveys.length} Surveys</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Surveys"
          value={surveys.length}
          color="indigo"
        />
        <StatCard
          label="Submitted"
          value={surveys.filter((s) => s.status === "submitted" || s.status === "reviewed").length}
          color="green"
        />
        <StatCard
          label="In Progress"
          value={surveys.filter((s) => s.status === "in_progress").length}
          color="amber"
        />
        <StatCard
          label="High Risk"
          value={surveys.filter((s) => s.risk_level === "high").length}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {/* Survey Cards */}
      {surveys.length === 0 ? (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 rounded-2xl p-16 text-center">
          <div className="p-4 bg-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="text-indigo-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Survey Responses Found</h3>
          <p className="text-gray-600">
            {searchTerm ? "No surveys match your search." : "Survey responses will appear here once patients complete assessments."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey) => {
            const riskBadge = getRiskBadge(survey.risk_level);
            const RiskIcon = riskBadge.icon;

            return (
              <div
                key={survey.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Patient Info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Patient</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                        {survey.patient_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{survey.patient_name}</p>
                        <p className="text-xs text-gray-500">Survey #{survey.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        survey.status === "reviewed"
                          ? "bg-blue-50 text-blue-700"
                          : survey.status === "submitted"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {survey.status === "reviewed" ? (
                        <CheckCircle size={14} />
                      ) : survey.status === "submitted" ? (
                        <CheckCircle size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                      {survey.status === "reviewed"
                        ? "Reviewed"
                        : survey.status === "submitted"
                        ? "Submitted"
                        : "In Progress"}
                    </span>
                  </div>

                  {/* Risk Level */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Risk Level</p>
                    {survey.risk_level ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${riskBadge.bg} ${riskBadge.text}`}
                      >
                        <RiskIcon size={14} />
                        <span className="capitalize">{survey.risk_level}</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">N/A</span>
                    )}
                  </div>

                  {/* Dates */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Timeline</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        Started: {new Date(survey.started_at).toLocaleDateString()}
                      </div>
                      {survey.completed_at ? (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar size={14} className="text-gray-400" />
                          Ended: {new Date(survey.completed_at).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-600 font-medium">In progress...</div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-end justify-end">
                    <button
                      onClick={() => setSelectedSurvey(survey)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Survey Detail Modal */}
      {selectedSurvey && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSurvey(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Survey #{selectedSurvey.id}
                  </h2>
                  <div className="flex items-center gap-3 text-indigo-100 text-sm">
                    <div className="flex items-center gap-1.5">
                      <User size={14} />
                      <span>{selectedSurvey.patient_name}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>
                        {new Date(
                          selectedSurvey.started_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSurvey(null)}
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
              {/* Status & Risk */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Status
                  </p>
                  <p className="text-sm text-gray-900 font-medium capitalize">
                    {selectedSurvey.status}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Risk Level
                  </p>
                  <p className="text-sm text-gray-900 font-medium capitalize">
                    {selectedSurvey.risk_level || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Completed
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {selectedSurvey.completed_at
                      ? new Date(
                          selectedSurvey.completed_at,
                        ).toLocaleDateString()
                      : "In Progress"}
                  </p>
                </div>
              </div>

              {/* Analysis Summary */}
              {selectedSurvey.analysis_summary && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                    Analysis Summary
                  </h3>
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedSurvey.analysis_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Responses */}
              {selectedSurvey.responses &&
                selectedSurvey.responses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                      Survey Responses
                    </h3>
                    <div className="space-y-3">
                      {selectedSurvey.responses.map(
                        (response: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                          >
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              Q{idx + 1}: {response.question_text}
                            </p>
                            <p className="text-sm text-gray-700 pl-4 border-l-2 border-indigo-300">
                              {response.answer}
                            </p>
                          </div>
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

const StatCard = ({ label, value, color }: any) => {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
    green: "bg-green-50 border-green-200 text-green-600",
    amber: "bg-amber-50 border-amber-200 text-amber-600",
    red: "bg-red-50 border-red-200 text-red-600",
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default SurveysTab;
