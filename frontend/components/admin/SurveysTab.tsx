"use client";
import React, { useState, useEffect } from "react";
import { ClipboardList, ExternalLink, Search, Filter } from "lucide-react";
import { adminApiCall } from "@/lib/adminapi";

const SurveysTab = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      const res = await adminApiCall("/surveys/responses/"); // Adjust based on your Django URLs
      if (res?.ok) {
        setSurveys(res.data);
      }
      setLoading(false);
    };
    fetchSurveys();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Survey Responses</h2>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {surveys.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ClipboardList className="mx-auto mb-4 text-gray-300" size={48} />
            <p>No survey responses found yet.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Survey Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Match Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {surveys.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {s.patient_name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                      {s.match_count || 0} Therapists Found
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline flex items-center text-sm">
                      View Details <ExternalLink size={14} className="ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SurveysTab;
