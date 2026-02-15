"use client";

import { useState } from "react";
import { bookingAPI } from "@/lib/api";
import { Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "react-toastify";

interface SessionReportFormProps {
  appointmentId: number;
  patientName: string;
  appointmentDate: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function SessionReportForm({
  appointmentId,
  patientName,
  appointmentDate,
  onSuccess,
  onClose,
}: SessionReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    appointment: appointmentId,
    session_summary: "",
    mood_rating: 7,
    symptom_improvement: {},
    treatment_goals_addressed: [],
    session_outcome: "productive",
    homework_assigned: "",
    triggers_identified: "",
    notes_for_next_session: "",
    clinical_observations: "",
    patient_visible: false,
  });

  const [symptoms, setSymptoms] = useState<{ [key: string]: number }>({});
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleMoodChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      mood_rating: value,
    }));
  };

  const handleSymptomChange = (symptom: string, score: number) => {
    const newSymptoms = { ...symptoms, [symptom]: score };
    setSymptoms(newSymptoms);
    setFormData((prev) => ({
      ...prev,
      symptom_improvement: newSymptoms,
    }));
  };

  const addSymptom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      const symptomName = e.currentTarget.value;
      setSymptoms((prev) => ({
        ...prev,
        [symptomName]: 5,
      }));
      e.currentTarget.value = "";
    }
  };

  const removeSymptom = (symptom: string) => {
    const newSymptoms = { ...symptoms };
    delete newSymptoms[symptom];
    setSymptoms(newSymptoms);
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals((prev) => [...prev, newGoal]);
      setFormData((prev) => ({
        ...prev,
        treatment_goals_addressed: [...prev.treatment_goals_addressed, newGoal],
      }));
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
    setFormData((prev) => ({
      ...prev,
      treatment_goals_addressed: newGoals,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.session_summary.trim()) {
      toast.error("Please enter a session summary");
      return;
    }

    if (formData.session_summary.trim().length < 10) {
      toast.error("Session summary must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      console.log("[v0] Sending form data:", formData);
      const response = await bookingAPI.createSessionReport(formData);
      console.log("[v0] Response:", response);
      toast.success("Session report created successfully!");
      
      // Reset form
      setFormData({
        appointment: appointmentId,
        session_summary: "",
        mood_rating: 7,
        symptom_improvement: {},
        treatment_goals_addressed: [],
        session_outcome: "productive",
        homework_assigned: "",
        triggers_identified: "",
        notes_for_next_session: "",
        clinical_observations: "",
        patient_visible: false,
      });
      setSymptoms({});
      setGoals([]);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      console.error("[v0] Session report error:", error);
      console.error("[v0] Error status:", error.response?.status);
      console.error("[v0] Error data:", error.response?.data);
      console.error("[v0] Full error response:", JSON.stringify(error.response?.data, null, 2));
      
      // Get detailed error message
      let errorMsg = "Failed to create session report";
      
      if (error.response?.data) {
        // Handle different error formats
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else if (error.response.data.appointment) {
          errorMsg = Array.isArray(error.response.data.appointment) 
            ? error.response.data.appointment[0] 
            : error.response.data.appointment;
        } else if (error.response.data.session_summary) {
          errorMsg = Array.isArray(error.response.data.session_summary)
            ? error.response.data.session_summary[0]
            : error.response.data.session_summary;
        } else {
          // For any other field errors
          const firstError = Object.entries(error.response.data)[0];
          if (firstError) {
            const [field, messages] = firstError;
            errorMsg = `${field}: ${Array.isArray(messages) ? messages[0] : messages}`;
          }
        }
      }
      
      console.error("[v0] Final error message to show:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Write Session Report</h2>
          <p className="text-gray-600 mt-1">
            {patientName} • {appointmentDate}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Summary */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Session Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            name="session_summary"
            value={formData.session_summary}
            onChange={handleInputChange}
            placeholder="What was discussed in this session? Main topics, breakthroughs, patterns..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            rows={5}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.session_summary.length} / Minimum 10 characters
          </p>
        </div>

        {/* Mood Rating */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-4">
            Patient Mood Rating
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={formData.mood_rating}
              onChange={(e) => handleMoodChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-2xl font-bold text-blue-600 min-w-12 text-center">
              {formData.mood_rating}/10
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Very Negative</span>
            <span>Neutral</span>
            <span>Very Positive</span>
          </div>
        </div>

        {/* Symptom Improvement Tracking */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Symptom Improvements
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add symptom (anxiety, depression, etc.)"
              onKeyPress={addSymptom}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-3">
            {Object.entries(symptoms).map(([symptom, score]) => (
              <div key={symptom} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 min-w-24">
                  {symptom}
                </span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={score}
                  onChange={(e) =>
                    handleSymptomChange(symptom, parseInt(e.target.value))
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg"
                />
                <span className="text-sm font-bold text-gray-900 min-w-8">
                  {score}/10
                </span>
                <button
                  type="button"
                  onClick={() => removeSymptom(symptom)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          {Object.keys(symptoms).length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No symptoms tracked yet. Add one to get started.
            </p>
          )}
        </div>

        {/* Treatment Goals */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Treatment Goals Addressed
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add treatment goal"
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddGoal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {goal}
                <button
                  type="button"
                  onClick={() => removeGoal(index)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Session Outcome */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Session Outcome <span className="text-red-500">*</span>
          </label>
          <select
            name="session_outcome"
            value={formData.session_outcome}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="productive">Productive Session</option>
            <option value="breakthrough">Breakthrough Moment</option>
            <option value="needs_follow_up">Needs Follow-Up</option>
            <option value="blocked">Blocked / Stuck</option>
          </select>
        </div>

        {/* Homework Assigned */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Homework / Action Items
          </label>
          <textarea
            name="homework_assigned"
            value={formData.homework_assigned}
            onChange={handleInputChange}
            placeholder="What should the patient work on before the next session?"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Triggers Identified */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Triggers / Patterns Identified
          </label>
          <textarea
            name="triggers_identified"
            value={formData.triggers_identified}
            onChange={handleInputChange}
            placeholder="What triggers or patterns did you identify during this session?"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Notes for Next Session */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Focus Areas for Next Session
          </label>
          <textarea
            name="notes_for_next_session"
            value={formData.notes_for_next_session}
            onChange={handleInputChange}
            placeholder="What should we focus on in the next session?"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Clinical Observations */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Clinical Observations
          </label>
          <textarea
            name="clinical_observations"
            value={formData.clinical_observations}
            onChange={handleInputChange}
            placeholder="Additional clinical notes or observations..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Patient Visibility Toggle */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
          <input
            type="checkbox"
            name="patient_visible"
            checked={formData.patient_visible}
            onChange={handleInputChange}
            className="w-5 h-5 text-blue-600 rounded cursor-pointer"
          />
          <div>
            <label className="text-sm font-bold text-gray-900 cursor-pointer">
              Share Summary with Patient
            </label>
            <p className="text-xs text-gray-600 mt-0.5">
              Patient will see anonymized session summary and progress data
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6 border-t-2 border-gray-100">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Save Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
