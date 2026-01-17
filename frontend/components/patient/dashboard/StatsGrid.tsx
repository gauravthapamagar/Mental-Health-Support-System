import { Calendar, Star, TrendingUp, MessageSquare } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  href?: string;
}

function StatCard({ icon, label, value, subtitle, href }: StatCardProps) {
  const content = (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <div className="text-xs font-medium text-gray-600 uppercase">
          {label}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Calendar className="text-blue-600" size={24} />}
        label="Next Therapy Session"
        value="Dec 30, 02:00 PM"
        subtitle="Dr. Sarah Jenkins"
        href="/patient/appointments"
      />

      <StatCard
        icon={<Star className="text-blue-600" size={24} />}
        label="AI Match Compatibility"
        value="94% Match Score"
        subtitle="Based on Similarity Score"
      />

      <StatCard
        icon={<TrendingUp className="text-blue-600" size={24} />}
        label="Recent Mood Sentiment"
        value="Primarily Positive"
        subtitle="Analysis from last response"
        href="/patient/journal"
      />

      <StatCard
        icon={<MessageSquare className="text-blue-600" size={24} />}
        label="AI Companion Insights"
        value="3 New Summaries"
        subtitle="Feedback only • No Diagnosis"
        href="/patient/articles"
      />
    </div>
  );
}
