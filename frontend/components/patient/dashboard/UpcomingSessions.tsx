'use client';

import { Video, MapPin, Clock, Calendar as CalendarIcon, ChevronRight, Phone, Eye, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import AppointmentDetailsModal from "@/components/patient/appointments/AppointmentDetailsModal";

interface UpcomingSessionsProps {
  appointments: any[];
}

function SessionCard({ session, index }: { session: any; index: number }) {
  const [showDetails, setShowDetails] = useState(false);
  const therapistName = session.therapist?.full_name || "Unknown Therapist";
  const initials = therapistName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);
  const profession = session.therapist?.therapist_profile?.profession_type || "Therapist";
  
  const dateObj = new Date(`${session.appointment_date}T${session.start_time}`);
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  
  const isToday = dateObj.toDateString() === new Date().toDateString();
  const hoursUntil = Math.floor((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60));
  const isUpcoming = hoursUntil >= 0 && hoursUntil <= 24;

  const getFormatInfo = () => {
    if (session.format === 'video' || session.session_format === 'video') {
      return {
        icon: <Video className="w-5 h-5" />,
        label: 'Video Call',
        gradient: 'from-blue-500 via-cyan-500 to-teal-500',
        lightGradient: 'from-blue-100 via-cyan-100 to-teal-100',
        glowColor: 'rgba(59, 130, 246, 0.3)'
      };
    } else if (session.format === 'phone' || session.session_format === 'phone') {
      return {
        icon: <Phone className="w-5 h-5" />,
        label: 'Phone Call',
        gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
        lightGradient: 'from-purple-100 via-fuchsia-100 to-pink-100',
        glowColor: 'rgba(168, 85, 247, 0.3)'
      };
    } else {
      return {
        icon: <MapPin className="w-5 h-5" />,
        label: 'In-Person',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        lightGradient: 'from-emerald-100 via-teal-100 to-cyan-100',
        glowColor: 'rgba(16, 185, 129, 0.3)'
      };
    }
  };

  const formatInfo = getFormatInfo();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, rotateX: 20, scale: 0.9 }}
        transition={{ 
          delay: index * 0.1, 
          duration: 0.6,
          type: "spring",
          stiffness: 80
        }}
        whileHover={{ 
          y: -10, 
          rotateX: 5,
          transition: { duration: 0.3 }
        }}
        className="group relative"
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Glow effect on hover */}
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r ${formatInfo.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
        />

        <div className={`relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 overflow-hidden shadow-xl`}>
          {/* Decorative top bar */}
          <div className={`h-2 bg-gradient-to-r ${formatInfo.gradient}`}>
            <motion.div
              className="h-full w-1/3 bg-white/40"
              animate={{ x: ['0%', '300%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Mesh gradient background */}
          <div className="absolute inset-0 opacity-40">
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${formatInfo.lightGradient} rounded-full blur-3xl`} />
            <div className={`absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr ${formatInfo.lightGradient} rounded-full blur-3xl`} />
          </div>
          
          <div className="relative p-7">
            <div className="flex flex-col lg:flex-row items-start gap-6">
              {/* Avatar with floating effect */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 blur-xl opacity-50"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${formatInfo.gradient}`} />
                </motion.div>
                
                <motion.div 
                  className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${formatInfo.gradient} flex items-center justify-center shadow-2xl`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                  style={{
                    boxShadow: `0 20px 40px ${formatInfo.glowColor}`
                  }}
                >
                  <span className="font-black text-white text-2xl tracking-tighter">
                    {initials}
                  </span>
                </motion.div>
                
                {/* Status indicators */}
                {isToday && (
                  <motion.div 
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(249, 115, 22, 0.7)',
                        '0 0 0 10px rgba(249, 115, 22, 0)',
                        '0 0 0 0 rgba(249, 115, 22, 0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </motion.div>
                )}
                
                {session.status === 'completed' && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl">
                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-black text-2xl text-slate-900 tracking-tight">
                      {therapistName}
                    </h3>
                    {session.status === 'confirmed' && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring", bounce: 0.6 }}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg"
                      >
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <motion.div 
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          Confirmed
                        </span>
                      </motion.div>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 font-semibold mb-4">{profession}</p>
                  
                  {/* Format badge with icon */}
                  <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r ${formatInfo.lightGradient} rounded-2xl border border-white/60 shadow-lg`}>
                    <div className={`p-2 bg-gradient-to-br ${formatInfo.gradient} rounded-xl text-white shadow-lg`}>
                      {formatInfo.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{formatInfo.label}</span>
                  </div>
                </div>
                
                {/* Date & Time in card style */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 overflow-hidden"
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <div className="absolute top-0 right-0 text-slate-200/40">
                      <CalendarIcon className="w-16 h-16" strokeWidth={0.5} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                          <CalendarIcon className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Date</span>
                      </div>
                      <div className="font-black text-slate-900 text-base mb-1">{dayOfWeek}</div>
                      <div className="text-xs text-slate-600 font-semibold">{dateStr}</div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 overflow-hidden"
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <div className="absolute top-0 right-0 text-slate-200/40">
                      <Clock className="w-16 h-16" strokeWidth={0.5} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                          <Clock className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time</span>
                      </div>
                      <div className="font-black text-slate-900 text-base mb-1">{timeStr}</div>
                      {isUpcoming && (
                        <div className="text-xs text-orange-600 font-bold">In {hoursUntil}h</div>
                      )}
                    </div>
                  </motion.div>
                </div>
                
                {/* Today badge */}
                {isToday && (
                  <motion.div
                    initial={{ scale: 0, x: -20 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring", bounce: 0.7 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl"
                  >
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-sm font-black text-white uppercase tracking-wider">
                      Starting Soon
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0 self-center">
                <motion.button
                  onClick={() => setShowDetails(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group/btn relative overflow-hidden px-6 py-4 bg-gradient-to-r ${formatInfo.gradient} text-white rounded-2xl font-bold shadow-2xl`}
                  style={{
                    boxShadow: `0 10px 40px ${formatInfo.glowColor}`
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="relative z-10 flex items-center gap-2">
                    <Eye className="w-5 h-5" strokeWidth={2.5} />
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AppointmentDetailsModal
        appointmentId={session.id.toString()}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        therapistName={therapistName}
      />
    </>
  );
}

export default function UpcomingSessions({ appointments }: UpcomingSessionsProps) {
  const sortedAppointments = [...appointments]
    .filter(apt => apt.status !== 'cancelled')
    .sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.start_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    });
  
  const upcomingCount = sortedAppointments.filter(apt => {
    const dateObj = new Date(`${apt.appointment_date}T${apt.start_time}`);
    return dateObj.getTime() > new Date().getTime();
  }).length;

  const todayCount = sortedAppointments.filter(apt => {
    const dateObj = new Date(`${apt.appointment_date}T${apt.start_time}`);
    return dateObj.toDateString() === new Date().toDateString();
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white/80 backdrop-blur-2xl rounded-3xl border border-slate-200/40 overflow-hidden shadow-xl"
    >
      {/* Mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-indigo-100 via-purple-100 to-transparent" />
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-violet-100 via-fuchsia-100 to-transparent" />
      </div>

      {/* Header */}
      <div className="relative px-8 py-6 border-b border-slate-200/40">
        <div className="flex items-center justify-between">
          <div>
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-slate-900 mb-3 tracking-tight"
            >
              Your Sessions
            </motion.h2>
            <div className="flex items-center gap-3">
              {upcomingCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  {upcomingCount} Upcoming
                </motion.span>
              )}
              {todayCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  {todayCount} Today
                </motion.span>
              )}
            </div>
          </div>
          
          <Link href="/patient/appointments">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="relative z-10 flex items-center gap-2">
                <span>View All</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Sessions List */}
      <div className="relative p-8">
        {sortedAppointments.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence>
              {sortedAppointments.slice(0, 3).map((session, index) => (
                <SessionCard key={session.id} session={session} index={index} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-3xl flex items-center justify-center shadow-2xl"
            >
              <CalendarIcon className="w-12 h-12 text-violet-700" strokeWidth={2} />
            </motion.div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-3">
              No Sessions Scheduled
            </h3>
            <p className="text-slate-600 mb-8 font-medium">
              Book your first session to start your wellness journey
            </p>
            
            <Link href="/patient/find-therapist">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white rounded-2xl font-bold shadow-2xl shadow-violet-500/30"
              >
                <span>Find a Therapist</span>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}