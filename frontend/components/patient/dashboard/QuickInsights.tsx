'use client';

import { MessageSquare, Calendar, Heart, TrendingUp, Sparkles, BookOpen, Target, Award, Zap, Brain, Smile, Frown, Meh } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { JournalEntry } from '@/lib/api';
import { useMemo } from 'react';

interface QuickInsightsProps {
  journalEntries: JournalEntry[];
  appointments: any[];
}

export default function QuickInsights({ journalEntries, appointments }: QuickInsightsProps) {
  // Analyze journal data
  const insights = useMemo(() => {
    const recentEntries = journalEntries.slice(0, 7);
    
    // Sentiment analysis
    const sentiments = recentEntries.map(entry => {
      const content = entry.content?.toLowerCase() || '';
      const positiveWords = ['happy', 'great', 'good', 'better', 'amazing', 'wonderful', 'joy', 'excited', 'love', 'grateful', 'thankful'];
      const negativeWords = ['sad', 'bad', 'worse', 'terrible', 'awful', 'anxious', 'worried', 'stressed', 'depressed', 'upset'];
      
      const positiveCount = positiveWords.filter(word => content.includes(word)).length;
      const negativeCount = negativeWords.filter(word => content.includes(word)).length;
      
      if (positiveCount > negativeCount) return 'positive';
      if (negativeCount > positiveCount) return 'negative';
      return 'neutral';
    });

    const positiveRatio = sentiments.filter(s => s === 'positive').length / (sentiments.length || 1);
    
    // Writing frequency
    const thisWeek = journalEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }).length;

    // Average word count
    const avgWordCount = Math.round(
      recentEntries.reduce((acc, entry) => 
        acc + (entry.content?.split(' ').length || 0), 0
      ) / (recentEntries.length || 1)
    );

    return {
      sentiment: positiveRatio > 0.6 ? 'Positive' : positiveRatio < 0.4 ? 'Challenging' : 'Balanced',
      sentimentEmoji: positiveRatio > 0.6 ? '😊' : positiveRatio < 0.4 ? '😔' : '😐',
      weeklyEntries: thisWeek,
      avgWordCount,
      totalEntries: journalEntries.length,
    };
  }, [journalEntries]);

  const quickActions = [
    {
      id: "journal",
      title: "Write Journal",
      description: "Reflect on your day",
      icon: <BookOpen className="w-5 h-5" strokeWidth={2.5} />,
      href: "/patient/journal",
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-400 to-purple-500",
    },
    {
      id: "mood",
      title: "Track Mood",
      description: "Log how you feel",
      icon: <Heart className="w-5 h-5" strokeWidth={2.5} />,
      href: "/patient/mood-tracker",
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-50 to-rose-50",
      iconBg: "from-pink-400 to-rose-500",
    },
    {
      id: "progress",
      title: "View Insights",
      description: "See your journey",
      icon: <TrendingUp className="w-5 h-5" strokeWidth={2.5} />,
      href: "/patient/journal",
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50",
      iconBg: "from-cyan-400 to-blue-500",
    },
    {
      id: "goals",
      title: "Set Goals",
      description: "Plan your week",
      icon: <Target className="w-5 h-5" strokeWidth={2.5} />,
      href: "/patient/care-plan",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm"
      >
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-5 h-5 text-orange-500" strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Quick Actions
            </h2>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            Take action on your wellness goals
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link
                  href={action.href}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.bgGradient} p-4 border border-slate-200/60 hover:shadow-xl transition-all duration-300 block`}
                >
                  {/* Animated background orb */}
                  <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${action.gradient} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className={`w-11 h-11 bg-gradient-to-br ${action.iconBg} rounded-xl flex items-center justify-center mb-3 shadow-lg text-white`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {action.icon}
                    </motion.div>
                    
                    <h3 className="font-black text-slate-900 mb-1 text-sm">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Hover arrow */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Journal Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 border border-indigo-200/60 shadow-sm"
      >
        <div className="flex items-start gap-4 mb-5">
          <motion.div
            className="w-14 h-14 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain className="w-7 h-7 text-white" strokeWidth={2.5} />
          </motion.div>
          
          <div className="flex-1">
            <h3 className="font-black text-slate-900 text-xl mb-1">
              Journal Insights
            </h3>
            <p className="text-sm text-slate-700 font-medium">
              AI-powered analysis of your reflections
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-md"
          >
            <div className="text-4xl mb-2">{insights.sentimentEmoji}</div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {insights.sentiment}
            </div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wide">
              Overall Mood
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-md"
          >
            <div className="text-4xl font-black text-transparent bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text mb-1">
              {insights.weeklyEntries}
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">
              Entries
            </div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wide">
              This Week
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring", bounce: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-md"
          >
            <div className="text-4xl font-black text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text mb-1">
              {insights.avgWordCount}
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">
              Words
            </div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wide">
              Avg. Length
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-md"
          >
            <div className="text-4xl font-black text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text mb-1">
              {insights.totalEntries}
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">
              Total
            </div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wide">
              All Entries
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Link
            href="/patient/journal"
            className="group w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <MessageSquare className="w-5 h-5" strokeWidth={2.5} />
            <span>View All Entries</span>
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </motion.svg>
          </Link>
        </motion.div>
      </motion.div>

      {/* Achievement Badge */}
      {insights.weeklyEntries >= 5 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", bounce: 0.6 }}
          className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-6 border border-amber-200/60 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            
            <div className="flex-1">
              <h3 className="font-black text-slate-900 text-lg mb-2">
                Consistency Champion! 🏆
              </h3>
              <p className="text-sm text-slate-700 mb-4 font-medium">
                You've journaled {insights.weeklyEntries} times this week. Your dedication to self-reflection is inspiring!
              </p>
              
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-black text-amber-700 border border-amber-300 shadow-sm">
                  🔥 {insights.weeklyEntries} Days
                </div>
                <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-black text-amber-700 border border-amber-300 shadow-sm">
                  ⭐ Top 10%
                </div>
                <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-black text-amber-700 border border-amber-300 shadow-sm">
                  🎯 Goal Crusher
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}