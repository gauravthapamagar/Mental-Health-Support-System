"use client";

import { useState } from "react";
import { X, Eye, Calendar, Zap, Target, BookOpen, CheckCircle, AlertCircle } from "lucide-react";

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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex items-center justify-between border-b border-indigo-700 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Eye size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Session Report</h2>
              <p className="text-indigo-100 text-sm mt-0.5">
                {new Date(report.appointment_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-6">
            {/* Session Date */}
            <div className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar size={18} className="text-blue-600" />
                </div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Session Date</p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {new Date(report.appointment_date).toLocaleDateString()}
              </p>
            </div>

            {/* Outcome */}
            <div className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle size={18} className="text-purple-600" />
                </div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Session Outcome</p>
              </div>
              <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${getOutcomeColor(report.session_outcome)}`}>
                {report.session_outcome_display || report.session_outcome}
              </span>
            </div>
          </div>

          {/* Mood Section */}
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-xl p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-700 font-semibold uppercase tracking-wide mb-2">Your Mood</p>
                <p className={`text-5xl font-bold ${getMoodColor(report.mood_rating)} flex items-center gap-2`}>
                  <span>{getMoodEmoji(report.mood_rating)}</span>
                  {report.mood_rating}/10
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">
                  {report.mood_rating <= 3 ? "🌧️" : report.mood_rating <= 5 ? "⛅" : report.mood_rating <= 7 ? "🌤️" : "☀️"}
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  {report.mood_rating <= 3 ? "Challenging" : report.mood_rating <= 5 ? "Mixed" : report.mood_rating <= 7 ? "Good" : "Excellent"}
                </p>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6 border-t border-gray-200 pt-8">
            {/* Homework */}
            {report.homework_assigned && (
              <div className="group p-6 rounded-xl border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900">Your Homework</h3>
                </div>
                <p className="text-blue-800 leading-relaxed">{report.homework_assigned}</p>
              </div>
            )}

            {/* Symptom Improvement */}
            {report.symptom_improvement && Object.keys(report.symptom_improvement).length > 0 && (
              <div className="p-6 rounded-xl border-l-4 border-l-emerald-500 bg-emerald-50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-900">Your Progress</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(report.symptom_improvement).map(([symptom, score]: [string, any]) => (
                    <div key={symptom}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-emerald-900 capitalize">{symptom}</span>
                        <span className="font-bold text-emerald-700">{score}/10</span>
                      </div>
                      <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                          style={{ width: `${(score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Goals */}
            {report.treatment_goals_addressed && report.treatment_goals_addressed.length > 0 && (
              <div className="p-6 rounded-xl border-l-4 border-l-indigo-500 bg-indigo-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Target size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-indigo-900">Treatment Goals</h3>
                </div>
                <ul className="space-y-3">
                  {report.treatment_goals_addressed.map((goal: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-indigo-800">
                      <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes for Next Session */}
            {report.notes_for_next_session && (
              <div className="p-6 rounded-xl border-l-4 border-l-amber-500 bg-amber-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BookOpen size={20} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-900">Next Steps</h3>
                </div>
                <p className="text-amber-800 leading-relaxed">{report.notes_for_next_session}</p>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-slate-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              Your therapist shares key insights from your sessions to help you track progress. 
              Some clinical details are kept confidential to maintain professional boundaries.
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}