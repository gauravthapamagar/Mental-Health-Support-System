"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  category: string;
  type: "single" | "multiple";
  options: {
    id: string;
    text: string;
    value: number;
  }[];
}

interface SurveyResponse {
  [questionId: string]: string[] | string;
}

const SURVEY_QUESTIONS: Question[] = [
  // PHQ-9: Depression Assessment
  {
    id: "phq_1",
    text: "Little interest or pleasure in doing things?",
    category: "Depression (PHQ-9)",
    type: "single",
    options: [
      { id: "0", text: "Not at all", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "phq_2",
    text: "Feeling down, depressed, or hopeless?",
    category: "Depression (PHQ-9)",
    type: "single",
    options: [
      { id: "0", text: "Not at all", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "phq_3",
    text: "Trouble falling or staying asleep, or sleeping too much?",
    category: "Depression (PHQ-9)",
    type: "single",
    options: [
      { id: "0", text: "Not at all", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "phq_4",
    text: "Feeling tired or having little energy?",
    category: "Depression (PHQ-9)",
    type: "single",
    options: [
      { id: "0", text: "Not at all", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "phq_5",
    text: "Poor appetite or overeating?",
    category: "Depression (PHQ-9)",
    type: "single",
    options: [
      { id: "0", text: "Not at all", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "phq_6",
    text: "Feeling bad about yourself — or that you are a failure or let down your family?",
    category: "Depression (PHQ-9)",
    type: "single",
    options: [
      { id: "0", text: "Not at all", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "phq_7",
    text: "Trouble concentrating on things, such as reading the newspaper or watching television?",
    category: "Depression (PHQ-9)",
    type: "single",
    options: [
      { id: "0", text: "Not at all", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "phq_8",
    text: "Moving or speaking so slowly that others have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
    category: "Depression (PHQ-9)",
    type: "single",
    options: [
      { id: "0", text: "Not at all", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "phq_9",
    text: "Thoughts that you would be better off dead, or hurting yourself?",
    category: "Depression (PHQ-9)",
    type: "single",
    options: [
      { id: "0", text: "Not at all", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },

  // GAD-7: Anxiety Assessment
  {
    id: "gad_1",
    text: "Feeling nervous, anxious, or on edge?",
    category: "Anxiety (GAD-7)",
    type: "single",
    options: [
      { id: "0", text: "Not at all sure", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "gad_2",
    text: "Not being able to stop or control worrying?",
    category: "Anxiety (GAD-7)",
    type: "single",
    options: [
      { id: "0", text: "Not at all sure", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "gad_3",
    text: "Worrying too much about different things?",
    category: "Anxiety (GAD-7)",
    type: "single",
    options: [
      { id: "0", text: "Not at all sure", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "gad_4",
    text: "Trouble relaxing?",
    category: "Anxiety (GAD-7)",
    type: "single",
    options: [
      { id: "0", text: "Not at all sure", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "gad_5",
    text: "Being so restless that it's hard to sit still?",
    category: "Anxiety (GAD-7)",
    type: "single",
    options: [
      { id: "0", text: "Not at all sure", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "gad_6",
    text: "Becoming easily annoyed or irritable?",
    category: "Anxiety (GAD-7)",
    type: "single",
    options: [
      { id: "0", text: "Not at all sure", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: "gad_7",
    text: "Feeling afraid as if something awful might happen?",
    category: "Anxiety (GAD-7)",
    type: "single",
    options: [
      { id: "0", text: "Not at all sure", value: 0 },
      { id: "1", text: "Several days", value: 1 },
      { id: "2", text: "More than half the days", value: 2 },
      { id: "3", text: "Nearly every day", value: 3 },
    ],
  },

  // Additional wellness questions
  {
    id: "wellness_1",
    text: "Which coping strategies have you been using? (Select all that apply)",
    category: "Wellness",
    type: "multiple",
    options: [
      { id: "exercise", text: "Exercise & Physical Activity", value: 1 },
      { id: "meditation", text: "Meditation & Mindfulness", value: 2 },
      { id: "sleep", text: "Adequate Sleep", value: 3 },
      { id: "social", text: "Social Connection", value: 4 },
      { id: "therapy", text: "Therapy Sessions", value: 5 },
      { id: "hobbies", text: "Hobbies & Activities", value: 6 },
    ],
  },
  {
    id: "wellness_2",
    text: "How would you rate your overall well-being?",
    category: "Wellness",
    type: "single",
    options: [
      { id: "1", text: "Very Poor", value: 1 },
      { id: "2", text: "Poor", value: 2 },
      { id: "3", text: "Fair", value: 3 },
      { id: "4", text: "Good", value: 4 },
      { id: "5", text: "Very Good", value: 5 },
    ],
  },
];

export default function SurveyForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [surveyId, setSurveyId] = useState<string | null>(null);

  const questionsPerStep = 3;
  const totalSteps = Math.ceil(SURVEY_QUESTIONS.length / questionsPerStep);
  const currentQuestions = SURVEY_QUESTIONS.slice(
    currentStep * questionsPerStep,
    (currentStep + 1) * questionsPerStep
  );

  const handleOptionSelect = (questionId: string, optionId: string) => {
    const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);
    if (question?.type === "single") {
      setResponses((prev) => ({
        ...prev,
        [questionId]: optionId,
      }));
    } else {
      setResponses((prev) => ({
        ...prev,
        [questionId]: Array.isArray(prev[questionId])
          ? (prev[questionId] as string[]).includes(optionId)
            ? (prev[questionId] as string[]).filter((id) => id !== optionId)
            : [...(prev[questionId] as string[]), optionId]
          : [optionId],
      }));
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length !== SURVEY_QUESTIONS.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/surveys/submit/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient_id: user?.id,
            patient_email: user?.email,
            responses: responses,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit survey");
      }

      const data = await response.json();
      setSurveyId(data.survey_id);
      setSubmitted(true);

      // Redirect to results page after 2 seconds
      setTimeout(() => {
        router.push(`/patient/assessment/result/${data.survey_id}`);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting the survey"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentStepComplete = currentQuestions.every(
    (q) => responses[q.id] !== undefined
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Survey Submitted!
          </h2>
          <p className="text-slate-600 mb-6">
            Thank you for completing the assessment. Your responses have been saved and your results are being generated.
          </p>
          <p className="text-sm text-slate-500">
            Redirecting to your results...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Mental Health Assessment
          </h1>
          <p className="text-lg text-slate-600">
            Help us understand your mental health by answering these questions
            honestly.
          </p>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              Step {currentStep + 1} of {totalSteps}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i <= currentStep ? "bg-blue-600 w-8" : "bg-slate-300 w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-8 mb-12">
          {currentQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
            >
              <div className="mb-4">
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  {question.category}
                </p>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  {question.text}
                </h3>
              </div>

              <div className="space-y-3">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <input
                      type={question.type === "single" ? "radio" : "checkbox"}
                      name={question.id}
                      value={option.id}
                      checked={
                        question.type === "single"
                          ? responses[question.id] === option.id
                          : (responses[question.id] as string[])?.includes(
                              option.id
                            ) || false
                      }
                      onChange={() =>
                        handleOptionSelect(question.id, option.id)
                      }
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-slate-700 font-medium">
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <p className="text-sm text-slate-600">
            {Object.keys(responses).length} / {SURVEY_QUESTIONS.length}{" "}
            answered
          </p>

          {currentStep < totalSteps - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isCurrentStepComplete}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                Object.keys(responses).length !== SURVEY_QUESTIONS.length
              }
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Submitting..." : "Submit Survey"}
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
