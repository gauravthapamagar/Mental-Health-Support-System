"use client";

import { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api"; // Ensure this contains getAvailableSlots & createAppointment
import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight,
  AlertCircle,
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

  // States
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    appointment_date: "",
    start_time: "",
    reason_for_visit: "",
    appointment_type: "consultation",
    session_mode: "online",
    duration_minutes: 60,
    patient_notes: "",
  });

  // Fetch Available Slots from Backend
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError(null);
      try {
        const res = await bookingAPI.getAvailableSlots(therapistId);
        // The backend returns { therapist_id, therapist_name, slots: [...] }
        const availableSlots = res.slots.filter((s: Slot) => s.is_available);
        setSlots(availableSlots);
      } catch (err: any) {
        console.error("Failed to load slots", err);
        setError(
          "Could not load therapist availability. Please try again later.",
        );
      } finally {
        setLoadingSlots(false);
      }
    };

    if (therapistId) fetchSlots();
  }, [therapistId]);

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_time || !formData.appointment_date) {
      return alert("Please select a valid time slot");
    }

    setSubmitting(true);
    setError(null);

    try {
      await bookingAPI.createAppointment({
        ...formData,
        therapist: therapistId,
        // Optional: Replace with real patient data from your Auth context if needed
        contact_phone: "0000000000",
        contact_email: "patient@example.com",
      });

      setIsBooked(true);

      // Auto-trigger success callback after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error("Booking error:", err);
      // Try to extract specific validation error from Django (e.g., conflicting slot)
      const errorMsg =
        err.response?.data?.start_time?.[0] ||
        err.response?.data?.appointment_date?.[0] ||
        "Booking failed. This slot might have been taken.";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS VIEW (Once booking is confirmed)
  if (isBooked) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Request Sent!
          </h2>
          <p className="text-gray-600 mb-8">
            Your appointment request with <strong>{therapistName}</strong> has
            been submitted. You will be notified when they confirm.
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

  // FORM VIEW
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Book Appointment
            </h2>
            <p className="text-sm text-gray-500">with {therapistName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Slot Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              Available Slots
            </label>

            {loadingSlots ? (
              <div className="flex items-center gap-2 text-blue-600 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm font-medium">
                  Loading availability...
                </span>
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
                    slots.map((s, i) => (
                      <option key={i} value={`${s.date}|${s.start_time}`}>
                        {new Date(s.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at {s.start_time.substring(0, 5)}
                      </option>
                    ))
                  ) : (
                    <option disabled>
                      No slots available in the next 30 days
                    </option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                  <Clock size={18} />
                </div>
              </div>
            )}
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Visit
            </label>
            <textarea
              required
              placeholder="Briefly describe what you'd like to discuss (e.g., Anxiety, Stress, Relationship issues)..."
              className="w-full p-3 border border-gray-300 rounded-xl h-28 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
              value={formData.reason_for_visit}
              onChange={(e) =>
                setFormData({ ...formData, reason_for_visit: e.target.value })
              }
            />
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start border border-blue-100">
            <Clock className="text-blue-600 mt-0.5 shrink-0" size={18} />
            <p className="text-xs text-blue-800 leading-relaxed">
              Standard sessions are <strong>60 minutes</strong>. Your booking
              will be marked as "Pending" until the therapist accepts the
              request.
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Submit Button */}
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
