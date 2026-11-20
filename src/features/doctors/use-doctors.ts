import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Doctor, Paginated } from "@/lib/types";

export interface DoctorListParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
}

function toQuery(params: object) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) q.set(k, String(v));
  });
  return q.toString();
}

export function useDoctors(params: DoctorListParams) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () => api.get<Paginated<Doctor>>(`/doctors?${toQuery(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useDoctorFilterOptions() {
  return useQuery({
    queryKey: ["doctors", "filter-options"],
    queryFn: () => api.get<{ specializations: string[]; hospitals: string[] }>("/doctors/filter-options"),
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Doctor, "id" | "createdAt" | "updatedAt" | "patientCount">) =>
      api.post<Doctor>("/doctors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Doctor> }) =>
      api.patch<Doctor>(`/doctors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/doctors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}