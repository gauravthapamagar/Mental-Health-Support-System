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
      console.log("📋 Appointment data:", data);
      console.log("📎 File URL:", data.assessment_file_url);
      setAppointment(data);
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Proper file download handler
  const handleDownloadAssessment = async () => {
    if (!appointment.assessment_file_url) {
      alert('No assessment file available');
      return;
    }

    setDownloading(true);
    try {
      console.log("🔽 Downloading from:", appointment.assessment_file_url);

      // Fetch the file from backend
      const response = await fetch(appointment.assessment_file_url);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = appointment.assessment_file_name || 'assessment.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("✅ Download successful");
    } catch (error) {
      console.error('❌ Download error:', error);
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full p-8 text-center shadow-2xl">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Appointment
          </h3>
          <p className="text-gray-600 mb-6">
            Could not load appointment details. Please try again.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const hasFile = !!appointment.assessment_file_url;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Appointment Details
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
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
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                appointment.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : appointment.status === "pending"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {appointment.status === "confirmed" && <CheckCircle size={16} />}
              {appointment.status_label || appointment.status}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === "details"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Patient Details
            </button>
            <button
              onClick={() => setActiveTab("attachment")}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "attachment"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText size={18} />
              Assessment File
              {hasFile && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                  Attached
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "details" ? (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900 font-medium">
                      {appointment.patient?.full_name || appointment.patient_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">
                      Email
                    </label>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      {appointment.contact_email || appointment.patient?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      {appointment.contact_phone || appointment.patient?.phone_number}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">
                      Session Mode
                    </label>
                    <p className="text-gray-900 font-medium">
                      {appointment.session_mode === "online" ? "Online" : "In-Person"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  Appointment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">
                      Type
                    </label>
                    <p className="text-gray-900 font-medium">
                      {appointment.appointment_type_label || appointment.appointment_type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">
                      Duration
                    </label>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      {appointment.duration_minutes} minutes
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 block mb-1">
                      Reason for Visit
                    </label>
                    <p className="text-gray-900 font-medium bg-white p-3 rounded-lg">
                      {appointment.reason_for_visit}
                    </p>
                  </div>
                  {appointment.patient_notes && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-600 block mb-1">
                        Additional Notes
                      </label>
                      <p className="text-gray-900 font-medium bg-white p-3 rounded-lg">
                        {appointment.patient_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {hasFile ? (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <FileText size={24} className="text-blue-600" />
                    Attached Assessment File
                  </h3>

                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-1 truncate max-w-full">
                          {appointment.assessment_file_name || "assessment-file.pdf"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Uploaded by patient during booking
                        </p>
                      </div>

                      {/* ✅ FIXED: Use button with onClick handler instead of <a> tag */}
                      <button
                        onClick={handleDownloadAssessment}
                        disabled={downloading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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

                  <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-1">Note for Therapist</h4>
                        <p className="text-sm text-amber-800">
                          This file was uploaded by the patient. Review it carefully before the session.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Assessment File Attached
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    The patient did not upload any assessment report for this appointment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Close
          </button>
          {appointment.status === "pending" && onConfirm && (
            <button
              onClick={handleConfirmClick}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Confirm Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}