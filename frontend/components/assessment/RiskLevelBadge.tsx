import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface RiskLevelBadgeProps {
  level: "low" | "medium" | "high";
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RiskLevelBadge({
  level,
  showDescription = false,
  size = "md",
}: RiskLevelBadgeProps) {
  const configs = {
    low: {
      color: "green",
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: CheckCircle2,
      title: "Low Risk",
      description: "You're managing well with good coping mechanisms",
    },
    medium: {
      color: "yellow",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      icon: AlertTriangle,
      title: "Medium Risk",
      description: "You may benefit from professional support",
    },
    high: {
      color: "red",
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: AlertCircle,
      title: "High Risk",
      description: "We recommend seeking professional help soon",
    },
  };

  const config = configs[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: "px-3 py-1.5 text-xs",
      icon: "w-3 h-3",
    },
    md: {
      container: "px-4 py-2 text-sm",
      icon: "w-4 h-4",
    },
    lg: {
      container: "px-6 py-3 text-base",
      icon: "w-5 h-5",
    },
  };

  if (showDescription) {
    return (
      <div className={`${config.bg} border-2 ${config.border} rounded-xl p-6`}>
        <div className="flex items-start gap-4">
          <div className={config.text}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-bold ${config.text} text-xl mb-1`}>
              {config.title}
            </h3>
            <p className={`${config.text}`}>{config.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 ${config.bg} ${config.text} border ${config.border} rounded-full font-semibold ${sizeClasses[size].container}`}
    >
      <Icon className={sizeClasses[size].icon} />
      {config.title}
    </span>
  );
}
