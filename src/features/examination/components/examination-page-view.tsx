import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getAppointmentExaminationAction } from '@/features/examination/apis/examination.action';
import { EntExaminationForm } from '@/features/examination/components/ent-examination-form';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export interface ExaminationPageViewProps {
  params: Promise<{ id: string }>;
}

function ExaminationSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center shadow-xs flex flex-col items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 text-[#0B7B5E] animate-spin mb-3" />
      <p className="text-xs font-bold text-slate-500">جاري تحميل استمارة فحص المريض...</p>
    </div>
  );
}

async function ExaminationContent({ params }: ExaminationPageViewProps) {
  const { id } = await params;

  const res = await getAppointmentExaminationAction(id);

  if (res.code === 401) {
    redirect('/auth/login?expired=true');
  }

  if (!res.status || !res.payload) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center text-red-900 shadow-sm max-w-lg mx-auto my-12 animate-in fade-in-50">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black mb-2">تعذر فتح استمارة الكشف</h3>
        <p className="text-xs text-red-700 mb-6 leading-relaxed">
          {res.message || 'الموعد غير موجود أو حدث خطأ أثناء تحميل بيانات الزيارة.'}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>العودة للوحة التحكم</span>
        </Link>
      </div>
    );
  }

  const rawPayload = res.payload as any;
  const appointment = rawPayload.appointment || rawPayload;
  const patient = rawPayload.patient || appointment?.patient;
  const doctor = rawPayload.doctor || appointment?.doctor;
  const visit = rawPayload.visit || appointment?.visit;

  return (
    <EntExaminationForm
      appointment={appointment}
      patient={patient}
      doctor={doctor}
      visit={visit}
    />
  );
}

export function ExaminationPageView(props: ExaminationPageViewProps) {
  return (
    <Suspense fallback={<ExaminationSkeleton />}>
      <ExaminationContent {...props} />
    </Suspense>
  );
}

