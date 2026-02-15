"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { bookingAPI } from "@/lib/api";
import { toast } from "react-toastify";

interface EditSessionReportModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSessionReportModal({
  report,
  isOpen,
  onClose,
  onSuccess,
}: EditSessionReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    session_summary: report.session_summary || "",
    mood_rating: report.mood_rating || 5,
    clinical_observations: report.clinical_observations || "",
    session_outcome: report.session_outcome || "productive",
    homework_assigned: report.homework_assigned || "",
    triggers_identified: report.triggers_identified || "",
    notes_for_next_session: report.notes_for_next_session || "",
    patient_visible: report.patient_visible || false,
  });

  // Update form data when report changes
  useEffect(() => {
    if (isOpen && report) {
      setFormData({
        session_summary: report.session_summary || "",
        mood_rating: report.mood_rating || 5,
        clinical_observations: report.clinical_observations || "",
        session_outcome: report.session_outcome || "productive",
        homework_assigned: report.homework_assigned || "",
        triggers_identified: report.triggers_identified || "",
        notes_for_next_session: report.notes_for_next_session || "",
        patient_visible: report.patient_visible || false,
      });
    }
  }, [isOpen, report]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "mood_rating"
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await bookingAPI.updateReport(report.id, formData);
      toast.success("Session report updated successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("[v0] Update error:", error);
      toast.error(error.response?.data?.error || "Failed to update report");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex items-center justify-between border-b border-slate-200">
          <h2 className="text-2xl font-bold">Edit Session Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Patient and Date Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Patient
              </label>
              <p className="text-slate-900 font-bold">{report.patient.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Session Date
              </label>
              <p className="text-slate-900 font-bold">
                {new Date(report.appointment_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Session Summary */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Session Summary *
            </label>
            <textarea
              name="session_summary"
              value={formData.session_summary}
              onChange={handleChange}
              required
              minLength={10}
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="What was discussed in this session?"
            />
          </div>

          {/* Mood Rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Mood Rating: {formData.mood_rating}/10
            </label>
            <input
              type="range"
              name="mood_rating"
              min="1"
              max="10"
              value={formData.mood_rating}
              onChange={handleChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>Very Negative</span>
              <span>Very Positive</span>
            </div>
          </div>

          {/* Session Outcome */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Session Outcome *
            </label>
            <select
              name="session_outcome"
              value={formData.session_outcome}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="productive">Productive Session</option>
              <option value="breakthrough">Breakthrough Moment</option>
              <option value="needs_follow_up">Needs Follow-Up</option>
              <option value="blocked">Blocked/Stuck</option>
            </select>
          </div>

          {/* Clinical Observations */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Clinical Observations
            </label>
            <textarea
              name="clinical_observations"
              value={formData.clinical_observations}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Your clinical observations and progress notes..."
            />
          </div>

          {/* Triggers Identified */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Triggers Identified
            </label>
            <textarea
              name="triggers_identified"
              value={formData.triggers_identified}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Triggers or patterns identified during session..."
            />
          </div>

          {/* Homework */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Homework Assignment
            </label>
            <textarea
              name="homework_assigned"
              value={formData.homework_assigned}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Homework or assignments for patient..."
            />
          </div>

          {/* Notes for Next Session */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Notes for Next Session
            </label>
            <textarea
              name="notes_for_next_session"
              value={formData.notes_for_next_session}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Topics or focus areas for next session..."
            />
          </div>

          {/* Patient Visibility Toggle */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="patient_visible"
                checked={formData.patient_visible}
                onChange={handleChange}
                className="w-5 h-5 rounded"
              />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  {formData.patient_visible ? (
                    <>
                      <Eye size={18} className="text-purple-600" />
                      Share with Patient
                    </>
                  ) : (
                    <>
                      <EyeOff size={18} className="text-slate-600" />
                      Keep Private
                    </>
                  )}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {formData.patient_visible
                    ? "Patient can view this report in their progress section"
                    : "Only you can view this report"}
                </p>
              </div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
