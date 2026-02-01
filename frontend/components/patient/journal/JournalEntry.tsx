'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { journalAPI, JournalEntry as JournalEntryType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, X, Check } from 'lucide-react';

interface JournalEntryProps {
  entry?: JournalEntryType;
  onSave?: (entry: JournalEntryType) => void;
  onDelete?: (id: number) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  isNew?: boolean;
  isEditing?: boolean;
}

const MOOD_EMOJIS = {
  happy: { emoji: '😄', label: 'Happy', color: 'from-yellow-400 to-yellow-200' },
  excited: { emoji: '🤗', label: 'Excited', color: 'from-pink-400 to-pink-200' },
  calm: { emoji: '😌', label: 'Calm', color: 'from-blue-400 to-blue-200' },
  sad: { emoji: '😢', label: 'Sad', color: 'from-indigo-400 to-indigo-200' },
  anxious: { emoji: '😰', label: 'Anxious', color: 'from-red-400 to-red-200' },
  angry: { emoji: '😠', label: 'Angry', color: 'from-orange-400 to-orange-200' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'from-gray-400 to-gray-200' },
  grateful: { emoji: '🙏', label: 'Grateful', color: 'from-green-400 to-green-200' },
};

type MoodType = keyof typeof MOOD_EMOJIS;

export default function JournalEntry({
  entry,
  onSave,
  onDelete,
  onCancel,
  onEdit,
  isNew = false,
  isEditing: isEditingProp = false,
}: JournalEntryProps) {
  const [isEditing, setIsEditing] = useState(isNew || isEditingProp);
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<MoodType>((entry?.mood as MoodType) || 'neutral');
  const [moodIntensity, setMoodIntensity] = useState(entry?.mood_intensity || 5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update state when entry prop changes
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setMood((entry.mood as MoodType) || 'neutral');
      setMoodIntensity(entry.mood_intensity || 5);
    }
  }, [entry]);

  // Sync editing state with prop
  useEffect(() => {
    setIsEditing(isNew || isEditingProp);
  }, [isEditingProp, isNew]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let savedEntry: JournalEntryType;
      
      const data = {
        title: title.trim(),
        content: content.trim(),
        mood,
        mood_intensity: moodIntensity,
      };

      if (isNew) {
        savedEntry = await journalAPI.createEntry(data);
        console.log('[JournalEntry] Created new entry:', savedEntry);
      } else if (entry) {
        savedEntry = await journalAPI.updateEntry(entry.id, data);
        console.log('[JournalEntry] Updated entry:', savedEntry);
      } else {
        throw new Error('No entry to save');
      }

      setIsEditing(false);
      onSave?.(savedEntry);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save entry');
      console.error('[JournalEntry] Error saving journal entry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !window.confirm('Are you sure you want to delete this entry?')) return;

    setIsLoading(true);
    setError('');
    
    try {
      await journalAPI.deleteEntry(entry.id);
      console.log('[JournalEntry] Deleted entry:', entry.id);
      onDelete?.(entry.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete entry');
      console.error('[JournalEntry] Error deleting journal entry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (entry) {
      // Reset to original values
      setTitle(entry.title);
      setContent(entry.content);
      setMood((entry.mood as MoodType) || 'neutral');
      setMoodIntensity(entry.mood_intensity || 5);
      setError('');
    }
    setIsEditing(false);
    onCancel?.();
  };

  const moodData = MOOD_EMOJIS[mood];

  // View Mode - Show entry details
  if (!isEditing && entry) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className={`bg-gradient-to-r ${moodData.color} p-6`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="text-5xl animate-bounce">{moodData.emoji}</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.();
                      setIsEditing(true);
                    }}
                    className="hover:bg-white/20"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="hover:bg-white/20 hover:text-red-600"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">Mood: {moodData.label}</p>
              <p className="text-sm font-semibold text-gray-600 mb-2">Mood Intensity</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(moodIntensity / 10) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700 w-8">{moodIntensity}/10</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>

            {entry.updated_at && entry.updated_at !== entry.created_at && (
              <p className="text-xs text-gray-500 mt-4 pt-4 border-t">
                Last edited: {new Date(entry.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  // Edit Mode - Show form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className={`bg-gradient-to-r ${moodData.color} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl animate-bounce">{moodData.emoji}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {isNew ? 'Create New Entry' : 'Edit Entry'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isNew ? 'Express your thoughts and feelings' : 'Update your journal entry'}
                </p>
              </div>
            </div>
            {!isNew && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 bg-white space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="border-gray-300"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How are you feeling? *
            </label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {Object.entries(MOOD_EMOJIS).map(([moodKey, moodInfo]) => (
                <motion.button
                  key={moodKey}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMood(moodKey as MoodType)}
                  disabled={isLoading}
                  className={`p-2 rounded-lg text-2xl transition-all ${
                    mood === moodKey
                      ? 'bg-gradient-to-r ' + moodInfo.color + ' ring-2 ring-offset-2 ring-blue-500'
                      : 'hover:bg-gray-100'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={moodInfo.label}
                >
                  {moodInfo.emoji}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Selected: {moodData.label}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Intensity: <span className="text-blue-600">{moodIntensity}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodIntensity}
              onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What's on your mind? *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts and feelings here..."
              className="min-h-48 border-gray-300 resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            {!isNew && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            {isNew && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSave}
                disabled={isLoading || !title.trim() || !content.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white disabled:opacity-50"
              >
                <Check className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : isNew ? 'Create Entry' : 'Save Changes'}
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}