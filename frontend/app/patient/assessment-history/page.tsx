'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { surveyAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  Trash2,
  Eye,
  FileText,
  BarChart3,
  Clock,
  AlertCircle,
  Plus,
  Download,
  Activity
} from 'lucide-react';
import type { SurveyResponse } from '@/lib/api';

export default function AssessmentHistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Redirect if not authenticated or not patient
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'patient') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Load history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await surveyAPI.getAssessmentHistory();
        // Sort so most recent is first (index 0 = newest)
        const sorted = data.sort(
          (a, b) => new Date(b.completed_at || b.created).getTime() -
                    new Date(a.completed_at || a.created).getTime()
        );
        setResponses(sorted);
      } catch (err) {
        console.error('[v0] Failed to load history:', err);
        setError('Failed to load assessment history');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && user.role === 'patient') {
      loadHistory();
    }
  }, [isAuthenticated, user]);

  const handleViewAssessment = (responseId: number) => {
    router.push(`/patient/assessment-results/${responseId}`);
  };

  const handleRetake = () => {
    router.push('/patient/therapist-matching-assessment');
  };

  const handleDelete = async (responseId: number) => {
    try {
      setDeletingId(responseId);
      await surveyAPI.deleteAssessment(responseId);
      setResponses((prev) => prev.filter((r) => r.id !== responseId));
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete assessment:', err);
      setError('Failed to delete assessment. Please try again.');
      setDeletingId(null);
    }
  };

  const getScoreTrend = () => {
    if (responses.length < 2) return null;
    const latest = responses[0]?.total_score || 0;
    const previous = responses[1]?.total_score || 0;
    const change = latest - previous;
    return { change, isPositive: change > 0, isNeutral: change === 0 };
  };

  const getAverageScore = () => {
    if (responses.length === 0) return 0;
    const sum = responses.reduce((acc, r) => acc + (r.total_score || 0), 0);
    return Math.round(sum / responses.length);
  };

  const getMostRecentDate = () => {
    if (responses.length === 0) return null;
    return new Date(responses[0].completed_at || responses[0].created);
  };

  const getStatusBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          Latest
        </span>
      );
    }
    return null;
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-16 pb-16 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-6"></div>
            <p className="text-gray-600 font-medium">Loading your assessment history...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trend = getScoreTrend();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/patient')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-3 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Assessment History</h1>
              <p className="text-gray-600 mt-1">Track your mental health assessment journey over time</p>
            </div>
            <div className="hidden md:block">
              <Button 
                onClick={handleRetake}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {responses.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="pt-20 pb-20">
              <div className="text-center max-w-md mx-auto">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">No Assessments Yet</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Start your journey to finding the perfect therapist by taking your first assessment. 
                  Our AI-powered matching system will help connect you with compatible mental health professionals.
                </p>
                <Button 
                  onClick={handleRetake}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Take Your First Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Analytics Dashboard */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Assessments */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Assessments</p>
                        <p className="text-3xl font-bold text-gray-900">{responses.length}</p>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Last Assessment */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Last Assessment</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {getMostRecentDate()?.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getMostRecentDate()?.toLocaleDateString('en-US', { year: 'numeric' })}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Assessment Timeline */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Assessment Timeline</h2>
                <span className="text-sm text-gray-500">{responses.length} total</span>
              </div>
            </div>

            {/* Assessment List */}
            <div className="space-y-4">
              {responses.map((response, index) => {
                // Display number: 1 = most recent, 2 = second most recent, etc.
                const displayNumber = index + 1;

                return (
                  <Card 
                    key={response.id} 
                    className="shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
                  >
                    <CardContent className="pt-6 pb-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left Section - Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            {/* Timeline Indicator */}
                            <div className="flex flex-col items-center">
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-md ${
                                index === 0 
                                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                              }`}>
                                <span className="text-white font-bold text-lg">
                                  {displayNumber}
                                </span>
                              </div>
                              {index !== responses.length - 1 && (
                                <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                              )}
                            </div>

                            {/* Assessment Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Assessment #{displayNumber}
                                </h3>
                                {getStatusBadge(index)}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {new Date(response.completed_at || response.created).toLocaleDateString(
                                      'en-US',
                                      {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      }
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {new Date(response.completed_at || response.created).toLocaleTimeString(
                                      'en-US',
                                      {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span>{response.answers.length} questions</span>
                                </div>
                              </div>

                              {/* Score Progress Bar */}
                              {response.total_score !== null && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Assessment Score</span>
                                    <span className="text-sm font-bold text-blue-600">
                                      {response.total_score} / 100
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.min((response.total_score / 100) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                          <Button
                            onClick={() => handleViewAssessment(response.id)}
                            className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                disabled={deletingId === response.id}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl">Delete Assessment?</AlertDialogTitle>
                                <AlertDialogDescription className="text-base leading-relaxed">
                                  Are you sure you want to delete Assessment #{displayNumber}? This will permanently remove 
                                  all responses and data associated with this assessment. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleDelete(response.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {responses.length} {responses.length === 1 ? 'assessment' : 'assessments'}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/patient')}
                    className="border-gray-300"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    onClick={handleRetake}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Assessment
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile New Assessment Button */}
            <div className="md:hidden mt-6">
              <Button 
                onClick={handleRetake}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Assessment
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}