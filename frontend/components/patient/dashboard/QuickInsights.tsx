'use client';

import { Wind, Lightbulb, BookMarked, CheckCircle, Circle, ArrowRight, Play, Pause } from "lucide-react";
import Link from "next/link";
import { JournalEntry } from '@/lib/api';
import { useState, useEffect } from 'react';

interface QuickInsightsProps {
  journalEntries: JournalEntry[];
  appointments: any[];
}

export default function QuickInsights({ journalEntries, appointments }: QuickInsightsProps) {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [checkInCompleted, setCheckInCompleted] = useState(false);

  // Breathing exercise timer
  useEffect(() => {
    if (!breathingActive) return;

    const phases = [
      { phase: 'inhale' as const, duration: 4000 },
      { phase: 'hold' as const, duration: 4000 },
      { phase: 'exhale' as const, duration: 4000 },
      { phase: 'pause' as const, duration: 4000 },
    ];

    let currentPhaseIndex = 0;
    const interval = setInterval(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      setBreathPhase(phases[currentPhaseIndex].phase);
    }, 4000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  const dailyCheckIns = [
    "I took time for myself today",
    "I practiced gratitude",
    "I moved my body",
    "I connected with someone",
  ];

  const wellnessResources = [
    {
      title: "Grounding Techniques",
      description: "5-4-3-2-1 sensory exercise",
      category: "Anxiety Relief",
      gradient: "from-blue-500 to-cyan-500",
      icon: "🌊"
    },
    {
      title: "Sleep Hygiene Tips",
      description: "Improve your rest quality",
      category: "Better Sleep",
      gradient: "from-indigo-500 to-purple-500",
      icon: "🌙"
    },
    {
      title: "Mindful Walking",
      description: "Movement meditation guide",
      category: "Mindfulness",
      gradient: "from-emerald-500 to-teal-500",
      icon: "🌿"
    },
  ];

  const getBreathText = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe in...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe out...';
      case 'pause': return 'Pause...';
    }
  };

  const getBreathScale = () => {
    switch (breathPhase) {
      case 'inhale': return 'scale-125';
      case 'hold': return 'scale-125';
      case 'exhale': return 'scale-75';
      case 'pause': return 'scale-75';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Breathing Exercise */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-2 mb-1">
            <Wind className="w-5 h-5 text-cyan-600" strokeWidth={1.5} />
            <h3 className="text-lg font-serif font-semibold text-slate-800">
              Box Breathing
            </h3>
          </div>
          <p className="text-sm text-slate-500">
            4-4-4-4 technique for calm
          </p>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-6">
            {/* Breathing Circle */}
            <div className="relative w-40 h-40 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-200/60" />
              
              <div 
                className={`absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 transition-all duration-[3800ms] ease-in-out ${getBreathScale()}`}
                style={{ opacity: breathingActive ? 0.6 : 0 }}
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-slate-700">
                  {breathingActive ? getBreathText() : 'Ready'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-md transition-all"
            >
              {breathingActive ? (
                <>
                  <Pause className="w-4 h-4" strokeWidth={2} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" strokeWidth={2} />
                  <span>Start Exercise</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-xs text-slate-500 leading-relaxed">
            Follow the circle: Inhale (4s) → Hold (4s) → Exhale (4s) → Pause (4s)
          </div>
        </div>
      </div>

      {/* Daily Check-in */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50">
        <div className="px-6 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
            <h3 className="text-lg font-serif font-semibold text-slate-800">
              Daily Check-in
            </h3>
          </div>
          <p className="text-sm text-slate-500">
            Track your wellness habits
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-3 mb-6">
            {dailyCheckIns.map((item, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 cursor-pointer transition-colors group"
              >
                <input
                  type="checkbox"
                  className="sr-only"
                />
                <div className="w-5 h-5 rounded-md border-2 border-slate-300 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                  <Circle className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {item}
                </span>
              </label>
            ))}
          </div>

          <Link
            href="/patient/journal"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-md transition-all"
          >
            <span>Complete in Journal</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* Wellness Resources - Full Width */}
      <div className="md:col-span-2 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50">
        <div className="px-6 py-5 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                <h3 className="text-lg font-serif font-semibold text-slate-800">
                  Wellness Resources
                </h3>
              </div>
              <p className="text-sm text-slate-500">
                Curated guides for your journey
              </p>
            </div>
            
            <Link
              href="/patient/resources"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wellnessResources.map((resource, index) => (
              <button
                key={index}
                className="group text-left p-5 bg-white/80 hover:bg-white rounded-2xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{resource.icon}</div>
                  <span className="text-xs font-medium text-slate-500 px-2 py-1 bg-slate-100 rounded-md">
                    {resource.category}
                  </span>
                </div>
                
                <h4 className="font-semibold text-slate-800 mb-1 leading-tight">
                  {resource.title}
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  {resource.description}
                </p>

                <div className="flex items-center gap-1 text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Therapist Recommendation */}
      {appointments.length === 0 && (
        <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_50%)]" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl">
                💬
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Ready to Connect?
                </h3>
                <p className="text-sm text-white/90">
                  Find a licensed therapist who understands your needs
                </p>
              </div>
            </div>
            
            <Link
              href="/patient/find-therapist"
              className="flex-shrink-0 px-6 py-3 bg-white hover:bg-white/90 text-purple-600 font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
            >
              Browse Therapists
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}