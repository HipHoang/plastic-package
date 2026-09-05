import React from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthModal = ({ type = "login", onClose, onSwitchType }) => {
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/45 px-4 py-6 overflow-y-auto">
      <div className="relative w-full max-w-130 max-h-[90vh] rounded-[28px] bg-white shadow-2xl overflow-y-auto">
        {/* nền nhạt */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-slate-50 "></div>

        <div className="relative z-10 p-6 md:p-8">
          {/* top */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-[#002B5B] transition"
            >
              ← Quay lại
            </button>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-gray-500 hover:bg-slate-200 hover:text-[#002B5B] transition"
            >
              ×
            </button>
          </div>

          {/* logo */}
          <div className="mb-5 flex justify-center">
            <div className="rounded-2xl bg-[#002B5B] px-4 py-2 text-white shadow-md">
              <span className="text-2xl font-extrabold tracking-wide">OU</span>
            </div>
          </div>
          {type === "login" ? (
            <LoginForm onSwitchType={onSwitchType} />
          ) : (
            <RegisterForm onSwitchType={onSwitchType} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;