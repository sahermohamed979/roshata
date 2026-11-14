import React, { Suspense } from 'react';
import { ReceptionistDashboardView } from '@/features/dashboard';

interface ReceptionistPageProps {
  searchParams?: Promise<{
    doctorId?: string;
  }>;
}

function ReceptionistDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-72 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-2xl" />
      </div>
      <div className="bg-white rounded-3xl p-8 border border-slate-100 min-h-[420px] shadow-xs" />
    </div>
  );
}

export default async function ReceptionistPage({ searchParams }: ReceptionistPageProps) {
  const params = searchParams ? await searchParams : {};
  return (
    <Suspense fallback={<ReceptionistDashboardSkeleton />}>
      <ReceptionistDashboardView doctorId={params?.doctorId} />
    </Suspense>
  );
}
