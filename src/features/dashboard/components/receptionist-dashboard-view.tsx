import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Stethoscope, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { TableAppointmentsSkeleton } from '@/features/appointments/components/table-appointments-skeleton';
import { TableAppointmentsError } from '@/features/appointments/components/table-appointments-error';
import { TableAppoinmentsReception } from '@/features/appointments/components/table-appoinments-reception';
import { fetchDoctorsFromBackend } from '@/features/appointments/apis/doctors.api';
import { DoctorOption } from '@/features/appointments/types/booking';
import { getNextAuthToken } from '@/shared/lib/utils/auth.util';

/**
 * المحتوى الخاص بشاشة الاستقبال (Receptionist Dashboard) - Server Component مع Suspense & ErrorBoundary
 */
export async function ReceptionistDashboardView({ doctorId }: { doctorId?: string } = {}) {
  const t = await getTranslations('Dashboard.receptionist');
  const tDoctorStatus = await getTranslations('Dashboard.doctorStatus');

  const token = await getNextAuthToken();
  const doctorsRes = await fetchDoctorsFromBackend(token?.accessToken).catch(() => null);
  const doctors: DoctorOption[] =
    doctorsRes && 'payload' in doctorsRes && Array.isArray(doctorsRes.payload)
      ? doctorsRes.payload
      : [];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة + زر حجز موعد جديد */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black text-[#074C3A] tracking-tight">
            {t('title')}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {t('subtitle')}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A] text-white text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{tDoctorStatus('available')}</span>
          </div>
        </div>

        {/* زر حجز موعد / تسجيل مريض */}
        <Link
          href={`/dashboard/appointments/new${doctorId && doctorId !== 'all' ? `?doctorId=${encodeURIComponent(doctorId)}` : ''}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white font-bold rounded-xl shadow-md transition-all text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('bookPatient')}</span>
        </Link>
      </div>

      {/* تبويبات فلتر الأطباء للاستقبال */}
      {doctors.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
          <Link
            href="/dashboard"
            className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              !doctorId || doctorId === 'all'
                ? 'bg-[#074C3A] text-white shadow-xs font-black'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>جميع أطباء العيادة</span>
          </Link>

          {doctors.map((doc) => {
            const isSelected = doctorId === doc.id;
            return (
              <Link
                key={doc.id}
                href={`/dashboard?doctorId=${encodeURIComponent(doc.id)}`}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0B7B5E] text-white shadow-xs font-black'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{doc.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* جدول قائمة انتظار المرضى مع معالجة الأخطاء وحالة التحميل التفاعلية */}
      <ErrorBoundary errorComponent={TableAppointmentsError}>
        <Suspense fallback={<TableAppointmentsSkeleton />} key={doctorId || 'all'}>
          <TableAppoinmentsReception doctorId={doctorId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
