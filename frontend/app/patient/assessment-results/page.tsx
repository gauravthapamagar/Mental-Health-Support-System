'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { surveyAPI, SurveyResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  AlertCircle,
  Download,
  Share2,
  Loader2,
} from 'lucide-react';

export default function AssessmentResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    // Redirect if user is not a patient
    if (user.role !== 'patient') {
      router.push('/');
      return;
    }

    const loadResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get latest response
        const latestResponse = await surveyAPI.getLatestResponse();
        setResponse(latestResponse);
      } catch (err) {
        console.error('[v0] Error loading results:', err);
        setError('Failed to load assessment results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user, router]);

  const handleDownloadPDF = () => {
    // This will be implemented later for PDF export
    alert('PDF download will be available soon');
  };

  const handleShareResults = () => {
    // This will be implemented later for sharing with therapists
    alert('Sharing results with therapists will be available soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm mt-1">
                  {error || 'Unable to load assessment results'}
                </p>
                <button
                  onClick={() => router.back()}
                  className="mt-4 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Assessment Complete
              </h1>
              <p className="text-slate-600 mt-1">
                Your responses have been recorded and analyzed
              </p>
            </div>
          </div>
        </div>

        {/* Main Results Card */}
        <Card className="p-8 mb-8 border-2 border-green-200 bg-green-50">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Assessment Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Assessment Type</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {response.survey_title}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-slate-700">
                      {response.completed_at
                        ? formatDate(response.completed_at)
                        : formatDate(response.created)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Questions Answered</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {response.answers.length} questions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  {response.total_score !== null && (
                    <div className="text-center">
                      <p className="text-4xl font-bold text-white">
                        {response.total_score}
                      </p>
                      <p className="text-blue-100 text-sm">Score</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Responses Summary */}
        <Card className="p-8 mb-8 border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Your Responses
          </h3>

          <div className="space-y-6">
            {response.answers.map((answer, idx) => (
              <div key={idx} className="border-b border-slate-200 pb-6 last:border-b-0">
                <p className="font-semibold text-slate-900 mb-3">
                  {idx + 1}. {answer.question_text}
                </p>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  {answer.question_type === 'multiple_choice' && (
                    <p className="text-slate-700">{answer.option_text}</p>
                  )}
                  {answer.question_type === 'rating' && (
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg font-semibold">
                        {answer.answer_rating}
                      </div>
                      <span className="text-slate-600">out of {answer.question_type === 'rating' ? '3 or 5' : ''}</span>
                    </div>
                  )}
                  {answer.question_type === 'yes_no' && (
                    <p className="text-slate-700 font-semibold">
                      {answer.answer_yes_no ? 'Yes' : 'No'}
                    </p>
                  )}
                  {answer.question_type === 'text' && (
                    <p className="text-slate-700">{answer.answer_text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-8 border border-slate-200 mb-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            What Happens Next?
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Analysis</p>
                <p className="text-slate-600 text-sm mt-1">
                  Our AI analyzes your responses to understand your mental health
                  needs and preferences.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Matching</p>
                <p className="text-slate-600 text-sm mt-1">
                  We match you with therapists who specialize in your areas of
                  concern.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Connection</p>
                <p className="text-slate-600 text-sm mt-1">
                  Browse your matched therapists and book your first appointment
                  with confidence.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex items-center justify-center gap-2 flex-1 py-3 bg-transparent"
          >
            <Download className="w-4 h-4" />
            Download Assessment
          </Button>

          <Button
            onClick={handleShareResults}
            className="flex items-center justify-center gap-2 flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
          >
            <Share2 className="w-4 h-4" />
            Share with Therapists
          </Button>

          <Button
            onClick={() => router.push('/patient/appointments')}
            className="flex items-center justify-center gap-2 flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg"
          >
            Find Therapist
          </Button>
        </div>
      </div>
    </div>
  );
}
