"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import SessionReportForm from "./SessionReportForm";

interface SessionReportModalProps {
  isOpen: boolean;
  appointmentId: number;
  patientName: string;
  appointmentDate: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SessionReportModal({
  isOpen,
  appointmentId,
  patientName,
  appointmentDate,
  onClose,
  onSuccess,
}: SessionReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          >
            <X size={24} className="text-gray-500" />
          </button>

          {/* Form */}
          <div className="p-6">
            <SessionReportForm
              appointmentId={appointmentId}
              patientName={patientName}
              appointmentDate={appointmentDate}
              onSuccess={() => {
                onSuccess?.();
                onClose();
              }}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
