'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { surveyAPI, matchingAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, ChevronLeft, Calendar, Award, Zap, Sparkles, Check, Clock, FileText } from 'lucide-react';
import type { SurveyResponse } from '@/lib/api';

export default function AssessmentResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const resolvedParams = use(params);

  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [findingMatches, setFindingMatches] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);

  // Redirect if not authenticated
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

  // Load response data
  useEffect(() => {
    const loadResponse = async () => {
      try {
        setLoading(true);
        const data = await surveyAPI.getResponse(parseInt(resolvedParams.id));
        setResponse(data);
      } catch (err) {
        console.error('[v0] Failed to load response:', err);
        setError('Failed to load assessment results');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && user.role === 'patient' && resolvedParams?.id) {
      loadResponse();
    }
  }, [isAuthenticated, user, resolvedParams?.id]);

  // Simulate progress for matching animation
  useEffect(() => {
    if (!findingMatches) return;

    const interval = setInterval(() => {
      setMatchingProgress(prev => {
        if (prev < 90) return prev + Math.random() * 30;
        return prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [findingMatches]);

  const handleFindMatches = async () => {
    if (!response) return;

    try {
      setFindingMatches(true);
      setError(null);
      setMatchingProgress(0);
      
      await matchingAPI.findMatches(response.id);
      
      // Show 100% and wait a moment before redirecting
      setMatchingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      router.push(`/patient/therapist-matches/${response.id}`);
    } catch (err) {
      console.error('[v0] Failed to find matches:', err);
      setError('Failed to find matches. Please try again.');
      setFindingMatches(false);
      setMatchingProgress(0);
    }
  };

  const handleDownload = () => {
    if (!response) return;

    const content = generatePDF();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `assessment-${response.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generatePDF = () => {
    if (!response) return '';

    let content = `Therapist Matching Assessment Results\n`;
    content += `=====================================\n\n`;
    content += `Assessment ID: ${response.id}\n`;
    content += `Completed: ${new Date(response.completed_at || response.created).toLocaleString()}\n`;
    content += `Total Score: ${response.total_score || 0}\n\n`;

    content += `Questions and Answers:\n`;
    content += `---------------------\n\n`;

    response.answers.forEach((answer, index) => {
      content += `Q${index + 1}. ${answer.question_text}\n`;
      content += `Type: ${answer.question_type}\n`;

      if (answer.answer_text) {
        content += `Answer: ${answer.answer_text}\n`;
      } else if (answer.answer_option_text) {
        content += `Answer: ${answer.answer_option_text}\n`;
      } else if (answer.answer_rating !== null) {
        content += `Answer: ${answer.answer_rating}/10\n`;
      } else if (answer.answer_yes_no !== null) {
        content += `Answer: ${answer.answer_yes_no ? 'Yes' : 'No'}\n`;
      }

      content += `\n`;
    });

    return content;
  };

  // Loading Modal Component
  const MatchingLoadingModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl">
        <CardContent className="pt-16 pb-16 text-center">
          {/* Animated search icon */}
          <div className="mb-10 flex justify-center">
            <div className="relative h-28 w-28">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
              
              {/* Middle pulsing ring */}
              <div className="absolute inset-3 rounded-full border-2 border-blue-300 animate-pulse" />
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-blue-600 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Progress stages */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Finding Your Perfect Match</h2>
          <p className="text-gray-600 mb-10 text-sm">Our AI is analyzing your responses to find the best therapists for you</p>

          {/* Progress stages */}
          <div className="space-y-5 mb-10 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-4">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                matchingProgress >= 25 ? 'bg-green-600' : 'bg-gray-200'
              }`}>
                {matchingProgress >= 25 && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className={`text-sm transition-colors ${matchingProgress >= 25 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Processing your preferences
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                matchingProgress >= 50 ? 'bg-green-600' : 'bg-gray-200'
              }`}>
                {matchingProgress >= 50 && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className={`text-sm transition-colors ${matchingProgress >= 50 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Searching therapist database
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                matchingProgress >= 75 ? 'bg-green-600' : 'bg-gray-200'
              }`}>
                {matchingProgress >= 75 && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className={`text-sm transition-colors ${matchingProgress >= 75 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Analyzing compatibility scores
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                matchingProgress >= 100 ? 'bg-green-600' : 'bg-gray-200'
              }`}>
                {matchingProgress >= 100 && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className={`text-sm transition-colors ${matchingProgress >= 100 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Preparing your results
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(matchingProgress, 100)}%` }}
            />
          </div>

          <p className="text-xs text-gray-500">This typically takes 10-20 seconds</p>
        </CardContent>
      </Card>
    </div>
  );

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-16 pb-16 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-6"></div>
            <p className="text-gray-600 font-medium">Loading assessment results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="flex gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-red-900 font-semibold text-lg mb-2">Error Loading Assessment</h3>
                  <p className="text-red-800 mb-4">{error}</p>
                  <Button 
                    onClick={() => router.push('/patient/assessment-history')} 
                    variant="outline"
                    className="border-red-300 hover:bg-red-100"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Return to Assessment History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="pt-16 pb-16 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-6">Assessment not found</p>
              <Button onClick={() => router.push('/patient')}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Assessment History 
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Matching Modal */}
      {findingMatches && <MatchingLoadingModal />}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/patient/assessment-history')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-3 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Back to Assessment History</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
              <p className="text-gray-600 mt-1">Review your therapist matching assessment responses</p>
            </div>
            <div className="hidden sm:flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleDownload}
                className="border-gray-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessment Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Assessment ID</p>
                    <p className="text-2xl font-bold text-gray-900">#{response.id}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Completion Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(response.completed_at || response.created).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(response.completed_at || response.created).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Questions Answered</p>
                    <p className="text-2xl font-bold text-gray-900">{response.answers.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Section - Primary CTA */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Ready to Find Your Therapist?</h3>
                </div>
                <p className="text-gray-700">
                  Our AI-powered matching system will analyze your responses and connect you with the most compatible therapists based on your unique needs and preferences.
                </p>
              </div>
              <Button 
                onClick={handleFindMatches}
                disabled={findingMatches}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
              >
                <Zap className="h-5 w-5 mr-2" />
                {findingMatches ? 'Finding Matches...' : 'Find My Therapist Match'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Responses Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Responses</h2>
            <span className="text-sm text-gray-500">{response.answers.length} responses</span>
          </div>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-6">
                {response.answers.map((answer, index) => (
                  <div key={answer.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-sm font-semibold text-gray-700">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base leading-relaxed">
                            {answer.question_text}
                          </h3>
                          <span className="inline-block mt-2 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                            {answer.question_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-10 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                      {answer.answer_text && (
                        <p className="text-gray-800 leading-relaxed">{answer.answer_text}</p>
                      )}
                      {answer.answer_option_text && (
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          <p className="text-gray-800 font-medium">{answer.answer_option_text}</p>
                        </div>
                      )}
                      {answer.answer_rating !== null && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-800 font-semibold text-lg">{answer.answer_rating} / 10</p>
                            <span className="text-sm text-gray-600">
                              {answer.answer_rating >= 8 ? 'High' : answer.answer_rating >= 5 ? 'Moderate' : 'Low'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all"
                              style={{ width: `${(answer.answer_rating / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {answer.answer_yes_no !== null && (
                        <div className={`inline-flex items-center px-3.5 py-1.5 rounded-full font-semibold text-sm ${
                          answer.answer_yes_no 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {answer.answer_yes_no ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                              Yes
                            </>
                          ) : (
                            <>No</>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Your Privacy Matters</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Your assessment responses are securely stored and will only be used to match you with suitable therapists. 
                  Our matching algorithm analyzes your preferences, needs, and therapeutic goals to provide personalized recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button 
            variant="outline" 
            onClick={() => router.push('/patient/assessment-history')}
            className="border-gray-300"
          >
            <Clock className="h-4 w-4 mr-2" />
            View Assessment History
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="sm:hidden border-gray-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Results
          </Button>
        </div>
      </div>
    </div>
  );
}