"use client";

import { use } from "react";
import { usePatients } from "@/features/patients/use-patients";

export default function DoctorPatientsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = usePatients({ doctorId: id, limit: 20 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Doctor's Patients</h1>
      <div className="rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Condition</th>
              <th className="p-3 text-left">Age</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={3} className="p-6 text-center">Loading…</td></tr>}
            {data?.data.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.condition}</td>
                <td className="p-3">{p.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}