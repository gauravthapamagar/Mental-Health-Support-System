"use client";
import { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function BookAppointmentModal({
  therapistId,
  therapistName,
  onClose,
  onSuccess,
}: any) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    appointment_date: "",
    start_time: "",
    reason_for_visit: "",
    appointment_type: "consultation",
    session_mode: "online",
    duration_minutes: 60,
  });

  useEffect(() => {
    async function loadSlots() {
      if (!therapistId) return;
      try {
        setLoadingSlots(true);
        setError(null);
        // Ensure ID is a number
        const id =
          typeof therapistId === "string" ? parseInt(therapistId) : therapistId;
        const res = await bookingAPI.getAvailableSlots(id);

        // Handle the nested { slots: [] } structure from your API
        const availableSlots = res.slots
          ? res.slots.filter((s: any) => s.is_available)
          : [];
        setSlots(availableSlots);
      } catch (err: any) {
        console.error("Failed to fetch slots:", err);
        setError("Unable to load available slots. Please try again later.");
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [therapistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appointment_date || !formData.start_time) {
      alert("Please select a time slot.");
      return;
    }

    setSubmitting(true);
    try {
      await bookingAPI.createAppointment({
        ...formData,
        therapist: parseInt(therapistId),
      });
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "This slot is no longer available.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Book a Session</h2>
            <p className="text-sm text-blue-600 font-medium">{therapistName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                Select Available Time
              </label>

              {loadingSlots ? (
                <div className="flex items-center justify-center h-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Loader2
                    className="animate-spin text-blue-600 mr-2"
                    size={20}
                  />
                  <span className="text-slate-500 text-sm font-medium">
                    Checking availability...
                  </span>
                </div>
              ) : slots.length > 0 ? (
                <select
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium"
                  onChange={(e) => {
                    const [date, time] = e.target.value.split("|");
                    setFormData({
                      ...formData,
                      appointment_date: date,
                      start_time: time,
                    });
                  }}
                >
                  <option value="">Choose a slot...</option>
                  {slots.map((s: any, i) => (
                    <option key={i} value={`${s.date}|${s.start_time}`}>
                      {new Date(s.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at {s.start_time}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                  <p className="text-sm text-amber-700 font-medium">
                    No slots found. Please contact the therapist or try again
                    later.
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Reason for Visit
            </label>
            <textarea
              required
              placeholder="Tell us briefly why you're seeking therapy..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-32 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
              onChange={(e) =>
                setFormData({ ...formData, reason_for_visit: e.target.value })
              }
            />
          </div>

          <button
            disabled={submitting || !formData.start_time || loadingSlots}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-200"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            {submitting ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}
