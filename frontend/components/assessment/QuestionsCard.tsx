import { CheckCircle2, Circle } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number;
  questionText: string;
  responseType: "single_choice" | "text";
  options?: string[];
  value: string;
  onChange: (value: string) => void;
  questionType?: "static" | "dynamic";
}

export default function QuestionCard({
  questionNumber,
  questionText,
  responseType,
  options,
  value,
  onChange,
  questionType = "static",
}: QuestionCardProps) {
  const badgeColor =
    questionType === "static"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
      <div className="mb-6">
        <span
          className={`inline-block px-3 py-1 ${badgeColor} rounded-full text-xs font-semibold mb-4`}
        >
          {questionType === "static"
            ? `Question ${questionNumber}`
            : `Follow-up ${questionNumber}`}
        </span>
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          {questionText}
        </h2>

        {/* Single Choice Options */}
        {responseType === "single_choice" && options && (
          <div className="space-y-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => onChange(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  value === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {value === option ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="text-slate-700">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Text Response */}
        {responseType === "text" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors resize-none"
          />
        )}
      </div>
    </div>
  );
}
