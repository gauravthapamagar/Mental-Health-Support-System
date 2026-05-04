"use client";
import React, { useState, useEffect } from "react";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const moodConfig: Record<string, { emoji: string; bg: string; text: string }> =
  {
    happy: { emoji: "\u{1F60A}", bg: "bg-yellow-50", text: "text-yellow-700" },
    excited: {
      emoji: "\u{1F929}",
      bg: "bg-orange-50",
      text: "text-orange-700",
    },
    calm: { emoji: "\u{1F60C}", bg: "bg-teal-50", text: "text-teal-700" },
    sad: { emoji: "\u{1F622}", bg: "bg-blue-50", text: "text-blue-700" },
    anxious: {
      emoji: "\u{1F630}",
      bg: "bg-purple-50",
      text: "text-purple-700",
    },
    angry: { emoji: "\u{1F621}", bg: "bg-red-50", text: "text-red-700" },
    neutral: { emoji: "\u{1F610}", bg: "bg-gray-50", text: "text-gray-600" },
    grateful: { emoji: "\u{1F64F}", bg: "bg-green-50", text: "text-green-700" },
  };

const JournalsTab = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodFilter, setMoodFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (moodFilter !== "all") params.set("mood", moodFilter);
      if (searchTerm) params.set("search", searchTerm);

      const res = await adminApiCall(`/admin/journals/?${params.toString()}`);
      if (res?.ok) {
        setEntries(res.data.entries || res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch journals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [moodFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadData();
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <p className="text-gray-500">Loading journal entries...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Journal Entries</h2>
          <p className="text-gray-500 text-sm mt-1">
            Monitor patient journal activity and mood patterns
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search title or patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {entries.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No journal entries found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Entries will appear here once patients start journaling.
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
                    Title
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mood
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Intensity
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((entry: any) => {
                  const mc = moodConfig[entry.mood] || moodConfig.neutral;
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {entry.patient_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <p className="font-medium text-gray-900 text-sm">
                            {entry.patient_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-800 font-medium truncate max-w-[200px]">
                          {entry.title}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${mc.bg} ${mc.text}`}
                        >
                          <span>{mc.emoji}</span>
                          <span className="capitalize">{entry.mood}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
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
                          <span className="text-xs text-gray-500 font-medium">
                            {entry.mood_intensity}/10
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {entry.tags && entry.tags.length > 0 ? (
                            entry.tags
                              .slice(0, 3)
                              .map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium"
                                >
                                  {tag}
                                </span>
                              ))
                          ) : (
                            <span className="text-xs text-gray-300">--</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalsTab;
