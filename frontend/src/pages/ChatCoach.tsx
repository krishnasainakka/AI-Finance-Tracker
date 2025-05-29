import React, { useState, useEffect, useRef, FormEvent } from "react";
import { useUser } from "@clerk/clerk-react";
import ReactMarkdown from 'react-markdown';

interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
}

const ChatCoach: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = user.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input.trim() };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, userId }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        const botMessage: Message = { role: "assistant", content: data.reply };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Error receiving reply" },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-indigo-100 to-white">
      <header className="bg-indigo-700 text-white text-xl font-bold px-6 py-4 shadow-md">
        💸 Budgeting Coach Chatbot
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 mt-10 text-lg">
              Start the conversation below 👇
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl shadow-md ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                }`}
              >
                <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-100">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <form
        onSubmit={sendMessage}
        className="w-full border-t border-gray-200 p-4 bg-white flex gap-2"
      >
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ask me about budgeting, saving, or finance..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatCoach;
