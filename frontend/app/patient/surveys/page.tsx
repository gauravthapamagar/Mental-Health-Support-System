'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { surveyAPI, Survey } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ClipboardList,
  Brain,
  Heart,
  Zap,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface SurveyCardProps {
  survey: Survey;
  onStart: (surveyId: number) => void;
}

function SurveyCard({ survey, onStart }: SurveyCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'standard':
        return <Brain className="w-8 h-8 text-blue-600" />;
      case 'custom':
        return <Heart className="w-8 h-8 text-red-600" />;
      case 'both':
        return <Zap className="w-8 h-8 text-purple-600" />;
      default:
        return <ClipboardList className="w-8 h-8 text-slate-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'standard':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            <Brain className="w-3 h-3" />
            Standard Assessment
          </span>
        );
      case 'custom':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <Heart className="w-3 h-3" />
            Therapist Matching
          </span>
        );
      case 'both':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            <Zap className="w-3 h-3" />
            Complete Assessment
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg hover:border-blue-300 transition-all border-slate-200 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-blue-100 transition-colors">
          {getIcon(survey.assessment_type)}
        </div>
        {getTypeBadge(survey.assessment_type)}
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">{survey.title}</h3>
      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{survey.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {survey.questions?.length || 0} questions
        </span>
        <Button
          onClick={() => onStart(survey.id)}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
        >
          Start
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

export default function SurveysPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtering, setFiltering] = useState<'all' | 'standard' | 'custom' | 'both'>('all');
  const { isAuthenticated } = useAuth();

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

    const loadSurveys = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await surveyAPI.getSurveys();
        setSurveys(data);
      } catch (err) {
        console.error('[v0] Error loading surveys:', err);
        setError('Failed to load surveys. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSurveys();
  }, [user, router]);

  const handleStartSurvey = (surveyId: number) => {
    router.push(`/patient/assessment?survey_id=${surveyId}`);
  };

  const filteredSurveys =
    filtering === 'all'
      ? surveys
      : surveys.filter((s) => s.assessment_type === filtering);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Mental Health Assessments
              </h1>
              <p className="text-slate-600 mt-1">
                Complete assessments to get matched with the right therapist for you
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {[
            { value: 'all' as const, label: 'All Assessments' },
            { value: 'standard' as const, label: 'Standard Assessments' },
            { value: 'custom' as const, label: 'Therapist Matching' },
            { value: 'both' as const, label: 'Complete Assessment' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFiltering(tab.value)}
              className={`
                px-6 py-2.5 rounded-lg font-semibold transition-all
                ${
                  filtering === tab.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Surveys Grid */}
        {filteredSurveys.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                onStart={handleStartSurvey}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No assessments found
            </h3>
            <p className="text-slate-600">
              There are no {filtering !== 'all' ? 'matching ' : ''}assessments available right now.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Why Take Our Assessments?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-3">
                1
              </div>
              <p className="font-semibold text-slate-900 mb-2">Personalized Matching</p>
              <p className="text-slate-600 text-sm">
                Get matched with therapists who specialize in your specific mental
                health concerns.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-3">
                2
              </div>
              <p className="font-semibold text-slate-900 mb-2">Evidence-Based</p>
              <p className="text-slate-600 text-sm">
                Our assessments are based on scientifically validated screening tools
                used by mental health professionals.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-3">
                3
              </div>
              <p className="font-semibold text-slate-900 mb-2">Track Progress</p>
              <p className="text-slate-600 text-sm">
                Retake assessments over time to track your mental health progress and
                celebrate your improvements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
