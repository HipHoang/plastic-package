import React from "react";
import { FiAlertTriangle, FiInbox, FiRefreshCw } from "react-icons/fi";

export function LoadingState({ message }) {
  return (
    <div className="flex min-h-75 flex-col items-center justify-center gap-3 rounded-xl bg-white shadow-sm">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <FiAlertTriangle size={17} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          <FiRefreshCw size={14} />
          Thử lại
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-75 flex-col items-center justify-center rounded-xl bg-white px-6 text-center shadow-sm">
      <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
        <FiInbox size={28} />
      </div>

      <h3 className="font-semibold text-slate-700">{title}</h3>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default {
  LoadingState,
  ErrorBanner,
  EmptyState,
};
