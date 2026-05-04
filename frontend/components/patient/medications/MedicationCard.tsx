"use client";

import { useState } from "react";
import {
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";

interface MedicationCardProps {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  prescribedBy: string;
  startDate: string;
  notes?: string;
  taken: boolean;
}

export default function MedicationCard({
  id,
  name,
  dosage,
  frequency,
  time,
  prescribedBy,
  startDate,
  notes,
  taken: initialTaken,
}: MedicationCardProps) {
  const [taken, setTaken] = useState(initialTaken);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Pill className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {dosage} • {frequency}
            </p>
            <p className="text-xs text-gray-500">
              Prescribed by {prescribedBy}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {taken ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Taken</span>
            </div>
          ) : (
            <button
              onClick={() => setTaken(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Mark as Taken
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                  <Edit size={16} />
                  Edit Medication
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600">
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} />
          <span className="font-medium">Times: {time.join(", ")}</span>
        </div>
        <div className="text-sm text-gray-600">Started: {startDate}</div>
      </div>

      {notes && (
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle
              className="text-yellow-700 mt-0.5 flex-shrink-0"
              size={16}
            />
            <div className="text-sm text-yellow-800">{notes}</div>
          </div>
        </div>
      )}
    </div>
  );
}
