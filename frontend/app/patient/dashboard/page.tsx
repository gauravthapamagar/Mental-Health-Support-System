'use client';

import { useState, useEffect } from 'react';
import StatsGrid from "@/components/patient/dashboard/StatsGrid";
import UpcomingSessions from "@/components/patient/dashboard/UpcomingSessions";
import CarePlan from "@/components/patient/dashboard/CarePlan";
import QuickInsights from "@/components/patient/dashboard/QuickInsights";
import { journalAPI, bookingAPI, JournalEntry } from '@/lib/api';
import { Loader2 } from 'lucide-react';

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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-black animate-spin mx-auto mb-4" strokeWidth={2.5} />
          <h2 className="text-xl font-bold text-black tracking-tight">Loading Dashboard</h2>
        </div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-neutral-50">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Work+Sans:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .font-display {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      {/* Geometric Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Hero Header */}
      <div className="relative border-b-4 border-black bg-white">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-12">
          <div className="flex items-end justify-between">
            <div>
              <div className="inline-block px-4 py-1.5 bg-black text-white text-xs font-bold tracking-widest mb-4">
                PATIENT DASHBOARD
              </div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-black mb-2 font-display">
                {greeting}.
              </h1>
              <p className="text-lg text-neutral-600 font-medium">
                Your wellness journey at a glance
              </p>
            </div>
            
            <div className="hidden lg:block">
              <div className="text-right">
                <div className="text-sm font-bold text-neutral-500 tracking-wide mb-1">TODAY</div>
                <div className="text-3xl font-black font-display">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-8 lg:px-12 py-12">
        {/* Stats Grid */}
        <div className="mb-12">
          <StatsGrid 
            appointments={appointments} 
            journalEntries={journalEntries}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <UpcomingSessions appointments={appointments} />
            <QuickInsights 
              journalEntries={journalEntries}
              appointments={appointments}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <CarePlan />
          </div>
        </div>
      </div>
    </div>
  );
}