"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Search,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  TrendingUp,
  X,
  FileText,
  Edit,
} from "lucide-react";
import { bookingAPI } from "@/lib/api";
import { toast } from "react-toastify";
import EditSessionReportModal from "./EditSessionReportModal";

interface SessionReport {
  id: number;
  patient: {
    id: number;
    full_name: string;
    email: string;
  };
  appointment_date: string;
  mood_rating: number;
  session_outcome: string;
  session_outcome_display?: string;
  session_summary?: string;
  homework_assigned?: string;
  triggers_identified?: string;
  notes_for_next_session?: string;
  clinical_observations?: string;
  patient_visible: boolean;
  created_at: string;
}

export default function SessionReportsDashboard() {
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOutcome, setFilterOutcome] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<SessionReport | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [editingReport, setEditingReport] = useState<SessionReport | null>(null);

  const fetchReports = useCallback(async (page = 1, outcome = "") => {
    setLoading(true);
    try {
      const params: any = { page };
      if (outcome) params.session_outcome = outcome;

      const response = await bookingAPI.getTherapistReports(params);
      setReports(response.results || response || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
      setCurrentPage(page);
    } catch (error) {
      console.error("[v0] Failed to fetch reports:", error);
      toast.error("Failed to load session reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(currentPage, filterOutcome);
  }, [filterOutcome, currentPage, fetchReports]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredReports = reports.filter((report) =>
    report.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleDeleteReport = async (reportId: number) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await bookingAPI.deleteReport(reportId);
      toast.success("Report deleted successfully");
      fetchReports(currentPage, filterOutcome);
    } catch (error: any) {
      console.error("[v0] Delete error:", error);
      toast.error(error.response?.data?.error || "Failed to delete report");
    }
  };

  return (
    <div className="w-full pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Session Reports</h1>
              <p className="text-slate-600 mt-1">Track and manage patient progress notes</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <select
              value={filterOutcome}
              onChange={(e) => {
                setFilterOutcome(e.target.value);
                setCurrentPage(1);
              }}
              className="lg:w-56 px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="">All Outcomes</option>
              <option value="productive">Productive</option>
              <option value="breakthrough">Breakthrough</option>
              <option value="needs_follow_up">Needs Follow-Up</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
              <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-semibold">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
              <AlertCircle size={40} className="text-slate-400 mb-4" />
              <p className="text-slate-600 font-semibold text-lg">No reports found</p>
              <p className="text-slate-500 text-sm mt-2">
                Session reports will appear here as you complete appointments
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 p-6 hover:border-blue-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-slate-900">
                        {report.patient.full_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getOutcomeColor(report.session_outcome)}`}>
                        {report.session_outcome_display || report.session_outcome}
                      </span>
                      {report.patient_visible && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold border border-purple-300 flex items-center gap-1.5">
                          <Eye size={14} />
                          Shared with Patient
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-6 text-slate-600 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        <span>{new Date(report.appointment_date).toLocaleDateString()}</span>
                      </div>
                      <div className={`font-semibold ${getMoodColor(report.mood_rating)}`}>
                        <span className="mr-2">{getMoodEmoji(report.mood_rating)}</span>
                        Mood: {report.mood_rating}/10
                      </div>
                      {report.homework_assigned && (
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                          ✓ Homework Assigned
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 lg:justify-end flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowDetailView(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingReport(report);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition-colors"
                      title="Edit Report"
                    >
                      <Edit size={18} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border-2 border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50 font-medium transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-700 font-semibold bg-slate-100 rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border-2 border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50 font-medium transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailView && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetailView(false)}
          />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-2xl font-bold">Session Report</h2>
              <button
                onClick={() => setShowDetailView(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-600 text-sm font-semibold uppercase">Patient</p>
                  <p className="text-slate-900 text-lg font-bold">{selectedReport.patient.full_name}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-semibold uppercase">Date</p>
                  <p className="text-slate-900 text-lg font-bold">
                    {new Date(selectedReport.appointment_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-semibold uppercase">Mood Rating</p>
                  <p className={`text-lg font-bold ${getMoodColor(selectedReport.mood_rating)}`}>
                    {getMoodEmoji(selectedReport.mood_rating)} {selectedReport.mood_rating}/10
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-semibold uppercase">Outcome</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getOutcomeColor(selectedReport.session_outcome)}`}>
                    {selectedReport.session_outcome_display || selectedReport.session_outcome}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 space-y-6">
                {selectedReport.session_summary && (
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm uppercase mb-2">Session Summary</h4>
                    <p className="text-slate-700 leading-relaxed">{selectedReport.session_summary}</p>
                  </div>
                )}

                {selectedReport.clinical_observations && (
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm uppercase mb-2">Clinical Observations</h4>
                    <p className="text-slate-700 leading-relaxed">{selectedReport.clinical_observations}</p>
                  </div>
                )}

                {selectedReport.triggers_identified && (
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm uppercase mb-2">Triggers Identified</h4>
                    <p className="text-slate-700 leading-relaxed">{selectedReport.triggers_identified}</p>
                  </div>
                )}

                {selectedReport.homework_assigned && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-blue-900 font-bold text-sm uppercase mb-2">Homework</h4>
                    <p className="text-blue-800 leading-relaxed">{selectedReport.homework_assigned}</p>
                  </div>
                )}

                {selectedReport.notes_for_next_session && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-amber-900 font-bold text-sm uppercase mb-2">Notes for Next Session</h4>
                    <p className="text-amber-800 leading-relaxed">{selectedReport.notes_for_next_session}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowDetailView(false)}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Report Modal */}
      {editingReport && (
        <EditSessionReportModal
          report={editingReport}
          isOpen={!!editingReport}
          onClose={() => setEditingReport(null)}
          onSuccess={() => {
            setEditingReport(null);
            fetchReports(currentPage, filterOutcome);
          }}
        />
      )}
    </div>
  );
}