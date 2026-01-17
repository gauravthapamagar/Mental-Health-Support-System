interface Conversation {
  id: string;
  therapist: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold">Messages</h2>
        <p className="text-sm text-gray-600 mt-1">
          {conversations.length} conversations
        </p>
      </div>

      <div className="overflow-y-auto flex-1">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 text-left transition-colors ${
              activeId === conv.id
                ? "bg-blue-50 border-l-4 border-l-blue-600"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="font-bold text-white">{conv.avatar}</span>
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold truncate">{conv.therapist}</div>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      {conv.unread}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {conv.lastMessage}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 ml-15">{conv.timestamp}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
