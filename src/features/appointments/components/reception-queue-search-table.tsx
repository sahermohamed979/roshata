'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Clock,
  User,
  Calendar,
  Search,
  Plus,
  ShieldCheck,
  UserPlus,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { TableAppointmentsRowActions } from './table-appointments-row-actions';

export interface TodayWaitingPatient {
  id: string;
  queueNumber: number;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  doctorName?: string;
  type: string;
  source: string;
  status: string;
  waitingMinutes: number | null;
  isExempt: boolean;
  isFullyPaid: boolean;
  remainingAmount: number;
  discount: number;
  totalAmount?: number;
  paidAmount?: number;
}

interface ReceptionQueueSearchTableProps {
  initialPatients: TodayWaitingPatient[];
  doctorId?: string;
  translations: {
    number: string;
    patient: string;
    doctor: string;
    appointmentType: string;
    status: string;
    waitingDuration: string;
    financialStatus: string;
    actions: string;
    checkup: string;
    consultation: string;
    inCheckup: string;
    pendingCheckout: string;
    waiting: string;
    exempt: string;
    paidInFull: string;
    partiallyPaid: string;
    unpaid: string;
    remaining: string;
    minutes: string;
  };
}

export function ReceptionQueueSearchTable({
  initialPatients,
  doctorId,
  translations: t,
}: ReceptionQueueSearchTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // فلترة قائمة اليوم محلياً
  const filteredLocal = initialPatients.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    const nameMatch = p.patientName?.toLowerCase().includes(term);
    const phoneMatch = p.patientPhone?.includes(term);
    const queueMatch = String(p.queueNumber).includes(term);
    return nameMatch || phoneMatch || queueMatch;
  });

  // التقيد الصارم بعرض 10 مرضى فقط كحد أقصى دائم
  const visiblePatients = filteredLocal.slice(0, 10);

  // البحث في كامل قاعدة بيانات العيادة عند كتابة نص
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);

    if (val.trim().length >= 2) {
      setIsSearchingExternal(true);
      fetch(`/api/patients/search?q=${encodeURIComponent(val.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          const rawList = Array.isArray(data)
            ? data
            : data?.payload && Array.isArray(data.payload)
            ? data.payload
            : [];

          // استبعاد المرضى الموجودين بالفعل في قائمة انتظار اليوم الحالية
          const localIds = new Set(initialPatients.map((p) => p.patientId));
          const external = rawList.filter((p: any) => !localIds.has(p.id));
          setSearchResults(external.slice(0, 5));
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearchingExternal(false));
    } else {
      setSearchResults([]);
      setIsSearchingExternal(false);
    }
  };

  return (
    <div className="space-y-4 select-none" dir="rtl">
      {/* 🔍 شريط البحث السريع والإحصائية المحددة بـ 10 مرضى دائمًا */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* حقل البحث السريع */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو رقم الملف (يظهر حتى لو لم يكن في القائمة)..."
            className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-[#074C3A] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#0B7B5E] focus:bg-white transition-all shadow-2xs"
          />
          {isSearchingExternal && (
            <Loader2 className="w-4 h-4 text-[#0B7B5E] animate-spin absolute left-3 top-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* الإحصائية وشارة الحد الأقصى */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-500">
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
            المعروض: <strong className="text-[#074C3A] font-black">{visiblePatients.length}</strong> (حد أقصى 10)
          </span>
          {initialPatients.length > 10 && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              إجمالي الانتظار: {initialPatients.length}
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>اليوم</span>
          </span>
        </div>
      </div>

      {/* 🌟 نتائج البحث لمرضى مسجلين بالعيادة ولكنهم ليسوا في قائمة انتظار اليوم */}
      {searchTerm.trim().length >= 2 && searchResults.length > 0 && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2.5 animate-in fade-in-50">
          <div className="flex items-center justify-between text-xs font-black text-[#074C3A]">
            <span className="flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#0B7B5E]" />
              <span>نتائج البحث في سجل مرضى العيادة (غير مسجلين في انتظار اليوم):</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700">
              {searchResults.length} مريض
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {searchResults.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white rounded-xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between gap-2 hover:border-[#0B7B5E] transition-all"
              >
                <div>
                  <h4 className="font-black text-sm text-[#074C3A]">
                    {p.fullName || p.name}
                  </h4>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{p.phone || 'بدون هاتف'}</span>
                    {p.fileNumber && <span>• ملف #{p.fileNumber}</span>}
                    {p.age && <span>• {p.age} سنة</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <Link
                    href={`/dashboard/appointments/new?patientId=${encodeURIComponent(p.id)}${doctorId ? `&doctorId=${encodeURIComponent(doctorId)}` : ''}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B7B5E] hover:bg-[#09634C] text-white text-xs font-bold transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تسجيل كشف اليوم</span>
                  </Link>

                  <Link
                    href={`/dashboard/patients/${p.id}`}
                    className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
                    title="فتح الملف الطبي للمريض"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. جدول حالات انتظار اليوم (10 حالات فقط) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {visiblePatients.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-bold text-slate-600">
              {searchTerm ? 'لا توجد نتائج مطابقة في قائمة اليوم' : 'لا يوجد مرضى في قائمة الانتظار حالياً'}
            </p>
            {searchTerm && searchResults.length === 0 && (
              <p className="text-xs text-slate-400">
                يمكنك الضغط على زر &quot;حجز جديد&quot; لتسجيل مريض جديد غير مسجل مسبقاً.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-xs">
                  <th className="py-4 px-6 text-start">{t.number}</th>
                  <th className="py-4 px-6 text-start">{t.patient}</th>
                  <th className="py-4 px-6 text-start">{t.doctor}</th>
                  <th className="py-4 px-6 text-center">{t.appointmentType}</th>
                  <th className="py-4 px-6 text-center">{t.status}</th>
                  <th className="py-4 px-6 text-center">{t.waitingDuration}</th>
                  <th className="py-4 px-6 text-center">{t.financialStatus}</th>
                  <th className="py-4 px-6 text-end">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {visiblePatients.map((patient) => {
                  const queueNo = String(patient.queueNumber).padStart(2, '0');

                  return (
                    <tr
                      key={patient.id}
                      className={`transition-colors ${
                        patient.status === 'PENDING_CHECKOUT'
                          ? 'bg-amber-50/50 hover:bg-amber-50/80 border-r-4 border-r-amber-500'
                          : patient.status === 'IN_PROGRESS'
                          ? 'bg-emerald-50/30 hover:bg-emerald-50/60 border-r-4 border-r-emerald-500'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* رقم الكشف */}
                      <td className="py-4 px-6 text-start">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#E3F5EE] text-[#0B7B5E] font-black text-sm">
                          #{queueNo}
                        </span>
                      </td>

                      {/* اسم المريض وبياناته */}
                      <td className="py-4 px-6 text-start">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#074C3A] text-sm">
                            {patient.patientName}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400 font-mono" dir="ltr">
                              {patient.patientPhone || 'لا يوجد هاتف'}
                            </span>
                            {patient.patientAge && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                • {patient.patientAge} سنة
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* الطبيب المعالج */}
                      <td className="py-4 px-6 text-start">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-xs text-[#074C3A]">
                            {patient.doctorName
                              ? patient.doctorName.startsWith('د.') || patient.doctorName.startsWith('Dr.')
                                ? patient.doctorName
                                : `د. ${patient.doctorName}`
                              : 'د. إسلام عبدالله'}
                          </span>
                        </div>
                      </td>

                      {/* نوع الكشف ومصدر الحجز */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                            {patient.type === 'EXAMINATION'
                              ? t.checkup
                              : patient.type === 'CONSULTATION'
                              ? t.consultation
                              : patient.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {patient.source === 'WALK_IN' ? 'كشف مباشر' : 'حجز مسبق'}
                          </span>
                        </div>
                      </td>

                      {/* الحالة */}
                      <td className="py-4 px-6 text-center">
                        {patient.status === 'IN_PROGRESS' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {t.inCheckup}
                          </span>
                        ) : patient.status === 'PENDING_CHECKOUT' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                            {t.pendingCheckout}
                          </span>
                        ) : patient.status === 'WAITING' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {t.waiting}
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            {patient.status}
                          </span>
                        )}
                      </td>

                      {/* مدة الانتظار */}
                      <td className="py-4 px-6 text-center">
                        {patient.waitingMinutes !== null ? (
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                            <Clock
                              className={`w-3.5 h-3.5 ${
                                patient.waitingMinutes > 30 ? 'text-amber-500' : 'text-slate-400'
                              }`}
                            />
                            <span className={patient.waitingMinutes > 30 ? 'text-amber-700 font-bold' : ''}>
                              {patient.waitingMinutes} دقيقة
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* الموقف المالي والمتبقي */}
                      <td className="py-4 px-6 text-center">
                        {patient.isExempt ? (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 shadow-2xs">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                              <span>{t.exempt}</span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">0 ج.م</span>
                          </div>
                        ) : patient.isFullyPaid ? (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{t.paidInFull}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 font-bold mt-0.5">
                              {patient.remainingAmount === 0 ? 'خالص' : `${patient.remainingAmount} ج.م`}
                            </span>
                          </div>
                        ) : patient.remainingAmount > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                              {patient.discount > 0 ? t.partiallyPaid : t.unpaid}
                            </span>
                            <span className="text-[11px] text-amber-900 font-black mt-0.5">
                              متبقي: {patient.remainingAmount} ج.م
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">خالص</span>
                        )}
                      </td>

                      {/* إجراءات الموعد */}
                      <td className="py-4 px-6 text-end">
                        <TableAppointmentsRowActions
                          appointmentId={patient.id}
                          patientName={patient.patientName}
                          status={patient.status as 'WAITING' | 'IN_PROGRESS' | 'BOOKED' | 'PENDING_CHECKOUT' | 'COMPLETED'}
                          hasRemaining={!patient.isFullyPaid && patient.remainingAmount > 0}
                          remainingAmount={patient.remainingAmount}
                          totalAmount={patient.totalAmount || 0}
                          paidAmount={patient.paidAmount || 0}
                          doctorId={doctorId}
                          doctorName={patient.doctorName}
                          type={patient.type}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
