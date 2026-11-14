'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Plus, Edit2, Trash2, Pill, Printer, FileText, FileCheck, ExternalLink, X } from 'lucide-react';
import { PrintablePrescriptionSlip } from '@/features/examination/components/prescription-view';
import { PatientDetails, Patient } from '../types/patient';
import { PatientHeroBanner } from './patient-hero-banner';
import { PatientMetricCards } from './patient-metric-cards';
import { PatientPersonalInfoCard } from './patient-personal-info-card';
import { PatientMedicalHistoryCard } from './patient-medical-history-card';
import { PatientAttachmentsCard } from './patient-attachments-card';
import { PatientVisitsTable } from './patient-visits-table';
import { PatientNotesCard } from './patient-notes-card';
import { DeletePatientModal } from './delete-patient-modal';
import { EditPatientModal } from './edit-patient-modal';

interface PatientProfileViewProps {
  details: PatientDetails;
}

type TabType = 'overview' | 'visits' | 'prescriptions' | 'payments' | 'attachments' | 'notes';

export function PatientProfileView({ details }: PatientProfileViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>('visits');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // حالة مودال معاينة وطباعة الروشتة المباشرة
  const [previewRx, setPreviewRx] = useState<{
    rx: any;
    mode: 'full' | 'plain';
  } | null>(null);

  const handlePrintSelectedRx = (mode: 'full' | 'plain') => {
    if (!previewRx) return;
    setPreviewRx({ ...previewRx, mode });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleOpenRxFromVisit = (visitId?: string | null, appointmentId?: string) => {
    const found = details.prescriptions?.find(
      (rx: any) =>
        (appointmentId && rx.appointmentId === appointmentId) ||
        (visitId && rx.visitId === visitId) ||
        (appointmentId && rx.id === appointmentId)
    );
    if (found) {
      setPreviewRx({ rx: found, mode: 'full' });
    } else if (appointmentId) {
      router.push(`/dashboard/examination/${appointmentId}?tab=prescription`);
    }
  };

  const backUrl = pathname?.includes('view-patients') ? '/dashboard/view-patients' : '/dashboard/patients';

  const patient = details.patient;
  const patientAsItem: Patient = {
    id: patient.id,
    fullName: patient.fullName,
    phone: patient.phone,
    gender: patient.gender,
    age: patient.age,
    dateOfBirth: patient.dateOfBirth || undefined,
    address: patient.address || undefined,
    occupation: patient.occupation || undefined,
    chronicConditions: patient.chronicConditions,
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'visits', label: `الزيارات (${details.previousAppointments?.length || 0})` },
    { id: 'prescriptions', label: `الروشتات الطبية (${details.prescriptions?.length || 0})` },
    { id: 'payments', label: 'المدفوعات' },
    { id: 'attachments', label: 'المرفقات' },
    { id: 'notes', label: 'ملاحظات' },
  ];

  const previewExamData = previewRx ? {
    fileNo: (patient as any)?.fileNumber || details.patient.id?.slice(0, 8),
    date: (previewRx.rx as any).visitDate || (previewRx.rx.createdAt ? new Date(previewRx.rx.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
    diagnosis: (previewRx.rx as any).diagnosis || '',
    treatmentNotes: previewRx.rx.notes || '',
    prescriptionItems: (previewRx.rx.items || []).map((it: any) => ({
      id: it.id || Math.random().toString(),
      drugName: it.drugName,
      form: it.form || 'Tablet',
      concentration: it.concentration || '',
      dose: it.dose || '',
      frequency: it.frequency || '',
      duration: it.duration || '',
      instructions: it.instructions || '',
    })),
    followUpDate: (previewRx.rx as any).followUpDate || '',
  } as any : null;

  return (
    <>
      <div className={`space-y-6 select-none ${previewRx ? 'print:hidden' : ''}`} dir="rtl">
      {/* 1. الشريط العلوي: العودة للمرضى + أزرار الإجراءات */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        {/* أزرار الإجراءات على اليسار */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/dashboard/appointments/new?patientId=${patient.id}`}
            className="h-10 px-4 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>حجز جديد</span>
          </Link>

          {details.previousAppointments && details.previousAppointments[0] && (
            <Link
              href={`/dashboard/examination/${details.previousAppointments[0].id}`}
              className="h-10 px-3.5 rounded-xl border border-[#D0E5DC] bg-[#E3F5EE]/80 hover:bg-[#E3F5EE] text-[#0B7B5E] font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="فتح استمارة كشف المريض الكاملة"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>استمارة الكشف 📋</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>تعديل البيانات</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="h-10 px-3.5 rounded-xl border border-rose-200 bg-[#FFF5F5] hover:bg-rose-100 text-[#E11D48] font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>حذف</span>
          </button>
        </div>

        {/* زر العودة للمرضى على اليمين */}
        <Link
          href={backUrl}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>العودة للمرضى</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* 2. بطاقة معلومات المريض الرئيسية (Hero Banner) */}
      <PatientHeroBanner details={details} />

      {/* 3. بطاقات الإحصائيات الأربع (KPI Metrics) */}
      <PatientMetricCards details={details} />

      {/* 4. التقسيم الرئيسي (عمودين متوازيين) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* العمود الأيمن (البيانات الشخصية والطبية والمرفقات) */}
        <div className="lg:col-span-4 space-y-5">
          <PatientPersonalInfoCard details={details} />
          <PatientMedicalHistoryCard details={details} />
          <PatientAttachmentsCard details={details} />
        </div>

        {/* العمود الأيسر (التبويبات وجدول الزيارات والملاحظات) */}
        <div className="lg:col-span-8 space-y-5">
          {/* بطاقة التبويبات والمحتوى */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            {/* شريط ألسنة التبويب */}
            <div className="flex items-center gap-4 px-6 pt-4 border-b border-slate-100 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 font-bold text-xs transition-all cursor-pointer whitespace-nowrap relative ${
                      isActive
                        ? 'text-[#0B7B5E] font-black'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B7B5E] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* محتوى التبويب */}
            <div className="p-4 sm:p-5">
              {activeTab === 'visits' && (
                <PatientVisitsTable
                  visits={details.previousAppointments || []}
                  onViewPrescription={handleOpenRxFromVisit}
                />
              )}

              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  {(!details.prescriptions || details.prescriptions.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-2xl">
                      لا توجد روشتات علاجية مسجلة سابقة لهذا المريض
                    </div>
                  ) : (
                    details.prescriptions.map((rx, idx) => (
                      <div
                        key={rx.id || idx}
                        className="bg-white border-2 border-slate-100 hover:border-[#D0E5DC] rounded-2xl p-4 sm:p-5 shadow-xs transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center font-black text-sm">
                              ℞
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-sm text-[#074C3A]">
                                  روشتة علاجية #{details.prescriptions!.length - idx}
                                </h4>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E3F5EE] text-[#0B7B5E] font-bold text-[11px] border border-[#D0E5DC]">
                                  <span>تاريخ الزيارة:</span>
                                  <strong className="font-mono">
                                    {(rx as any).visitDate || (rx.createdAt ? new Date(rx.createdAt).toISOString().slice(0, 10) : '—')}
                                  </strong>
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                                الطبيب المعالج: <strong className="text-slate-700">{rx.doctorName || 'د. إسلام'}</strong>
                                {(rx as any).diagnosis && (
                                  <span className="mr-2 text-slate-600">
                                    · التشخيص: <strong className="text-[#074C3A]">{(rx as any).diagnosis}</strong>
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewRx({ rx, mode: 'full' })}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>طباعة ومعاينة الروشتة</span>
                            </button>
                            {((rx as any).appointmentId || rx.visitId) && (
                              <Link
                                href={`/dashboard/examination/${(rx as any).appointmentId || rx.visitId}?tab=prescription`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                                title="فتح ملف الكشف بالكامل"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                <span>الكشف</span>
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* جدول الأدوية */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-start text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                                <th className="py-2 px-3 text-start">اسم الدواء</th>
                                <th className="py-2 px-3 text-center">النوع (Form)</th>
                                <th className="py-2 px-3 text-center">التركيز</th>
                                <th className="py-2 px-3 text-center">الجرعة</th>
                                <th className="py-2 px-3 text-center">التكرار</th>
                                <th className="py-2 px-3 text-center">المدة</th>
                                <th className="py-2 px-3 text-start">التعليمات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {rx.items?.map((item: any, i: number) => (
                                <tr key={item.id || i} className="hover:bg-slate-50/50">
                                  <td className="py-2 px-3 font-bold text-[#074C3A] font-mono">{item.drugName}</td>
                                  <td className="py-2 px-3 text-center text-slate-700 font-bold">{item.form || '—'}</td>
                                  <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">{item.concentration || '—'}</td>
                                  <td className="py-2 px-3 text-center font-bold text-slate-700">{item.dose || '—'}</td>
                                  <td className="py-2 px-3 text-center text-slate-600">{item.frequency || '—'}</td>
                                  <td className="py-2 px-3 text-center text-slate-600">{item.duration || '—'}</td>
                                  <td className="py-2 px-3 text-slate-600 font-bold">{item.instructions || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {rx.notes && (
                          <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600">
                            <span className="font-bold text-slate-800">ملاحظات الطبيب: </span>
                            <span>{rx.notes}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="p-4 text-center text-xs text-slate-400">
                  عرض موجز شامل لكافة التعاملات السابقة للمريض في العيادة
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="p-4 text-center text-xs text-slate-400">
                  إجمالي المبالغ المسددة {details.financialSummary.totalPaid} ج.م والمتبقي{' '}
                  {details.financialSummary.outstandingBalance} ج.م
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="p-4 text-center text-xs text-slate-400">
                  يمكن استعراض كافة المرفقات وصور الأشعة من القائمة الجانبية أو من تبويب المرفقات
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="p-4 text-center text-xs text-slate-400">
                  انظر قسم الملاحظات أدناه لإضافة واستعراض ملاحظات الاستقبال والطبيب
                </div>
              )}
            </div>
          </div>

          {/* قسم ملاحظات الطبيب والاستقبال */}
          <PatientNotesCard
            notes={details.notes}
            patientId={patient.id}
          />
        </div>
      </div>

      {/* مودال الحذف النهائي / الأرشفة */}
      <DeletePatientModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        patient={patientAsItem}
        onSuccess={() => router.push('/dashboard/patients')}
      />

      {/* مودال تعديل بيانات المريض */}
      <EditPatientModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        patient={patientAsItem}
      />
    </div>

      {/* مودال معاينة وطباعة الروشتة الطبية مباشرة دون مغادرة الصفحة */}
      {previewRx && previewExamData && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:static print:p-0 print:m-0 print:bg-white print:block"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:border-none print:shadow-none print:rounded-none">
            {/* Header - مخفي أثناء الطباعة */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center font-black text-lg">
                  ℞
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">معاينة وطباعة الروشتة العلاجية</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    المريض: <strong className="text-slate-700">{patient.fullName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRx(null)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Controls Bar - مخفي أثناء الطباعة */}
            <div className="px-6 py-3 bg-[#F0FDF8] border-b border-[#D0E5DC] flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">نمط الطباعة:</span>
                <button
                  type="button"
                  onClick={() => setPreviewRx({ ...previewRx, mode: 'full' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    previewRx.mode === 'full'
                      ? 'bg-[#0B7B5E] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  كاملة (مع ترويسة العيادة)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRx({ ...previewRx, mode: 'plain' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    previewRx.mode === 'plain'
                      ? 'bg-[#0B7B5E] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  أدوية فقط (للورق الجاهز)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSelectedRx(previewRx.mode)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 stroke-[2.5]" />
                  <span>طباعة الروشتة الآن</span>
                </button>
              </div>
            </div>

            {/* Prescription Preview Sheet */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100/60 print:overflow-visible print:p-0 print:bg-white print:block">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
                <PrintablePrescriptionSlip
                  examData={previewExamData}
                  patient={patient}
                  doctor={{
                    name: previewRx.rx.doctorName || 'د. إسلام عبدالله كريمة',
                    phone: '01018566478',
                  }}
                  printMode={previewRx.mode}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

