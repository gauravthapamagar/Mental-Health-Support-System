"use client";

import { Plus, TrendingUp, CheckCircle, Pill, Clock } from "lucide-react";
import MedicationCard from "@/components/patient/medications/MedicationCard";

export default function MedicationsPage() {
  const medications = [
    {
      id: "1",
      name: "Sertraline",
      dosage: "50mg",
      frequency: "Once daily",
      time: ["9:00 AM"],
      prescribedBy: "Dr. Sarah Johnson",
      startDate: "Dec 01, 2025",
      notes: "Take with food. May cause drowsiness initially.",
      taken: true,
    },
    {
      id: "2",
      name: "Hydroxyzine",
      dosage: "25mg",
      frequency: "As needed",
      time: ["As needed for anxiety"],
      prescribedBy: "Dr. Sarah Johnson",
      startDate: "Dec 15, 2025",
      notes: "Use only when experiencing acute anxiety symptoms.",
      taken: false,
    },
    {
      id: "3",
      name: "Melatonin",
      dosage: "3mg",
      frequency: "Nightly",
      time: ["10:00 PM"],
      prescribedBy: "Dr. Sarah Johnson",
      startDate: "Jan 05, 2026",
      taken: false,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Medications</h1>
          <p className="text-gray-600">Track your prescribed medications</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
          <Plus size={20} />
          Add Medication
        </button>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="text-blue-600" size={20} />
            </div>
            <div className="text-gray-600 font-medium">Today's Doses</div>
          </div>
          <div className="text-3xl font-bold mb-1">2</div>
          <div className="text-sm text-green-600 font-medium">1 of 2 taken</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div className="text-gray-600 font-medium">Adherence Rate</div>
          </div>
          <div className="text-3xl font-bold mb-1">92%</div>
          <div className="text-sm text-gray-600">Last 30 days</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-purple-600" size={20} />
            </div>
            <div className="text-gray-600 font-medium">Active Medications</div>
          </div>
          <div className="text-3xl font-bold mb-1">{medications.length}</div>
          <div className="text-sm text-gray-600">Currently prescribed</div>
        </div>
      </div>

      {/* Medications List */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold">Your Medications</h2>
        {medications.map((med) => (
          <MedicationCard key={med.id} {...med} />
        ))}
      </div>

      {/* Reminder Settings */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Medication Reminders</h3>
            <p className="text-sm text-gray-700 mb-4">
              Get notifications when it's time to take your medication. Never
              miss a dose.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Set Up Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
