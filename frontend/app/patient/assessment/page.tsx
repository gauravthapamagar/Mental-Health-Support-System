'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { surveyAPI, Survey, SurveyResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SurveyQuestion from '../components/SurveyQuestion';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const surveyId = searchParams.get('survey_id');

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

    const loadSurvey = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!surveyId) {
          setError('No survey selected. Please go back and select a survey.');
          setLoading(false);
          return;
        }

        // Get survey details
        const surveyData = await surveyAPI.getSurveyDetail(parseInt(surveyId));
        setSurvey(surveyData);

        // Try to get existing in-progress response
        try {
          const existingResponse = await surveyAPI.startSurvey(parseInt(surveyId));
          setResponse(existingResponse);

          // Load existing answers
          const answersMap: Record<number, any> = {};
          existingResponse.answers.forEach((answer) => {
            if (answer.answer_option) {
              answersMap[answer.question] = answer.answer_option;
            } else if (answer.answer_rating !== null) {
              answersMap[answer.question] = answer.answer_rating;
            } else if (answer.answer_yes_no !== null) {
              answersMap[answer.question] = answer.answer_yes_no;
            } else if (answer.answer_text) {
              answersMap[answer.question] = answer.answer_text;
            }
          });
          setAnswers(answersMap);
        } catch (err) {
          // If no existing response, create a new one
          const newResponse = await surveyAPI.startSurvey(parseInt(surveyId));
          setResponse(newResponse);
        }
      } catch (err) {
        console.error('[v0] Error loading survey:', err);
        setError('Failed to load the survey. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId, user, router]);

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSaveAnswer = async (questionId: number) => {
    if (!response) return;

    try {
      const question = survey?.questions.find((q) => q.id === questionId);
      if (!question) return;

      let answerData: any = {};

      if (question.question_type === 'multiple_choice') {
        answerData = { option_id: answers[questionId] };
      } else if (question.question_type === 'rating') {
        answerData = { rating: answers[questionId] };
      } else if (question.question_type === 'yes_no') {
        answerData = { yes_no: answers[questionId] };
      } else if (question.question_type === 'text') {
        answerData = { text: answers[questionId] };
      }

      await surveyAPI.saveAnswer(response.id, questionId, answerData);
    } catch (err) {
      console.error('[v0] Error saving answer:', err);
    }
  };

  const handleSubmit = async () => {
    if (!response || !survey) return;

    try {
      setSubmitting(true);
      setError(null);

      // Validate all required questions are answered
      const unansweredRequired = survey.questions
        .filter((q) => q.is_required)
        .filter((q) => answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === '')
        .map((q) => q.question_text);

      if (unansweredRequired.length > 0) {
        setError(
          `Please answer all required questions. Missing answers for: ${unansweredRequired.slice(0, 2).join(', ')}${unansweredRequired.length > 2 ? '...' : ''}`
        );
        return;
      }

      // Mark as submitted
      await surveyAPI.submitResponse(response.id);
      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/patient/assessment-results?survey_id=' + surveyId);
      }, 2000);
    } catch (err) {
      console.error('[v0] Error submitting survey:', err);
      setError('Failed to submit the survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
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

  const currentQuestion = survey.questions[currentQuestionIndex];
  const totalQuestions = survey.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {success && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Assessment Complete!
            </h2>
            <p className="text-slate-600 mb-6">
              Thank you for completing the assessment. We're analyzing your responses to match you with the best therapist.
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </Card>
        </div>
      )}

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

          <h1 className="text-4xl font-bold text-slate-900 mb-2">{survey.title}</h1>
          <p className="text-slate-600">{survey.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm text-slate-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Current Question */}
        {currentQuestion && (
          <SurveyQuestion
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            onBlur={() => handleSaveAnswer(currentQuestion.id)}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between mt-8">
          <Button
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
              }
            }}
            disabled={currentQuestionIndex === 0 || submitting}
            variant="outline"
            className="flex items-center gap-2 px-6 py-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Assessment
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (currentQuestionIndex < totalQuestions - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                }
              }}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Question Indicators */}
        <div className="mt-12 flex flex-wrap gap-2 justify-center">
          {survey.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`
                w-10 h-10 rounded-lg font-semibold text-sm transition-all
                ${
                  idx === currentQuestionIndex
                    ? 'bg-blue-600 text-white shadow-lg'
                    : answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== ''
                      ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                }
              `}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
