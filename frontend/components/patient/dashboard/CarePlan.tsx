'use client';

import { CheckCircle, Circle, Sparkles, User, Brain, Heart, Leaf, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CarePlanItem {
  id: string;
  title: string;
  description: string;
  frequency: string;
  source: "ai" | "therapist";
  completed?: boolean;
  progress?: number;
  category?: string;
}

function CarePlanCard({ item, index }: { item: CarePlanItem; index: number }) {
  const [isCompleted, setIsCompleted] = useState(item.completed || false);
  const [progress, setProgress] = useState(item.progress || 0);
  const isAI = item.source === "ai";

  const handleComplete = () => {
    setIsCompleted(true);
    setProgress(100);
  };

  const getIcon = () => {
    if (item.category === 'mindfulness') return <Brain className="w-4 h-4" strokeWidth={1.5} />;
    if (item.category === 'exercise') return <Heart className="w-4 h-4" strokeWidth={1.5} />;
    if (item.category === 'reflection') return <Leaf className="w-4 h-4" strokeWidth={1.5} />;
    return isAI ? <Sparkles className="w-4 h-4" strokeWidth={1.5} /> : <User className="w-4 h-4" strokeWidth={1.5} />;
  };

  const getGradient = () => {
    if (isCompleted) return 'from-emerald-400 to-teal-500';
    if (isAI) return 'from-violet-400 to-purple-500';
    return 'from-blue-400 to-cyan-500';
  };

  const getBgColor = () => {
    if (isCompleted) return 'bg-emerald-50';
    if (isAI) return 'bg-violet-50';
    return 'bg-blue-50';
  };

  return (
    <div className={`group relative overflow-hidden bg-white/80 hover:bg-white rounded-2xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300`}>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient()} flex items-center justify-center shadow-md`}>
            <div className="text-white">
              {isCompleted ? <CheckCircle className="w-5 h-5" strokeWidth={1.5} /> : getIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                {item.title}
              </h4>
              
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${
                isAI 
                  ? 'bg-violet-100 text-violet-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {isAI ? 'AI' : 'Therapist'}
              </span>
            </div>
            
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">
              {item.description}
            </p>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Circle className="w-2.5 h-2.5" strokeWidth={2} />
              {item.frequency}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!isCompleted && progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Progress</span>
              <span className="text-xs font-semibold text-slate-700">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getGradient()} transition-all duration-500 rounded-full`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        {isAI && !isCompleted && (
          <button
            onClick={handleComplete}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r ${getGradient()} hover:opacity-90 text-white text-xs font-medium rounded-xl transition-all shadow-md`}
          >
            <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            Mark Complete
          </button>
        )}
        
        {isCompleted && (
          <div className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r ${getGradient()} text-white text-xs font-medium rounded-xl shadow-md`}>
            <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            Completed
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarePlan() {
  const carePlanItems: CarePlanItem[] = [
    {
      id: "1",
      title: "Morning Mindfulness",
      description: "Guided meditation for anxiety management",
      frequency: "10 mins daily at 8:00 AM",
      source: "ai",
      progress: 75,
      category: "mindfulness",
    },
    {
      id: "2",
      title: "Thought Journal",
      description: "Evening reflection on thought patterns",
      frequency: "15 mins, 3x per week",
      source: "therapist",
      progress: 60,
      category: "reflection",
    },
    {
      id: "3",
      title: "Breathing Exercise",
      description: "Box breathing for stress management",
      frequency: "5 mins, twice daily",
      source: "ai",
      progress: 40,
      category: "mindfulness",
    },
    {
      id: "4",
      title: "Gratitude Practice",
      description: "Daily appreciation journaling",
      frequency: "5 mins before bed",
      source: "therapist",
      progress: 90,
      category: "reflection",
    },
  ];

  const overallProgress = Math.round(
    carePlanItems.reduce((acc, item) => acc + (item.progress || 0), 0) / carePlanItems.length
  );

  const completedCount = carePlanItems.filter(item => item.completed || item.progress === 100).length;
  const currentStreak = 7;

  return (
    <div className="sticky top-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200/60">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-serif font-semibold text-slate-800">
            Your Care Plan
          </h3>
          <span className="px-3 py-1 bg-slate-100 border border-slate-200/60 rounded-full text-xs font-medium text-slate-600">
            {completedCount}/{carePlanItems.length}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Personalized wellness activities
        </p>
      </div>

      {/* Progress Overview */}
      <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.1),transparent_50%)]" />
        
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-0.5">
                Current Streak
              </div>
              <div className="text-xl font-serif font-semibold text-slate-800">
                {currentStreak} Days
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs font-medium text-slate-500 mb-0.5">
              Progress
            </div>
            <div className="text-xl font-serif font-semibold text-slate-800">
              {overallProgress}%
            </div>
          </div>
        </div>
        
        <div className="relative h-2.5 bg-white/80 rounded-full overflow-hidden border border-slate-200/60">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Care Plan Items */}
      <div className="p-6">
        <div className="space-y-3">
          {carePlanItems.map((item, index) => (
            <CarePlanCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <Link
          href="/patient/care-plan"
          className="group w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-slate-300/50"
        >
          <span>View Complete Plan</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}