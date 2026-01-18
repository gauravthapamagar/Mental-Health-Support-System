"use client";
import { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import { X, Calendar, Clock, CheckCircle, Loader2 } from "lucide-react";

export default function BookAppointmentModal({ therapistId, therapistName, onClose, onSuccess }: any) {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    appointment_date: "",
    start_time: "",
    reason_for_visit: "",
    appointment_type: "consultation", // Required by your serializer
    session_mode: "online",          // Required by your serializer
    duration_minutes: 60,            // Required by your serializer
    patient_notes: ""
  });

  // Fetch real-time availability from Django
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await bookingAPI.getAvailableSlots(therapistId);
        // Filter to only show available ones
        setSlots(res.slots.filter((s: any) => s.is_available));
      } catch (err) {
        console.error("Failed to load slots", err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [therapistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_time) return alert("Please select a time slot");
    
    setSubmitting(true);
    try {
      await bookingAPI.createAppointment({ 
        ...formData, 
        therapist: therapistId,
        // Ensure phone/email are handled if your serializer requires them
        contact_phone: "0000000000", 
        contact_email: "patient@example.com" 
      });
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.start_time?.[0] || "Booking failed.";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Book Appointment</h2>
            <p className="text-sm text-gray-500">with {therapistName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Available Slots (Next 30 Days)</label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="animate-spin" size={18}/> 
                <span className="text-sm">Fetching therapist schedule...</span>
              </div>
            ) : (
              <select 
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none"
                onChange={(e) => {
                  const [date, time] = e.target.value.split("|");
                  setFormData({...formData, appointment_date: date, start_time: time});
                }}
              >
                <option value="">Select a date & time</option>
                {slots.map((s: any, i) => (
                  <option key={i} value={`${s.date}|${s.start_time}`}>
                    {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {s.start_time}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Visit Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit</label>
            <textarea 
              required
              placeholder="e.g., General anxiety, follow-up session..."
              className="w-full p-3 border border-gray-300 rounded-xl h-28 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              onChange={(e) => setFormData({...formData, reason_for_visit: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={submitting || !formData.start_time}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            {submitting ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle size={20}/>}
            {submitting ? "Processing..." : "Confirm Booking Request"}
          </button>
          
          <p className="text-center text-xs text-gray-500">
            Requests are sent to the therapist for approval.
          </p>
        </form>
      </div>
    </div>
  );
}