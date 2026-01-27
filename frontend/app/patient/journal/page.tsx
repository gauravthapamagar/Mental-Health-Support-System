'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { journalAPI, JournalEntry as JournalEntryType } from '@/lib/api';
import JournalEntry from '@/components/patient/journal/JournalEntry';
import JournalAnalytics from '@/components/patient/journal/JournalAnalytics';
import JournalList from '@/components/patient/journal/JournalList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, BarChart3, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ViewMode = 'list' | 'analytics' | 'new';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryType | null>(null);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await journalAPI.getEntries({ limit: 100 });
      console.log('[JournalPage] Loaded journal entries:', response);
      setEntries(response.results || response || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load entries');
      console.error('[JournalPage] Error loading entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntry = (entry: JournalEntryType) => {
    console.log('[JournalPage] Saving entry:', entry);
    
    setEntries((prevEntries) => {
      // Check if this entry already exists (update case)
      const existingIndex = prevEntries.findIndex((e) => e.id === entry.id);
      
      if (existingIndex !== -1) {
        // Update existing entry
        const newEntries = [...prevEntries];
        newEntries[existingIndex] = entry;
        console.log('[JournalPage] Updated existing entry at index:', existingIndex);
        return newEntries;
      } else {
        // New entry - add to beginning
        console.log('[JournalPage] Added new entry');
        return [entry, ...prevEntries];
      }
    });
    
    setSelectedEntry(null);
    setViewMode('list');
  };

  const handleDeleteEntry = (id: number) => {
    console.log('[JournalPage] Deleting entry:', id);
    setEntries(entries.filter((e) => e.id !== id));
    setSelectedEntry(null);
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setViewMode('new');
  };

  const handleSelectEntry = (entry: JournalEntryType) => {
    setSelectedEntry(entry);
    setViewMode('list');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-5xl">📝</span>
                Your Journal
              </h1>
              <p className="text-gray-600 mt-2">
                Track your thoughts, emotions, and mental wellbeing
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleNewEntry}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Entry
              </Button>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-4">
                <div className="text-sm text-blue-600 font-semibold">Total Entries</div>
                <div className="text-3xl font-bold text-blue-900 mt-2">{entries.length}</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-4">
                <div className="text-sm text-purple-600 font-semibold">This Month</div>
                <div className="text-3xl font-bold text-purple-900 mt-2">
                  {entries.filter(
                    (e) =>
                      new Date(e.created_at).getMonth() === new Date().getMonth()
                  ).length}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-4">
                <div className="text-sm text-green-600 font-semibold">Consistency</div>
                <div className="text-3xl font-bold text-green-900 mt-2">
                  {entries.length > 0 ? '📈' : '🌱'}
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'new' && (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <JournalEntry
                isNew
                onSave={handleSaveEntry}
                onCancel={() => setViewMode('list')}
              />
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs defaultValue="entries" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="entries" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    My Entries
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="entries" className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="text-4xl"
                      >
                        ⏳
                      </motion.div>
                    </div>
                  ) : entries.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="text-6xl mb-4">📔</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No entries yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Start your journaling journey by creating your first entry
                      </p>
                      <Button
                        onClick={handleNewEntry}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Entry
                      </Button>
                    </motion.div>
                  ) : (
                    <JournalList
                      entries={entries}
                      onSelectEntry={handleSelectEntry}
                      selectedEntry={selectedEntry}
                      onSaveEntry={handleSaveEntry}
                      onDeleteEntry={handleDeleteEntry}
                    />
                  )}
                </TabsContent>

                <TabsContent value="analytics">
                  <JournalAnalytics entries={entries} />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}