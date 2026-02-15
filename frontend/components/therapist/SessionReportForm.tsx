"use client";

import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { sessionReportAPI, SessionReportData } from "@/lib/api";
import { toast } from "react-toastify";

interface SessionReportFormProps {
  appointmentId: number;
  patientName: string;
  appointmentDate: string;
  editMode?: boolean;
  reportId?: number;
  initialData?: Partial<SessionReportData>;
  onSuccess: () => void;
  onClose: () => void;
}

export default function SessionReportForm({
  appointmentId,
  patientName,
  appointmentDate,
  editMode = false,
  reportId,
  initialData,
  onSuccess,
  onClose,
}: SessionReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SessionReportData>({
    appointment: appointmentId,
    session_summary: initialData?.session_summary || "",
    mood_rating: initialData?.mood_rating || 5,
    session_outcome: initialData?.session_outcome || "productive",
    homework_assigned: initialData?.homework_assigned || "",
    triggers_identified: initialData?.triggers_identified || "",
    notes_for_next_session: initialData?.notes_for_next_session || "",
    clinical_observations: initialData?.clinical_observations || "",
    patient_visible: initialData?.patient_visible || false,
    symptom_improvement: initialData?.symptom_improvement || {},
    treatment_goals_addressed: initialData?.treatment_goals_addressed || [],
  });

  const [originalData, setOriginalData] = useState(formData);
  const [treatmentGoalInput, setTreatmentGoalInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
      setOriginalData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // Get only changed fields for edit mode
  const getChangedFields = (): Partial<SessionReportData> => {
    const changed: Partial<SessionReportData> = {};
    
    Object.keys(formData).forEach((key) => {
      const formValue = formData[key as keyof SessionReportData];
      const originalValue = originalData[key as keyof SessionReportData];
      
      // Deep comparison for objects/arrays
      if (JSON.stringify(formValue) !== JSON.stringify(originalValue)) {
        changed[key as keyof SessionReportData] = formValue;
      }
    });
    
    return changed;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" 
        ? (e.target as HTMLInputElement).checked
        : name === "mood_rating"
        ? parseInt(value)
        : value,
    }));
  };

  const handleAddGoal = () => {
    if (treatmentGoalInput.trim()) {
      setFormData(prev => ({
        ...prev,
        treatment_goals_addressed: [
          ...prev.treatment_goals_addressed,
          treatmentGoalInput.trim(),
        ],
      }));
      setTreatmentGoalInput("");
    }
  };

  const handleRemoveGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      treatment_goals_addressed: prev.treatment_goals_addressed.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSymptomChange = (symptom: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      symptom_improvement: {
        ...prev.symptom_improvement,
        [symptom]: score,
      },
    }));
  };

  const handleRemoveSymptom = (symptom: string) => {
    setFormData(prev => {
      const newSymptoms = { ...prev.symptom_improvement };
      delete newSymptoms[symptom];
      return {
        ...prev,
        symptom_improvement: newSymptoms,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.session_summary || formData.session_summary.trim().length < 10) {
      toast.error("Session summary must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      if (editMode && reportId) {
        // Edit mode: only send changed fields
        const changedFields = getChangedFields();
        
        if (Object.keys(changedFields).length === 0) {
          toast.info("No changes to save");
          setLoading(false);
          return;
        }

        await sessionReportAPI.updateReport(reportId, changedFields);
        toast.success("Session report updated successfully");
      } else {
        // Create mode: send all fields
        await sessionReportAPI.createSessionReport(formData);
        toast.success("Session report created successfully");
      }
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.error ||
                       "Failed to save report";
      toast.error(errorMsg);
      console.error('[SessionReportForm] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient and Date Info */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Patient
          </label>
          <p className="text-slate-900 font-bold">{patientName}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Session Date
          </label>
          <p className="text-slate-900 font-bold">
            {new Date(appointmentDate).toLocaleDateString()}
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
          placeholder="What was discussed in this session?"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200"
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

      {/* Treatment Goals */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Treatment Goals Addressed
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={treatmentGoalInput}
            onChange={(e) => setTreatmentGoalInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddGoal();
              }
            }}
            placeholder="Add a treatment goal..."
            className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddGoal}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.treatment_goals_addressed.map((goal, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg"
            >
              <span className="text-sm">{goal}</span>
              <button
                type="button"
                onClick={() => handleRemoveGoal(index)}
                className="text-blue-600 hover:text-blue-800 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Symptom Improvement */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Symptom Improvement Tracking
        </label>
        <div className="space-y-3 mb-4">
          {Object.entries(formData.symptom_improvement || {}).map(([symptom, score]) => (
            <div key={symptom} className="flex items-center gap-4">
              <span className="w-32 font-medium text-slate-700">{symptom}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => handleSymptomChange(symptom, parseInt(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-slate-200"
              />
              <span className="w-12 text-center font-bold text-slate-900">{score}/10</span>
              <button
                type="button"
                onClick={() => handleRemoveSymptom(symptom)}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-bold transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new symptom (e.g., anxiety, depression)..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const symptom = e.currentTarget.value.trim();
                if (symptom) {
                  handleSymptomChange(symptom, 5);
                  e.currentTarget.value = "";
                }
              }
            }}
            className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
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
          placeholder="Your clinical observations and progress notes..."
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          placeholder="Triggers or patterns identified during session..."
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          placeholder="Homework or assignments for patient..."
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          placeholder="Topics or focus areas for next session..."
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Patient Visibility */}
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
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            editMode ? "Update Report" : "Create Report"
          )}
        </button>
      </div>
    </form>
  );
}