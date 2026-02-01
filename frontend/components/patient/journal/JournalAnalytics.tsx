'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { JournalEntry } from '@/lib/api';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface JournalAnalyticsProps {
  entries: JournalEntry[];
}

const MOOD_COLORS: Record<string, string> = {
  happy: '#FBBF24',
  excited: '#EC4899',
  calm: '#60A5FA',
  sad: '#818CF8',
  anxious: '#F87171',
  angry: '#FB923C',
  neutral: '#9CA3AF',
  grateful: '#10B981',
};

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😄',
  excited: '🤗',
  calm: '😌',
  sad: '😢',
  anxious: '😰',
  angry: '😠',
  neutral: '😐',
  grateful: '🙏',
};

export default function JournalAnalytics({ entries }: JournalAnalyticsProps) {
  // Calculate mood distribution
  const moodDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};

    entries.forEach((entry) => {
      distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([mood, count]) => ({
        name: mood,
        value: count,
        emoji: MOOD_EMOJIS[mood] || '😐',
        color: MOOD_COLORS[mood] || '#9CA3AF',
      }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  // Calculate mood intensity over time (last 30 days)
  const moodTrend = useMemo(() => {
    const today = new Date();
    const days: Record<string, { date: string; avgIntensity: number; count: number }> = {};

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      days[dateStr] = { date: dateStr, avgIntensity: 0, count: 0 };
    }

    // Populate with entry data
    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (days[dateStr]) {
        days[dateStr].avgIntensity += entry.mood_intensity || 0;
        days[dateStr].count += 1;
      }
    });

    return Object.values(days).map((day) => ({
      ...day,
      avgIntensity: day.count > 0 ? day.avgIntensity / day.count : 0,
    }));
  }, [entries]);

  // Calculate daily entry count
  const entriesByDay = useMemo(() => {
    const today = new Date();
    const days: Record<string, number> = {};

    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      days[dateStr] = 0;
    }

    // Count entries
    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (days[dateStr] !== undefined) {
        days[dateStr] += 1;
      }
    });

    return Object.entries(days).map(([date, count]) => ({
      date,
      entries: count,
    }));
  }, [entries]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const avgIntensity =
      entries.length > 0
        ? (entries.reduce((sum, e) => sum + (e.mood_intensity || 0), 0) /
            entries.length).toFixed(1)
        : '0';
    
    const mostFrequentMood = moodDistribution[0]?.name || 'none';
    const mostIntenseEntry = entries.reduce((max, e) =>
      (e.mood_intensity || 0) > (max.mood_intensity || 0) ? e : max
    );

    const writingStreak = calculateStreak(entries);

    return {
      totalEntries,
      avgIntensity,
      mostFrequentMood,
      mostIntenseEntry,
      writingStreak,
    };
  }, [entries, moodDistribution]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-6">
            <div className="text-sm text-blue-600 font-semibold">Total Entries</div>
            <div className="text-4xl font-bold text-blue-900 mt-3">
              {stats.totalEntries}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              📚 entries created
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-6">
            <div className="text-sm text-purple-600 font-semibold">Avg Intensity</div>
            <div className="text-4xl font-bold text-purple-900 mt-3">
              {stats.avgIntensity}/10
            </div>
            <p className="text-xs text-purple-700 mt-2">
              average mood intensity
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 p-6">
            <div className="text-sm text-pink-600 font-semibold">Primary Mood</div>
            <div className="text-4xl font-bold text-pink-900 mt-3">
              {MOOD_EMOJIS[stats.mostFrequentMood] || '😐'}
            </div>
            <p className="text-xs text-pink-700 mt-2 capitalize">
              {stats.mostFrequentMood} mood
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 p-6">
            <div className="text-sm text-orange-600 font-semibold">Writing Streak</div>
            <div className="text-4xl font-bold text-orange-900 mt-3">
              {stats.writingStreak}
            </div>
            <p className="text-xs text-orange-700 mt-2">
              🔥 days in a row
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mood Distribution
            </h3>
            {moodDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ emoji, value, percent }) =>
                      `${emoji} ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moodDistribution.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} entries`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No data yet
              </div>
            )}
          </Card>
        </motion.div>

        {/* Mood Intensity Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mood Intensity Trend (30 Days)
            </h3>
            {moodTrend.some((day) => day.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    formatter={(value) => `${(value as number).toFixed(1)}/10`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgIntensity"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No data yet
              </div>
            )}
          </Card>
        </motion.div>

        {/* Entry Frequency (Last 14 Days) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Entry Frequency (14 Days)
            </h3>
            {entriesByDay.some((day) => day.entries > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={entriesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} entries`} />
                  <Bar
                    dataKey="entries"
                    fill="#3B82F6"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No data yet
              </div>
            )}
          </Card>
        </motion.div>

        {/* Mood Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mood Breakdown
            </h3>
            <div className="space-y-3">
              {moodDistribution.length > 0 ? (
                moodDistribution.map((mood, index) => {
                  const percentage = (
                    (mood.value / entries.length) *
                    100
                  ).toFixed(0);
                  return (
                    <motion.div
                      key={mood.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-700 capitalize">
                            {mood.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {mood.value} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: mood.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-gray-500">No mood data yet</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
          <div className="flex items-start gap-4">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Insights</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {stats.writingStreak > 0 && (
                  <li>
                    ✨ Keep up the great work! You have a {stats.writingStreak}-day
                    writing streak.
                  </li>
                )}
                {entries.length > 0 && (
                  <li>
                    📊 Your most frequent mood is{' '}
                    <span className="font-semibold capitalize">
                      {stats.mostFrequentMood}
                    </span>
                    .
                  </li>
                )}
                {entries.length >= 10 && (
                  <li>
                    🎯 You've created {stats.totalEntries} entries. Keep journaling to
                    better understand your emotions!
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let streak = 0;
  let lastDate: Date | null = null;

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.created_at);
    entryDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      lastDate = entryDate;
      streak = 1;
    } else {
      const dayDifference = Math.floor(
        (lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDifference === 1) {
        streak += 1;
        lastDate = entryDate;
      } else if (dayDifference === 0) {
        // Same day, skip
        continue;
      } else {
        break;
      }
    }
  }

  return streak;
}
