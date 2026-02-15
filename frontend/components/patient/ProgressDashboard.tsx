"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Heart,
  Target,
  CheckCircle2,
  Loader2,
  Calendar,
  Award,
  Zap,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { sessionReportAPI } from "@/lib/api";
import SessionProgressCard from "./SessionProgressCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MoodTrendData {
  date: string;
  mood: number;
}

interface SymptomTrend {
  [key: string]: Array<{
    date: string;
    score: number;
  }>;
}

interface ProgressAnalytics {
  mood_trend: MoodTrendData[];
  symptom_trends: SymptomTrend;
  latest_session: any;
  total_sessions: number;
  average_mood: number;
}

export default function ProgressDashboard() {
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const [analyticsData, reportsData] = await Promise.all([
          sessionReportAPI.getPatientProgressAnalytics(),
          sessionReportAPI.getPatientProgress(),
        ]);
        setAnalytics(analyticsData);
        setReports(reportsData.results || []);
      } catch (error) {
        console.error("[ProgressDashboard] Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={40} className="animate-spin text-slate-400 mb-4" />
        <p className="text-gray-600 font-medium">Loading your progress...</p>
      </div>
    );
  }

  if (!analytics || analytics.total_sessions === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
        <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
          <Heart size={32} className="text-slate-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Progress Data Yet</h3>
        <p className="text-gray-600">
          Your therapist will share session summaries here to help you track your healing journey.
          Check back after your next session!
        </p>
      </div>
    );
  }

  const moodTrend = analytics.mood_trend || [];
  const latestMood = moodTrend.length > 0 ? moodTrend[moodTrend.length - 1].mood : 0;
  const firstMood = moodTrend.length > 0 ? moodTrend[0].mood : 0;
  const moodChange = latestMood - firstMood;
  const isImproving = moodChange > 0;

  // Format data for charts
  const moodChartData = moodTrend.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mood: entry.mood,
    fullDate: entry.date,
  }));

  return (
    <div className="space-y-8">
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sessions Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                Sessions Completed
              </p>
              <p className="text-4xl font-semibold text-gray-900">{analytics.total_sessions}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <CheckCircle2 size={24} className="text-slate-600" />
            </div>
          </div>
        </div>

        {/* Average Mood Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                Average Mood
              </p>
              <p className="text-4xl font-semibold text-gray-900">
                {analytics.average_mood.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400 mt-1">/10</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <Heart size={24} className="text-slate-600" />
            </div>
          </div>
        </div>

        {/* Progress Trend Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                Trend
              </p>
              <p className={`text-4xl font-semibold ${isImproving ? "text-emerald-600" : "text-slate-600"}`}>
                {isImproving ? "+" : ""}{moodChange.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isImproving ? "Improving" : "Steady"}
              </p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              {isImproving ? (
                <ArrowUp size={24} className="text-emerald-600" />
              ) : (
                <TrendingUp size={24} className="text-slate-600" />
              )}
            </div>
          </div>
        </div>

        {/* Consistency Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                Consistency
              </p>
              <p className="text-4xl font-semibold text-gray-900">{moodTrend.length}</p>
              <p className="text-xs text-slate-400 mt-1">Sessions tracked</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <Zap size={24} className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Mood Timeline Chart */}
      {moodChartData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Mood Progression</h2>
            <p className="text-slate-500 text-sm">Your emotional wellness over time</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                domain={[0, 10]}
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => [`${value}/10`, "Mood"]}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#64748b"
                strokeWidth={2}
                dot={{ fill: "#64748b", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200">
            <div className="text-center">
              <p className="text-slate-500 text-xs font-semibold uppercase mb-2">First Session</p>
              <p className="text-2xl font-semibold text-gray-900">{firstMood}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs font-semibold uppercase mb-2">Latest</p>
              <p className="text-2xl font-semibold text-gray-900">{latestMood}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs font-semibold uppercase mb-2">Range</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.max(...moodTrend.map((e) => e.mood)) - Math.min(...moodTrend.map((e) => e.mood))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Symptom Improvement Section */}
      {Object.keys(analytics.symptom_trends).length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Symptom Progress</h2>
            <p className="text-slate-500 text-sm">Tracking improvements across different areas</p>
          </div>

          <div className="space-y-8">
            {Object.entries(analytics.symptom_trends).map(([symptom, scores]) => {
              const latestScore = scores[scores.length - 1]?.score || 0;
              const firstScore = scores[0]?.score || 0;
              const improvement = latestScore - firstScore;

              const symptomChartData = scores.map((s) => ({
                date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                score: s.score,
              }));

              return (
                <div key={symptom}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{symptom}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-gray-900">{latestScore}/10</p>
                      <p className="text-xs text-slate-500 mt-1">Current Score</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
                    <div
                      className="h-full bg-slate-600 rounded-full transition-all duration-500"
                      style={{ width: `${(latestScore / 10) * 100}%` }}
                    ></div>
                  </div>

                  {/* Mini Chart */}
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={symptomChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "11px" }} />
                        <YAxis domain={[0, 10]} stroke="#94a3b8" style={{ fontSize: "11px" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "6px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                          formatter={(value) => [`${value}/10`, "Score"]}
                        />
                        <Bar dataKey="score" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                    <div className="text-center">
                      <p className="text-slate-500 text-xs font-semibold uppercase mb-1">Started</p>
                      <p className="text-lg font-semibold text-gray-900">{firstScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500 text-xs font-semibold uppercase mb-1">Current</p>
                      <p className="text-lg font-semibold text-gray-900">{latestScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500 text-xs font-semibold uppercase mb-1">Change</p>
                      <p className={`text-lg font-semibold ${improvement > 0 ? "text-emerald-600" : "text-slate-600"}`}>
                        {improvement > 0 ? "+" : ""}{improvement.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Reports */}
      {reports.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Session Reports</h2>
            <p className="text-slate-500 text-sm mt-1">
              Insights and takeaways from each session with your therapist
            </p>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <SessionProgressCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}

      {/* Encouragement Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-200 rounded-lg flex-shrink-0">
            <Award size={24} className="text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You're Making Progress</h3>
            <p className="text-gray-600 mb-4">
              Healing is a journey, not a destination. Every session you attend, every reflection you make, 
              and every step forward—no matter how small—is meaningful. Trust the process and be kind to yourself.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <CheckCircle2 size={16} />
              Keep up the commitment to your well-being
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}