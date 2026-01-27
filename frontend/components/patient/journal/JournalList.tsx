'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalEntry as JournalEntryType } from '@/lib/api';
import JournalEntry from './JournalEntry';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar } from 'lucide-react';

interface JournalListProps {
  entries: JournalEntryType[];
  onSelectEntry?: (entry: JournalEntryType) => void;
  selectedEntry?: JournalEntryType | null;
  onSaveEntry?: (entry: JournalEntryType) => void;
  onDeleteEntry?: (id: number) => void;
  onUpdate?: (id: string, updatedData: {
    content: string;
    trigger?: string;
    reframe?: string;
    mood?: "positive" | "neutral" | "negative";
  }) => Promise<void>;
}

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

export default function JournalList({
  entries,
  onSelectEntry,
  selectedEntry,
  onSaveEntry,
  onDeleteEntry,
  onUpdate,
}: JournalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'mood'>('recent');
  const [expandedId, setExpandedId] = useState<number | null>(selectedEntry?.id || null);

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'mood') {
      filtered.sort((a, b) => (b.mood_intensity || 0) - (a.mood_intensity || 0));
    }

    return filtered;
  }, [entries, searchTerm, sortBy]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, JournalEntryType[]> = {};

    filteredAndSortedEntries.forEach((entry) => {
      const date = new Date(entry.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return groups;
  }, [filteredAndSortedEntries]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300"
          />
        </div>
        <div className="flex gap-2">
          {(['recent', 'oldest', 'mood'] as const).map((sort) => (
            <motion.button
              key={sort}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy(sort)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === sort
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {sort === 'recent' && '⏱️'}
              {sort === 'oldest' && '📅'}
              {sort === 'mood' && '🎭'}
              <span className="ml-2 hidden sm:inline capitalize">{sort}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Entries grouped by date */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedEntries).map(([date, dateEntries], dateIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: dateIndex * 0.1 }}
            >
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700">{date}</h3>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Entries for this date */}
              <div className="space-y-4">
                {dateEntries.map((entry, entryIndex) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: entryIndex * 0.05 }}
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    className="cursor-pointer"
                  >
                    {expandedId === entry.id ? (
                      // Expanded view
                      <JournalEntry
                        entry={entry}
                        onSave={onSaveEntry}
                        onDelete={onDeleteEntry}
                        onCancel={() => setExpandedId(null)}
                      />
                    ) : (
                      // Collapsed view - List item
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                          <div className="flex items-start gap-4 p-4 sm:p-6">
                            {/* Mood emoji */}
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-4xl flex-shrink-0"
                            >
                              {MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS] ||
                                '😐'}
                            </motion.div>

                            {/* Content preview */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-gray-900 truncate">
                                {entry.title}
                              </h4>
                              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                {entry.content}
                              </p>

                              {/* Mood intensity bar */}
                              <div className="flex items-center gap-2 mt-3">
                                <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-1.5">
                                  <motion.div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${
                                        ((entry.mood_intensity || 0) / 10) * 100
                                      }%`,
                                    }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 w-6 text-right">
                                  {entry.mood_intensity || 0}/10
                                </span>
                              </div>

                              {/* Time */}
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(entry.created_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>

                            {/* Click indicator */}
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-2xl flex-shrink-0"
                            >
                              →
                            </motion.div>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAndSortedEntries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-600">No entries found matching your search</p>
        </motion.div>
      )}
    </div>
  );
}
