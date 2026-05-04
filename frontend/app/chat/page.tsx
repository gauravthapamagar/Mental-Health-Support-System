"use client";
import { useState } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.response }]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pt-24 h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${
              msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
            }`}>
              {msg.role === "bot" ? <Bot size={20} /> : <User size={20} />}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && <Loader2 className="animate-spin text-blue-600 mx-auto" />}
      </div>

      <div className="flex gap-2 bg-white p-2 border rounded-2xl shadow-sm">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Talk to me..."
          className="flex-1 px-4 py-2 outline-none"
        />
        <button onClick={sendMessage} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}