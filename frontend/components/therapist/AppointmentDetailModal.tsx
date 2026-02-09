"use client";

import { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  Loader2,
  Heart,
  Sparkles,
} from "lucide-react";

interface AppointmentDetailModalProps {
  appointmentId: number;
  onClose: () => void;
  onConfirm?: (id: number) => void;
}

export default function AppointmentDetailModal({
  appointmentId,
  onClose,
  onConfirm,
}: AppointmentDetailModalProps) {
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "attachment">("details");

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const data = await bookingAPI.getAppointmentDetail(appointmentId.toString());
      setAppointment(data);
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAssessment = async () => {
    if (!appointment.assessment_file_url) {
      alert('No assessment file available');
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(appointment.assessment_file_url);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = appointment.assessment_file_name || 'assessment.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download assessment file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm(appointmentId);
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
        <div className="bg-white rounded-2xl max-w-md w-full p-10 text-center shadow-2xl animate-scale-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full animate-pulse opacity-40"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full animate-spin"></div>
            <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Session
          </h3>
          <p className="text-gray-600 mb-6">
            Could not load session details. Please try again.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-bold hover:from-gray-900 hover:to-black transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const hasFile = !!appointment.assessment_file_url;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl animate-scale-in overflow-hidden flex flex-col">
        {/* Header with Gradient - Fixed */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Heart className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">
                  Session Details
                </h2>
              </div>
              <p className="text-white/90 flex items-center gap-2">
                <Calendar size={16} />
                {new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at {appointment.start_time}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
            >
              <X size={22} />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm ${
                appointment.status === "confirmed"
                  ? "bg-green-500/90 text-white"
                  : appointment.status === "pending"
                  ? "bg-amber-500/90 text-white"
                  : "bg-white/90 text-gray-700"
              }`}
            >
              {appointment.status === "confirmed" && <CheckCircle size={16} />}
              {appointment.status_label || appointment.status}
            </span>
          </div>
        </div>

        {/* Tabs - Fixed */}
        <div className="border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex gap-2 px-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`relative px-6 py-3 font-bold transition-all ${
                activeTab === "details"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {activeTab === "details" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-teal-600 rounded-t-full"></div>
              )}
              <span className="relative flex items-center gap-2 text-sm">
                <User size={16} />
                Patient Details
              </span>
            </button>
            <button
              onClick={() => setActiveTab("attachment")}
              className={`relative px-6 py-3 font-bold transition-all flex items-center gap-2 ${
                activeTab === "attachment"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {activeTab === "attachment" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-teal-600 rounded-t-full"></div>
              )}
              <span className="relative flex items-center gap-2 text-sm">
                <FileText size={16} />
                Assessment File
                {hasFile && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs rounded-full font-bold shadow-md">
                    Attached
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-b from-white to-gray-50">
          {activeTab === "details" ? (
            <div className="space-y-5">
              {/* Patient Information */}
              <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg">
                    <User size={16} className="text-white" />
                  </div>
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Full Name
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {appointment.patient?.full_name || appointment.patient_name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Email
                    </label>
                    <p className="text-gray-900 font-medium flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-blue-500" />
                      {appointment.contact_email || appointment.patient?.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Phone
                    </label>
                    <p className="text-gray-900 font-medium flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-teal-500" />
                      {appointment.contact_phone || appointment.patient?.phone_number}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Session Mode
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {appointment.session_mode === "online" ? "🌐 Online" : "🏥 In-Person"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg">
                    <Calendar size={16} className="text-white" />
                  </div>
                  Session Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Type
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {appointment.appointment_type_label || appointment.appointment_type}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Duration
                    </label>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" />
                      {appointment.duration_minutes} minutes
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Reason for Visit
                    </label>
                    <p className="text-gray-900 font-medium bg-white p-3 rounded-lg border border-blue-100 text-sm leading-relaxed">
                      {appointment.reason_for_visit}
                    </p>
                  </div>
                  {appointment.patient_notes && (
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Additional Notes
                      </label>
                      <p className="text-gray-900 font-medium bg-white p-3 rounded-lg border border-blue-100 text-sm leading-relaxed">
                        {appointment.patient_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {hasFile ? (
                <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg">
                      <FileText size={18} className="text-white" />
                    </div>
                    Attached Assessment File
                  </h3>

                  <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-5 rounded-lg border border-blue-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 mb-1 truncate">
                          📄 {appointment.assessment_file_name || "assessment-file.pdf"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Uploaded by patient during booking
                        </p>
                      </div>

                      <button
                        onClick={handleDownloadAssessment}
                        disabled={downloading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {downloading ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download size={18} />
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-bold text-amber-900 mb-1 text-sm">Note for Therapist</h4>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          This file was uploaded by the patient. Please review it carefully before the session.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Assessment File Attached
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto text-sm">
                    The patient did not upload any assessment report for this appointment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions - Fixed */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 hover:border-gray-400 transition-all"
          >
            Close
          </button>
          {appointment.status === "pending" && onConfirm && (
            <button
              onClick={handleConfirmClick}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Confirm Session
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}