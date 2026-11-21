"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/* ---------- Types ---------- */

export type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  /** Highlighted name of the thing being acted on, e.g. the patient's name. */
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  /** Runs when the user confirms. The dialog shows a spinner until it settles,
   *  closes on success, and shows the error message if it throws. */
  onConfirm: () => Promise<unknown> | unknown;
};

/* ---------- Hook ---------- */

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback((o: ConfirmOptions) => {
    setError(null);
    setOptions(o);
  }, []);

  const close = useCallback(() => {
    if (!busy) setOptions(null);
  }, [busy]);

  const run = useCallback(async () => {
    if (!options) return;
    setBusy(true);
    setError(null);
    try {
      await options.onConfirm();
      setOptions(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [options]);

  const dialog = options ? (
    <ConfirmDialog options={options} busy={busy} error={error} onCancel={close} onConfirm={run} />
  ) : null;

  return { ask, dialog };
}

/* ---------- Dialog ---------- */

function ConfirmDialog({
  options,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  options: ConfirmOptions;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const {
    title,
    description,
    itemName,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "danger",
  } = options;
  const danger = tone === "danger";
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Escape closes (unless busy), lock scroll, focus the safe action first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <style>{`
        @keyframes cd-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cd-pop { from { opacity: 0; transform: translateY(20px) scale(.97) } to { opacity: 1; transform: none } }
        @keyframes cd-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }
        .cd-fade { animation: cd-fade .2s ease-out both }
        .cd-pop { animation: cd-pop .25s cubic-bezier(.16,1,.3,1) both }
        .cd-shake { animation: cd-shake .3s ease-in-out }
        @media (prefers-reduced-motion: reduce) { .cd-fade, .cd-pop, .cd-shake { animation: none } }
      `}</style>

      <div className="cd-fade absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onCancel} aria-hidden />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="cd-pop relative w-full overflow-hidden rounded-t-3xl bg-white p-6 shadow-2xl shadow-slate-900/20 sm:max-w-md sm:rounded-3xl sm:p-8"
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ring-8 ${
              danger ? "bg-red-50 text-red-600 ring-red-50/60" : "bg-teal-50 text-teal-600 ring-teal-50/60"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {danger ? (
                <>
                  <path d="M4 7h16M10 11v6M14 11v6" />
                  <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4.5M12 16h.01" />
                </>
              )}
            </svg>
          </span>

          <h2 id="confirm-title" className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>

          {itemName && (
            <span className="mt-3 inline-flex max-w-full items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              <span className="truncate">{itemName}</span>
            </span>
          )}

          {description && (
            <p id="confirm-desc" className="mt-3 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          )}
        </div>

        {error && (
          <div
            key={error}
            role="alert"
            className="cd-shake mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700"
          >
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5M12 16.5h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60 sm:min-w-32"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-32 ${
              danger
                ? "bg-gradient-to-r from-red-600 to-rose-600 shadow-red-600/25 hover:from-red-700 hover:to-rose-700 focus-visible:ring-red-500/40"
                : "bg-gradient-to-r from-teal-600 to-cyan-700 shadow-teal-600/25 hover:from-teal-700 hover:to-cyan-800 focus-visible:ring-teal-500/40"
            }`}
          >
            {busy ? (
              <>
                <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" aria-hidden>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
                  <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Working…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}