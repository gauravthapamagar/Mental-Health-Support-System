"use client";

import { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight,
  AlertCircle,
  FileText,
  Upload,
  Monitor,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BookAppointmentModalProps {
  therapistId: number;
  therapistName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Slot {
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function BookAppointmentModal({
  therapistId,
  therapistName,
  onClose,
  onSuccess,
}: BookAppointmentModalProps) {
  const router = useRouter();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    appointment_date: "",
    start_time: "",
    reason_for_visit: "",
    appointment_type: "initial",
    session_mode: "online",
    duration_minutes: 60,
    patient_notes: "",
  });

  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError(null);
      try {
        const res = await bookingAPI.getAvailableSlots(therapistId);
        const availableSlots = res.slots.filter((s: Slot) => s.is_available);
        setSlots(availableSlots);
      } catch (err: any) {
        console.error("Failed to load slots", err);
        setError("Could not load therapist availability. Please try again later.");
      } finally {
        setLoadingSlots(false);
      }
    };

    if (therapistId) fetchSlots();
  }, [therapistId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }
      const allowedTypes = ["application/pdf", "application/json", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only PDF, JSON, and TXT files are allowed");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_time || !formData.appointment_date) {
      return alert("Please select a valid time slot");
    }

    setSubmitting(true);
    setError(null);

    try {
      const formPayload = new FormData();
      formPayload.append("therapist", therapistId.toString());
      formPayload.append("appointment_date", formData.appointment_date);
      formPayload.append("start_time", formData.start_time);
      formPayload.append("reason_for_visit", formData.reason_for_visit);
      formPayload.append("appointment_type", formData.appointment_type);
      formPayload.append("session_mode", formData.session_mode);
      formPayload.append("duration_minutes", formData.duration_minutes.toString());
      formPayload.append("patient_notes", formData.patient_notes || "");

      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      formPayload.append("contact_phone", user.phone_number || "0000000000");
      formPayload.append("contact_email", user.email || "patient@example.com");

      if (selectedFile) {
        formPayload.append("assessment_file", selectedFile);
      }

      await bookingAPI.createAppointment(formPayload);

      setIsBooked(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error("Booking error:", err);
      let errorMsg = "Booking failed. ";
      const errorData = err.response?.data;

      if (errorData) {
        if (errorData.assessment_file) errorMsg += errorData.assessment_file[0] || "File upload failed";
        else if (errorData.start_time) errorMsg += errorData.start_time[0];
        else if (errorData.appointment_date) errorMsg += errorData.appointment_date[0];
        else if (errorData.non_field_errors) errorMsg += errorData.non_field_errors[0];
        else errorMsg += "Please try again.";
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isBooked) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
          <p className="text-gray-600 mb-4">
            Your appointment request with <strong>{therapistName}</strong> has been submitted.
          </p>
          {selectedFile && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2 text-blue-800 text-sm justify-center">
                <FileText size={16} />
                <span className="font-medium">Assessment file attached</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {selectedFile.name}
              </p>
            </div>
          )}
          <p className="text-gray-500 text-sm mb-8">
            You will be notified when the therapist confirms.
          </p>
          <button
            onClick={() => router.push("/patient/appointments")}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
          >
            Go to My Appointments <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-4 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header - slightly tighter */}
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Book Appointment</h2>
            <p className="text-sm text-blue-600 font-medium">with {therapistName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Slot Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              Available Time Slots
            </label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-blue-600 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm font-medium">Loading availability...</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none appearance-none pr-10"
                  onChange={(e) => {
                    const [date, time] = e.target.value.split("|");
                    setFormData({
                      ...formData,
                      appointment_date: date,
                      start_time: time,
                    });
                  }}
                >
                  <option value="">Select a date & time</option>
                  {slots.length > 0 ? (
                    slots.map((s, i) => {
                      const dateStr = s.date || "";
                      let formattedDate = dateStr;
                      try {
                        if (dateStr) {
                          formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          });
                        }
                      } catch {}
                      const formattedTime = s.start_time?.substring(0, 5) || "";
                      return (
                        <option key={i} value={`${dateStr}|${s.start_time}`}>
                          {formattedDate} at {formattedTime}
                        </option>
                      );
                    })
                  ) : (
                    <option disabled>No slots available in the next 30 days</option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                  <Clock size={18} />
                </div>
              </div>
            )}
          </div>

          {/* Session Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Session Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, session_mode: "online" })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.session_mode === "online"
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Monitor size={24} className={formData.session_mode === "online" ? "text-blue-600" : "text-gray-400"} />
                </div>
                <div className="font-semibold text-gray-800">Online</div>
                <div className="text-xs text-gray-500 mt-1">Video call session</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, session_mode: "offline" })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.session_mode === "offline"
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Users size={24} className={formData.session_mode === "offline" ? "text-blue-600" : "text-gray-400"} />
                </div>
                <div className="font-semibold text-gray-800">In-Person</div>
                <div className="text-xs text-gray-500 mt-1">Face-to-face session</div>
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Reason for Visit
            </label>
            <textarea
              required
              placeholder="Briefly describe what you'd like to discuss (e.g., Anxiety, Stress, Relationship issues)..."
              className="w-full p-3 border border-gray-300 rounded-xl h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={formData.reason_for_visit}
              onChange={(e) => setFormData({ ...formData, reason_for_visit: e.target.value })}
            />
          </div>

          {/* File Upload - more compact */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:border-blue-400 transition-colors">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Upload size={16} className="text-gray-600" />
              Attach Assessment File <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <div className="flex items-center justify-center px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors bg-white">
                  <FileText size={18} className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 truncate">
                    {selectedFile ? selectedFile.name : "Choose PDF, JSON, or TXT file"}
                  </span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.json,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {selectedFile && (
                <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 truncate max-w-[280px]">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can download your assessment from the Assessment History page
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 p-3 rounded-xl flex gap-3 items-start border border-blue-100">
            <Clock className="text-blue-600 mt-0.5 shrink-0" size={18} />
            <p className="text-sm text-blue-800 leading-relaxed">
              Standard sessions are <strong>60 minutes</strong>. Your booking will be marked as "Pending" until the therapist accepts the request.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !formData.start_time || loadingSlots}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-100"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Confirm Booking Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}