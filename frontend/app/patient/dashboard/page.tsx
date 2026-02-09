'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatsGrid from "@/components/patient/dashboard/StatsGrid";
import UpcomingSessions from "@/components/patient/dashboard/UpcomingSessions";
import CarePlan from "@/components/patient/dashboard/CarePlan";
import QuickInsights from "@/components/patient/dashboard/QuickInsights";
import { journalAPI, bookingAPI, JournalEntry } from '@/lib/api';

export default function PatientDashboard() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      const journalResponse = await journalAPI.getEntries({ limit: 100 });
      setJournalEntries(journalResponse.results || journalResponse || []);
      
      const appointmentsResponse = await bookingAPI.getMyAppointments();
      setAppointments(appointmentsResponse.results || appointmentsResponse || []);
      
    } catch (error) {
      console.error('[Dashboard] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-violet-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-white rounded-2xl" />
          </motion.div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Loading Your Dashboard</h2>
          <p className="text-slate-600 font-medium">Preparing your personalized experience...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-violet-50/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <StatsGrid 
            appointments={appointments} 
            journalEntries={journalEntries}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <UpcomingSessions appointments={appointments} />
          </div>

          <div className="space-y-8">
            <CarePlan />
            <QuickInsights 
              journalEntries={journalEntries}
              appointments={appointments}
            />
          </div>
        </div>

        {/* Floating action button */}
        <motion.a
          href="/patient/journal"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", bounce: 0.6 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:shadow-violet-500/50 transition-all"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </motion.a>
      </div>
    </div>
  );
}