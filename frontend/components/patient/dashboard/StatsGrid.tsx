'use client';

import { Calendar, Sparkles, MessageSquare, Heart, Award, BookOpen, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { JournalEntry } from '@/lib/api';
import { useMemo } from 'react';

interface StatsGridProps {
  appointments: any[];
  journalEntries: JournalEntry[];
}

export default function StatsGrid({ appointments, journalEntries }: StatsGridProps) {
  const nextSession = useMemo(() => {
    const upcoming = appointments
      .filter((apt) => {
        const dateObj = new Date(`${apt.appointment_date}T${apt.start_time}`);
        return dateObj.getTime() > Date.now() && apt.status !== 'cancelled';
      })
      .sort((a, b) => {
        const da = new Date(`${a.appointment_date}T${a.start_time}`);
        const db = new Date(`${b.appointment_date}T${b.start_time}`);
        return da.getTime() - db.getTime();
      });

    return upcoming[0] ?? null;
  }, [appointments]);

  const nextSessionLabel = nextSession
    ? new Date(`${nextSession.appointment_date}T${nextSession.start_time}`).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'No upcoming session';

  const therapist = nextSession?.therapist?.full_name || 'Find a therapist';

  const journalStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    const thisWeek = journalEntries.filter((e) => new Date(e.created_at) >= oneWeekAgo).length;

    const thisMonth = journalEntries.filter((e) => {
      const d = new Date(e.created_at);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;

    let streak = 0;
    let current = new Date(today);
    const dates = new Set(journalEntries.map((e) => new Date(e.created_at).toDateString()));

    while (dates.has(current.toDateString())) {
      streak++;
      current.setDate(current.getDate() - 1);
    }

    const latest = journalEntries[0];
    let mood = '—';
    if (latest?.content) {
      const text = latest.content.toLowerCase();
      const pos = ['happy', 'good', 'great', 'better', 'joy', 'grateful', 'love'].filter((w) => text.includes(w)).length;
      const neg = ['sad', 'bad', 'anxious', 'stressed', 'worried', 'depressed'].filter((w) => text.includes(w)).length;
      mood = pos > neg ? 'Positive' : neg > pos ? 'Challenging' : 'Neutral';
    }

    return { thisWeek, thisMonth, streak, mood };
  }, [journalEntries]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 pb-8">
      {/* Hero section with diagonal split design */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden"
      >
        {/* Diagonal split background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500" 
               style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50" 
               style={{ clipPath: 'polygon(0 100%, 100% 85%, 100% 100%)' }} />
        </div>

        {/* Floating orbs */}
        <motion.div
          className="absolute top-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-40 h-40 bg-fuchsia-300/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="relative p-8 md:p-12">
          <div className="max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div>
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs text-white/90 font-semibold flex items-center gap-2 mb-3"
                >
                  <Sparkles size={14} />
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight"
                >
                  {greeting}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-white/90 font-medium"
                >
                  How are you feeling today?
                </motion.p>
              </div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
              >
                <Link
                  href="/patient/journal"
                  className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 font-bold rounded-2xl shadow-2xl shadow-violet-900/20 overflow-hidden transition-all hover:shadow-violet-900/40 hover:scale-105"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-100 to-fuchsia-100"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <MessageSquare size={18} className="relative z-10" />
                  <span className="relative z-10">Write now</span>
                </Link>
              </motion.div>
            </div>

            {/* Bento-style mini stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Streak', value: journalStats.streak, unit: journalStats.streak === 1 ? 'day' : 'days', icon: Zap, color: 'from-orange-400 to-red-400' },
                { label: 'This week', value: journalStats.thisWeek, unit: 'entries', icon: TrendingUp, color: 'from-blue-400 to-cyan-400' },
                { label: 'Mood', value: journalStats.mood, unit: '', icon: Heart, color: 'from-pink-400 to-rose-400' },
                { label: 'Next', value: nextSession ? new Date(`${nextSession.appointment_date}T${nextSession.start_time}`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None', unit: '', icon: Calendar, color: 'from-violet-400 to-purple-400' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 * i + 0.5, type: "spring" }}
                  className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className={`absolute top-2 right-2 p-1.5 bg-gradient-to-br ${stat.color} rounded-lg`}>
                    <stat.icon className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-lg font-black text-slate-900 mb-0.5">{stat.value}</p>
                  {stat.unit && <p className="text-[9px] text-slate-600 font-medium">{stat.unit}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Asymmetric bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
        {/* Large appointment card - spans 2 columns */}
        <Link href="/patient/appointments" className="md:col-span-3 lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group relative h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl border border-blue-200/40 p-6 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-200/50 transition-all"
          >
            {/* Decorative blob */}
            <svg className="absolute -top-10 -right-10 w-40 h-40 opacity-20" viewBox="0 0 200 200">
              <motion.circle 
                cx="100" 
                cy="100" 
                r="80" 
                fill="url(#blue-gradient)"
                animate={{ r: [75, 85, 75] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <defs>
                <radialGradient id="blue-gradient">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </radialGradient>
              </defs>
            </svg>

            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl"
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                >
                  <Calendar className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Next Session</p>
                  <p className="text-xl font-black text-slate-900 mb-1 leading-tight">{nextSessionLabel}</p>
                  <p className="text-sm text-slate-600 font-medium">{therapist}</p>
                </div>
              </div>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </Link>

        {/* Journal card */}
        <Link href="/patient/journal" className="md:col-span-3 lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group h-full bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-2xl border border-violet-200/40 p-6 shadow-lg hover:shadow-2xl hover:shadow-violet-200/50 transition-all"
          >
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Journal</p>
            <p className="text-2xl font-black text-slate-900 mb-1">{journalEntries.length}</p>
            <p className="text-xs text-slate-600 font-medium">{journalStats.thisMonth} this month</p>
          </motion.div>
        </Link>

        {/* Streak card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-3 lg:col-span-3 relative bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl border border-amber-200/40 p-6 shadow-lg overflow-hidden"
        >
          {/* Animated flame background */}
          <motion.div
            className="absolute -bottom-5 -right-5 text-amber-200/30"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-32 h-32" strokeWidth={1} />
          </motion.div>

          <div className="relative z-10">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg mb-4"
              animate={{ 
                boxShadow: [
                  '0 10px 30px rgba(251, 146, 60, 0.3)',
                  '0 10px 40px rgba(251, 146, 60, 0.5)',
                  '0 10px 30px rgba(251, 146, 60, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Streak</p>
            <p className="text-2xl font-black text-slate-900 mb-1">{journalStats.streak} days</p>
            <p className="text-xs text-slate-600 font-medium">Keep it going!</p>
          </div>
        </motion.div>

        {/* Mood card - tall */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="md:col-span-6 lg:col-span-12 relative bg-gradient-to-br from-pink-50 via-white to-rose-50 rounded-2xl border border-pink-200/40 p-6 shadow-lg overflow-hidden"
        >
          {/* Heart pulse background */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-200/20"
            animate={{ 
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Heart className="w-64 h-64" strokeWidth={0.5} fill="currentColor" />
          </motion.div>

          <div className="relative z-10 flex items-center gap-6">
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-xl"
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Recent Mood</p>
              <p className="text-3xl font-black text-slate-900 mb-1">{journalStats.mood}</p>
              <p className="text-sm text-slate-600 font-medium">Based on your latest journal entry</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}