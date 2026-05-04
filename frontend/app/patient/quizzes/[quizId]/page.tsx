'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { quizzes } from '../../data/quizzes';
import { saveQuizResult, generateId, calculateScoreLevel } from '../../utils/storage';
import { QuizResult } from '../../types';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  
  const quiz = quizzes.find(q => q.id === quizId);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h1>
          <button
            onClick={() => router.push('/patient/quizzes')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to quizzes
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  const handleOptionSelect = (score: number) => {
    setSelectedOption(score);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = { ...answers, [question.id]: selectedOption };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate final score
      const totalScore = Object.values(newAnswers).reduce((sum, score) => sum + score, 0);
      const maxScore = quiz.questions.reduce((sum, q) => 
        sum + Math.max(...q.options.map(o => o.score)), 0
      );
      
      const scoreLevel = calculateScoreLevel(totalScore, quiz.scoringGuide);
      
      // Save result
      const result: QuizResult = {
        id: generateId(),
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: totalScore,
        maxScore,
        level: scoreLevel.level,
        description: scoreLevel.description,
        completedAt: new Date(),
        answers: newAnswers
      };
      
      saveQuizResult(result);
      
      // Navigate to results page
      router.push(`/patient/quizzes/results/${result.id}`);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[quiz.questions[currentQuestion - 1].id] ?? null);
    } else {
      router.push('/patient/quizzes');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {currentQuestion === 0 ? 'Back to Quizzes' : 'Previous Question'}
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600 mt-1">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className="text-4xl">{quiz.icon}</div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option.score)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  selectedOption === option.score
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedOption === option.score
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedOption === option.score && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-lg ${
                    selectedOption === option.score
                      ? 'text-blue-900 font-medium'
                      : 'text-gray-700'
                  }`}>
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
              selectedOption === null
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isLastQuestion ? 'View Results' : 'Next Question'}
            {!isLastQuestion && (
              <svg className="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your responses are saved locally and remain private.</p>
        </div>
      </div>
    </div>
  );
}