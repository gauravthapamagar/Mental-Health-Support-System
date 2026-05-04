"use client";
import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Eye,
} from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const SurveysTab = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (riskFilter !== "all") params.set("risk_level", riskFilter);
      if (searchTerm) params.set("search", searchTerm);

      const res = await adminApiCall(`/admin/surveys/?${params.toString()}`);
      if (res?.ok) {
        setSurveys(res.data.surveys || res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, [statusFilter, riskFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadSurveys();
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <p className="text-gray-500">Loading surveys...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-indigo-600" size={28} />
            Survey Responses
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Monitor patient mental health assessments and risk levels
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
              placeholder="Search patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
          <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">
            Total Surveys
          </p>
          <p className="text-2xl font-bold text-indigo-900">{surveys.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase mb-1">
            Completed
          </p>
          <p className="text-2xl font-bold text-green-900">
            {surveys.filter((s) => s.status === "completed").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-600 font-semibold uppercase mb-1">
            In Progress
          </p>
          <p className="text-2xl font-bold text-amber-900">
            {surveys.filter((s) => s.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <p className="text-xs text-red-600 font-semibold uppercase mb-1">
            High Risk
          </p>
          <p className="text-2xl font-bold text-red-900">
            {surveys.filter((s) => s.risk_level === "high").length}
          </p>
        </div>
      </div>

      {/* Survey List */}
      {surveys.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <ClipboardList className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No survey responses found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Survey responses will appear here once patients complete
            assessments.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {surveys.map((survey: any) => {
                  const riskBadge = getRiskBadge(survey.risk_level);
                  const RiskIcon = riskBadge.icon;

                  return (
                    <tr
                      key={survey.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {survey.patient_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {survey.patient_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              Survey #{survey.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            survey.status === "completed"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {survey.status === "completed"
                            ? "Completed"
                            : "In Progress"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {survey.risk_level ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${riskBadge.bg} ${riskBadge.text}`}
                          >
                            <RiskIcon size={12} />
                            <span className="capitalize">
                              {survey.risk_level}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(survey.started_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {survey.completed_at ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={12} className="text-gray-400" />
                            {new Date(survey.completed_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedSurvey(survey)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-xs font-medium"
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

export default SurveysTab;
