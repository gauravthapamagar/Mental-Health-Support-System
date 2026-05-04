interface Message {
  id: string;
  sender: "user" | "therapist";
  content: string;
  timestamp: string;
  read: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-md px-4 py-3 rounded-2xl ${
          message.sender === "user"
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div
          className={`text-xs mt-2 ${
            message.sender === "user" ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {message.timestamp}
          {message.sender === "user" && (
            <span className="ml-1">{message.read ? "✓✓" : "✓"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
