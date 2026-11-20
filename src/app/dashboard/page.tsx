"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function asArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === "object" && Array.isArray((v as { data?: unknown }).data)) {
    return (v as { data: T[] }).data;
  }
  return [];
}

export default function DashboardPage() {
  // Client-only date range. Starts empty so SSR/prerender doesn't see new Date().
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  useEffect(() => {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    setRange({ from: start.toISOString().slice(0, 10), to });
  }, []);

  const summary = useDashboardSummary();
  const perDoctor = usePatientsPerDoctor(8);
  const timeline = useTimeline("day", range?.from ?? "", range?.to ?? "");
  const conditions = useConditions();
  const specializations = useSpecializations();

  // Normalize every list-shaped response into a real array.
  const perDoctorRows = asArray<{ doctorName: string; count: number }>(perDoctor.data);
  const timelineRows = asArray<{ bucket: string; patients: number; doctors: number }>(
    timeline.data
  );
  const conditionRows = asArray<{ condition: string; count: number }>(conditions.data);
  const specializationRows = asArray<{ specialization: string; count: number }>(
    specializations.data
  );

  // Diagnostics — remove after verifying.
  if (summary.isError) console.error("[dashboard] summary", summary.error);
  if (perDoctor.isError) console.error("[dashboard] perDoctor", perDoctor.error);
  if (timeline.isError) console.error("[dashboard] timeline", timeline.error);
  if (conditions.isError) console.error("[dashboard] conditions", conditions.error);
  if (specializations.isError)
    console.error("[dashboard] specializations", specializations.error);

  // Raw shape logs, once per response — helps align types.
  useEffect(() => {
    if (summary.data) console.log("[dashboard] summary raw", summary.data);
  }, [summary.data]);
  useEffect(() => {
    if (perDoctor.data) console.log("[dashboard] perDoctor raw", perDoctor.data);
  }, [perDoctor.data]);
  useEffect(() => {
    if (timeline.data) console.log("[dashboard] timeline raw", timeline.data);
  }, [timeline.data]);
  useEffect(() => {
    if (conditions.data) console.log("[dashboard] conditions raw", conditions.data);
  }, [conditions.data]);
  useEffect(() => {
    if (specializations.data)
      console.log("[dashboard] specializations raw", specializations.data);
  }, [specializations.data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Doctors"
          value={summary.data?.totalDoctors ?? "—"}
        />
        <StatCard
          label="Total Patients"
          value={summary.data?.totalPatients ?? "—"}
        />
        <StatCard
          label="Avg Patients / Doctor"
          value={summary.data?.avgPatientsPerDoctor?.toFixed(1) ?? "—"}
        />
        <StatCard
          label="New Patients (30d)"
          value={summary.data?.newPatientsLast30Days ?? "—"}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium">Top Doctors by Patients</h2>
          <div className="h-64 w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perDoctorRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="doctorName" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium">Conditions</h2>
          <div className="h-64 w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conditionRows}
                  dataKey="count"
                  nameKey="condition"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {conditionRows.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium">New Patients (last 30 days)</h2>
          <div className="h-64 w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="patients"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium">Doctors per Specialization</h2>
          <div className="h-64 w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specializationRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="specialization" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}