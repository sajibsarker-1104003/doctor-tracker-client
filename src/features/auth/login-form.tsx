"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";

/* ---------- Inline icons (no extra dependencies) ---------- */

type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const MailIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 8 8 6 8-6" />
  </svg>
);

const LockIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="4" y="10" width="16" height="10" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const EyeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A10.5 10.5 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.9" />
    <path d="M6.3 6.8C3.6 8.6 2 12 2 12s3.6 6 10 6c1.5 0 2.8-.3 4-.8" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

const ShieldIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 3 5 6v5.5c0 4.4 2.9 8.2 7 9.5 4.1-1.3 7-5.1 7-9.5V6l-7-3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
);

const AlertIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5" />
    <path d="M12 16.5h.01" />
  </svg>
);

const PulseIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2.2}>
    <path d="M3 12h4l2-6 4 12 2-6h6" />
  </svg>
);

const Spinner = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" aria-hidden>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ---------- Brand panel ---------- */

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-950 text-white lg:flex lg:w-[46%] xl:w-1/2">
      {/* soft glow blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-cyan-300/20 blur-3xl" />
      {/* subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
            <PulseIcon className="h-6 w-6" />
          </span>
          <span className="text-xl font-semibold tracking-tight">MediCare Portal</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Care that starts with <span className="text-emerald-300">clarity.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-teal-50/80">
            One secure workspace for patient records, appointments and care teams, so clinicians
            spend less time on admin and more time with patients.
          </p>

          {/* ECG line */}
          <svg viewBox="0 0 400 80" className="mt-10 h-20 w-full text-emerald-300" aria-hidden>
            <path
              className="ecg-line"
              d="M0 40h90l12-26 16 52 16-62 14 36h32l10-14 10 14h200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <ul className="grid grid-cols-3 gap-4 text-sm">
          {[
            ["256-bit", "Encrypted sessions"],
            ["24/7", "Secure access"],
            ["Role-based", "Access control"],
          ].map(([title, sub]) => (
            <li key={title} className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
              <p className="text-base font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-teal-50/75">{sub}</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* ---------- Login form ---------- */

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      // login() sets window.location.href — navigation happens here.
      // If we reach the catch, login threw.
    } catch (err) {
      console.error("[login-form] error", err);
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  const inputClass =
    "peer block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-[15px] text-slate-900 " +
    "placeholder:text-slate-400 transition focus:border-teal-500 focus:bg-white focus:outline-none " +
    "focus:ring-4 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:opacity-60";

  const iconClass =
    "pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition peer-focus:text-teal-600";

  return (
    <div className="flex min-h-screen bg-white">
      <style>{`
        @keyframes ecg-draw { 0% { stroke-dashoffset: 700; } 70%, 100% { stroke-dashoffset: 0; } }
        .ecg-line { stroke-dasharray: 700; animation: ecg-draw 3.2s ease-in-out infinite; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .fade-up { animation: fade-up .6s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .ecg-line, .fade-up { animation: none; } }
      `}</style>

      <BrandPanel />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white px-5 py-10 sm:px-8 lg:bg-none lg:bg-white">
        {/* mobile-only decorative glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-300/30 blur-3xl lg:hidden" />

        <div className="fade-up relative w-full max-w-md">
          {/* mobile / tablet brand */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 text-white shadow-lg shadow-teal-600/30">
              <PulseIcon className="h-6 w-6" />
            </span>
            <span className="text-xl font-semibold tracking-tight text-slate-900">MediCare Portal</span>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-9 lg:border-0 lg:p-0 lg:shadow-none">
            <header className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to access your clinical dashboard.
              </p>
            </header>

            <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
                  Work email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    required
                    className={inputClass}
                  />
                  <MailIcon className={iconClass} />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm font-medium text-teal-700 hover:text-teal-800 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                    onBlur={() => setCapsLock(false)}
                    disabled={submitting}
                    required
                    className={`${inputClass} pr-12`}
                  />
                  <LockIcon className={iconClass} />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {capsLock && (
                  <p className="mt-1.5 text-xs font-medium text-amber-600">Caps Lock is on</p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 px-4 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-700 hover:to-cyan-800 hover:shadow-teal-700/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Spinner />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign in securely</span>
                )}
              </button>
            </form>

            {/* Trust note */}
            <div className="mt-7 flex items-start gap-3 rounded-xl bg-teal-50/70 px-4 py-3 text-xs leading-relaxed text-teal-900/80 ring-1 ring-teal-100">
              <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
              <p>
                Your connection is encrypted. Patient information is protected and access is
                logged. Never share your credentials.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Need access? Contact your system administrator.
          </p>
        </div>
      </main>
    </div>
  );
}