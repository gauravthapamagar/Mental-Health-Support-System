"use client";

import { useState } from "react";
import {
  Eye,
  Calendar,
  FileText,
} from "lucide-react";
import SessionReportView from "./SessionReportView";

interface SessionReport {
  id: number;
  appointment_date: string;
  mood_rating: number;
  session_outcome: string;
  session_outcome_display?: string;
  session_summary?: string;
  homework_assigned?: string;
  notes_for_next_session?: string;
  patient_visible: boolean;
}

interface SessionProgressCardProps {
  report: SessionReport;
}

export default function SessionProgressCard({
  report,
}: SessionProgressCardProps) {
  const [showDetails, setShowDetails] = useState(false);

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
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600 font-semibold uppercase">Session Report</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(report.appointment_date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <p className="text-sm text-slate-600 font-semibold uppercase">Mood</p>
                <p className={`text-2xl font-bold ${getMoodColor(report.mood_rating)}`}>
                  {getMoodEmoji(report.mood_rating)} {report.mood_rating}/10
                </p>
              </div>

              <div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getOutcomeColor(report.session_outcome)}`}>
                  {report.session_outcome_display || report.session_outcome}
                </span>
              </div>

              {report.homework_assigned && (
                <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                  ✓ Homework Assigned
                </div>
              )}
            </div>

            {report.session_summary && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold uppercase mb-2">Session Summary</p>
                <p className="text-slate-700 text-sm leading-relaxed line-clamp-2">
                  {report.session_summary}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowDetails(true)}
            className="lg:self-start flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-colors"
          >
            <Eye size={18} />
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">View</span>
          </button>
        </div>
      </div>

      {/* Report Detail Modal */}
      <SessionReportView
        report={report}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}
