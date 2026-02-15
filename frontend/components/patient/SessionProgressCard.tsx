"use client";

import { useState } from "react";
import {
  Eye,
  Calendar,
  FileText,
  TrendingUp,
  Sparkles,
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
  treatment_goals_addressed?: string[];
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

  const getMoodBgColor = (mood: number) => {
    if (mood <= 3) return "bg-red-100";
    if (mood <= 5) return "bg-amber-100";
    if (mood <= 7) return "bg-blue-100";
    return "bg-emerald-100";
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

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "productive":
        return "✓";
      case "breakthrough":
        return "★";
      case "needs_follow_up":
        return "→";
      case "blocked":
        return "!";
      default:
        return "•";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
        {/* Hover glow effect */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-3xl"></div>

        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1 min-w-0">
              {/* Date & Session Type */}
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Calendar size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Session Date</p>
                  <h3 className="text-lg font-bold text-gray-900">{formatDate(report.appointment_date)}</h3>
                </div>
              </div>

              {/* Mood & Outcome Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* Mood Badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${getMoodBgColor(report.mood_rating)} ${getMoodColor(report.mood_rating)}`}>
                  <span className="text-xl">{getMoodEmoji(report.mood_rating)}</span>
                  <span>{report.mood_rating}/10</span>
                </div>

                {/* Outcome Badge */}
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getOutcomeColor(report.session_outcome)}`}>
                  <span>{getOutcomeIcon(report.session_outcome)}</span>
                  {report.session_outcome_display || report.session_outcome}
                </span>

                {/* Homework Badge */}
                {report.homework_assigned && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200">
                    <Sparkles size={14} />
                    Homework
                  </div>
                )}

                {/* Goals Badge */}
                {report.treatment_goals_addressed && report.treatment_goals_addressed.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200">
                    <TrendingUp size={14} />
                    {report.treatment_goals_addressed.length} Goals
                  </div>
                )}
              </div>

              {/* Session Summary Preview */}
              {report.session_summary && (
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Session Highlight</p>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                    {report.session_summary}
                  </p>
                </div>
              )}
            </div>

            {/* Right Action */}
            <button
              onClick={() => setShowDetails(true)}
              className="lg:flex-shrink-0 w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-xl font-semibold transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
            >
              <Eye size={18} />
              <span className="hidden sm:inline">View Full Report</span>
              <span className="sm:hidden">View</span>
            </button>
          </div>
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