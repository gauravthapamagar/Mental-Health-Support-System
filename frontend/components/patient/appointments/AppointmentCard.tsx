"use client";

import {
  Video,
  MapPin,
  Phone,
  RefreshCw,
  X,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AppointmentCardProps {
  id: string;
  therapist: string;
  title: string;
  date: string;
  time: string;
  format: "video" | "in-person" | "phone";
  matchScore: number;
  sentiment?: string;
  status?: "upcoming" | "completed" | "cancelled";
  notes?: string;
}

export default function AppointmentCard({
  id,
  therapist,
  title,
  date,
  time,
  format,
  matchScore,
  sentiment,
  status = "upcoming",
  notes,
}: AppointmentCardProps) {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const getFormatIcon = () => {
    switch (format) {
      case "video":
        return <Video size={18} className="text-blue-600" />;
      case "in-person":
        return <MapPin size={18} className="text-green-600" />;
      case "phone":
        return <Phone size={18} className="text-purple-600" />;
    }
  };

  const getFormatLabel = () => {
    switch (format) {
      case "video":
        return "Video Call";
      case "in-person":
        return "In-Person";
      case "phone":
        return "Phone Call";
    }
  };

  const getFormatColor = () => {
    switch (format) {
      case "video":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "in-person":
        return "bg-green-50 text-green-700 border-green-200";
      case "phone":
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Cancelled
          </span>
        );
      case "upcoming":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Upcoming
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Section - Therapist Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="font-bold text-white text-lg">
                {getInitials(therapist)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900">{therapist}</h3>
                {status === "upcoming" && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    {matchScore}% Match
                  </span>
                )}
                {getStatusBadge()}
              </div>

              <p className="text-sm text-gray-600 mb-2">{title}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  <span className="font-medium">{date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} />
                  <span className="font-medium">{time}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${getFormatColor()}`}
                >
                  {getFormatIcon()}
                  <span className="font-medium text-xs">
                    {getFormatLabel()}
                  </span>
                </div>
              </div>

              {sentiment && status === "upcoming" && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-600">
                    Last Session Sentiment:{" "}
                  </span>
                  <span className="font-medium text-gray-900">{sentiment}</span>
                </div>
              )}

              {notes && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Note: </span>
                    {notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3 lg:flex-col lg:items-end">
            {status === "upcoming" && (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Reschedule"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>
                </div>

                <Link
                  href={`/patient/appointments/${id}`}
                  className="w-full lg:w-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center font-medium"
                >
                  Session Details
                </Link>

                {format === "video" && (
                  <button className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <Video size={18} />
                    Join Video Call
                  </button>
                )}
              </>
            )}

            {status === "completed" && (
              <Link
                href={`/patient/appointments/${id}`}
                className="w-full lg:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
              >
                View Details
              </Link>
            )}

            {status === "cancelled" && (
              <button className="w-full lg:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Book New Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Reschedule Appointment</h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Choose a new date and time for your session with {therapist}.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Time
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Let your therapist know why you're rescheduling..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600">
                Cancel Appointment
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your appointment with {therapist}{" "}
              on {date} at {time}?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason (Optional)
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Help us understand why you're cancelling..."
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Note: </span>
                Please cancel at least 24 hours in advance to avoid cancellation
                fees.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Keep Appointment
              </button>
              <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
