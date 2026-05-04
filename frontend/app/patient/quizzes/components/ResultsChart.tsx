'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

type ChartType = 'line' | 'bar';

interface ResultsChartProps {
  title: string;
  data: any[];
  dataKey: string;
  name?: string;
  type?: ChartType;
  color?: string;
  height?: number;
  showTrend?: boolean;
  secondaryDataKey?: string;
  secondaryName?: string;
  secondaryColor?: string;
  domain?: [number, number];
  trendValue?: number;
  trendLabel?: string;
}

export default function ResultsChart({
  title,
  data,
  dataKey,
  name = 'Value',
  type = 'line',
  color = '#6366f1', // indigo-500
  height = 320,
  showTrend = false,
  secondaryDataKey,
  secondaryName,
  secondaryColor = '#9ca3af', // gray-400
  domain = [0, 100],
  trendValue,
  trendLabel,
}: ResultsChartProps) {
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-sm" style={{ color }}>
            {name}: <span className="font-semibold">{payload[0].value}</span>
          </p>
          {secondaryDataKey && payload[1] && (
            <p className="text-sm text-gray-600">
              {secondaryName}: <span className="font-semibold">{payload[1].value}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const TrendIndicator = () => {
    if (!showTrend || trendValue === undefined) return null;

    const isPositive = trendValue >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className="flex items-center gap-1.5 text-sm mt-1">
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <span className={colorClass}>
          {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}% {trendLabel || 'change'}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 pt-5 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showTrend && <TrendIndicator />}
        </div>
      </div>

      <div className="p-4" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis domain={domain} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />

              <Line
                type="monotone"
                dataKey={dataKey}
                name={name}
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />

              {secondaryDataKey && (
                <Line
                  type="monotone"
                  dataKey={secondaryDataKey}
                  name={secondaryName}
                  stroke={secondaryColor}
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis domain={domain} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />

              <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
              {secondaryDataKey && (
                <Bar dataKey={secondaryDataKey} name={secondaryName} fill={secondaryColor} radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}