"use client";

// Tells Next.js to render this page dynamically, bypassing static prerender issues
export const dynamic = 'force-dynamic';

import { use, useState } from "react";
import Link from "next/link";
import { usePatients, useDeletePatient } from "@/features/patients/use-patients";
import { Modal } from "@/components/ui/modal";
import { PatientForm } from "@/features/patients/patient-form";

export default function DoctorPatientsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = usePatients({ doctorId: id, page, limit: 10 });
  const deleteMutation = useDeletePatient();

  const handleDelete = (patientId: string) => {
    if (confirm("Remove this patient from the doctor's list?")) {
      deleteMutation.mutate(patientId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/doctors"
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            &larr; Back to Doctors
          </Link>
          <h1 className="text-2xl font-semibold">Doctor's Patient List</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm"
        >
          + Add Patient
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Condition</th>
              <th className="p-3 text-left">Age</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  Loading…
                </td>
              </tr>
            )}
            {data?.data.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.condition}</td>
                <td className="p-3">{p.age}</td>
                <td className="p-3 text-right space-x-3">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  No patients found for this doctor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {data?.meta.page ?? 1} of {data?.meta.totalPages ?? 1}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={!!data && page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Patient to Doctor"
      >
        <PatientForm doctorId={id} onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}