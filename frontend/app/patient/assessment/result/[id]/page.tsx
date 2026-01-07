"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Download,
  Calendar,
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

export default function AssessmentResults() {
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get survey ID from URL (you'll need to implement this based on your routing)
  const surveyId = 1; // Replace with actual survey ID from route params

  useEffect(() => {
    fetchSurveyResults();
  }, []);

  const fetchSurveyResults = async () => {
    try {
      const response = await fetch(`${API_BASE}/survey/detail/${surveyId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load results");
      const data = await response.json();
      setSurveyData(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelConfig = (level) => {
    const configs = {
      low: {
        color: "green",
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: <CheckCircle2 className="w-6 h-6" />,
        title: "Low Risk",
        description: "You're managing well with good coping mechanisms",
      },
      medium: {
        color: "yellow",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        icon: <AlertTriangle className="w-6 h-6" />,
        title: "Medium Risk",
        description: "You may benefit from professional support",
      },
      high: {
        color: "red",
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: <AlertCircle className="w-6 h-6" />,
        title: "High Risk",
        description: "We recommend seeking professional help soon",
      },
    };
    return configs[level] || configs.low;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !surveyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">
            Error Loading Results
          </h2>
          <p className="text-slate-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const riskConfig = getRiskLevelConfig(surveyData.risk_level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Assessment Complete!
          </h1>
          <p className="text-slate-600">
            Thank you for completing your mental health assessment
          </p>
        </div>

        {/* Risk Level Card */}
        <div
          className={`${riskConfig.bg} border-2 ${riskConfig.border} rounded-2xl p-8 mb-6`}
        >
          <div className="flex items-start gap-4">
            <div className={`${riskConfig.text} flex-shrink-0`}>
              {riskConfig.icon}
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${riskConfig.text} mb-2`}>
                {riskConfig.title}
              </h2>
              <p className={`${riskConfig.text} text-lg mb-4`}>
                {riskConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">🤖</span>
            </div>
            AI Analysis Summary
          </h3>
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <p className="text-slate-700 leading-relaxed">
              {surveyData.analysis_summary}
            </p>
          </div>
        </div>

        {/* Your Responses */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Your Responses
          </h3>
          <div className="space-y-6">
            {surveyData.responses.map((response, index) => (
              <div
                key={response.id}
                className="pb-6 border-b border-slate-200 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      {response.dynamic_question_text || response.question_text}
                    </h4>
                    <p className="text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
                      {response.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 mb-6">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-500 mb-1">Completed On</p>
              <p className="font-semibold text-slate-900">
                {new Date(surveyData.completed_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Questions</p>
              <p className="font-semibold text-slate-900">
                {surveyData.total_responses}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Assessment ID</p>
              <p className="font-semibold text-slate-900">#{surveyData.id}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => (window.location.href = "/therapist-matching")}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            <Calendar className="w-5 h-5" />
            Find a Therapist
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
        </div>

        {/* Help Section */}
        {surveyData.risk_level === "high" && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <h4 className="font-bold text-red-900 mb-2">
              Need Immediate Support?
            </h4>
            <p className="text-red-800 mb-4">
              If you're experiencing a mental health crisis, please reach out
              for immediate help.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-red-900">
                <strong>Crisis Hotline:</strong> 1-800-273-8255
              </p>
              <p className="text-red-900">
                <strong>Text Support:</strong> Text "HELLO" to 741741
              </p>
            </div>
          </div>
        )}

        {/* Return to Dashboard */}
        <div className="mt-6 text-center">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="text-blue-600 hover:underline font-semibold"
          >
            ← Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
