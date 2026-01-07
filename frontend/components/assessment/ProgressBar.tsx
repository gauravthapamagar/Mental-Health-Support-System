interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({
  current,
  total,
  label,
}: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
        <span>{label || `Question ${current} of ${total}`}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
