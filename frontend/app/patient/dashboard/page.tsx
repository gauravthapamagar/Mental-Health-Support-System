"use client";

import Header from "@/components/Header";
import StatsGrid from "@/components/patient/StatsGrid";
import UpcomingAppointments from "@/components/patient/Appointments";
import MedicationTracker from "@/components/patient/Medications";
import { useAuth } from "@/context/AuthContext";

export default function PatientDashboard() {
  const { user } = useAuth();

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Same max width as Header for perfect alignment */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:flex w-64 flex-col py-2">
            <nav className="space-y-1">
              {[
                "Dashboard",
                "Appointments",
                "Messages",
                "Lab Results",
                "Billing",
              ].map((item) => (
                <button
                  key={item}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                    item === "Dashboard"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                      : "text-slate-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 pb-12 space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Good morning, {firstName}
                </h1>
                <p className="text-slate-500 mt-1">
                  Here is what is happening with your health today.
                </p>
              </div>
            </div>

            {/* Stats */}
            <StatsGrid />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                <UpcomingAppointments />

                <div className="h-40 bg-white border border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 font-medium">
                  Lab Results Table (Coming Soon)
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <MedicationTracker />

                <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                    <p className="text-sm text-blue-50/80 mb-5">
                      Talk to our 24/7 support team or schedule an emergency
                      call.
                    </p>
                    <button className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
