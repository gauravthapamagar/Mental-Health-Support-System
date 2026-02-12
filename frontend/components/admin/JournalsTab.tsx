"use client";
import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, AlertCircle } from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const moodConfig: Record<string, { emoji: string; bg: string; text: string }> =
  {
    happy: { emoji: "😊", bg: "bg-yellow-50", text: "text-yellow-700" },
    excited: {
      emoji: "🤩",
      bg: "bg-orange-50",
      text: "text-orange-700",
    },
    calm: { emoji: "😌", bg: "bg-teal-50", text: "text-teal-700" },
    sad: { emoji: "😢", bg: "bg-blue-50", text: "text-blue-700" },
    anxious: {
      emoji: "😰",
      bg: "bg-purple-50",
      text: "text-purple-700",
    },
    angry: { emoji: "😠", bg: "bg-red-50", text: "text-red-700" },
    neutral: { emoji: "😐", bg: "bg-gray-50", text: "text-gray-600" },
    grateful: { emoji: "🙏", bg: "bg-green-50", text: "text-green-700" },
  };

const JournalsTab = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodFilter, setMoodFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (moodFilter !== "all") params.set("mood", moodFilter);
      if (searchTerm) params.set("search", searchTerm);

      const res = await adminApiCall(`/admin/journals/?${params.toString()}`);
      if (res?.ok) {
        setEntries(res.data.entries || res.data || []);
      } else if (res?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (res?.status === 404) {
        setEntries([]);
      } else {
        setError(res?.data?.error || "Failed to fetch journal entries");
      }
    } catch (error) {
      console.error("Failed to fetch journals:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [moodFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [moodFilter, searchTerm, loadData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading journal entries...</p>
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
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Journals</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Journal Entries</h1>
            <p className="text-blue-100 text-lg">Monitor patient journal activity and mood patterns</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-cyan-300 animate-pulse"></div>
            <span className="text-sm font-medium">{entries.length} Entries</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Entries"
          value={entries.length}
          color="green"
        />
        <StatCard
          label="Happy"
          value={moodCounts.happy || 0}
          color="yellow"
        />
        <StatCard
          label="Calm"
          value={moodCounts.calm || 0}
          color="teal"
        />
        <StatCard
          label="Anxious"
          value={moodCounts.anxious || 0}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Moods</option>
            <option value="happy">Happy</option>
            <option value="excited">Excited</option>
            <option value="calm">Calm</option>
            <option value="sad">Sad</option>
            <option value="anxious">Anxious</option>
            <option value="angry">Angry</option>
            <option value="neutral">Neutral</option>
            <option value="grateful">Grateful</option>
          </select>
        </div>
      </div>

      {/* Journal Entries */}
      {entries.length === 0 ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-green-200 rounded-2xl p-16 text-center">
          <div className="p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-green-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Journal Entries Found</h3>
          <p className="text-gray-600">
            {searchTerm ? "No entries match your search." : "Entries will appear here once patients start journaling."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => {
            const mc = moodConfig[entry.mood] || moodConfig.neutral;

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Mood & Patient */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Patient & Mood</p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        {entry.patient_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{entry.patient_name}</p>
                        <p className="text-xs text-gray-500">{entry.patient_email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${mc.bg} ${mc.text}`}>
                      <span className="text-lg">{mc.emoji}</span>
                      <span className="capitalize">{entry.mood}</span>
                    </span>
                  </div>

                  {/* Title & Content */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Title</p>
                    <p className="font-semibold text-gray-900 text-sm mb-2">{entry.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{entry.content?.substring(0, 150)}...</p>
                  </div>

                  {/* Intensity */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Intensity</p>
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            entry.mood_intensity <= 3
                              ? "bg-green-400"
                              : entry.mood_intensity <= 6
                                ? "bg-amber-400"
                                : "bg-red-400"
                          }`}
                          style={{
                            width: `${(entry.mood_intensity / 10) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{entry.mood_intensity}/10</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tags</p>
                    {entry.tags && entry.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.tags.slice(0, 3).map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No tags</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.created_at).getFullYear()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }: any) => {
  const colors: Record<string, string> = {
    green: "bg-green-50 border-green-200 text-green-600",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
    teal: "bg-teal-50 border-teal-200 text-teal-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default JournalsTab;
