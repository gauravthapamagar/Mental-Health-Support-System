import { Smile, Meh, Frown, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface JournalEntryProps {
  id: string;
  date: string;
  mood: "positive" | "neutral" | "negative";
  content: string;
  trigger?: string;
  reframe?: string;
}

export default function JournalEntry({
  id,
  date,
  mood,
  content,
  trigger,
  reframe,
}: JournalEntryProps) {
  const [showMenu, setShowMenu] = useState(false);

  const MoodIcon =
    mood === "positive" ? Smile : mood === "neutral" ? Meh : Frown;
  const moodColor =
    mood === "positive"
      ? "text-green-600"
      : mood === "neutral"
        ? "text-yellow-600"
        : "text-red-600";
  const moodLabel =
    mood === "positive"
      ? "Positive"
      : mood === "neutral"
        ? "Neutral"
        : "Negative";

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <MoodIcon className={moodColor} size={24} />
          <div>
            <div className="font-bold">{date}</div>
            <div className="text-sm text-gray-600 capitalize">
              {moodLabel} Mood
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                <Edit size={16} />
                Edit Entry
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600">
                <Trash2 size={16} />
                Delete Entry
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{content}</p>

      {trigger && (
        <div className="mb-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm font-bold text-red-900 mb-1">
            Trigger Identified:
          </div>
          <div className="text-sm text-red-700">{trigger}</div>
        </div>
      )}

      {reframe && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm font-bold text-green-900 mb-1">
            Reframed Thought:
          </div>
          <div className="text-sm text-green-700">{reframe}</div>
        </div>
      )}
    </div>
  );
}
