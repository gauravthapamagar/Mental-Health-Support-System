"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Eye } from "lucide-react";
import { sessionReportAPI, SessionReport } from "@/lib/api";
import { toast } from "react-toastify";

interface SessionReportViewModalProps {
  isOpen: boolean;
  reportId: number;
  onClose: () => void;
}

export default function SessionReportViewModal({
  isOpen,
  reportId,
  onClose,
}: SessionReportViewModalProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch full report details when modal opens
  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportDetails();
    }
  }, [isOpen, reportId]);

  const fetchReportDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Fetch FULL details - this returns ALL fields therapist entered
      const fullReport = await sessionReportAPI.getReportDetail(reportId);
      setReport(fullReport);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.error || 
                       'Failed to load report details';
      setError(errorMsg);
      console.error('[SessionReportViewModal] Error fetching report:', err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return "😢";
    if (mood <= 3) return "😞";
    if (mood <= 4) return "😔";
    if (mood <= 5) return "😐";
    if (mood <= 6) return "🙂";
    if (mood <= 7) return "😊";
    if (mood <= 8) return "😄";
    if (mood <= 9) return "😁";
    return "🤩";
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return "text-red-600";
    if (mood <= 5) return "text-amber-600";
    if (mood <= 7) return "text-blue-600";
    return "text-emerald-600";
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "productive":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "breakthrough":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "needs_follow_up":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "blocked":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header with Close Button */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex items-center justify-between border-b border-slate-200 z-10">
            <div className="flex items-center gap-3">
              <Eye size={24} />
              <h2 className="text-2xl font-bold">Session Report Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                <p className="text-slate-600 font-semibold">Loading report details...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-red-900 mb-2">Error Loading Report</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={fetchReportDetails}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : report ? (
              <div className="space-y-6">
                {/* Header Info Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase mb-1">Patient</p>
                    <p className="text-lg font-bold text-slate-900">{report.patient.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase mb-1">Date</p>
                    <p className="text-lg font-bold text-slate-900">
                      {new Date(report.appointment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase mb-1">Mood Rating</p>
                    <p className={`text-lg font-bold ${getMoodColor(report.mood_rating)}`}>
                      {getMoodEmoji(report.mood_rating)} {report.mood_rating}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase mb-1">Outcome</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getOutcomeColor(report.session_outcome)}`}>
                      {report.session_outcome_display || report.session_outcome}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200"></div>

                {/* Session Summary */}
                {report.session_summary && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-500 rounded"></div>
                      Session Summary
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{report.session_summary}</p>
                    </div>
                  </div>
                )}

                {/* Treatment Goals */}
                {report.treatment_goals_addressed && report.treatment_goals_addressed.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-emerald-500 rounded"></div>
                      Treatment Goals Addressed
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {report.treatment_goals_addressed.map((goal, index) => (
                        <div
                          key={index}
                          className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-medium border border-emerald-300"
                        >
                          ✓ {goal}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Symptom Improvement */}
                {report.symptom_improvement && Object.keys(report.symptom_improvement).length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-purple-500 rounded"></div>
                      Symptom Improvement Tracking
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(report.symptom_improvement).map(([symptom, score]) => (
                        <div key={symptom}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-slate-700 capitalize">{symptom}</span>
                            <span className={`font-bold text-lg ${
                              score <= 3 ? "text-red-600" :
                              score <= 5 ? "text-amber-600" :
                              score <= 7 ? "text-blue-600" :
                              "text-emerald-600"
                            }`}>
                              {score}/10
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                score <= 3 ? "bg-red-500" :
                                score <= 5 ? "bg-amber-500" :
                                score <= 7 ? "bg-blue-500" :
                                "bg-emerald-500"
                              }`}
                              style={{ width: `${(score / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Observations */}
                {report.clinical_observations && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-indigo-500 rounded"></div>
                      Clinical Observations
                    </h3>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{report.clinical_observations}</p>
                    </div>
                  </div>
                )}

                {/* Triggers Identified */}
                {report.triggers_identified && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-orange-500 rounded"></div>
                      Triggers Identified
                    </h3>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{report.triggers_identified}</p>
                    </div>
                  </div>
                )}

                {/* Homework Assigned */}
                {report.homework_assigned && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-cyan-500 rounded"></div>
                      Homework Assignment
                    </h3>
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{report.homework_assigned}</p>
                    </div>
                  </div>
                )}

                {/* Notes for Next Session */}
                {report.notes_for_next_session && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pink-500 rounded"></div>
                      Notes for Next Session
                    </h3>
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{report.notes_for_next_session}</p>
                    </div>
                  </div>
                )}

                {/* Patient Visibility Status */}
                <div className={`border-2 rounded-lg p-4 ${
                  report.patient_visible
                    ? "bg-purple-50 border-purple-200"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    {report.patient_visible ? (
                      <>
                        <Eye size={18} className="text-purple-600" />
                        <span>Visible to Patient</span>
                      </>
                    ) : (
                      <>
                        <X size={18} className="text-slate-600" />
                        <span>Private (Not Visible to Patient)</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Metadata */}
                <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
                  <p>Created: {new Date(report.created_at).toLocaleString()}</p>
                  {report.updated_at && (
                    <p>Last Updated: {new Date(report.updated_at).toLocaleString()}</p>
                  )}
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-6 border-t border-slate-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}