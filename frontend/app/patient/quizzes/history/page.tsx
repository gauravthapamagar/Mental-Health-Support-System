'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { quizzes } from '../../data/quizzes';
import { getQuizResults, getTimeAgo } from '../../utils/storage'; // adjust path if needed
import { QuizResult } from '@/types';
export default function QuizHistoryPage() {
  const [allResults, setAllResults] = useState<
    (QuizResult & { quizTitle: string; quizCategory?: string })[]
  >([]);

  const [stats, setStats] = useState({
    totalAssessments: 0,
    uniqueQuizzes: 0,
    latestDate: null as Date | null,
  });

  useEffect(() => {
    const resultsWithQuizInfo: typeof allResults = [];

    quizzes.forEach((quiz) => {
      const quizResults = getQuizResults().filter((r) => r.quizId === quiz.id);
      
      const enriched = quizResults.map((result) => ({
        ...result,
        quizTitle: quiz.title,
        quizCategory: quiz.category,
      }));

      resultsWithQuizInfo.push(...enriched);
    });

    // Sort newest first
    resultsWithQuizInfo.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    setAllResults(resultsWithQuizInfo);

    // Calculate stats
    const uniqueQuizIds = new Set(resultsWithQuizInfo.map(r => r.quizId));
    setStats({
      totalAssessments: resultsWithQuizInfo.length,
      uniqueQuizzes: uniqueQuizIds.size,
      latestDate: resultsWithQuizInfo[0]?.completedAt || null,
    });
  }, []);

  const getLevelColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    if (level.toLowerCase().includes('low') || level.toLowerCase().includes('minimal')) 
      return 'bg-green-100 text-green-800 border-green-200';
    if (level.toLowerCase().includes('moderate') || level.toLowerCase().includes('mild')) 
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/patient/quizzes"
            className="inline-flex items-center text-gray-600 hover:text-blue-700 transition-colors mb-6 group"
          >
            <svg 
              className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Quizzes
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Quiz History
              </h1>
              <p className="mt-3 text-lg text-gray-600">
                Review your progress and past results over time
              </p>
            </div>

            {stats.totalAssessments > 0 && (
              <div className="flex flex-wrap gap-4">
                <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Total Assessments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAssessments}</p>
                </div>
                <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Different Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.uniqueQuizzes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {allResults.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 md:p-16 text-center border border-gray-100">
            <div className="text-7xl mb-6">📉</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              No quizzes yet
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
              Complete your first mental health quiz to start tracking your progress and insights.
            </p>
            <Link
              href="/patient/quizzes"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-lg transition-all shadow-md hover:shadow-lg"
            >
              Start Quiz
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {allResults.map((result) => (
              <Link
                key={result.id}
                href={`/patient/quizzes/results/${result.id}`}
                className="block group"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                    {/* Left side */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{quizzes.find(q => q.id === result.quizId)?.icon || '📝'}</span>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {result.quizTitle}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {getTimeAgo(result.completedAt)}
                      </p>
                    </div>

                    {/* Right side - Score & Level */}
                    <div className="flex items-center gap-6 sm:gap-8">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {result.score}
                          <span className="text-lg font-normal text-gray-500">/{result.maxScore}</span>
                        </div>
                      </div>

                      <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getLevelColor(result.level)}`}>
                        {result.level || 'Unknown'}
                      </div>

                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>All data is stored locally in your browser and remains private.</p>
        </div>
      </div>
    </div>
  );
}