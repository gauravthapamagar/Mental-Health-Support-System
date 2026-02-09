'use client';

import { CheckCircle, Sparkles, User, Brain, Target, Zap, Flame, Stars } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
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
    if (item.category === 'mindfulness') return <Brain className="w-5 h-5" />;
    if (item.category === 'exercise') return <Target className="w-5 h-5" />;
    if (item.category === 'reflection') return <Stars className="w-5 h-5" />;
    return isAI ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />;
  };

  const colorScheme = isCompleted 
    ? {
        bg: 'bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-cyan-400/5',
        border: 'border-emerald-300/30',
        accent: 'bg-emerald-500',
        text: 'text-emerald-700',
        iconBg: 'bg-emerald-500/10',
        glow: 'shadow-emerald-500/20'
      }
    : isAI 
      ? {
          bg: 'bg-gradient-to-br from-violet-400/10 via-fuchsia-400/10 to-pink-400/5',
          border: 'border-violet-300/30',
          accent: 'bg-violet-500',
          text: 'text-violet-700',
          iconBg: 'bg-violet-500/10',
          glow: 'shadow-violet-500/20'
        }
      : {
          bg: 'bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/5',
          border: 'border-blue-300/30',
          accent: 'bg-blue-500',
          text: 'text-blue-700',
          iconBg: 'bg-blue-500/10',
          glow: 'shadow-blue-500/20'
        };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -8, 
        rotateX: 5,
        transition: { duration: 0.3 }
      }}
      className={`group relative ${colorScheme.bg} backdrop-blur-xl rounded-3xl border ${colorScheme.border} hover:border-opacity-50 transition-all duration-500 overflow-hidden hover:shadow-2xl ${colorScheme.glow}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Organic blob background */}
      <div className="absolute inset-0 opacity-30">
        <svg className="absolute top-0 right-0 w-48 h-48" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path 
            fill={isAI ? "url(#gradient-ai)" : "url(#gradient-therapist)"}
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,40.1,76.8C26.4,84.6,10,87.6,-5.7,86.1C-21.4,84.6,-36.2,78.6,-49.8,70.5C-63.4,62.4,-75.8,52.2,-82.9,38.8C-90,25.4,-91.8,8.8,-89.3,-6.9C-86.8,-22.6,-80,-37.4,-70.3,-50.1C-60.6,-62.8,-48,-73.4,-33.9,-80.3C-19.8,-87.2,-4.2,-90.4,9.8,-87.8C23.8,-85.2,30.6,-83.6,44.7,-76.4Z" 
            transform="translate(100 100)"
            animate={{
              d: [
                "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,40.1,76.8C26.4,84.6,10,87.6,-5.7,86.1C-21.4,84.6,-36.2,78.6,-49.8,70.5C-63.4,62.4,-75.8,52.2,-82.9,38.8C-90,25.4,-91.8,8.8,-89.3,-6.9C-86.8,-22.6,-80,-37.4,-70.3,-50.1C-60.6,-62.8,-48,-73.4,-33.9,-80.3C-19.8,-87.2,-4.2,-90.4,9.8,-87.8C23.8,-85.2,30.6,-83.6,44.7,-76.4Z",
                "M51.1,-84.5C64.5,-75.8,73.6,-59.4,79.8,-42.8C86,-26.2,89.3,-9.4,87.1,6.7C84.9,22.8,77.2,38.2,66.8,50.8C56.4,63.4,43.3,73.2,28.5,78.9C13.7,84.6,-2.8,86.2,-18.5,82.5C-34.2,78.8,-49.1,69.8,-61.8,57.5C-74.5,45.2,-85,29.6,-88.3,12.8C-91.6,-4,-87.7,-22,-78.9,-37.5C-70.1,-53,-56.4,-66,-41.2,-74.4C-26,-82.8,-9.4,-86.6,6.3,-85.9C22,-85.2,37.7,-93.2,51.1,-84.5Z"
              ]
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 8,
              ease: "easeInOut"
            }}
          />
          <defs>
            <linearGradient id="gradient-ai" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="gradient-therapist" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="relative p-6">
        <div className="flex items-start gap-4 mb-5">
          {/* Floating icon with glow */}
          <motion.div 
            className={`relative flex-shrink-0 w-14 h-14 rounded-2xl ${colorScheme.iconBg} backdrop-blur-sm flex items-center justify-center border border-white/20`}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 0.5 }
            }}
          >
            <div className={`absolute inset-0 ${colorScheme.accent} opacity-20 blur-xl rounded-2xl`} />
            <div className={colorScheme.text}>
              {isCompleted ? <CheckCircle className="w-6 h-6" strokeWidth={2.5} /> : getIcon()}
            </div>
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                {item.title}
              </h3>
              
              {/* Pill badge with shimmer */}
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring", bounce: 0.5 }}
                className={`relative flex-shrink-0 px-3 py-1 rounded-full ${colorScheme.accent} overflow-hidden`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "linear",
                    repeatDelay: 3
                  }}
                />
                <span className="relative text-[11px] font-bold text-white uppercase tracking-widest">
                  {isAI ? '✨ AI' : '👤 Pro'}
                </span>
              </motion.div>
            </div>
            
            <p className="text-sm text-slate-700 mb-3 leading-relaxed font-medium">
              {item.description}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
              <motion.div 
                className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : colorScheme.accent}`}
                animate={!isCompleted ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              {item.frequency}
            </div>
          </div>
        </div>

        {/* Liquid progress bar */}
        {!isCompleted && progress > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Progress</span>
              <motion.span 
                className="text-sm font-black text-slate-900"
                key={progress}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {progress}%
              </motion.span>
            </div>
            <div className="relative h-3 bg-gradient-to-r from-slate-200/50 to-slate-100/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div 
                className={`absolute inset-0 ${colorScheme.accent} opacity-20`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: index * 0.1 + 0.4, duration: 1.2, ease: "easeOut" }}
              />
              <motion.div 
                className={`relative h-full ${colorScheme.accent} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: index * 0.1 + 0.4, duration: 1.2, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "linear"
                  }}
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* Magnetic button effect */}
        {isAI && !isCompleted && (
          <motion.button
            onClick={handleComplete}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative w-full flex items-center justify-center gap-2 px-5 py-3.5 ${colorScheme.accent} text-white rounded-2xl font-bold shadow-lg overflow-hidden group/btn`}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <CheckCircle size={18} strokeWidth={2.5} className="relative z-10" />
            <span className="relative z-10">Mark Complete</span>
          </motion.button>
        )}
        
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-white rounded-2xl font-bold shadow-lg relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0"
              animate={{ 
                background: [
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                  'linear-gradient(270deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)'
                ]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CheckCircle size={18} strokeWidth={2.5} />
            </motion.div>
            <span>Completed! 🎉</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function CarePlan() {
  const carePlanItems: CarePlanItem[] = [
    {
      id: "1",
      title: "Morning Mindfulness Practice",
      description: "Guided meditation for anxiety management",
      frequency: "10 mins • Daily at 8:00 AM",
      source: "ai",
      progress: 75,
      category: "mindfulness",
    },
    {
      id: "2",
      title: "Cognitive Reframing Journal",
      description: "Evening reflection on thought patterns",
      frequency: "15 mins • 3x per week",
      source: "therapist",
      progress: 60,
      category: "reflection",
    },
    {
      id: "3",
      title: "Box Breathing Exercise",
      description: "Stress management technique",
      frequency: "5 mins • Twice daily",
      source: "ai",
      progress: 40,
      category: "mindfulness",
    },
    {
      id: "4",
      title: "Gratitude Practice",
      description: "Daily appreciation journaling",
      frequency: "5 mins • Before bed",
      source: "therapist",
      progress: 90,
      category: "reflection",
    },
  ];

  const overallProgress = Math.round(
    carePlanItems.reduce((acc, item) => acc + (item.progress || 0), 0) / carePlanItems.length
  );

  const currentStreak = 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-white/80 backdrop-blur-2xl rounded-3xl border border-violet-200/40 overflow-hidden shadow-xl shadow-violet-500/10"
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-100 via-fuchsia-50 to-transparent" />
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-pink-100 via-purple-50 to-transparent" />
      </div>

      {/* Header */}
      <div className="relative px-8 pt-8 pb-6 border-b border-violet-200/30">
        <div className="flex items-start justify-between mb-6">
          <div>
            <motion.h2 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-3xl font-black text-slate-900 mb-2 tracking-tight"
            >
              Your Care Plan
            </motion.h2>
            <motion.p 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-slate-600 font-medium"
            >
              Personalized activities to support your journey
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
            className="relative px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "linear"
              }}
            />
            <div className="relative flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="text-xs font-black text-white uppercase tracking-widest">
                AI Enhanced
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Stats card with 3D effect */}
        <motion.div
          initial={{ y: 30, opacity: 0, rotateX: -20 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/40 shadow-lg"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg"
                whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
              >
                <div className="absolute inset-0 bg-orange-400 opacity-50 blur-xl rounded-2xl" />
                <Flame className="relative w-7 h-7 text-white" strokeWidth={2.5} />
              </motion.div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Streak</div>
                <div className="text-3xl font-black text-slate-900">{currentStreak} Days 🔥</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Weekly Progress</div>
              <motion.div 
                className="text-4xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", bounce: 0.5 }}
              >
                {overallProgress}%
              </motion.div>
            </div>
          </div>
          
          <div className="relative h-4 bg-gradient-to-r from-slate-200/50 to-slate-100/50 rounded-full overflow-hidden">
            <motion.div 
              className="absolute h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "linear"
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Care plan items */}
      <div className="relative p-8">
        <div className="grid gap-5">
          {carePlanItems.map((item, index) => (
            <CarePlanCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>

      {/* Footer with magnetic hover */}
      <div className="relative px-8 pb-8">
        <Link
          href="/patient/care-plan"
          className="group relative block"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl font-bold shadow-2xl overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10">View Complete Care Plan</span>
            <motion.svg 
              className="relative z-10 w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </motion.svg>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}