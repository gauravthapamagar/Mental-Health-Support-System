'use client';

import { Video, MapPin, Clock, Calendar as CalendarIcon, Phone, ChevronRight } from "lucide-react";
import Link from "next/link";
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

  const getFormatInfo = () => {
    if (session.format === 'video' || session.session_format === 'video') {
      return {
        icon: <Video className="w-4 h-4" strokeWidth={1.5} />,
        label: 'Video Call',
        gradient: 'from-blue-500 to-cyan-500',
        lightBg: 'bg-blue-50',
        textColor: 'text-blue-700',
        iconBg: 'bg-blue-100'
      };
    } else if (session.format === 'phone' || session.session_format === 'phone') {
      return {
        icon: <Phone className="w-4 h-4" strokeWidth={1.5} />,
        label: 'Phone Call',
        gradient: 'from-purple-500 to-pink-500',
        lightBg: 'bg-purple-50',
        textColor: 'text-purple-700',
        iconBg: 'bg-purple-100'
      };
    } else {
      return {
        icon: <MapPin className="w-4 h-4" strokeWidth={1.5} />,
        label: 'In-Person',
        gradient: 'from-emerald-500 to-teal-500',
        lightBg: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        iconBg: 'bg-emerald-100'
      };
    }
  };

  const formatInfo = getFormatInfo();

  return (
    <>
      <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
        {isToday && (
          <div className="absolute -top-2 -right-2 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg">
              Today
            </span>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${formatInfo.gradient} flex items-center justify-center shadow-md`}>
                <span className="text-white text-sm font-semibold">
                  {initials}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-slate-800 mb-0.5">
                  {therapistName}
                </h3>
                <p className="text-sm text-slate-500">
                  {profession}
                </p>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400 mt-0.5" strokeWidth={1.5} />
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">{dayOfWeek}</div>
                    <div className="text-slate-500">{dateStr}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5" strokeWidth={1.5} />
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">{timeStr}</div>
                    {hoursUntil >= 0 && hoursUntil <= 24 && (
                      <div className="text-amber-600">In {hoursUntil}h</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Format & Action */}
              <div className="flex items-center justify-between gap-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${formatInfo.lightBg} border border-slate-200/60`}>
                  <span className={formatInfo.iconBg + ' p-1 rounded'}>
                    {formatInfo.icon}
                  </span>
                  <span className={`text-xs font-medium ${formatInfo.textColor}`}>
                    {formatInfo.label}
                  </span>
                </div>

                <button
                  onClick={() => setShowDetails(true)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 group/btn transition-colors"
                >
                  View Details
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-slate-800 mb-1">
              Your Sessions
            </h2>
            <p className="text-sm text-slate-500">
              {upcomingCount} upcoming appointment{upcomingCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Link 
            href="/patient/appointments"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            See all
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* Sessions List */}
      <div className="p-8">
        {sortedAppointments.length > 0 ? (
          <div className="space-y-4">
            {sortedAppointments.slice(0, 3).map((session, index) => (
              <SessionCard key={session.id} session={session} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-xl font-serif font-semibold text-slate-700 mb-2">
              No sessions scheduled yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Begin your wellness journey by connecting with a therapist
            </p>
            
            <Link href="/patient/find-therapist">
              <button className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all">
                Find a Therapist
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}