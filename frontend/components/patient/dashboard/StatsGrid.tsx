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

interface StatsGridProps {
  stats: {
    nextSession: any;
    matchScore: number | null;
    moodSentiment: string;
    insightCount: number;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const nextSessionDate = stats.nextSession
    ? new Date(`${stats.nextSession.appointment_date}T${stats.nextSession.start_time}`).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : "No Upcoming";

  const therapistName = stats.nextSession?.therapist?.full_name 
    ? `Dr. ${stats.nextSession.therapist.full_name.split(' ').slice(-1)[0]}`
    : "Schedule now";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Calendar className="text-blue-600" size={24} />}
        label="Next Therapy Session"
        value={nextSessionDate}
        subtitle={therapistName}
        href="/patient/appointments"
      />

      <StatCard
        icon={<Star className="text-blue-600" size={24} />}
        label="AI Match Compatibility"
        value={stats.matchScore ? `${stats.matchScore}% Match Score` : "Not Matched"}
        subtitle="Based on Similarity Score"
        href="/patient/therapist-matches/find"
      />

      <StatCard
        icon={<TrendingUp className="text-blue-600" size={24} />}
        label="Recent Mood Sentiment"
        value={stats.moodSentiment || "No Data"}
        subtitle="Analysis from journals"
        href="/patient/journal"
      />

      <StatCard
        icon={<MessageSquare className="text-blue-600" size={24} />}
        label="Journal Entries"
        value={`${stats.insightCount || 0} Entries`}
        subtitle="Total Reflections"
        href="/patient/journal"
      />
    </div>
  );
}
