'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Award,
  Target,
  BarChart3,
  Download,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import ResultsChart from '../components/ResultsChart';

interface Statistics {
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  latest_severity: string | null;
  improvement_trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  category_breakdown: Record<
    string,
    {
      count: number;
      average_score: number;
      latest_severity: string;
      color?: string;
    }
  >;
  monthly_progress: Array<{
    month: string;
    average_score: number;
    attempt_count: number;
  }>;
}

const trendConfig = {
  improving: {
    label: 'Improving',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  stable: {
    label: 'Stable',
    icon: Activity,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  declining: {
    label: 'Needs Attention',
    icon: TrendingDown,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  insufficient_data: {
    label: 'Not enough data',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
};

export default function StatisticsPage() {
  const router = useRouter();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/assessments/attempts/statistics/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!statistics) return;

    let csv = 'Mental Health Assessment Report\n\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    csv += 'Overview\n';
    csv += `Total Assessments,${statistics.total_attempts}\n`;
    csv += `Average Score,${statistics.average_score.toFixed(1)}%\n`;
    csv += `Latest Status,${statistics.latest_severity || 'N/A'}\n`;
    csv += `Trend,${statistics.improvement_trend}\n\n`;

    csv += 'Category Breakdown\n';
    csv += 'Category,Attempts,Average Score,Latest Status\n';
    Object.entries(statistics.category_breakdown).forEach(([cat, d]) => {
      csv += `${cat},${d.count},${d.average_score.toFixed(1)}%,${d.latest_severity}\n`;
    });

    csv += '\nMonthly Progress\n';
    csv += 'Month,Average Score,Attempts\n';
    statistics.monthly_progress.forEach(m => {
      csv += `${m.month},${m.average_score.toFixed(1)}%,${m.attempt_count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mental-health-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading your insights...</p>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.total_attempts === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <BarChart3 className="h-16 w-16 text-indigo-500 mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No Data Yet
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Complete your first mental health assessment to unlock personalized statistics, trends, and insights.
          </p>
          <button
            onClick={() => router.push('/patients/quizzes')}
            className="w-full bg-indigo-600 text-white py-3.5 px-6 rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm"
          >
            Start an Assessment
          </button>
        </div>
      </div>
    );
  }

  const trend = trendConfig[statistics.improvement_trend] || trendConfig.insufficient_data;
  const TrendIcon = trend.icon;

  // Prepare data for charts
  const monthlyData = statistics.monthly_progress.map(item => ({
    name: item.month,
    score: item.average_score,
    attempts: item.attempt_count,
  }));

  const categoryData = Object.entries(statistics.category_breakdown).map(([name, data]) => ({
    name,
    score: data.average_score,
    count: data.count,
    fill: data.color || '#6366f1',
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Mental Health Insights
            </h1>
            <p className="mt-2 text-gray-600">
              Track your progress, identify trends, and gain a clearer picture of your wellbeing.
            </p>
          </div>

          <button
            onClick={exportReport}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm"
          >
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Total Assessments</p>
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statistics.total_attempts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <Target className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statistics.average_score.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Latest Status</p>
              <Award className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-xl font-semibold capitalize text-gray-900">
              {statistics.latest_severity?.replace('_', ' ') || 'N/A'}
            </p>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${trend.border} ${trend.bg}`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Trend</p>
              <TrendIcon className={`h-6 w-6 ${trend.color}`} />
            </div>
            <p className={`text-xl font-semibold capitalize ${trend.color}`}>
              {trend.label}
            </p>
          </div>
        </div>

        {/* Charts - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <ResultsChart
            title="Monthly Progress"
            data={monthlyData}
            dataKey="score"
            name="Average Score"
            type="line"
            color="#6366f1"
            secondaryDataKey="attempts"
            secondaryName="Attempts"
            secondaryColor="#9ca3af"
            showTrend
            trendValue={monthlyData.length >= 2 
              ? monthlyData[monthlyData.length-1].score - monthlyData[monthlyData.length-2].score 
              : 0}
            trendLabel="last month"
          />

          <ResultsChart
            title="Scores by Category"
            data={categoryData}
            dataKey="score"
            name="Average Score"
            type="bar"
            color="#4f46e5"
          />
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Insights & Next Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`${trend.bg} rounded-xl p-6 border ${trend.border}`}>
              <div className="flex items-center gap-3 mb-4">
                <TrendIcon className={`h-6 w-6 ${trend.color}`} />
                <h3 className="text-lg font-semibold text-gray-900">Current Trend</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {statistics.improvement_trend === 'improving' &&
                  "You're showing consistent improvement — great work! Continue your current strategies."}
                {statistics.improvement_trend === 'stable' &&
                  "Your results are stable. Maintaining consistency is valuable — keep going."}
                {statistics.improvement_trend === 'declining' &&
                  "Your recent scores suggest some challenges. Consider reviewing recommendations or speaking to a professional."}
                {statistics.improvement_trend === 'insufficient_data' &&
                  "Complete more assessments to get meaningful trend insights."}
              </p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Areas to Focus On</h3>
              </div>
              <ul className="space-y-3">
                {Object.entries(statistics.category_breakdown)
                  .sort((a, b) => b[1].average_score - a[1].average_score)
                  .slice(0, 3)
                  .map(([name, data]) => (
                    <li key={name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: data.color || '#6366f1' }}
                      />
                      <span className="text-gray-800">
                        {name} — {data.average_score.toFixed(1)}% severity
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          <button
            onClick={() => router.push('/patients/quizzes')}
            className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-xl hover:bg-indigo-700 transition font-medium shadow-md"
          >
            Take Another Assessment
          </button>
          <button
            onClick={() => router.push('/patients/therapists')}
            className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-4 px-6 rounded-xl hover:bg-indigo-50 transition font-medium"
          >
            Find Professional Support
          </button>
        </div>
      </div>
    </div>
  );
}