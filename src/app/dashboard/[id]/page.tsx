import { Suspense } from "react";
import DoctorPatients from "./doctor-patients";

export default function DoctorPatientsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PatientsSkeleton />}>
      <DoctorPatients params={params} />
    </Suspense>
  );
}

function PatientsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="h-40 w-full animate-pulse rounded-lg border bg-muted" />
    </div>
  );
}