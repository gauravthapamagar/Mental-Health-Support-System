'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { surveyAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Send,
  ArrowLeft,
  Sparkles,
  Save,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  question_level: string;
  order: number;
  is_required: boolean;
  help_text: string;
  rating_min?: number;
  rating_max?: number;
  rating_min_label?: string;
  rating_max_label?: string;
  options?: Array<{
    id: number;
    option_text: string;
    option_value: string;
    order: number;
    score?: number;
  }>;
}

interface Answer {
  [questionId: number]: {
    text?: string;
    option_id?: number;
    option_ids?: number[];
    rating?: number;
    yes_no?: boolean;
  };
}

export default function TherapistMatchingAssessmentPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [survey, setSurvey] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [staticQuestions, setStaticQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

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

  useEffect(() => {
    const loadAssessment = async () => {
      if (!isAuthenticated || !user || user.role !== 'patient') {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const activeSurvey = await surveyAPI.getActiveAssessment();
        
        if (!activeSurvey || !activeSurvey.questions) {
          setError('No assessment available');
          return;
        }

        setSurvey(activeSurvey);

        const resp = await surveyAPI.startAssessment();
        setResponse(resp);

        if (resp.answers && resp.answers.length > 0) {
          const answerMap: Answer = {};
          resp.answers.forEach((ans: any) => {
            answerMap[ans.question] = {
              option_id: ans.answer_option,
              text: ans.answer_text,
              rating: ans.answer_rating,
              yes_no: ans.answer_yes_no,
            };
          });
          setAnswers(answerMap);
        }

        const staticQs = activeSurvey.questions.filter((q: Question) => q.question_level === 'static');
        setStaticQuestions(staticQs);

        try {
          const history = await surveyAPI.getAssessmentHistory();
          setHasHistory(history.length > 0);
        } catch {
          setHasHistory(false);
        }
      } catch (err) {
        console.error('[v0] Failed to load assessment:', err);
        setError('Failed to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [isAuthenticated, user]);

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const currentQuestion = staticQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === staticQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const totalQuestions = staticQuestions.length;
  const progress = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    return answer && (
      answer.text || 
      answer.option_id !== undefined || 
      (answer.option_ids && answer.option_ids.length > 0) ||
      answer.rating !== undefined || 
      answer.yes_no !== undefined
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex < staticQuestions.length - 1) {
      setSlideDirection('right');
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setSlideDirection('left');
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!response) {
      setError('Assessment not loaded');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      for (const [qId, ans] of Object.entries(answers)) {
        await surveyAPI.saveAnswer(response.id, parseInt(qId), ans);
      }

      await surveyAPI.submitAssessment(response.id);
      router.push(`/patient/assessment-results/${response.id}`);
    } catch (err) {
      console.error('[v0] Submit failed:', err);
      setError('Failed to submit assessment');
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || !user || user.role !== 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="shadow-lg">
          <CardContent className="pt-12 pb-12 text-center px-12">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-4">Please log in to take the assessment</p>
            <Link href="/auth/login">
              <Button className="bg-blue-600 hover:bg-blue-700">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardContent className="pt-16 pb-16 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-6"></div>
            <p className="text-gray-600 font-medium text-lg">Loading your assessment...</p>
            <p className="text-gray-500 text-sm mt-2">Preparing questions tailored for you</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-red-200">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Assessment</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => router.push('/patient')} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/patient">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Assessment
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Auto-saved</span>
              </div>
              {hasHistory && (
                <Link href="/patient/assessment-history">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    View History
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>
              <span className="text-sm font-medium text-blue-600">{progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Survey Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {survey?.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {survey?.description}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        {currentQuestion && (
          <div className="mb-8">
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardContent className="p-0">
                {/* Question Content */}
                <div className="p-8 sm:p-12">
                  {/* Question Number Badge */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {currentQuestionIndex + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Question {currentQuestionIndex + 1}</span>
                    </div>
                    {isCurrentQuestionAnswered() && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Answered</span>
                      </div>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {currentQuestion.question_text}
                      {currentQuestion.is_required && (
                        <span className="text-red-500 ml-2">*</span>
                      )}
                    </h2>
                    {currentQuestion.help_text && (
                      <p className="text-gray-600 text-base leading-relaxed">
                        {currentQuestion.help_text}
                      </p>
                    )}
                  </div>

                  {/* Question Input */}
                  <div className={`transition-all duration-500 ${slideDirection === 'right' ? 'animate-slideInRight' : 'animate-slideInLeft'}`}>
                    <QuestionInput
                      question={currentQuestion}
                      answer={answers[currentQuestion.id]}
                      onChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                    />
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      onClick={handlePrevious}
                      disabled={isFirstQuestion}
                      variant="outline"
                      size="lg"
                      className="flex-1 sm:flex-none"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      Previous
                    </Button>

                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                      <div className="flex gap-1">
                        {staticQuestions.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-2 w-2 rounded-full transition-all ${
                              idx === currentQuestionIndex
                                ? 'bg-blue-600 w-6'
                                : answers[staticQuestions[idx].id]
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {!isLastQuestion ? (
                      <Button
                        onClick={handleNext}
                        disabled={currentQuestion.is_required && !isCurrentQuestionAnswered()}
                        size="lg"
                        className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                      >
                        Next
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        size="lg"
                        className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Submit Assessment
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Mobile Progress Dots */}
                  <div className="sm:hidden flex justify-center gap-1 mt-4">
                    {staticQuestions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 w-2 rounded-full transition-all ${
                          idx === currentQuestionIndex
                            ? 'bg-blue-600 w-6'
                            : answers[staticQuestions[idx].id]
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tips Card */}
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Tips for Better Results</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Answer honestly and thoughtfully. There are no right or wrong answers. Your responses help us 
                  find the therapist who best matches your unique needs and preferences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function QuestionInput({ question, answer, onChange }: any) {
  // Multiple choice (radio buttons)
  if (question.question_type === 'multiple_choice') {
    return (
      <div className="space-y-3">
        {question.options && question.options.length > 0 ? (
          question.options.map((option: any) => {
            const isSelected = answer?.option_id === option.id;
            return (
              <label 
                key={option.id} 
                className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center h-6">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onChange({ option_id: option.id })}
                  className="sr-only"
                />
                <span className={`ml-4 text-base leading-relaxed ${
                  isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                }`}>
                  {option.option_text}
                </span>
              </label>
            );
          })
        ) : (
          <p className="text-gray-500">No options available</p>
        )}
      </div>
    );
  }

  // Multiple select (checkboxes)
  if (question.question_type === 'multiple_select') {
    const selectedIds = answer?.option_ids || [];
    return (
      <div className="space-y-3">
        {question.options && question.options.length > 0 ? (
          question.options.map((option: any) => {
            const isSelected = selectedIds.includes(option.id);
            return (
              <label 
                key={option.id} 
                className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center h-6">
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                </div>
                <input
                  type="checkbox"
                  name={`question-${question.id}-${option.id}`}
                  checked={isSelected}
                  onChange={(e) => {
                    let newIds = [...selectedIds];
                    if (e.target.checked) {
                      newIds.push(option.id);
                    } else {
                      newIds = newIds.filter(id => id !== option.id);
                    }
                    onChange({ option_ids: newIds });
                  }}
                  className="sr-only"
                />
                <span className={`ml-4 text-base leading-relaxed ${
                  isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                }`}>
                  {option.option_text}
                </span>
              </label>
            );
          })
        ) : (
          <p className="text-gray-500">No options available</p>
        )}
      </div>
    );
  }

  // Rating scale
  if (question.question_type === 'rating') {
    const minVal = question.rating_min || 1;
    const maxVal = question.rating_max || 10;
    return (
      <div className="space-y-6">
        <div className="flex gap-2 justify-center flex-wrap">
          {Array.from({ length: maxVal - minVal + 1 }).map((_, idx) => {
            const value = minVal + idx;
            const isSelected = answer?.rating === value;
            return (
              <button
                key={value}
                onClick={() => onChange({ rating: value })}
                className={`h-14 w-14 sm:h-16 sm:w-16 rounded-xl border-2 font-bold text-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg scale-110'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md hover:scale-105'
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>
        {(question.rating_min_label || question.rating_max_label) && (
          <div className="flex justify-between text-sm text-gray-600 px-2">
            <span className="font-medium">{question.rating_min_label || ''}</span>
            <span className="font-medium">{question.rating_max_label || ''}</span>
          </div>
        )}
      </div>
    );
  }

  // Yes/No
  if (question.question_type === 'yes_no') {
    return (
      <div className="flex gap-4">
        <button
          onClick={() => onChange({ yes_no: true })}
          className={`flex-1 py-6 px-6 rounded-xl border-2 font-semibold text-lg transition-all duration-200 ${
            answer?.yes_no === true
              ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white border-green-600 shadow-lg'
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:shadow-md'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className={`h-8 w-8 ${answer?.yes_no === true ? 'text-white' : 'text-gray-400'}`} />
            <span>Yes</span>
          </div>
        </button>
        <button
          onClick={() => onChange({ yes_no: false })}
          className={`flex-1 py-6 px-6 rounded-xl border-2 font-semibold text-lg transition-all duration-200 ${
            answer?.yes_no === false
              ? 'bg-gradient-to-br from-red-600 to-rose-600 text-white border-red-600 shadow-lg'
              : 'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:shadow-md'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className={`h-8 w-8 ${answer?.yes_no === false ? 'text-white' : 'text-gray-400'}`} />
            <span>No</span>
          </div>
        </button>
      </div>
    );
  }

  // Text input
  if (question.question_type === 'text') {
    return (
      <textarea
        value={answer?.text || ''}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Type your answer here..."
        className="w-full p-5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base leading-relaxed resize-none transition-all"
        rows={6}
      />
    );
  }

  return (
    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="text-red-800 font-medium">Unsupported Question Type</p>
          <p className="text-red-600 text-sm mt-1">Question type: {question.question_type}</p>
        </div>
      </div>
    </div>
  );
}