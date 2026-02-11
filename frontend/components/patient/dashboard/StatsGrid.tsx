'use client';

import { Calendar, Sparkles, MessageSquare, Heart, TrendingUp, BookOpen, Zap , ClipboardList} from "lucide-react";
import Link from "next/link";
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
      mood = pos > neg ? 'Positive' : neg > pos ? 'Reflective' : 'Balanced';
    }

    return { thisWeek, thisMonth, streak, mood };
  }, [journalEntries]);

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Session Card */}
        <Link 
          href="/patient/appointments"
          className="group relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-blue-300/60 p-6 hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
              <Calendar className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-slate-500 mb-2">Next Session</p>
            <p className="text-base font-semibold text-slate-800 mb-1 leading-tight">
              {nextSession 
                ? new Date(`${nextSession.appointment_date}T${nextSession.start_time}`).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })
                : 'Not scheduled'
              }
            </p>
            <p className="text-xs text-slate-500 truncate">{therapist}</p>
          </div>
        </Link>

        {/* Journal Entries Card */}
        <Link 
          href="/patient/journal"
          className="group relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-purple-300/60 p-6 hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-slate-500 mb-2">Journal Entries</p>
            <p className="text-2xl font-bold text-slate-800 mb-1">
              {journalEntries.length}
            </p>
            <p className="text-xs text-slate-500">{journalStats.thisMonth} this month</p>
          </div>
        </Link>

        {/* Streak Card */}
        <div className="group relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-orange-300/60 p-6 hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-slate-500 mb-2">Current Streak</p>
            <p className="text-2xl font-bold text-slate-800 mb-1">
              {journalStats.streak}
            </p>
            <p className="text-xs text-slate-500">
              {journalStats.streak === 1 ? 'day' : 'days'} in a row
            </p>
          </div>
        </div>

        <Link 
  href="/patient/therapist-matching-assessment"
  className="group relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-green-300/60 p-6 hover:shadow-lg hover:shadow-green-200/50 transition-all duration-300"
>
  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  
  <div className="relative z-10">
    <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-md">
      <ClipboardList className="w-6 h-6 text-white" strokeWidth={1.5} />
    </div>
    <p className="text-xs font-medium text-slate-500 mb-2">Take Assessment</p>
    
    <p className="text-xs text-slate-500">Find your Perfect Therapist</p>
  </div>
</Link>
</div>
      {/* Weekly Activity Bar */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg shadow-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">This Week's Activity</h3>
            <p className="text-sm text-slate-500">
              {journalStats.thisWeek} {journalStats.thisWeek === 1 ? 'entry' : 'entries'} logged
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md">
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-white">Active</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min((journalStats.thisWeek / 7) * 100, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>0 days</span>
          <span>7 days</span>
        </div>
      </div>

      {/* Quick Action Banner */}
      {journalStats.streak === 0 && journalEntries.length === 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_50%)]" />
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Start Your Wellness Journey
                </h3>
                <p className="text-sm text-white/90">
                  Write your first journal entry and begin tracking your progress
                </p>
              </div>
            </div>
            
            <Link
              href="/patient/journal"
              className="flex-shrink-0 px-6 py-3 bg-white hover:bg-white/90 text-purple-600 font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Milestone Achievement */}
      {journalStats.streak >= 7 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-200/60 p-6 shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_60%)]" />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg text-2xl">
              🎉
            </div>
            
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-amber-100 border border-amber-300/60 text-amber-800 text-xs font-medium rounded-full mb-2">
                Week Streak Achieved!
              </div>
              <h3 className="text-lg font-serif font-semibold text-slate-800 mb-1">
                Amazing Consistency
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                You've maintained a {journalStats.streak}-day streak! Your dedication to self-care is inspiring.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}