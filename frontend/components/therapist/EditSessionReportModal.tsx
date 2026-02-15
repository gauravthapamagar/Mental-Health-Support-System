"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { sessionReportAPI, SessionReport } from "@/lib/api";
import { toast } from "react-toastify";
import SessionReportForm from "./SessionReportForm";

interface EditSessionReportModalProps {
  isOpen: boolean;
  reportId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditSessionReportModal({
  isOpen,
  reportId,
  onClose,
  onSuccess,
}: EditSessionReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch full report details when modal opens
  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportDetails();
    }
  }, [isOpen, reportId]);

  const fetchReportDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Fetch FULL details - this returns ALL fields therapist entered
      const fullReport = await sessionReportAPI.getReportDetail(reportId);
      setReport(fullReport);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.error || 
                       'Failed to load report details';
      setError(errorMsg);
      console.error('[EditSessionReportModal] Error fetching report:', err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header with Close Button */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex items-center justify-between border-b border-slate-200 z-10">
            <h2 className="text-2xl font-bold">Edit Session Report</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                <p className="text-slate-600 font-semibold">Loading report details...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-red-900 mb-2">Error Loading Report</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchReportDetails}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : report ? (
              <SessionReportForm
                appointmentId={report.appointment}
                patientName={report.patient.full_name}
                appointmentDate={report.appointment_date}
                editMode={true}
                reportId={report.id}
                initialData={{
                  session_summary: report.session_summary,
                  mood_rating: report.mood_rating,
                  session_outcome: report.session_outcome,
                  homework_assigned: report.homework_assigned,
                  triggers_identified: report.triggers_identified,
                  notes_for_next_session: report.notes_for_next_session,
                  clinical_observations: report.clinical_observations,
                  patient_visible: report.patient_visible,
                  symptom_improvement: report.symptom_improvement,
                  treatment_goals_addressed: report.treatment_goals_addressed,
                }}
                onSuccess={() => {
                  onSuccess?.();
                  onClose();
                }}
                onClose={onClose}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}