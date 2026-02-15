"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Heart, Target, CheckCircle2, Loader2 } from "lucide-react";
import { sessionReportAPI } from "@/lib/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressAnalytics = async () => {
      try {
        const data = await sessionReportAPI.getPatientProgressAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("[v0] Failed to fetch progress analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!analytics || analytics.total_sessions === 0) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
        <Heart size={32} className="mx-auto text-blue-600 mb-3" />
        <h3 className="text-lg font-bold text-gray-900">No Progress Data Yet</h3>
        <p className="text-gray-600 mt-1">
          Your therapist will share session summaries here to help you track your progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sessions Completed */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Sessions Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {analytics.total_sessions}
              </p>
            </div>
            <CheckCircle2 size={32} className="text-blue-600" />
          </div>
        </div>

        {/* Average Mood */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Average Mood</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {analytics.average_mood.toFixed(1)}/10
              </p>
            </div>
            <Heart size={32} className="text-green-600" />
          </div>
        </div>

        {/* Progress Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Progress Trend</p>
              <p className="text-sm text-gray-700 mt-2">
                {analytics.mood_trend.length > 1 &&
                  analytics.mood_trend[analytics.mood_trend.length - 1].mood >
                    analytics.mood_trend[0].mood
                  ? "Improving over time"
                  : "Keep working on it"}
              </p>
            </div>
            <TrendingUp size={32} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Mood Timeline */}
      {analytics.mood_trend.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Mood Over Time</h3>
          <div className="space-y-3">
            {analytics.mood_trend.map((entry, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
                    style={{ width: `${(entry.mood / 10) * 100}%` }}
                  />
                </div>
                <div className="w-12 text-right font-bold text-gray-900">
                  {entry.mood}/10
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptom Improvement */}
      {Object.keys(analytics.symptom_trends).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={20} className="text-blue-600" />
            Symptom Improvements
          </h3>
          <div className="space-y-6">
            {Object.entries(analytics.symptom_trends).map(([symptom, scores]) => (
              <div key={symptom}>
                <h4 className="font-semibold text-gray-900 capitalize mb-2">
                  {symptom}
                </h4>
                <div className="flex items-end gap-1 h-20">
                  {scores.map((score, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-100 rounded-t hover:bg-blue-200 transition-colors relative group"
                      style={{ height: `${(score.score / 10) * 100}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {score.score}/10
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>First Session</span>
                  <span>Latest</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Session Summary */}
      {analytics.latest_session && (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Latest Session Summary</h3>
          <div className="space-y-3 text-gray-700">
            <div>
              <p className="text-sm font-semibold text-gray-600">Session Date</p>
              <p className="text-gray-900">
                {new Date(analytics.latest_session.appointment_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Mood Rating</p>
              <p className="text-gray-900">{analytics.latest_session.mood_rating}/10</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Session Outcome</p>
              <p className="text-gray-900">
                {analytics.latest_session.session_outcome_display}
              </p>
            </div>
            {analytics.latest_session.homework_assigned && (
              <div>
                <p className="text-sm font-semibold text-gray-600">Your Homework</p>
                <p className="text-gray-900 mt-1">
                  {analytics.latest_session.homework_assigned}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
