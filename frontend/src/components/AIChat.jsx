import { useEffect, useRef, useState } from "react";
import apiClient from "../untils/auth";
import { getCurrentUser, getCurrentUserId } from "../untils/auth";
import {
  saveMessageToFirestore,
  subscribeToMessages,
} from "../services/firebaseChatService";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);
  const user = getCurrentUser();
  const userId = getCurrentUserId();
  const conversationId = userId ? `ai-chat-${userId}` : "ai-chat-guest";
  const userRole = user?.role === "GiangVien" || user?.role === "GV" ? "teacher" : "student";

  // Subscribe to Firestore realtime messages (single source of truth)
  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, (firestoreMsgs) => {
      const formatted = firestoreMsgs.map((m) => ({
        role: m.role === "ai" ? "ai" : "user",
        text: m.text,
        id: m.id,
        senderId: m.senderId,
      }));
      setMessages(formatted);
    });
    return () => unsubscribe();
  }, [conversationId]);

  // Auto scroll
  const isNearBottom = () => {
    const el = chatRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    if (isNearBottom()) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: messages.length < 2 ? "auto" : "smooth",
      });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();
    setInput("");
    setLoading(true);

    // Save user message to Firestore (onSnapshot will update UI)
    try {
      await saveMessageToFirestore(conversationId, {
        senderId: userId || "guest",
        role: userRole,
        text: text,
      });
    } catch (err) {
      console.error("Firestore save error:", err);
    }

    try {
      const res = await apiClient.post("/ai/chat", {
        message: text,
      });

      const reply =
        res?.data?.reply ||
        res?.data?.data?.reply ||
        "No response from AI";

      // Save AI reply to Firestore (onSnapshot will update UI)
      try {
        await saveMessageToFirestore(conversationId, {
          senderId: "ai",
          role: "ai",
          text: reply,
          createdAt: new Date()
        });
      } catch (err) {
        console.error("Firestore AI save error:", err);
      }
    } catch (err) {
      console.error(err);
      const errorText = "Lỗi khi gọi AI API.";
      try {
        await saveMessageToFirestore(conversationId, {
          senderId: "ai",
          role: "ai",
          text: errorText,
        });
      } catch (saveErr) {
        console.error("Firestore error save error:", saveErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* HEADER */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          AI
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">AI Assistant</h2>
          <p className="text-sm text-gray-400">
            Hỗ trợ học tập & gợi ý khóa học
          </p>
        </div>
      </div>

      {/* CHAT BODY */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            Hãy hỏi AI bất cứ điều gì 🚀
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id || `${m.role}-${m.text}`}
            className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            {/* Avatar AI */}
            {m.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                AI
              </div>
            )}

            {/* Message */}
            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] text-[15px] leading-6 ${m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white border rounded-bl-none"
                }`}
            >
              {m.text}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 px-1">
              {formatTime(m.createdAt)}
            </span>

            {/* Avatar user */}
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                U
              </div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <div className="bg-white border px-4 py-2 rounded-2xl text-sm text-gray-400 animate-pulse">
              Đang trả lời...
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-3 border-t bg-white flex items-center gap-2">
        <input
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

