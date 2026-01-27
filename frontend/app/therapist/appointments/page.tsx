// "use client";
// import React, { useEffect, useState } from "react";
// import { bookingAPI } from "@/lib/api";
// import Header from "@/components/Header"; // Import your header
// import {
//   CheckCircle,
//   XCircle,
//   Video,
//   Clock,
//   Calendar,
//   MoreVertical,
//   Plus,
// } from "lucide-react";

// const TherapistAppointments = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("upcoming");

//   // 1. Add activeTab to the dependency array so it re-fetches when you click tabs
//   useEffect(() => {
//     fetchAppointments();
//   }, [activeTab]);

//   const fetchAppointments = async () => {
//     setLoading(true); // Start loading
//     try {
//       // 2. Pass the activeTab as a filter to your backend
//       const data = await bookingAPI.getTherapistAppointments(activeTab);

//       // 3. Access .results because the backend is paginated
//       setAppointments(data.results || []);
//     } catch (error) {
//       console.error("Error fetching appointments", error);
//     } finally {
//       setLoading(false); // 4. CRITICAL: Turn off loading state
//     }
//   };

//   const handleConfirm = async (id: number) => {
//     const meeting_link = `https://meet.carepair.com/${Math.random().toString(36).substring(7)}`;
//     try {
//       await bookingAPI.confirmAppointment(id, {
//         meeting_link,
//         therapist_notes: "Looking forward to our session.",
//       });
//       fetchAppointments();
//     } catch (error) {
//       console.error("Confirmation failed", error);
//     }
//   };

//   return (
//     <>
//       <Header />
//       {/* pt-20 pushes content down from the fixed header */}
//       <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//         <div className="max-w-7xl mx-auto px-6 py-12">
//           {/* Header Section */}
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h1 className="text-3xl font-bold text-slate-900 mb-2">
//                 Session Management
//               </h1>
//               <p className="text-slate-600">
//                 Review and manage your upcoming patient sessions
//               </p>
//             </div>
//             <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
//               <Plus className="w-5 h-5" />
//               Set Availability
//             </button>
//           </div>

//           {/* Filter Tabs - Matches Blog Dashboard Style */}
//           <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
//             {["upcoming", "pending", "history"].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-8 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all ${
//                   activeTab === tab
//                     ? "bg-blue-600 text-white shadow-md shadow-blue-200"
//                     : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300"
//                 }`}
//               >
//                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
//               </button>
//             ))}
//           </div>

//           {/* Content Area */}
//           {loading ? (
//             <div className="text-center py-20">
//               <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
//               <p className="mt-4 text-slate-600">Loading your schedule...</p>
//             </div>
//           ) : appointments.length === 0 ? (
//             <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
//               <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
//               <h3 className="text-xl font-bold text-slate-900 mb-2">
//                 No appointments found
//               </h3>
//               <p className="text-slate-600">
//                 Your schedule for this section is currently empty.
//               </p>
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {appointments.map((apt: any) => (
//                 <div
//                   key={apt.id}
//                   className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all flex items-center justify-between"
//                 >
//                   <div className="flex items-center space-x-6">
//                     {/* Patient Avatar Initials */}
//                     <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-100">
//                       {apt.patient?.full_name?.charAt(0) || "P"}
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-3 mb-1">
//                         <h3 className="font-bold text-slate-900 text-xl">
//                           {apt.patient?.full_name || "Anonymous Patient"}
//                         </h3>
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
//                             apt.status === "confirmed"
//                               ? "bg-green-100 text-green-700"
//                               : "bg-amber-100 text-amber-700"
//                           }`}
//                         >
//                           {apt.status_label || apt.status}
//                         </span>
//                       </div>

//                       <div className="flex items-center space-x-6 text-sm font-medium text-slate-500">
//                         <span className="flex items-center gap-2">
//                           <Calendar size={16} className="text-blue-600" />
//                           {apt.appointment_date}
//                         </span>
//                         <span className="flex items-center gap-2">
//                           <Clock size={16} className="text-blue-600" />
//                           {apt.start_time}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-3">
//                     {apt.status === "pending" && (
//                       <>
//                         <button
//                           onClick={() => handleConfirm(apt.id)}
//                           className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100"
//                         >
//                           <CheckCircle size={18} className="mr-2" /> Confirm
//                         </button>
//                         <button className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200">
//                           <XCircle size={22} />
//                         </button>
//                       </>
//                     )}

//                     {apt.status === "confirmed" && (
//                       <button className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition shadow-lg shadow-green-100">
//                         <Video size={18} className="mr-2" /> Start Session
//                       </button>
//                     )}

//                     <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition border border-slate-200">
//                       <MoreVertical size={22} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </main>
//     </>
//   );
// };

// export default TherapistAppointments;
"use client";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { bookingAPI } from "@/lib/api";
import Header from "@/components/Header"; // Import your header
import {
  CheckCircle,
  XCircle,
  Video,
  Clock,
  Calendar,
  MoreVertical,
  Plus,
} from "lucide-react";

const TherapistAppointments = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  // 1. Add activeTab to the dependency array so it re-fetches when you click tabs
  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const filterAppointments = (data: any[]) => {
    const now = new Date();
    
    return data.filter((apt: any) => {
      // Exclude cancelled appointments from all sections
      if (apt.status === "cancelled") {
        return false;
      }

      if (activeTab === "pending") {
        // Show only pending appointments
        return apt.status === "pending";
      } else if (activeTab === "upcoming") {
        // Show only confirmed appointments that are in the future
        const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
        return apt.status === "confirmed" && appointmentDateTime > now;
      } else if (activeTab === "history") {
        // Show only confirmed appointments that are in the past
        const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
        return apt.status === "confirmed" && appointmentDateTime <= now;
      }
      
      return false;
    });
  };

  const fetchAppointments = async () => {
    setLoading(true); // Start loading
    try {
      // Pass the activeTab as a filter to your backend
      const data = await bookingAPI.getTherapistAppointments(activeTab);

      // Access .results because the backend is paginated
      const allAppointments = data.results || [];
      
      // Apply client-side filtering for precise control
      const filteredAppointments = filterAppointments(allAppointments);
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error("Error fetching appointments", error);
    } finally {
      setLoading(false); // Turn off loading state
    }
  };

  const handleConfirm = async (id: number) => {
    const meeting_link = `https://meet.carepair.com/${Math.random().toString(36).substring(7)}`;
    try {
      await bookingAPI.confirmAppointment(id, {
        meeting_link,
        therapist_notes: "Looking forward to our session.",
      });
      fetchAppointments();
    } catch (error) {
      console.error("Confirmation failed", error);
    }
  };

  const canCancelAppointment = (appointmentDate: string, startTime: string): boolean => {
    try {
      // Combine date and time into a single datetime string
      const appointmentDateTime = new Date(`${appointmentDate}T${startTime}`);
      const currentTime = new Date();
      
      // Calculate the time difference in milliseconds
      const timeDifference = appointmentDateTime.getTime() - currentTime.getTime();
      
      // Convert to hours (24 hours = 86400000 milliseconds)
      const hoursRemaining = timeDifference / (1000 * 60 * 60);
      
      console.log("[v0] Hours remaining until appointment:", hoursRemaining);
      
      // Return true if more than 24 hours remaining
      return hoursRemaining > 24;
    } catch (error) {
      console.error("[v0] Error calculating time difference:", error);
      return false;
    }
  };

  const openCancelModal = (id: number) => {
    setSelectedAppointmentId(id);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    // Get the selected appointment to check 24-hour requirement
    const selectedAppointment = appointments.find((apt: any) => apt.id === selectedAppointmentId);
    
    if (!selectedAppointment) {
      alert("Appointment not found.");
      return;
    }

    // Check if cancellation is allowed (more than 24 hours away)
    if (!canCancelAppointment(selectedAppointment.appointment_date, selectedAppointment.start_time)) {
      alert("You can only cancel appointments that are more than 24 hours away.");
      return;
    }

    // Validate cancellation reason
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason.");
      return;
    }

    if (cancelReason.trim().length < 10) {
      alert("Cancellation reason must be at least 10 characters.");
      return;
    }

    setCancelLoading(true);
    try {
      console.log("[v0] Sending therapist cancel request with reason:", cancelReason);
      await bookingAPI.cancelAppointment(selectedAppointmentId!, cancelReason);
      console.log("[v0] Cancel successful");
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedAppointmentId(null);
      fetchAppointments();
    } catch (err: any) {
      console.log("[v0] Cancel error response:", err.response?.data);
      console.log("[v0] Cancel error status:", err.response?.status);

      let errorMsg = "Failed to cancel appointment. Please try again.";
      const responseData = err.response?.data;

      // Check for validation errors from Django serializer
      if (responseData?.cancellation_reason) {
        errorMsg = Array.isArray(responseData.cancellation_reason)
          ? responseData.cancellation_reason[0]
          : responseData.cancellation_reason;
      } else if (responseData?.error) {
        errorMsg = responseData.error;
      } else if (responseData?.detail) {
        errorMsg = responseData.detail;
      }

      alert(errorMsg);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      <Header />
      {/* pt-20 pushes content down from the fixed header */}
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Session Management
              </h1>
              <p className="text-slate-600">
                Review and manage your upcoming patient sessions
              </p>
            </div>
            <button
          onClick={() => router.push("/therapist/profile")}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
        >
        <Plus className="w-5 h-5" />
        Set Availability
      </button>
          </div>

          {/* Filter Tabs - Matches Blog Dashboard Style */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {["upcoming", "pending", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading your schedule...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No appointments found
              </h3>
              <p className="text-slate-600">
                Your schedule for this section is currently empty.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((apt: any) => (
                <div
                  key={apt.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-6">
                    {/* Patient Avatar Initials */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-100">
                      {apt.patient?.full_name?.charAt(0) || "P"}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-xl">
                          {apt.patient?.full_name || "Anonymous Patient"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            apt.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {apt.status_label || apt.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-600" />
                          {apt.appointment_date}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock size={16} className="text-blue-600" />
                          {apt.start_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {apt.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleConfirm(apt.id)}
                          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                        >
                          <CheckCircle size={18} className="mr-2" /> Confirm
                        </button>
                        <button 
                          onClick={() => openCancelModal(apt.id)}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200"
                        >
                          <XCircle size={22} />
                        </button>
                      </>
                    )}

                    {apt.status === "confirmed" && (
                      <>
                        <button className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition shadow-lg shadow-green-100">
                          <Video size={18} className="mr-2" /> Start Session
                        </button>
                        <div className="relative group">
                          <button 
                            onClick={() => {
                              if (canCancelAppointment(apt.appointment_date, apt.start_time)) {
                                openCancelModal(apt.id);
                              }
                            }}
                            disabled={!canCancelAppointment(apt.appointment_date, apt.start_time)}
                            className={`p-3 rounded-xl transition border ${
                              canCancelAppointment(apt.appointment_date, apt.start_time)
                                ? "text-slate-400 hover:text-red-600 hover:bg-red-50 border-slate-200 cursor-pointer"
                                : "text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50"
                            }`}
                            title={canCancelAppointment(apt.appointment_date, apt.start_time) ? "Cancel appointment" : "Cannot cancel within 24 hours of appointment"}
                          >
                            <XCircle size={22} />
                          </button>
                          {!canCancelAppointment(apt.appointment_date, apt.start_time) && (
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Cancel not allowed<br />within 24 hours
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition border border-slate-200">
                      <MoreVertical size={22} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cancel Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-red-600 mb-2">
                  Cancel Appointment?
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  This action cannot be undone. Please provide a reason for cancellation.
                </p>
                <div className="mb-4">
                  <textarea
                    placeholder="Why are you cancelling? (minimum 10 characters)"
                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <p
                    className={`text-xs font-medium ${
                      cancelReason.trim().length < 10 && cancelReason.length > 0
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {cancelReason.trim().length}/10 characters minimum
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason("");
                      setSelectedAppointmentId(null);
                    }}
                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelLoading || cancelReason.trim().length < 10}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 font-medium"
                  >
                    {cancelLoading ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      "Cancel Session"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default TherapistAppointments;
