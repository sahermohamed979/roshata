'use client';

import React from 'react';
import type { Prescription } from '@/types/prescription.types';
import type { PrescriptionTemplate } from '@/types/template.types';
import { paginatePrescriptionItems } from '../utils/prescription-pagination';
import { Pill, Phone, MapPin, Calendar, Clock, Stethoscope, AlertTriangle, ShieldCheck } from 'lucide-react';

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
  const backNotes = template?.backPageNotes || 'يرجى الالتزام بمواعيد وجرعات العلاج المقررة، وإحضار الروشتة في الاستشارة.';

  const dateFormatted = new Date(prescription.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate dynamic multi-page distribution to prevent physical overflow
  const pages = paginatePrescriptionItems(prescription.items, prescription.paperSize);

  return (
    <div className="print-document-root text-slate-900 bg-white font-sans selection:bg-none" dir="rtl">
      {/* ════════════════════ PAGINATED MEDICATION PAGES ════════════════════ */}
      {pages.map((page) => (
        <div
          key={`page_${page.pageNumber}`}
          className={`page-sheet relative bg-white flex flex-col justify-between overflow-hidden mx-auto ${
            isA5 ? 'a5-dimensions' : 'a4-dimensions'
          }`}
          style={{
            boxSizing: 'border-box',
            padding: isA5 ? '16mm 14mm 14mm 14mm' : '22mm 18mm 18mm 18mm',
          }}
        >
          <div>
            {/* Header: Full on Page 1, Compact on Continuation Pages */}
            {page.isFirstPage ? (
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
            ) : (
              <header className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between text-xs text-slate-500 font-bold">
                <span className="text-[#074C3A] font-black">{doctorName}</span>
                <span>
                  تابع روشتة: {prescription.patient.name} (صفحة {page.pageNumber} من {page.totalPages})
                </span>
              </header>
            )}

            {/* Patient Bar (Full on Page 1, minimal on subsequent) */}
            {page.isFirstPage ? (
              <section className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-3.5 grid grid-cols-12 gap-2 text-xs">
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
            ) : null}

            {/* Rx Watermark Symbol and Medications */}
            <main className="relative">
              {page.isFirstPage && (
                <div className="absolute top-0 right-0 font-serif italic text-6xl font-black text-[#0B7B5E]/15 select-none pointer-events-none -mt-3">
                  ℞
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3.5 pt-1">
                {page.items.map((item) => (
                  <div
                    key={item.id}
                    className="relative pr-6 break-inside-avoid print:break-inside-avoid"
                    style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                  >
                    {/* Display Order Counter */}
                    <div className="absolute right-0 top-0.5 text-xs font-black text-[#0B7B5E]">
                      {item.displayOrder}.
                    </div>

                    {/* Trade Name and Strength */}
                    <div className="flex items-baseline gap-2 flex-wrap">
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

                    {/* Clinical Directions */}
                    <div className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-[#074C3A] bg-[#E3F5EE] px-2 py-0.5 rounded-md font-black">
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
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                            {item.timing}
                          </span>
                        </>
                      )}
                      {item.route && item.route !== 'فموي' && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 text-[11px] font-normal">
                            ({item.route})
                          </span>
                        </>
                      )}
                    </div>

                    {/* Specific Instructions */}
                    {item.instructions && (
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5 italic">
                        ملاحظة: {item.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* General Consultation Notes (Rendered on the last page) */}
              {page.isLastPage && prescription.notes && (
                <div className="mt-4 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs">
                  <span className="font-bold text-amber-900">إرشادات الطبيب: </span>
                  <span className="text-amber-950 font-medium">{prescription.notes}</span>
                </div>
              )}
            </main>
          </div>

          {/* Footer Area */}
          <footer className="border-t-2 border-slate-200 pt-2.5 mt-3 text-[11px] text-slate-600">
            {page.isLastPage && (
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
            )}

            <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{address}</span>
              </div>

              {page.totalPages > 1 && (
                <span className="font-bold text-slate-400">
                  صفحة {page.pageNumber} من {page.totalPages}
                </span>
              )}

              <div className="flex items-center gap-1 font-mono font-bold" dir="ltr">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{phone}</span>
              </div>
            </div>
          </footer>
        </div>
      ))}

      {/* ════════════════════ BACK PAGE: MEDICAL INSTRUCTIONS ════════════════════ */}
      {includeBackPage && (
        <div
          className={`page-sheet relative bg-white flex flex-col justify-between overflow-hidden mx-auto print-break-before ${
            isA5 ? 'a5-dimensions' : 'a4-dimensions'
          }`}
          style={{
            boxSizing: 'border-box',
            padding: isA5 ? '16mm 14mm 14mm 14mm' : '22mm 18mm 18mm 18mm',
          }}
        >
          <div>
            {/* Back Header */}
            <header className="border-b-2 border-[#0B7B5E] pb-2.5 mb-4 text-center">
              <div className="inline-flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-[#0B7B5E]" />
                <h2 className="text-lg sm:text-xl font-black text-[#074C3A]">إرشادات وتعليمات طبية هامة</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                حرصاً على سلامتكم وسرعة استجابتكم للعلاج، يرجى الالتزام بالتعليمات التالية
              </p>
            </header>

            <main className="space-y-3.5 text-xs">
              {/* General Medicine Compliance */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0B7B5E]" />
                  تناول الأدوية بدقة وفق المواعيد المقررة
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  يرجى الالتزام بالمواعيد المحددة والجرعات المقررة، وعدم إيقاف المضادات الحيوية قبل انتهاء المدة المقررة حتى في حال اختفاء الأعراض تماماً لتجنب عودة العدوى أو حدوث مقاومة بكتيرية.
                </p>
              </div>

              {/* Warning Signs */}
              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/70 space-y-1.5">
                <h3 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  أعراض تستدعي التواصل الفوري بالعيادة أو التوجه للطوارئ
                </h3>
                <ul className="list-disc list-inside text-rose-800 space-y-1 font-medium text-[11px]">
                  <li>ظهور طفح جلدي مفاجئ، تورم في الشفتين، أو صعوبة في التنفس أو بلع الريق.</li>
                  <li>ارتفاع حاد في درجة الحرارة لا يستجيب للمسكنات وخافضات الحرارة.</li>
                  <li>نزيف من الأنف أو الحلق غير متوقف بعد الإجراءات الجراحية.</li>
                  <li>قيء مستمر يمنع تماماً تناول السوائل والأدوية المقررة.</li>
                </ul>
              </div>

              {/* Clinic Specific Back Notes */}
              {backNotes && (
                <div className="p-3 bg-[#E3F5EE]/60 rounded-xl border border-[#45DBA5]/40 space-y-1">
                  <h3 className="font-bold text-[#074C3A] text-sm">ملاحظات خاصة من الطبيب</h3>
                  <p className="text-slate-700 leading-relaxed font-medium text-[11px] whitespace-pre-line">
                    {backNotes}
                  </p>
                </div>
              )}

              {/* Return Policy */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">ميعاد استشارة المتابعة (الإعادة)</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-[11px]">
                  المتابعة الدقيقة تضمن التعافي التام والتأكد من استقرار الحالة. {returnDays}. يرجى إحضار هذه الروشتة في موعد الاستشارة.
                </p>
              </div>
            </main>
          </div>

          <footer className="border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400">
            <span>{clinicName} · مع تمنياتنا لكم بالشفاء العاجل وموفور الصحة والعافية</span>
          </footer>
        </div>
      )}

      {/* ════════════════════ PRINT-SPECIFIC CSS ════════════════════ */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${isA5 ? '148mm 210mm' : '210mm 297mm'} portrait;
            margin: 0;
          }
          html, body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          .print-document-root {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .page-sheet {
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
          .page-sheet:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .print-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }
          .break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
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
