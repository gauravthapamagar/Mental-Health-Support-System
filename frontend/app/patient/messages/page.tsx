"use client";

import { useState } from "react";
import {
  Send,
  Paperclip,
  Video,
  Phone,
  MoreVertical,
  Image as ImageIcon,
} from "lucide-react";
import ConversationList from "@/components/patient/messages/ConversationList";
import MessageBubble from "@/components/patient/messages/MessageBubble";

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState("1");
  const [messageInput, setMessageInput] = useState("");

  const conversations = [
    {
      id: "1",
      therapist: "Dr. Sarah Johnson",
      avatar: "SJ",
      lastMessage: "Looking forward to our session tomorrow!",
      timestamp: "2 hours ago",
      unread: 1,
      online: true,
    },
    {
      id: "2",
      therapist: "Counsellor David Chen",
      avatar: "DC",
      lastMessage: "Great progress on your mindfulness practice",
      timestamp: "1 day ago",
      unread: 0,
      online: false,
    },
  ];

  const messages = [
    {
      id: "1",
      sender: "therapist" as const,
      content: "Hi! How have you been feeling since our last session?",
      timestamp: "10:30 AM",
      read: true,
    },
    {
      id: "2",
      sender: "user" as const,
      content: "Much better! The breathing exercises have been really helpful.",
      timestamp: "10:45 AM",
      read: true,
    },
    {
      id: "3",
      sender: "therapist" as const,
      content:
        "That's wonderful to hear! Keep practicing them daily. Looking forward to our session tomorrow!",
      timestamp: "11:00 AM",
      read: false,
    },
  ];

  const activeConv = conversations.find((c) => c.id === activeConversation);

  const handleSend = () => {
    if (messageInput.trim()) {
      // Handle send message
      console.log("Sending:", messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <ConversationList
        conversations={conversations}
        activeId={activeConversation}
        onSelect={setActiveConversation}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">
                  {activeConv?.avatar}
                </span>
              </div>
              {activeConv?.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <div className="font-bold">{activeConv?.therapist}</div>
              <div className="text-xs text-green-600">
                {activeConv?.online ? "Online" : "Offline"}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voice call"
            >
              <Phone size={20} className="text-gray-700" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Video call"
            >
              <Video size={20} className="text-gray-700" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="More options"
            >
              <MoreVertical size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-1"
              title="Attach file"
            >
              <Paperclip size={20} className="text-gray-700" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-1"
              title="Send image"
            >
              <ImageIcon size={20} className="text-gray-700" />
            </button>
            <div className="flex-1">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!messageInput.trim()}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-1"
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
