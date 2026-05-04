"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { bookingAPI } from "@/lib/api";
import { cn } from "@/lib/utils"; // ← add this if you have shadcn utils (or just remove cn())

interface AppointmentDetailsModalProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  therapistName: string;
}

export default function AppointmentDetailsModal({
  appointmentId,
  isOpen,
  onClose,
  therapistName,
}: AppointmentDetailsModalProps) {
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingAPI.getAppointmentDetail(appointmentId);
      setAppointment(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").slice(0, 2);
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes.padStart(2, "0")} ${ampm}`;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      cancelled: "bg-rose-100 text-rose-800 border-rose-200",
      no_show: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return variants[status] || "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-w-[640px] p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-b from-white to-slate-50/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              Appointment Details
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-slate-500 hover:text-slate-700" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-slate-500 font-medium">Loading appointment information...</p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-5 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="h-6 w-6 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-rose-800">Error</h4>
                <p className="text-sm text-rose-700 mt-1">{error}</p>
              </div>
            </div>
          ) : appointment ? (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex justify-between items-center">
                <span
                  className={cn(
                    "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border",
                    getStatusVariant(appointment.status)
                  )}
                >
                  {appointment.status.replace("_", " ")}
                </span>

                {appointment.duration_minutes && (
                  <span className="text-sm text-slate-500">
                    Duration: <span className="font-medium">{appointment.duration_minutes} min</span>
                  </span>
                )}
              </div>

              {/* Main Info Cards */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Date */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Calendar className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Date</p>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {formatDate(appointment.appointment_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-indigo-100 p-2">
                      <Clock className="h-5 w-5 text-indigo-700" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Time</p>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {formatTime(appointment.start_time)} – {formatTime(appointment.end_time)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Therapist */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-violet-100 p-3">
                    <User className="h-5 w-5 text-violet-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Therapist</h3>
                    <p className="text-slate-700 mt-0.5">{therapistName}</p>
                  </div>
                </div>

                {appointment.therapist_notes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-600 mb-2">Therapist Notes</p>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                      {appointment.therapist_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Session Mode + Link */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-cyan-100 p-2.5 mt-0.5">
                    {appointment.session_mode === "online" ? (
                      <Video className="h-5 w-5 text-cyan-700" />
                    ) : (
                      <MapPin className="h-5 w-5 text-emerald-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Session Mode</h3>
                    <p className="text-slate-700 capitalize">
                      {appointment.session_mode === "online" ? "Online (Video Call)" : "In-Person"}
                    </p>

                    {appointment.session_mode === "online" && appointment.meeting_link && (
                      <div className="mt-4">
                        <a
                          href={appointment.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Video className="h-4 w-4" />
                          Join Meeting Link
                        </a>
                        <p className="mt-1 text-xs text-slate-500 break-all font-mono">
                          {appointment.meeting_link}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason & Notes */}
              {(appointment.reason_for_visit || appointment.patient_notes) && (
                <div className="space-y-5">
                  {appointment.reason_for_visit && (
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-lg bg-amber-100 p-2.5">
                          <FileText className="h-5 w-5 text-amber-700" />
                        </div>
                        <h3 className="font-semibold text-slate-900">Reason for Visit</h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {appointment.reason_for_visit}
                      </p>
                    </div>
                  )}

                  {appointment.patient_notes && (
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-lg bg-purple-100 p-2.5">
                          <FileText className="h-5 w-5 text-purple-700" />
                        </div>
                        <h3 className="font-semibold text-slate-900">Your Notes</h3>
                      </div>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {appointment.patient_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Contact */}
              {(appointment.contact_email || appointment.contact_phone) && (
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-slate-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {appointment.contact_email && (
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <Mail className="h-4 w-4 text-blue-700" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Email</p>
                          <p className="text-slate-800 font-medium">{appointment.contact_email}</p>
                        </div>
                      </div>
                    )}
                    {appointment.contact_phone && (
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2">
                          <Phone className="h-4 w-4 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Phone</p>
                          <p className="text-slate-800 font-medium">{appointment.contact_phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cancellation Info */}
              {appointment.status === "cancelled" && appointment.cancellation_reason && (
                <div className="border border-rose-200 bg-rose-50/60 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-rose-800 mb-1">Cancelled</h3>
                      <p className="text-rose-700 text-sm leading-relaxed">
                        {appointment.cancellation_reason}
                      </p>
                      {appointment.cancelled_at && (
                        <p className="text-xs text-rose-600 mt-3">
                          Cancelled on {formatDate(appointment.cancelled_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t bg-slate-50 flex justify-end">
          <Button onClick={onClose} variant="outline" className="min-w-[120px]">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}