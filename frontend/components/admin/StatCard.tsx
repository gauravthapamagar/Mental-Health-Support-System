import { TrendingUp } from "lucide-react";

export default function StatCard({
  icon,
  title,
  value,
  trend,
  subtitle,
  color,
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.blue}`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp size={16} className="mr-1" /> {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex items-baseline space-x-2 mt-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
