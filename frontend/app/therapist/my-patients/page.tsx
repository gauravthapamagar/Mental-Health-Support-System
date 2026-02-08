"use client";
import React, { useEffect, useState } from "react";
import { therapistAPI } from "@/lib/api";
import { Search, User, Calendar, CheckCircle, Clock, Mail, Phone, MoreVertical } from "lucide-react";

interface Patient {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  total_sessions: number;
  completed_sessions: number;
  upcoming_sessions: number;
  last_appointment: string | null;
  next_appointment: string | null;
}

const MyPatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await therapistAPI.getMyPatients();
      setPatients(data);
    } catch (error) {
      console.error("Failed to fetch patients", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    (patient.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (patient.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="pt-20 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Patients</h1>
            <p className="text-gray-600">
              Manage and view details of your {patients.length} patients
            </p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500">
              {searchQuery ? "Try adjusting your search terms" : "You haven't had any sessions with patients yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-100">
                      {patient.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                        {patient.full_name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                        <Mail size={14} />
                        <span className="truncate max-w-[180px]">{patient.email}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Sessions</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-bold text-gray-900">{patient.completed_sessions}/{patient.total_sessions}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 rounded-xl p-3">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Next</p>
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-blue-500" />
                       <span className="font-bold text-blue-900 text-sm truncate">
                         {patient.next_appointment ? new Date(patient.next_appointment).toLocaleDateString() : 'None'}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>Last seen: {patient.last_appointment ? new Date(patient.last_appointment).toLocaleDateString() : 'Never'}</span>
                    </div>
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                        View Profile
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyPatientsPage;
