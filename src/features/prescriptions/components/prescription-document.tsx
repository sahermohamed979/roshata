'use client';

import React from 'react';
import type { Prescription } from '@/types/prescription.types';
import type { PrescriptionTemplate } from '@/types/template.types';
import { Pill, Phone, MapPin, Calendar, Clock, Stethoscope } from 'lucide-react';

interface PrescriptionDocumentProps {
  prescription: Prescription;
  template?: PrescriptionTemplate | null;
  includeBackPage?: boolean;
}

export function PrescriptionDocument({
  prescription,
  template,
  includeBackPage = true,
}: PrescriptionDocumentProps) {
  const isA5 = prescription.paperSize === 'A5';

  const doctorName = template?.doctorNameAr || 'د. إسلام عبدالله كريمة';
  const doctorTitle =
    template?.medicalTitleAr || 'أخصائي الأنف والأذن والحنجرة وجراحات الرأس والرقبة والمناظير الدقيقة';
  const clinicName = template?.clinicNameAr || 'عيادة نَفَس التخصصية';
  const phone = template?.clinicPhones?.[0] || '01012345678 - 01234567890';
  const address = template?.clinicAddress || 'القاهرة - مدينة نصر - برج الأطباء - الدور الرابع';
  const returnDays = template?.returnNotice || 'الإعادة خلال أسبوع من تاريخ الكشف';

  const dateFormatted = new Date(prescription.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="print-document-root text-slate-900 bg-white font-sans selection:bg-none" dir="rtl">
      {/* ════════════════════ PAGE 1: FRONT PAGE ════════════════════ */}
      <div
        className={`page-sheet relative bg-white flex flex-col justify-between overflow-hidden mx-auto ${
          isA5 ? 'a5-dimensions' : 'a4-dimensions'
        }`}
        style={{
          boxSizing: 'border-box',
          padding: isA5 ? '18mm 14mm 14mm 14mm' : '22mm 18mm 18mm 18mm',
        }}
      >
        {/* Top Header */}
        <header className="border-b-2 border-[#0B7B5E] pb-3 mb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#074C3A] leading-tight">
                {doctorName}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                {doctorTitle}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold" dir="ltr">
                Dr. Eslam Abdallah Kareema · ENT & Head/Neck Surgeon
              </p>
            </div>

            <div className="text-left shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E3F5EE] border border-[#0B7B5E]/30 text-[#074C3A]">
                <Stethoscope className="w-4 h-4 text-[#0B7B5E]" />
                <span className="text-xs font-black">{clinicName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Patient Bar */}
        <section className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-4 grid grid-cols-12 gap-2 text-xs">
          <div className="col-span-6 font-bold flex items-center gap-1.5">
            <span className="text-slate-500">اسم المريض:</span>
            <span className="font-black text-slate-900 text-sm">
              {prescription.patient.name || 'مريض غير مسجل'}
            </span>
          </div>

          <div className="col-span-3 font-semibold flex items-center gap-1">
            <span className="text-slate-500">العمر:</span>
            <span className="font-bold text-slate-800">
              {prescription.patient.age ? `${prescription.patient.age}` : '—'}
            </span>
          </div>

          <div className="col-span-3 text-left font-semibold flex items-center justify-end gap-1">
            <span className="text-slate-500">التاريخ:</span>
            <span className="font-bold text-slate-800">{dateFormatted}</span>
          </div>

          {prescription.diagnosis && (
            <div className="col-span-12 pt-1 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 font-bold">التشخيص:</span>
              <span className="font-bold text-[#0B7B5E]">{prescription.diagnosis}</span>
            </div>
          )}
        </section>

        {/* Rx Symbol & Medication List */}
        <main className="flex-1 relative">
          {/* Watermark Rx */}
          <div className="absolute top-0 right-0 font-serif italic text-6xl font-black text-[#0B7B5E]/15 select-none pointer-events-none -mt-3">
            ℞
          </div>

          {/* List of Medications */}
          <div className="space-y-4 pt-1">
            {prescription.items.map((item, idx) => (
              <div key={item.id} className="relative pr-6">
                {/* Bullet counter */}
                <div className="absolute right-0 top-0.5 text-xs font-black text-[#0B7B5E]">
                  {idx + 1}.
                </div>

                {/* Drug Name & Strength */}
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-slate-900 tracking-wide" dir="ltr">
                    {item.nameSnapshotEn}
                  </span>
                  {item.strengthSnapshot && (
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded" dir="ltr">
                      {item.strengthSnapshot}
                    </span>
                  )}
                  {item.dosageFormSnapshot && (
                    <span className="text-xs text-slate-600 font-semibold">
                      ({item.dosageFormSnapshot})
                    </span>
                  )}
                </div>

                {/* Directions */}
                <div className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-[#074C3A] bg-[#E3F5EE] px-2 py-0.5 rounded-md">
                    {item.dosage}
                  </span>
                  <span>•</span>
                  <span>{item.frequency}</span>
                  {item.duration && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600">{item.duration}</span>
                    </>
                  )}
                  {item.timing && (
                    <>
                      <span>•</span>
                      <span className="text-amber-800">{item.timing}</span>
                    </>
                  )}
                </div>

                {/* Extra Instructions */}
                {item.instructions && (
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5 italic">
                    ملاحظة: {item.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>

          {prescription.notes && (
            <div className="mt-4 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs">
              <span className="font-bold text-amber-900">إرشادات الطبيب: </span>
              <span className="text-amber-950 font-medium">{prescription.notes}</span>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t-2 border-slate-200 pt-3 mt-4 text-[11px] text-slate-600">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#074C3A]">
              <Calendar className="w-3.5 h-3.5 text-[#0B7B5E]" />
              <span>{returnDays}</span>
            </div>

            {/* Signature Area */}
            <div className="text-center font-bold">
              <span className="text-slate-400 block text-[10px]">توقيع الطبيب</span>
              <span className="text-slate-800 font-serif italic text-sm">د. إسلام كريمة</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-1 font-mono font-bold" dir="ltr">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{phone}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ════════════════════ PAGE 2: BACK PAGE ════════════════════ */}
      {includeBackPage && (
        <div
          className={`page-sheet relative bg-white flex flex-col justify-between overflow-hidden mx-auto print-break-before ${
            isA5 ? 'a5-dimensions' : 'a4-dimensions'
          }`}
          style={{
            boxSizing: 'border-box',
            padding: isA5 ? '18mm 14mm 14mm 14mm' : '22mm 18mm 18mm 18mm',
          }}
        >
          {/* Back Header */}
          <header className="border-b border-[#0B7B5E]/30 pb-2 mb-4 text-center">
            <h2 className="text-lg font-black text-[#074C3A]">إرشادات وتعليمات طبية هامة</h2>
            <p className="text-xs text-slate-500 font-medium">
              حرصاً على سلامتكم وسرعة استجابتكم للعلاج، يرجى الالتزام بالتعليمات التالية
            </p>
          </header>

          <main className="flex-1 space-y-4 text-xs">
            {/* General Advice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0B7B5E]" />
                تناول الأدوية بدقة
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                يرجى الالتزام بالمواعيد المحددة والجرعات المقررة، وعدم إيقاف المضادات الحيوية قبل انتهاء المدة المقررة حتى في حال اختفاء الأعراض تماماً لتجنب عودة العدوى.
              </p>
            </div>

            {/* Warning Symptoms */}
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/70 space-y-1.5">
              <h3 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                أعراض تستدعي التواصل الفوري بالعيادة
              </h3>
              <ul className="list-disc list-inside text-rose-800 space-y-1 font-medium text-[11px]">
                <li>ظهور طفح جلدي مفاجئ أو صعوبة في التنفس أو بلع الريق.</li>
                <li>ارتفاع شديد في درجة الحرارة لا يستجيب للمسكنات.</li>
                <li>نزيف من الأنف أو الحلق غير متوقف.</li>
                <li>قيء مستمر يمنع تناول السوائل والأدوية.</li>
              </ul>
            </div>

            {/* Follow-up Note */}
            <div className="p-3 bg-[#E3F5EE]/60 rounded-xl border border-[#45DBA5]/40 space-y-1">
              <h3 className="font-bold text-[#074C3A] text-sm">ميعاد استشارة المتابعة (الإعادة)</h3>
              <p className="text-slate-700 leading-relaxed font-medium text-[11px]">
                المتابعة الدقيقة تضمن التعافي التام والتأكد من عدم وجود مضاعفات. يرجى إحضار الروشتة في الاستشارة.
              </p>
            </div>
          </main>

          <footer className="border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400">
            <span>{clinicName} · مع تمنياتنا لكم بالشفاء العاجل وموفور الصحة</span>
          </footer>
        </div>
      )}

      {/* Printing Specific CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${isA5 ? 'A5 portrait' : 'A4 portrait'};
            margin: 0;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-document-root {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .page-sheet {
            page-break-after: always;
            page-break-inside: avoid;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
          .print-break-before {
            page-break-before: always;
          }
        }

        .a4-dimensions {
          width: 210mm;
          min-height: 297mm;
        }

        .a5-dimensions {
          width: 148mm;
          min-height: 210mm;
        }
      `}</style>
    </div>
  );
}
