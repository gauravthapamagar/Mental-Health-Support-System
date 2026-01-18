"use client";
import { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import { X, Calendar, Clock, CheckCircle } from "lucide-react";

export default function BookAppointmentModal({ therapistId, therapistName, onClose, onSuccess }: any) {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    appointment_date: "",
    start_time: "",
    reason_for_visit: "",
    appointment_type: "consultation",
    session_mode: "online",
    duration_minutes: 60
  });

  useEffect(() => {
    bookingAPI.getAvailableSlots(therapistId).then(res => {
      setSlots(res.slots.filter((s: any) => s.is_available));
      setLoadingSlots(false);
    });
  }, [therapistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookingAPI.createAppointment({ ...formData, therapist: therapistId });
      onSuccess();
    } catch (err) {
      alert("Slot no longer available. Please choose another.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Book Session: {therapistName}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Slot Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Available Time Slots</label>
            {loadingSlots ? (
              <div className="h-10 animate-pulse bg-gray-100 rounded-lg"></div>
            ) : (
              <select 
                required
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                onChange={(e) => {
                  const [date, time] = e.target.value.split("|");
                  setFormData({...formData, appointment_date: date, start_time: time});
                }}
              >
                <option value="">Select a date & time</option>
                {slots.map((s: any, i) => (
                  <option key={i} value={`${s.date}|${s.start_time}`}>
                    {new Date(s.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} @ {s.start_time}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Session</label>
            <textarea 
              required
              placeholder="Briefly describe what you'd like to discuss..."
              className="w-full p-3 border rounded-xl h-24 focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, reason_for_visit: e.target.value})}
            />
          </div>

          <button 
            disabled={submitting || !formData.start_time}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin"/> : <CheckCircle size={20}/>}
            Confirm Booking Request
          </button>
        </form>
      </div>
    </div>
  );
}