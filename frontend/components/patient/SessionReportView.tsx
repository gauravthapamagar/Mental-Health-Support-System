"use client";

import { useState } from "react";
import { X, Eye } from "lucide-react";

interface SessionReportViewProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionReportView({
  report,
  isOpen,
  onClose,
}: SessionReportViewProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Eye size={24} />
            <h2 className="text-2xl font-bold">Session Progress Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Session Date and Outcome */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
            <div>
              <p className="text-slate-600 text-sm font-semibold uppercase">Session Date</p>
              <p className="text-slate-900 text-lg font-bold">
                {new Date(report.appointment_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-semibold uppercase">Outcome</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getOutcomeColor(report.session_outcome)}`}>
                {report.session_outcome_display || report.session_outcome}
              </span>
            </div>
          </div>

          {/* Mood Rating */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
            <p className="text-slate-600 text-sm font-semibold uppercase mb-2">Your Mood During Session</p>
            <p className={`text-3xl font-bold ${getMoodColor(report.mood_rating)}`}>
              <span className="mr-2">{getMoodEmoji(report.mood_rating)}</span>
              {report.mood_rating}/10
            </p>
          </div>

          {/* Content Sections - Only what patient should see */}
          <div className="border-t border-slate-200 pt-6 space-y-6">
            {/* Session Summary - Not shown to protect therapist's clinical notes */}
            {/* Instead show a brief outcome description */}
            
            {/* Homework - Show to encourage patient engagement */}
            {report.homework_assigned && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h4 className="text-blue-900 font-bold text-sm uppercase mb-3">
                  Your Homework / Action Items
                </h4>
                <p className="text-blue-800 leading-relaxed">{report.homework_assigned}</p>
              </div>
            )}

            {/* Symptom Improvement - Show progress tracking */}
            {report.symptom_improvement && Object.keys(report.symptom_improvement).length > 0 && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4">
                <h4 className="text-emerald-900 font-bold text-sm uppercase mb-3">
                  Your Progress
                </h4>
                <div className="space-y-2">
                  {Object.entries(report.symptom_improvement).map(([symptom, score]: [string, any]) => (
                    <div key={symptom} className="flex items-center justify-between">
                      <span className="text-emerald-800 font-medium capitalize">{symptom}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-emerald-200 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${(score / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-emerald-700 font-semibold text-sm w-8 text-right">{score}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Goals - Show goals being worked on */}
            {report.treatment_goals_addressed && report.treatment_goals_addressed.length > 0 && (
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
                <h4 className="text-indigo-900 font-bold text-sm uppercase mb-3">
                  Treatment Goals Addressed
                </h4>
                <ul className="space-y-2">
                  {report.treatment_goals_addressed.map((goal: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-indigo-800">
                      <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full"></span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Session Notes - Help patient prepare */}
            {report.notes_for_next_session && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <h4 className="text-amber-900 font-bold text-sm uppercase mb-3">
                  Focus for Next Session
                </h4>
                <p className="text-amber-800 leading-relaxed">{report.notes_for_next_session}</p>
              </div>
            )}
          </div>

          {/* Info note */}
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-sm text-slate-700">
            <p>
              Your therapist shares key insights from your sessions to help you track progress. 
              Some clinical details are kept confidential to maintain professional boundaries.
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
