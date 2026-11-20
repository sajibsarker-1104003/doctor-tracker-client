"use client";
import { useState } from "react";
import { useCreatePatient, useUpdatePatient } from "./use-patients";
import { useDoctors } from "@/features/doctors/use-doctors";
import type { Patient } from "@/lib/types";

export function PatientForm({ 
  doctorId, 
  initialData, 
  onSuccess 
}: { 
  doctorId?: string; 
  initialData?: Patient; 
  onSuccess: () => void;
}) {
  const isEditing = !!initialData;
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  
  // Fetch doctors for the dropdown if no specific doctorId is provided
  const { data: doctorsData } = useDoctors({ limit: 100 });
  
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    age: initialData?.age ?? 0,
    gender: initialData?.gender ?? "MALE",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    condition: initialData?.condition ?? "",
    notes: initialData?.notes ?? "",
    selectedDoctorId: doctorId || initialData?.doctorId || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { selectedDoctorId, ...patientPayload } = form;

    if (isEditing) {
      updateMutation.mutate({ id: initialData.id, data: patientPayload }, { onSuccess });
    } else {
      if (!selectedDoctorId) {
        alert("Please select a doctor");
        return;
      }
      createMutation.mutate({ doctorId: selectedDoctorId, data: patientPayload }, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!isEditing && !doctorId && (
        <div>
          <label className="text-sm font-medium mb-1 block">Assign to Doctor</label>
          <select 
            required 
            value={form.selectedDoctorId} 
            onChange={(e) => setForm({ ...form, selectedDoctorId: e.target.value })} 
            className="w-full rounded border p-2"
          >
            <option value="" disabled>Select a doctor...</option>
            {doctorsData?.data.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
            ))}
          </select>
        </div>
      )}

      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded border p-2" />
      
      <div className="flex gap-2">
        <input required type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} className="w-full rounded border p-2" />
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })} className="w-full rounded border p-2">
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      
      <input required placeholder="Condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="w-full rounded border p-2" />
      <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded border p-2" />
      <input type="email" placeholder="Email (Optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded border p-2" />
      <textarea placeholder="Notes (Optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded border p-2" rows={2} />
      
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
      <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white p-2 rounded">
        {isPending ? "Saving..." : isEditing ? "Update Patient" : "Create Patient"}
      </button>
    </form>
  );
}