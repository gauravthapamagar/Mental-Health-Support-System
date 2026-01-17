"use client";

import { useState } from "react";
import { Plus, Calendar, TrendingUp, Smile, Meh, Frown, X } from "lucide-react";
import JournalEntry from "@/components/patient/journal/JournalEntry";

export default function JournalPage() {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedMood, setSelectedMood] = useState<
    "positive" | "neutral" | "negative" | null
  >(null);

  const entries = [
    {
      id: "1",
      date: "Jan 16, 2026",
      mood: "positive" as const,
      content:
        "Had a great session with Dr. Johnson today. Learned new breathing techniques that really helped during my presentation at work.",
      trigger: "Work presentation stress",
      reframe:
        "This is an opportunity to showcase my skills and knowledge to my team",
    },
    {
      id: "2",
      date: "Jan 14, 2026",
      mood: "neutral" as const,
      content:
        "Feeling okay today. Practiced mindfulness for 10 minutes in the morning. The weather was nice so I went for a walk.",
    },
    {
      id: "3",
      date: "Jan 12, 2026",
      mood: "negative" as const,
      content:
        "Struggled with anxiety about upcoming deadlines. Felt overwhelmed by the amount of work.",
      trigger: "Multiple project deadlines approaching",
      reframe:
        "I can break these tasks into smaller, manageable steps and tackle them one at a time",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-gray-600">
            Track your thoughts and practice cognitive reframing
          </p>
        </div>
        <button
          onClick={() => setShowNewEntry(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          New Entry
        </button>
      </div>

      {/* Mood Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">This Week</span>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <div className="text-3xl font-bold mb-1">65%</div>
          <div className="text-sm text-gray-600">Positive Mood</div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: "65%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Total Entries</span>
            <Calendar className="text-blue-600" size={20} />
          </div>
          <div className="text-3xl font-bold mb-1">{entries.length}</div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Current Streak</span>
            <Smile className="text-orange-600" size={20} />
          </div>
          <div className="text-3xl font-bold mb-1">7</div>
          <div className="text-sm text-gray-600">Days in a row</div>
        </div>
      </div>

      {/* New Entry Form */}
      {showNewEntry && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">New Journal Entry</h3>
            <button
              onClick={() => setShowNewEntry(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">
                How are you feeling?
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedMood("positive")}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    selectedMood === "positive"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                  }`}
                >
                  <Smile className="mx-auto mb-2 text-green-600" size={36} />
                  <div className="text-sm font-medium">Positive</div>
                </button>
                <button
                  onClick={() => setSelectedMood("neutral")}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    selectedMood === "neutral"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50"
                  }`}
                >
                  <Meh className="mx-auto mb-2 text-yellow-600" size={36} />
                  <div className="text-sm font-medium">Neutral</div>
                </button>
                <button
                  onClick={() => setSelectedMood("negative")}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    selectedMood === "negative"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                  }`}
                >
                  <Frown className="mx-auto mb-2 text-red-600" size={36} />
                  <div className="text-sm font-medium">Negative</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                What's on your mind?
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Write about your thoughts, feelings, or experiences today..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Anxiety Trigger (Optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What triggered these feelings?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cognitive Reframing (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="How can you reframe this thought more positively or realistically?"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                Save Entry
              </button>
              <button
                onClick={() => setShowNewEntry(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <JournalEntry key={entry.id} {...entry} />
        ))}
      </div>
    </div>
  );
}
