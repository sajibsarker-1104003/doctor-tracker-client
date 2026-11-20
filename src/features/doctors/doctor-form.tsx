"use client";
import { useState } from "react";
import { useCreateDoctor, useUpdateDoctor } from "./use-doctors";
import type { Doctor } from "@/lib/types";

export function DoctorForm({ initialData, onSuccess }: { initialData?: Doctor; onSuccess: () => void }) {
  const isEditing = !!initialData;
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    specialization: initialData?.specialization ?? "",
    hospital: initialData?.hospital ?? "",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ id: initialData.id, data: form }, { onSuccess });
    } else {
      createMutation.mutate(form, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded border p-2" />
      <input required placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="w-full rounded border p-2" />
      <input required placeholder="Hospital" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} className="w-full rounded border p-2" />
      <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded border p-2" />
      <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded border p-2" />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
      <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white p-2 rounded">
        {isPending ? "Saving..." : isEditing ? "Update Doctor" : "Create Doctor"}
      </button>
    </form>
  );
}