import { useState } from "react";
import { FiMessageCircle, FiX } from "react-icons/fi";
import AIChat from "./AIChat";

export default function FloatingAIChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl border z-50 flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-500 text-white">
            <span className="font-semibold">AI Assistant</span>
            <button onClick={() => setOpen(false)}>
              <FiX />
            </button>
          </div>

          {/* CHAT COMPONENT */}
          <div className="flex-1 flex flex-col overflow-hidden">
  <AIChat />
</div>

        </div>
      )}

      {/* FLOATING BUTTON */}
      {/* <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition z-50"
      >
        <FiMessageCircle size={24} />
      </button> */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
  
  {!open && (
    <div className="bg-white px-3 py-1.5 rounded-full shadow text-sm text-gray-700 animate-bounce">
      Hỏi AI ngay
    </div>
  )}

  <button
    onClick={() => setOpen(!open)}
    className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
  >
    💬
  </button>
</div>
    </>
  );
}
