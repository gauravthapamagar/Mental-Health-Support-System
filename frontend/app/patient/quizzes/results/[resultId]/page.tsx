'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getQuizResultById, getResultsByQuizId, formatDate } from '../../../utils/storage';
import { getStrategiesForResult } from '../../../data/copingStrategies';
import { quizzes } from '../../../data/quizzes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.resultId as string;
  
  const [result, setResult] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  useEffect(() => {
    const fetchedResult = getQuizResultById(resultId);
    if (!fetchedResult) {
      router.push('/patient/quizzes');
      return;
    }

    const fetchedQuiz = quizzes.find(q => q.id === fetchedResult.quizId);
    const fetchedStrategies = getStrategiesForResult(
      fetchedQuiz?.category || '',
      fetchedResult.level
    );
    const fetchedHistory = getResultsByQuizId(fetchedResult.quizId);

    setResult(fetchedResult);
    setQuiz(fetchedQuiz);
    setStrategies(fetchedStrategies);
    setHistory(fetchedHistory);
  }, [resultId, router]);

  if (!result || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const scoreLevel = quiz.scoringGuide.ranges.find(
    (r: any) => result.score >= r.min && result.score <= r.max
  );

  // Prepare chart data
  const chartData = {
    labels: history.slice(0, 10).reverse().map((h, i) => `Attempt ${i + 1}`),
    datasets: [
      {
        label: 'Score',
        data: history.slice(0, 10).reverse().map(h => h.score),
        borderColor: scoreLevel?.color || '#3b82f6',
        backgroundColor: `${scoreLevel?.color || '#3b82f6'}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: result.maxScore,
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  const getLevelIcon = (level: string) => {
    const icons: Record<string, string> = {
      minimal: '😊',
      mild: '😐',
      moderate: '😟',
      severe: '😢'
    };
    return icons[level] || '😐';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/patient/quizzes')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Quizzes
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600 mt-2">Completed {formatDate(result.completedAt)}</p>
            </div>
            <div className="text-5xl">{quiz.icon}</div>
          </div>
        </div>

        {/* Score Card */}
        <div 
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-4"
          style={{ borderColor: scoreLevel?.color }}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">{getLevelIcon(result.level)}</div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: scoreLevel?.color }}>
              {result.level.charAt(0).toUpperCase() + result.level.slice(1)} Level
            </h2>
            <p className="text-gray-700 text-lg mb-6">{result.description}</p>
            
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div>
                <div className="text-4xl font-bold" style={{ color: scoreLevel?.color }}>
                  {result.score}
                </div>
                <div className="text-sm text-gray-600">Your Score</div>
              </div>
              <div className="text-3xl text-gray-300">/</div>
              <div>
                <div className="text-4xl font-bold text-gray-400">{result.maxScore}</div>
                <div className="text-sm text-gray-600">Maximum</div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${(result.score / result.maxScore) * 100}%`,
                  backgroundColor: scoreLevel?.color
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progress Chart */}
          {history.length > 1 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h3>
              <div style={{ height: '300px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Tracking your last {Math.min(history.length, 10)} attempts
              </p>
            </div>
          )}

          {/* Score Interpretation */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Understanding Your Score</h3>
            <div className="space-y-3">
              {quiz.scoringGuide.ranges.map((range: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.level === range.level
                      ? 'border-current shadow-md'
                      : 'border-gray-200'
                  }`}
                  style={result.level === range.level ? { borderColor: range.color, backgroundColor: `${range.color}15` } : {}}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold" style={{ color: range.color }}>
                      {range.level.charAt(0).toUpperCase() + range.level.slice(1)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {range.min}-{range.max} points
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{range.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coping Strategies */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Recommended Coping Strategies</h3>
              <p className="text-gray-600">Personalized techniques based on your results</p>
            </div>
          </div>

          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedStrategy(
                    expandedStrategy === strategy.id ? null : strategy.id
                  )}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {strategy.title}
                    </h4>
                    <p className="text-gray-600 text-sm">{strategy.description}</p>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${
                      expandedStrategy === strategy.id ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedStrategy === strategy.id && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <h5 className="font-semibold text-gray-900 mb-3">Steps to follow:</h5>
                    <ol className="space-y-2">
                      {strategy.steps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>

          {result.level === 'severe' && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-lg font-semibold text-red-900 mb-2">
                    Professional Support Recommended
                  </h4>
                  <p className="text-red-800 mb-3">
                    Your results indicate you may benefit from professional mental health support. 
                    Please consider speaking with a licensed therapist.
                  </p>
                  <button
                    onClick={() => router.push('/patient/therapists')}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Find a Therapist
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.push(`/patient/quizzes/${quiz.id}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Retake Assessment
          </button>
          <button
            onClick={() => router.push('/patient/quizzes')}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Take Another Quiz
          </button>
          <button
            onClick={() => router.push('/patient/flashcards')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Explore Flashcards
          </button>
        </div>
      </div>
    </div>
  );
}