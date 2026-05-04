'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { quizzes } from '../data/quizzes';
import { getResultsByQuizId, getTimeAgo } from '../utils/storage';
import { Quiz, QuizResult } from '../types';

export default function QuizzesPage() {
  const [quizHistory, setQuizHistory] = useState<Record<string, QuizResult[]>>({});

  useEffect(() => {
  const loadHistory = () => {
    const history: Record<string, QuizResult[]> = {};
    quizzes.forEach(quiz => {
      const quizResults = getResultsByQuizId(quiz.id);
      if (quizResults.length > 0) {
        history[quiz.id] = quizResults;
      }
    });
    setQuizHistory(history);
  };

  loadHistory(); // initial load

  // Reload when returning to this tab/page (after quiz completion)
  window.addEventListener('focus', loadHistory);
  // Optional: also listen for storage changes from other tabs
  window.addEventListener('storage', loadHistory);

  return () => {
    window.removeEventListener('focus', loadHistory);
    window.removeEventListener('storage', loadHistory);
  };
}, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      anxiety: 'bg-blue-100 text-blue-800 border-blue-200',
      depression: 'bg-purple-100 text-purple-800 border-purple-200',
      stress: 'bg-orange-100 text-orange-800 border-orange-200',
      sleep: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      wellness: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mental Health Quiz
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take scientifically-backed quizzes to understand your mental health better. 
            Get personalized insights and coping strategies based on your results.
          </p>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quizzes.map((quiz) => {
            const lastResult = quizHistory[quiz.id]?.[0];
            const totalAttempts = quizHistory[quiz.id]?.length || 0;

            return (
              <Link
                key={quiz.id}
                href={`/patient/quizzes/${quiz.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 h-full flex flex-col">
                  {/* Card Header */}
                  <div className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{quiz.icon}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(quiz.category)}`}>
                        {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {quiz.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {quiz.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {quiz.questions.length} questions
                    </div>
                  </div>

                  {/* Card Footer - Last Result */}
                  {lastResult && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last taken:</span>
                        <span className="text-gray-900 font-medium">
                          {getTimeAgo(lastResult.completedAt)}
                        </span>
                      </div>
                      {totalAttempts > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {totalAttempts} attempts total
                        </div>
                      )}
                    </div>
                  )}

                  {!lastResult && (
                    <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                      <span className="text-sm text-blue-600 font-medium">
                        Take this Quiz →
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* View History Section */}
        {Object.values(quizHistory).some(results => results.length > 0) && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Assessment History</h2>
            <p className="text-gray-600 mb-4">
              Track your mental health journey over time and see your progress.
            </p>
            <Link
              href="/patient/quizzes/history"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Full History
            </Link>
          </div>
        )}

        {/* Information Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Note</h3>
              <p className="text-blue-800 text-sm">
                These assessments are screening tools and not diagnostic instruments. 
                They can help you understand your mental health better, but they cannot replace 
                professional evaluation. If you're experiencing severe symptoms, please consult 
                with a mental health professional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}