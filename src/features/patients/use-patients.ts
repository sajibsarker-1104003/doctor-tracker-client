import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Paginated, Patient } from "@/lib/types";

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  gender?: string;
  doctorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

function toQuery(params: object) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) q.set(k, String(v));
  });
  return q.toString();
}

export function usePatients(params: PatientListParams) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => api.get<Paginated<Patient>>(`/patients?${toQuery(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function usePatientFilterOptions() {
  return useQuery({
    queryKey: ["patients", "filter-options"],
    queryFn: () => api.get<{ conditions: string[] }>("/patients/filter-options"),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: string; data: Omit<Patient, "id" | "doctorId" | "createdAt" | "updatedAt"> }) =>
      api.post<Patient>(`/doctors/${doctorId}/patients`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      api.patch<Patient>(`/patients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Updated: Using the standard DELETE /patients/:id endpoint
export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}