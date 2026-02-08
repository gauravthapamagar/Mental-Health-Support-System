// "use client";

// import { useEffect, useState } from "react";
// import { bookingAPI, surveyAPI, type SurveyResponse } from "@/lib/api"; // Added SurveyResponse type
// import {
//   X,
//   Calendar,
//   Clock,
//   CheckCircle,
//   Loader2,
//   ArrowRight,
//   AlertCircle,
//   FileText,
//   Info,
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// interface BookAppointmentModalProps {
//   therapistId: number;
//   therapistName: string;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// interface Slot {
//   date: string;
//   start_time: string;
//   end_time: string;
//   is_available: boolean;
// }

// export default function BookAppointmentModal({
//   therapistId,
//   therapistName,
//   onClose,
//   onSuccess,
// }: BookAppointmentModalProps) {
//   const router = useRouter();

//   // States
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [loadingSlots, setLoadingSlots] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [isBooked, setIsBooked] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Survey-related states
//   const [latestSurvey, setLatestSurvey] = useState<SurveyResponse | null>(null);
//   const [loadingSurvey, setLoadingSurvey] = useState(true);

//   const [formData, setFormData] = useState({
//     appointment_date: "",
//     start_time: "",
//     reason_for_visit: "",
//     appointment_type: "initial",  // ✅ Changed from "consultation" to "initial"
//     session_mode: "online",
//     duration_minutes: 60,
//     patient_notes: "",
//   });

//   // Fetch Available Slots from Backend
//   useEffect(() => {
//     const fetchSlots = async () => {
//       setLoadingSlots(true);
//       setError(null);
//       try {
//         const res = await bookingAPI.getAvailableSlots(therapistId);
//         const availableSlots = res.slots.filter((s: Slot) => s.is_available);
//         setSlots(availableSlots);
//       } catch (err: any) {
//         console.error("Failed to load slots", err);
//         setError(
//           "Could not load therapist availability. Please try again later.",
//         );
//       } finally {
//         setLoadingSlots(false);
//       }
//     };

//     if (therapistId) fetchSlots();
//   }, [therapistId]);

//   // Fetch Latest Survey Response
//   useEffect(() => {
//     const fetchLatestSurvey = async () => {
//       setLoadingSurvey(true);
//       try {
//         const surveys = await surveyAPI.getAssessmentHistory();
//         console.log('📋 Survey history loaded:', surveys);
        
//         if (surveys && surveys.length > 0) {
//           // Sort by most recent and get the first one
//           const sorted = surveys.sort(
//             (a: SurveyResponse, b: SurveyResponse) =>
//               new Date(b.completed_at || b.created).getTime() -
//               new Date(a.completed_at || a.created).getTime()
//           );
//           console.log('✅ Latest survey selected:', sorted[0]);
//           setLatestSurvey(sorted[0]);
//         } else {
//           console.log('ℹ️ No surveys found');
//         }
//       } catch (err) {
//         console.error("❌ Failed to load survey history", err);
//         // Don't show error to user - survey attachment is optional
//       } finally {
//         setLoadingSurvey(false);
//       }
//     };

//     fetchLatestSurvey();
//   }, []);

//   // Handle Submit
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.start_time || !formData.appointment_date) {
//       return alert("Please select a valid time slot");
//     }

//     setSubmitting(true);
//     setError(null);

//     const appointmentData = {
//       ...formData,
//       therapist: therapistId,
//       // Auto-attach the latest survey if available
//       // TODO: Uncomment this once backend supports survey_response field
//       survey_response: latestSurvey?.id || null,
//       // contact_phone: "0000000000",
//       // contact_email: "patient@example.com",
//     };

//     console.log('📤 Sending appointment data:', appointmentData);
//     console.log('📋 Survey ready to attach (once backend updated):', latestSurvey?.id);

//     try {
//       await bookingAPI.createAppointment(appointmentData);

//       setIsBooked(true);

//       // Auto-trigger success callback after 3 seconds
//       setTimeout(() => {
//         onSuccess();
//       }, 3000);
//     } catch (err: any) {
//       console.error("❌ Booking error:", err);
//       console.error("❌ Error response:", err.response?.data);
      
//       // Extract all error messages from the response
//       const errorData = err.response?.data;
//       let errorMsg = "Booking failed. ";
      
//       if (errorData) {
//         // Check for specific field errors
//         if (errorData.survey_response) {
//           errorMsg = `Survey attachment error: ${errorData.survey_response[0] || errorData.survey_response}`;
//         } else if (errorData.start_time) {
//           errorMsg = `Time slot error: ${errorData.start_time[0] || errorData.start_time}`;
//         } else if (errorData.appointment_date) {
//           errorMsg = `Date error: ${errorData.appointment_date[0] || errorData.appointment_date}`;
//         } else if (errorData.detail) {
//           errorMsg = errorData.detail;
//         } else if (errorData.error) {
//           errorMsg = errorData.error;
//         } else {
//           errorMsg = JSON.stringify(errorData);
//         }
//       }
      
//       setError(errorMsg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // SUCCESS VIEW
//   if (isBooked) {
//     return (
//       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
//         <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in duration-300">
//           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
//             <CheckCircle size={48} />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">
//             Request Sent!
//           </h2>
//           <p className="text-gray-600 mb-4">
//             Your appointment request with <strong>{therapistName}</strong> has
//             been submitted.
//           </p>
//           {latestSurvey && (
//             <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
//               <div className="flex items-center gap-2 text-blue-800 text-sm">
//                 <FileText size={16} />
//                 <span className="font-medium">Assessment attached</span>
//               </div>
//               <p className="text-xs text-blue-600 mt-1">
//                 Your recent assessment has been shared with the therapist
//               </p>
//             </div>
//           )}
//           <p className="text-gray-500 text-sm mb-8">
//             You will be notified when they confirm.
//           </p>
//           <button
//             onClick={() => router.push("/patient/appointments")}
//             className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
//           >
//             Go to My Appointments <ArrowRight size={18} />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // FORM VIEW
//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
//       <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
//         {/* Header */}
//         <div className="p-6 border-b flex justify-between items-center bg-gray-50">
//           <div>
//             <h2 className="text-xl font-bold text-gray-800">
//               Book Appointment
//             </h2>
//             <p className="text-sm text-gray-500">with {therapistName}</p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-200 rounded-full transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-5">
//           {/* Survey Attachment Status */}
//           {loadingSurvey ? (
//             <div className="bg-gray-50 p-4 rounded-xl flex gap-3 items-center border border-gray-200">
//               <Loader2 className="animate-spin text-gray-400" size={18} />
//               <p className="text-sm text-gray-600">
//                 Loading your assessment data...
//               </p>
//             </div>
//           ) : latestSurvey ? (
//             <div className="bg-green-50 p-4 rounded-xl border border-green-200">
//               <div className="flex gap-3 items-start">
//                 <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
//                   <FileText className="text-green-600" size={20} />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between gap-2 mb-1">
//                     <h4 className="text-sm font-semibold text-green-900">
//                       Assessment Auto-Attached
//                     </h4>
//                     <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
//                   </div>
//                   <p className="text-xs text-green-700 mb-2">
//                     Your most recent assessment will be shared with the therapist
//                   </p>
//                   <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-green-600">
//                     <span className="flex items-center gap-1">
//                       <Calendar size={12} />
//                       {(() => {
//                         try {
//                           const dateToFormat = latestSurvey.completed_at || latestSurvey.created;
//                           return new Date(dateToFormat).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "numeric",
//                           });
//                         } catch (e) {
//                           return "Recently completed";
//                         }
//                       })()}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Info size={12} />
//                       Score: {latestSurvey.total_score || 0}/100
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
//               <div className="flex gap-3 items-start">
//                 <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
//                 <div>
//                   <h4 className="text-sm font-semibold text-amber-900 mb-1">
//                     No Assessment Found
//                   </h4>
//                   <p className="text-xs text-amber-700 mb-2">
//                     Taking an assessment helps therapists understand your needs better
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => router.push("/patient/therapist-matching-assessment")}
//                     className="text-xs font-medium text-amber-800 hover:text-amber-900 underline"
//                   >
//                     Take Assessment Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Slot Selection */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//               <Calendar size={16} className="text-gray-400" />
//               Available Slots
//             </label>

//             {loadingSlots ? (
//               <div className="flex items-center gap-2 text-blue-600 p-3 bg-blue-50 rounded-xl border border-blue-100">
//                 <Loader2 className="animate-spin" size={18} />
//                 <span className="text-sm font-medium">
//                   Loading availability...
//                 </span>
//               </div>
//             ) : (
//               <div className="relative">
//                 <select
//                   required
//                   className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none appearance-none pr-10"
//                   onChange={(e) => {
//                     const [date, time] = e.target.value.split("|");
//                     setFormData({
//                       ...formData,
//                       appointment_date: date,
//                       start_time: time,
//                     });
//                   }}
//                 >
//                   <option value="">Select a date & time</option>
//                   {slots.length > 0 ? (
//                     slots.map((s, i) => {
//                       // Safe date formatting with fallback
//                       const dateStr = s.date || '';
//                       const timeStr = s.start_time || '';
                      
//                       let formattedDate = dateStr;
//                       try {
//                         if (dateStr) {
//                           formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
//                             weekday: "short",
//                             month: "short",
//                             day: "numeric",
//                           });
//                         }
//                       } catch (e) {
//                         console.error('Date formatting error:', e);
//                         formattedDate = dateStr;
//                       }
                      
//                       const formattedTime = timeStr ? timeStr.substring(0, 5) : '';
                      
//                       return (
//                         <option key={i} value={`${dateStr}|${timeStr}`}>
//                           {formattedDate} at {formattedTime}
//                         </option>
//                       );
//                     })
//                   ) : (
//                     <option disabled>
//                       No slots available in the next 30 days
//                     </option>
//                   )}
//                 </select>
//                 <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
//                   <Clock size={18} />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Reason Input */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Reason for Visit
//             </label>
//             <textarea
//               required
//               placeholder="Briefly describe what you'd like to discuss (e.g., Anxiety, Stress, Relationship issues)..."
//               className="w-full p-3 border border-gray-300 rounded-xl h-28 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
//               value={formData.reason_for_visit}
//               onChange={(e) =>
//                 setFormData({ ...formData, reason_for_visit: e.target.value })
//               }
//             />
//           </div>

//           {/* Info Banner */}
//           <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start border border-blue-100">
//             <Clock className="text-blue-600 mt-0.5 shrink-0" size={18} />
//             <p className="text-xs text-blue-800 leading-relaxed">
//               Standard sessions are <strong>60 minutes</strong>. Your booking
//               will be marked as "Pending" until the therapist accepts the
//               request.
//             </p>
//           </div>

//           {/* Error Message Display */}
//           {error && (
//             <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
//               <AlertCircle size={16} />
//               {error}
//             </div>
//           )}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={submitting || !formData.start_time || loadingSlots}
//             className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-100"
//           >
//             {submitting ? (
//               <>
//                 <Loader2 className="animate-spin" size={20} />
//                 Processing...
//               </>
//             ) : (
//               <>
//                 <CheckCircle size={20} />
//                 Confirm Booking Request
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }