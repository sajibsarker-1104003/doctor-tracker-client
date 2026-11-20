// src/features/dashboard/use-dashboard.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  ConditionRow,
  DashboardSummary,
  PatientsPerDoctorRow,
  SpecializationRow,
  TimelineRow,
} from "@/lib/types";

/** Safely extract an array from any shape the backend might return. */
function asArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;
    // Try common keys
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.result)) return obj.result as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.get<DashboardSummary>("/dashboard/summary"),
  });
}

export function usePatientsPerDoctor(limit = 10) {
  return useQuery({
    queryKey: ["dashboard", "patients-per-doctor", limit],
    queryFn: () => api.get<PatientsPerDoctorRow[]>(`/dashboard/patients-per-doctor?limit=${limit}`),
    // Normalize to array
    select: (res) => asArray<PatientsPerDoctorRow>(res),
  });
}

export function useTimeline(interval: "day" | "month", from: string, to: string) {
  return useQuery({
    queryKey: ["dashboard", "timeline", interval, from, to],
    queryFn: () => api.get<TimelineRow[]>(`/dashboard/timeline?interval=${interval}&from=${from}&to=${to}`),
    enabled: !!from && !!to,
    // Normalize to array
    select: (res) => asArray<TimelineRow>(res),
  });
}

export function useConditions(limit = 8) {
  return useQuery({
    queryKey: ["dashboard", "conditions", limit],
    queryFn: () => api.get<ConditionRow[]>(`/dashboard/conditions?limit=${limit}`),
    // Normalize to array
    select: (res) => asArray<ConditionRow>(res),
  });
}

export function useSpecializations(limit = 8) {
  return useQuery({
    queryKey: ["dashboard", "specializations", limit],
    queryFn: () => api.get<SpecializationRow[]>(`/dashboard/specializations?limit=${limit}`),
    // Normalize to array
    select: (res) => asArray<SpecializationRow>(res),
  });
}