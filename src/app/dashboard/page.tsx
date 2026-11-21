"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useConditions,
  useDashboardSummary,
  usePatientsPerDoctor,
  useSpecializations,
  useTimeline,
} from "@/features/dashboard/use-dashboard";

/* ---------- Palette ---------- */

const COLORS = ["#0d9488", "#06b6d4", "#10b981", "#6366f1", "#f59e0b", "#f43f5e"];
const AXIS = "#94a3b8";
const GRID = "#e2e8f0";
const RANGES = [7, 30, 90] as const;

/* ---------- Helpers ---------- */

function asArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === "object" && Array.isArray((v as { data?: unknown }).data)) {
    return (v as { data: T[] }).data;
  }
  return [];
}

function shortDate(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function truncate(v: string, n = 14) {
  return v && v.length > n ? `${v.slice(0, n - 1)}…` : v;
}

const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);

/** Compare the second half of a series with the first half. */
function halfTrend(series: number[]) {
  if (series.length < 4) return null;
  const half = Math.floor(series.length / 2);
  const prev = sum(series.slice(0, half));
  const cur = sum(series.slice(series.length - half));
  const pct = prev === 0 ? (cur === 0 ? 0 : null) : ((cur - prev) / prev) * 100;
  return { pct, prev, cur, half };
}

/** Animated count-up (respects reduced motion). */
function useCountUp(target: number | null, duration = 900) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (target == null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const val = a + (target - a) * e;
      setV(val);
      from.current = val;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/* ---------- Icons ---------- */

type IconProps = { className?: string };
const ico = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const StethoscopeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M10 13v1a5 5 0 0 0 10 0v-2" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);
const UsersIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
    <path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
  </svg>
);
const RatioIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M4 20 20 4" />
    <circle cx="7" cy="7" r="2.5" />
    <circle cx="17" cy="17" r="2.5" />
  </svg>
);
const UserPlusIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <circle cx="10" cy="8" r="3.5" />
    <path d="M3 20a7 7 0 0 1 14 0" />
    <path d="M19 8v6M16 11h6" />
  </svg>
);
const AlertIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5M12 16.5h.01" />
  </svg>
);
const InboxIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M4 13h4l1.5 3h5L16 13h4" />
    <path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2.5-8Z" />
  </svg>
);
const SparkleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
  </svg>
);
const RefreshIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4" />
  </svg>
);
const ArrowIcon = ({ className, down }: IconProps & { down?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} {...ico} strokeWidth={2.4}>
    {down ? <path d="M7 7l10 10M17 9v8H9" /> : <path d="M7 17 17 7M9 7h8v8" />}
  </svg>
);

/* ---------- UI building blocks ---------- */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />;
}

const TONES = {
  teal: { grad: "from-teal-500 to-teal-700 shadow-teal-600/25", spark: "#0d9488" },
  cyan: { grad: "from-cyan-500 to-sky-600 shadow-cyan-600/25", spark: "#0891b2" },
  emerald: { grad: "from-emerald-500 to-emerald-700 shadow-emerald-600/25", spark: "#059669" },
  indigo: { grad: "from-indigo-500 to-violet-600 shadow-indigo-600/25", spark: "#6366f1" },
} as const;

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const id = useId().replace(/:/g, "");
  if (data.length < 2) return null;
  const w = 96;
  const h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 3 - ((v - min) / rng) * (h - 6)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-24" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${line} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeltaBadge({ pct, title }: { pct: number | null; title: string }) {
  if (pct === null) return null;
  const up = pct > 0;
  const flat = Math.abs(pct) < 0.5;
  const cls = flat
    ? "bg-slate-100 text-slate-600"
    : up
      ? "bg-emerald-50 text-emerald-700"
      : "bg-rose-50 text-rose-700";
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {!flat && <ArrowIcon className="h-3 w-3" down={!up} />}
      {flat ? "0%" : `${Math.abs(pct).toFixed(0)}%`}
    </span>
  );
}

function StatCard({
  label,
  value,
  decimals = 0,
  hint,
  icon,
  tone,
  loading,
  pct,
  pctTitle = "",
  spark,
}: {
  label: string;
  value: number | null;
  decimals?: number;
  hint?: string;
  icon: ReactNode;
  tone: keyof typeof TONES;
  loading?: boolean;
  pct?: number | null;
  pctTitle?: string;
  spark?: number[];
}) {
  const animated = useCountUp(value);
  const text =
    value == null
      ? "—"
      : decimals
        ? animated.toFixed(decimals)
        : Math.round(animated).toLocaleString();

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-[0.08] transition group-hover:opacity-[0.14] ${TONES[tone].grad}`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-20" />
          ) : (
            <div className="mt-2 flex items-center gap-2.5">
              <p className="truncate text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                {text}
              </p>
              {pct !== undefined && <DeltaBadge pct={pct} title={pctTitle} />}
            </div>
          )}
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${TONES[tone].grad}`}
        >
          {icon}
        </span>
      </div>
      {!loading && spark && spark.length > 1 && (
        <div className="mt-3 -mb-1">
          <Sparkline data={spark} color={TONES[tone].spark} />
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  className = "",
  action,
  loading,
  error,
  empty,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  action?: ReactNode;
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/6" />
          <Skeleton className="h-5 w-3/6" />
          <Skeleton className="h-5 w-2/6" />
        </div>
      ) : error ? (
        <div className="flex h-52 flex-col items-center justify-center gap-2 text-center text-sm text-red-600">
          <AlertIcon className="h-7 w-7" />
          Couldn&apos;t load this data.
        </div>
      ) : empty ? (
        <div className="flex h-52 flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
          <InboxIcon className="h-8 w-8" />
          No data to display yet.
        </div>
      ) : (
        children
      )}
    </section>
  );
}

type TipProps = {
  active?: boolean;
  payload?: Array<{ value?: number | string; name?: string; color?: string; stroke?: string }>;
  label?: string | number;
  labelFormatter?: (v: string) => string;
  unit?: string;
};

function ChartTooltip({ active, payload, label, labelFormatter, unit = "" }: TipProps) {
  if (!active || !payload?.length) return null;
  const title = label !== undefined ? (labelFormatter ? labelFormatter(String(label)) : String(label)) : "";
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {title && <p className="font-medium text-slate-700">{title}</p>}
      {payload
        .filter((p) => p.value !== null && p.value !== undefined)
        .map((p, i) => (
          <p key={i} className="mt-0.5 flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? p.stroke }} />
            <span className="font-semibold text-slate-900">
              {typeof p.value === "number" ? Number(p.value.toFixed(1)) : p.value}
            </span>
            {p.name && p.name !== "count" ? p.name : unit}
          </p>
        ))}
    </div>
  );
}

/* Horizontal bars handle long names far better on small screens. */
function HBarChart({
  rows,
  nameKey,
  color,
  unit,
  colorFor,
}: {
  rows: Record<string, unknown>[];
  nameKey: string;
  color: string;
  unit: string;
  colorFor?: (row: Record<string, unknown>) => string;
}) {
  const height = Math.max(220, rows.length * 40 + 20);
  return (
    <div className="w-full" style={{ height, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={GRID} strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey={nameKey}
            width={96}
            tick={{ fontSize: 12, fill: "#475569" }}
            tickFormatter={(v: string) => truncate(v, 14)}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: "#f1f5f9" }} content={<ChartTooltip unit={unit} />} />
          <Bar dataKey="count" fill={color} radius={[0, 8, 8, 0]} barSize={18}>
            {colorFor && rows.map((r, i) => <Cell key={i} fill={colorFor(r)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- Insights ---------- */

type Insight = { tone: "good" | "warn" | "info"; title: string; text: string };

const INSIGHT_STYLES = {
  good: "border-emerald-200 bg-emerald-50/60 text-emerald-700",
  warn: "border-amber-200 bg-amber-50/70 text-amber-700",
  info: "border-teal-200 bg-teal-50/60 text-teal-700",
} as const;

function InsightCard({ i }: { i: Insight }) {
  return (
    <div className={`rounded-2xl border p-4 ${INSIGHT_STYLES[i.tone]}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
        <SparkleIcon className="h-4 w-4" />
        {i.title}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{i.text}</p>
    </div>
  );
}

/* ---------- Page ---------- */

export default function DashboardPage() {
  // Client-only date range. Starts empty so SSR/prerender doesn't see new Date().
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [activeCond, setActiveCond] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    setRange({ from: start.toISOString().slice(0, 10), to });
  }, [days]);

  const summary = useDashboardSummary();
  const perDoctor = usePatientsPerDoctor(8);
  const timeline = useTimeline("day", range?.from ?? "", range?.to ?? "");
  const conditions = useConditions();
  const specializations = useSpecializations();

  // Normalize every list-shaped response into a real array.
  const perDoctorRows = asArray<{ doctorName: string; count: number }>(perDoctor.data);
  const timelineRows = asArray<{ bucket: string; patients: number; doctors: number }>(timeline.data);
  const conditionRows = asArray<{ condition: string; count: number }>(conditions.data);
  const specializationRows = asArray<{ specialization: string; count: number }>(specializations.data);

  if (summary.isError) console.error("[dashboard] summary", summary.error);
  if (perDoctor.isError) console.error("[dashboard] perDoctor", perDoctor.error);
  if (timeline.isError) console.error("[dashboard] timeline", timeline.error);
  if (conditions.isError) console.error("[dashboard] conditions", conditions.error);
  if (specializations.isError) console.error("[dashboard] specializations", specializations.error);

  const queries = [summary, perDoctor, timeline, conditions, specializations];
  const anyError = queries.some((q) => q.isError);
  const isFetching = queries.some((q) => q.isFetching);
  const updatedAt = Math.max(...queries.map((q) => q.dataUpdatedAt ?? 0));
  const refreshAll = () => queries.forEach((q) => q.refetch());

  /* ----- Derived data ----- */

  const conditionTotal = sum(conditionRows.map((r) => Number(r.count) || 0));
  const avgLoad = summary.data?.avgPatientsPerDoctor ?? 0;

  const newPatients = timelineRows.map((r) => Number(r.patients) || 0);
  const newDoctors = timelineRows.map((r) => Number(r.doctors) || 0);
  const trend = halfTrend(newPatients);

  const totalPatients: number | null = summary.data?.totalPatients ?? null;
  const totalDoctors: number | null = summary.data?.totalDoctors ?? null;

  // Running totals that end at today's real total (so the sparkline is truthful).
  function runningTotal(total: number | null, series: number[]) {
    if (total == null || series.length < 2) return [];
    let run = total - sum(series);
    return series.map((n) => (run += n));
  }
  const patientsSpark = runningTotal(totalPatients, newPatients);
  const doctorsSpark = newDoctors.some((n) => n > 0) ? runningTotal(totalDoctors, newDoctors) : [];

  const windowNew = sum(newPatients);
  const growthBase = totalPatients != null ? totalPatients - windowNew : 0;
  const growthPct = totalPatients != null && growthBase > 0 ? (windowNew / growthBase) * 100 : null;

  // 7-point moving average for the timeline.
  const chartRows = timelineRows.map((r, i) => ({
    ...r,
    average: i >= 6 ? sum(newPatients.slice(i - 6, i + 1)) / 7 : null,
  }));

  // Workload colouring relative to the average.
  const loadColor = (row: Record<string, unknown>) => {
    const c = Number(row.count) || 0;
    if (avgLoad > 0 && c >= avgLoad * 1.5) return "#f43f5e";
    if (avgLoad > 0 && c >= avgLoad * 1.2) return "#f59e0b";
    return "#0d9488";
  };

  // Smart insights, generated from the data on screen.
  const insights: Insight[] = [];

  if (trend && newPatients.length >= 4) {
    if (trend.pct === null) {
      insights.push({
        tone: "good",
        title: "Intake",
        text: `${trend.cur} new patients in the last ${trend.half} days, after none in the ${trend.half} days before.`,
      });
    } else if (Math.abs(trend.pct) < 0.5) {
      insights.push({
        tone: "info",
        title: "Intake",
        text: `New patient intake is steady: ${trend.cur} in the last ${trend.half} days, same as the period before.`,
      });
    } else {
      const up = trend.pct > 0;
      insights.push({
        tone: up ? "good" : "warn",
        title: "Intake trend",
        text: `${Math.abs(trend.pct).toFixed(0)}% ${up ? "more" : "fewer"} new patients than the previous ${trend.half} days (${trend.cur} vs ${trend.prev}).`,
      });
    }
  }

  const topCondition = [...conditionRows].sort((a, b) => b.count - a.count)[0];
  if (topCondition && conditionTotal > 0) {
    insights.push({
      tone: "info",
      title: "Top condition",
      text: `${topCondition.condition} is the most common condition, affecting ${Math.round(
        (topCondition.count / conditionTotal) * 100
      )}% of patients (${topCondition.count}).`,
    });
  }

  const topDoctor = [...perDoctorRows].sort((a, b) => b.count - a.count)[0];
  if (topDoctor && avgLoad > 0) {
    const ratio = topDoctor.count / avgLoad;
    insights.push(
      ratio >= 1.5
        ? {
            tone: "warn",
            title: "Workload alert",
            text: `${topDoctor.doctorName} has ${topDoctor.count} patients, ${ratio.toFixed(1)}× the average of ${avgLoad.toFixed(1)}. Consider rebalancing.`,
          }
        : {
            tone: "good",
            title: "Balanced workload",
            text: `The busiest doctor, ${topDoctor.doctorName}, has ${topDoctor.count} patients (${ratio.toFixed(1)}× the average of ${avgLoad.toFixed(1)}).`,
          }
    );
  }

  const peak = timelineRows.reduce<{ bucket: string; n: number } | null>(
    (best, r) => ((Number(r.patients) || 0) > (best?.n ?? 0) ? { bucket: r.bucket, n: Number(r.patients) } : best),
    null
  );
  if (peak && peak.n > 0) {
    insights.push({
      tone: "info",
      title: "Busiest day",
      text: `${shortDate(peak.bucket)} was the busiest day with ${peak.n} new ${peak.n === 1 ? "patient" : "patients"}.`,
    });
  }

  const thin = specializationRows.filter((s) => s.count === 1);
  if (specializationRows.length > 1 && thin.length > 0) {
    const names = thin.slice(0, 2).map((s) => s.specialization).join(" and ");
    insights.push({
      tone: "warn",
      title: "Thin coverage",
      text: `${names} ${thin.length === 1 ? "has" : "have"} only one doctor${thin.length > 2 ? ` (and ${thin.length - 2} more)` : ""}.`,
    });
  }

  const insightsLoading = summary.isLoading || timeline.isLoading || conditions.isLoading;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 p-6 text-white shadow-lg shadow-teal-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-100/80">
              Clinical overview
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-1.5 max-w-md text-sm text-teal-50/80">
              Care team capacity, patient intake and condition trends at a glance.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Range switcher */}
            <div
              role="radiogroup"
              aria-label="Date range"
              className="inline-flex w-fit rounded-xl bg-white/15 p-1 ring-1 ring-white/25 backdrop-blur"
            >
              {RANGES.map((d) => (
                <button
                  key={d}
                  role="radio"
                  aria-checked={days === d}
                  onClick={() => setDays(d)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                    days === d ? "bg-white text-teal-800 shadow-sm" : "text-white/80 hover:text-white"
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>

            <button
              onClick={refreshAll}
              disabled={isFetching}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-medium ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-80"
            >
              <RefreshIcon className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Refreshing…" : "Refresh"}
              {!isFetching && updatedAt > 0 && (
                <span className="hidden text-xs text-teal-100/80 sm:inline">
                  · {new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {anyError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          Some dashboard data failed to load. Try refreshing.
        </div>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Doctors"
          value={totalDoctors}
          icon={<StethoscopeIcon className="h-5 w-5" />}
          tone="teal"
          loading={summary.isLoading}
          spark={doctorsSpark}
        />
        <StatCard
          label="Total Patients"
          value={totalPatients}
          icon={<UsersIcon className="h-5 w-5" />}
          tone="cyan"
          loading={summary.isLoading}
          pct={growthPct}
          pctTitle={`Growth over the last ${days} days`}
          spark={patientsSpark}
        />
        <StatCard
          label="Avg Patients / Doctor"
          value={summary.data?.avgPatientsPerDoctor ?? null}
          decimals={1}
          icon={<RatioIcon className="h-5 w-5" />}
          tone="indigo"
          loading={summary.isLoading}
        />
        <StatCard
          label="New Patients"
          value={summary.data?.newPatientsLast30Days ?? null}
          hint="Last 30 days"
          icon={<UserPlusIcon className="h-5 w-5" />}
          tone="emerald"
          loading={summary.isLoading}
          pct={trend ? trend.pct : undefined}
          pctTitle={trend ? `vs previous ${trend.half} days` : ""}
          spark={newPatients}
        />
      </section>

      {/* Smart insights */}
      <section aria-labelledby="insights-title">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 id="insights-title" className="text-base font-semibold text-slate-900">
              Smart insights
            </h2>
            <p className="text-xs text-slate-500">Generated automatically from your latest data</p>
          </div>
        </div>

        {insightsLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((k) => (
              <Skeleton key={k} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
            Insights will appear once there is enough data.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {insights.map((i) => (
              <InsightCard key={i.title} i={i} />
            ))}
          </div>
        )}
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <ChartCard
          title="Top Doctors by Patients"
          subtitle="Colour shows load compared with the average"
          loading={perDoctor.isLoading}
          error={perDoctor.isError}
          empty={perDoctorRows.length === 0}
        >
          <HBarChart
            rows={perDoctorRows}
            nameKey="doctorName"
            color="#0d9488"
            unit="patients"
            colorFor={loadColor}
          />
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Normal
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> 1.2× avg or more
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> 1.5× avg or more
            </li>
          </ul>
        </ChartCard>

        <ChartCard
          title="Conditions"
          subtitle="Hover a slice or a row to focus it"
          loading={conditions.isLoading}
          error={conditions.isError}
          empty={conditionRows.length === 0}
        >
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
            <div className="relative h-52 w-52 shrink-0" style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionRows}
                    dataKey="count"
                    nameKey="condition"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={2}
                    cornerRadius={6}
                    stroke="none"
                    onMouseEnter={(_, i) => setActiveCond(i)}
                    onMouseLeave={() => setActiveCond(null)}
                  >
                    {conditionRows.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        fillOpacity={activeCond === null || activeCond === i ? 1 : 0.3}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <span className="text-2xl font-semibold tabular-nums text-slate-900">
                  {activeCond !== null ? conditionRows[activeCond]?.count : conditionTotal}
                </span>
                <span className="max-w-full truncate text-xs text-slate-500">
                  {activeCond !== null ? conditionRows[activeCond]?.condition : "total"}
                </span>
              </div>
            </div>

            <ul className="w-full min-w-0 flex-1 space-y-1">
              {conditionRows.slice(0, 6).map((r, i) => {
                const pct = conditionTotal ? Math.round((r.count / conditionTotal) * 100) : 0;
                return (
                  <li
                    key={r.condition}
                    onMouseEnter={() => setActiveCond(i)}
                    onMouseLeave={() => setActiveCond(null)}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition ${
                      activeCond === i ? "bg-slate-50" : ""
                    } ${activeCond !== null && activeCond !== i ? "opacity-50" : ""}`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="min-w-0 flex-1 truncate text-slate-700">{r.condition}</span>
                    <span className="font-medium tabular-nums text-slate-900">{r.count}</span>
                    <span className="w-9 text-right text-xs tabular-nums text-slate-400">{pct}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title="New Patients"
          subtitle={`Daily registrations · last ${days} days`}
          action={
            <span className="hidden items-center gap-3 text-xs text-slate-500 sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-600" /> Daily
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-amber-500" /> 7-day average
              </span>
            </span>
          }
          loading={!range || timeline.isLoading}
          error={timeline.isError}
          empty={timelineRows.length === 0}
        >
          <div className="h-64 w-full sm:h-72" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartRows} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={shortDate}
                  tick={{ fontSize: 11, fill: AXIS }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: "#0d9488", strokeOpacity: 0.25 }}
                  content={<ChartTooltip labelFormatter={shortDate} />}
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  name="new patients"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fill="url(#patientsFill)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="7-day avg"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title="Doctors per Specialization"
          subtitle="Staffing by department"
          loading={specializations.isLoading}
          error={specializations.isError}
          empty={specializationRows.length === 0}
        >
          <HBarChart rows={specializationRows} nameKey="specialization" color="#06b6d4" unit="doctors" />
        </ChartCard>
      </div>
    </div>
  );
}