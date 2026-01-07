"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

// This would come from your API
const API_BASE = "http://localhost:8000/api";

export default function PatientAssessment() {
  const [currentStep, setCurrentStep] = useState("loading"); // loading, static, dynamic, completed
  const [surveyId, setSurveyId] = useState(null);
  const [staticQuestions, setStaticQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [dynamicQuestion, setDynamicQuestion] = useState(null);
  const [dynamicQuestionNumber, setDynamicQuestionNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize survey on mount
  useEffect(() => {
    initializeSurvey();
  }, []);

  const initializeSurvey = async () => {
    try {
      setCurrentStep("loading");

      // Step 1: Start survey
      const surveyResponse = await fetch(`${API_BASE}/survey/start/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!surveyResponse.ok) throw new Error("Failed to start survey");
      const surveyData = await surveyResponse.json();
      setSurveyId(surveyData.survey.id);

      // Step 2: Get static questions
      const questionsResponse = await fetch(
        `${API_BASE}/survey/questions/static/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!questionsResponse.ok) throw new Error("Failed to load questions");
      const questionsData = await questionsResponse.json();
      setStaticQuestions(questionsData.questions);

      setCurrentStep("static");
    } catch (err) {
      setError(err.message);
      console.error("Error initializing survey:", err);
    }
  };

  const handleStaticAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < staticQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitStaticResponses = async () => {
    try {
      setIsSubmitting(true);

      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer: answer,
      }));

      const response = await fetch(`${API_BASE}/survey/responses/static/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          survey_id: surveyId,
          responses: responses,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit responses");

      // Move to dynamic questions
      await fetchNextDynamicQuestion();
      setCurrentStep("dynamic");
    } catch (err) {
      setError(err.message);
      console.error("Error submitting responses:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchNextDynamicQuestion = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE}/survey/questions/dynamic/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          survey_id: surveyId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get dynamic question");
      const data = await response.json();

      if (data.is_final) {
        // No more questions, complete survey
        await completeSurvey();
      } else {
        setDynamicQuestion(data.question_text);
        setDynamicQuestionNumber(data.question_number);
        setAnswers({ dynamicAnswer: "" }); // Reset for new question
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dynamic question:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDynamicAnswer = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE}/survey/responses/dynamic/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          survey_id: surveyId,
          question_text: dynamicQuestion,
          answer: answers.dynamicAnswer,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit answer");

      // Get next dynamic question
      await fetchNextDynamicQuestion();
    } catch (err) {
      setError(err.message);
      console.error("Error submitting dynamic answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeSurvey = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE}/survey/complete/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          survey_id: surveyId,
        }),
      });

      if (!response.ok) throw new Error("Failed to complete survey");
      const data = await response.json();

      setCurrentStep("completed");
      // Redirect to results page
      window.location.href = `/assessment/result/${surveyId}`;
    } catch (err) {
      setError(err.message);
      console.error("Error completing survey:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = staticQuestions[currentQuestionIndex];
  const progress =
    currentStep === "static"
      ? ((currentQuestionIndex + 1) / staticQuestions.length) * 100
      : 100;

  // Loading State
  if (currentStep === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border-2 border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">
            Something went wrong
          </h2>
          <p className="text-slate-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {currentStep === "static"
              ? "Mental Health Assessment"
              : "Follow-up Questions"}
          </h1>
          <p className="text-slate-600">
            {currentStep === "static"
              ? "Please answer these questions honestly to help us understand your needs"
              : "These personalized questions help us better understand your situation"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
            <span>
              {currentStep === "static"
                ? `Question ${currentQuestionIndex + 1} of ${
                    staticQuestions.length
                  }`
                : `Follow-up ${dynamicQuestionNumber}`}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-6">
          {currentStep === "static" && currentQuestion && (
            <>
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
                  Question {currentQuestionIndex + 1}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  {currentQuestion.question_text}
                </h2>

                {/* Single Choice Options */}
                {currentQuestion.response_type === "single_choice" && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleStaticAnswer(currentQuestion.id, option)
                        }
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          answers[currentQuestion.id] === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {answers[currentQuestion.id] === option ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                          <span className="text-slate-700">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Text Response */}
                {currentQuestion.response_type === "text" && (
                  <textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      handleStaticAnswer(currentQuestion.id, e.target.value)
                    }
                    placeholder="Type your answer here..."
                    rows={6}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors resize-none"
                  />
                )}
              </div>
            </>
          )}

          {currentStep === "dynamic" && dynamicQuestion && (
            <>
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-4">
                  Follow-up Question {dynamicQuestionNumber}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  {dynamicQuestion}
                </h2>

                <textarea
                  value={answers.dynamicAnswer || ""}
                  onChange={(e) =>
                    setAnswers({ dynamicAnswer: e.target.value })
                  }
                  placeholder="Type your answer here..."
                  rows={6}
                  className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          {currentStep === "static" && (
            <>
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>

              {currentQuestionIndex === staticQuestions.length - 1 ? (
                <button
                  onClick={submitStaticResponses}
                  disabled={!answers[currentQuestion?.id] || isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Continue to Follow-up
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={goToNextQuestion}
                  disabled={!answers[currentQuestion?.id]}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </>
          )}

          {currentStep === "dynamic" && (
            <>
              <button
                onClick={() => completeSurvey()}
                disabled={isSubmitting}
                className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Skip & Complete
              </button>

              <button
                onClick={submitDynamicAnswer}
                disabled={!answers.dynamicAnswer || isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Your responses are confidential and will be used to match you with
            the right therapist
          </p>
        </div>
      </div>
    </div>
  );
}
