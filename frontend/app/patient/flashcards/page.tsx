'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { flashcardCategories } from '../data/flashcards';
import { getProgressForCategory } from '../utils/storage';

export default function FlashcardsPage() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load progress for each category
    const progressData: Record<string, number> = {};
    flashcardCategories.forEach(category => {
      const categoryProgress = getProgressForCategory(category.id);
      if (categoryProgress) {
        const percentage = (categoryProgress.completedCards.length / category.cards.length) * 100;
        progressData[category.id] = Math.round(percentage);
      } else {
        progressData[category.id] = 0;
      }
    });
    setProgress(progressData);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mental Health Flashcards
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn evidence-based mental health concepts, coping techniques, and therapeutic 
            approaches through interactive flashcards. Perfect for building your mental wellness toolkit!
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {flashcardCategories.map((category) => {
            const completionPercentage = progress[category.id] || 0;
            const isCompleted = completionPercentage === 100;

            return (
              <Link
                key={category.id}
                href={`/patient/flashcards/${category.id}`}
                className="group"
              >
                <div 
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 h-full flex flex-col"
                  style={{ borderColor: `${category.color}40` }}
                >
                  {/* Card Header with colored background */}
                  <div 
                    className="p-6"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-5xl">{category.icon}</div>
                      {isCompleted && (
                        <div className="bg-green-500 text-white rounded-full p-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <h3 
                      className="text-xl font-bold mb-2 group-hover:underline"
                      style={{ color: category.color }}
                    >
                      {category.name}
                    </h3>
                    
                    <p className="text-gray-700 text-sm">
                      {category.description}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-grow">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {category.cards.length} cards
                      </div>
                      <span className="font-medium" style={{ color: category.color }}>
                        {completionPercentage}% complete
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${completionPercentage}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div 
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ backgroundColor: `${category.color}10` }}
                  >
                    <span className="text-sm font-medium" style={{ color: category.color }}>
                      {completionPercentage === 0 ? 'Start Learning' : 
                       completionPercentage === 100 ? 'Review Cards' : 'Continue Learning'}
                    </span>
                    <svg 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      style={{ color: category.color }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Use Flashcards?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Knowledge</h3>
              <p className="text-gray-600 text-sm">
                Learn mental health concepts and techniques at your own pace
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reinforce Learning</h3>
              <p className="text-gray-600 text-sm">
                Repetition helps solidify important coping strategies
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Reference</h3>
              <p className="text-gray-600 text-sm">
                Access helpful techniques whenever you need them
              </p>
            </div>
          </div>
        </div>

        {/* Study Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Study Tips</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Review cards regularly for better retention</li>
                <li>• Take your time to understand each concept fully</li>
                <li>• Try to apply what you learn in your daily life</li>
                <li>• Revisit completed categories to reinforce learning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}