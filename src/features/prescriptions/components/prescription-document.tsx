'use client';

import React from 'react';
import type { Prescription } from '@/types/prescription.types';
import type { PrescriptionTemplate } from '@/types/template.types';
import { paginatePrescriptionItems } from '../utils/prescription-pagination';
import {
  Pill,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Stethoscope,
  AlertTriangle,
  ShieldCheck,
  Building2,
} from 'lucide-react';

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
  const doctorNameEn = template?.doctorNameEn || 'Dr. Eslam Abdallah Karima';
  const doctorTitle =
    template?.medicalTitleAr || 'استشاري جراحة الأنف والأذن والحنجرة وجراحات الرأس والرقبة والمناظير الدقيقة';
  const qualifications = template?.qualificationsAr || '';
  const clinicName = template?.clinicNameAr || 'عيادة نَفَس التخصصية';
  const phone = template?.clinicPhones?.[0] || '01000000000';
  const address = template?.clinicAddress || 'القاهرة - المعادي - شارع النصر';
  const returnDays = template?.returnNotice || 'الكشف ساري لمدة 14 يوماً من تاريخ الزيارة';
  const backNotes = template?.backPageNotes || 'يرجى الالتزام بمواعيد وجرعات العلاج المقررة، وإحضار الروشتة في الاستشارة.';

  const primaryColor = template?.primaryColor || '#0B7B5E';
  const fontFamily = template?.fontFamily || 'Cairo';
  const showWatermark = template?.showWatermark ?? true;
  const watermarkOpacity = template?.watermarkOpacity ?? 0.08;
  const showLogo = (template?.showLogo ?? true) && !!template?.logoUrl;
  const showSignature = template?.showSignature ?? true;
  const showStamp = (template?.showStamp ?? false) && !!template?.stampUrl;
  const showPatientBox = template?.showPatientBox ?? true;
  const showReturnPolicy = template?.showReturnPolicy ?? true;
  const headerLayout = template?.headerLayout || 'split';

  const dateFormatted = new Date(prescription.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate dynamic multi-page distribution to prevent physical overflow
  const pages = paginatePrescriptionItems(prescription.items, prescription.paperSize);

  return (
    <div
      className="print-document-root text-slate-900 bg-white selection:bg-none"
      style={{ fontFamily }}
      dir="rtl"
    >
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
          {/* Rx Background Watermark */}
          {showWatermark && (
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center select-none"
              style={{ opacity: watermarkOpacity }}
            >
              <span
                className="font-serif italic font-black text-slate-900"
                style={{ fontSize: isA5 ? '160px' : '230px' }}
              >
                ℞
              </span>
            </div>
          )}

          <div className="relative z-10">
            {/* Header: Full on Page 1, Compact on Continuation Pages */}
            {page.isFirstPage ? (
              <header
                className={`pb-3 mb-3 border-b-2 ${
                  headerLayout === 'modern' ? 'bg-slate-50/70 p-3 rounded-2xl border-slate-200' : ''
                }`}
                style={{ borderColor: primaryColor }}
              >
                <div
                  className={`flex gap-4 ${
                    headerLayout === 'centered'
                      ? 'flex-col items-center text-center'
                      : 'items-center justify-between'
                  }`}
                >
                  {/* Doctor Info */}
                  <div className="space-y-0.5">
                    <h1
                      className="text-xl sm:text-2xl font-black leading-tight"
                      style={{ color: primaryColor }}
                    >
                      {doctorName}
                    </h1>
                    <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                      {doctorTitle}
                    </p>
                    {qualifications && (
                      <p className="text-[11px] text-slate-500 font-medium">
                        {qualifications}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 font-semibold" dir="ltr">
                      {doctorNameEn}
                    </p>
                  </div>

                  {/* Clinic Logo & Brand Badge */}
                  <div
                    className={`flex items-center gap-3 ${
                      headerLayout === 'centered' ? 'justify-center' : 'text-left shrink-0'
                    }`}
                  >
                    {showLogo && template?.logoUrl && (
                      <img
                        src={template.logoUrl}
                        alt="Logo"
                        className="w-12 h-12 object-contain rounded-xl border border-slate-200 p-0.5"
                      />
                    )}
                    <div>
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border font-black text-xs"
                        style={{
                          color: primaryColor,
                          borderColor: `${primaryColor}40`,
                          backgroundColor: `${primaryColor}12`,
                        }}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>{clinicName}</span>
                      </div>
                      {template?.syndicateNumber && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono text-center">
                          {template.syndicateNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>
            ) : (
              <header className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between text-xs text-slate-500 font-bold">
                <span className="font-black" style={{ color: primaryColor }}>
                  {doctorName}
                </span>
                <span>
                  تابع روشتة: {prescription.patient.name} (صفحة {page.pageNumber} من {page.totalPages})
                </span>
              </header>
            )}

            {/* Patient Bar (Full on Page 1, minimal on subsequent) */}
            {page.isFirstPage && showPatientBox ? (
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
                    {prescription.patient.age ? `${prescription.patient.age} سنة` : '—'}
                  </span>
                </div>

                <div className="col-span-3 font-semibold flex items-center gap-1 justify-end">
                  <span className="text-slate-500">التاريخ:</span>
                  <span className="font-mono text-slate-800 font-bold">{dateFormatted}</span>
                </div>

                {(prescription.patient.gender || prescription.patient.weight || prescription.diagnosis) && (
                  <div className="col-span-12 pt-1.5 border-t border-slate-200/80 flex items-center gap-4 text-[11px] text-slate-600">
                    {prescription.patient.gender && (
                      <span>
                        النوع: {prescription.patient.gender === 'MALE' ? 'ذكر' : prescription.patient.gender === 'FEMALE' ? 'أنثى' : 'أخرى'}
                      </span>
                    )}
                    {prescription.patient.weight && (
                      <span>الوزن: {prescription.patient.weight} كجم</span>
                    )}
                    {prescription.diagnosis && (
                      <span className="font-bold text-slate-800">
                        التشخيص: {prescription.diagnosis}
                      </span>
                    )}
                  </div>
                )}
              </section>
            ) : null}

            {/* Main Rx Symbol & Prescribed Medications */}
            <main>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-serif italic font-black text-2xl sm:text-3xl leading-none select-none"
                  style={{ color: primaryColor }}
                >
                  ℞
                </span>
                <span className="text-xs font-bold text-slate-400">
                  العلاج الموصوف (Prescribed Medication)
                </span>
              </div>

              {/* Medication List */}
              <div
                className="space-y-3.5 border-r-2 pr-3"
                style={{ borderColor: `${primaryColor}60` }}
              >
                {page.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="break-inside-avoid pb-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {page.isFirstPage ? idx + 1 : (page.pageNumber - 1) * 5 + idx + 1}
                        </span>
                        <h2 className="text-sm sm:text-base font-black text-slate-900" dir="ltr">
                          {item.nameSnapshotEn || item.nameSnapshotAr}
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold">
                        {item.dosageFormSnapshot || item.strengthSnapshot || ''}
                      </span>
                    </div>

                    {/* Dosage, Frequency, Duration & Timing */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 mt-1 mr-7">
                      <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {item.dosage}
                      </span>
                      <span>•</span>
                      <span style={{ color: primaryColor }}>{item.frequency}</span>
                      <span>•</span>
                      <span className="text-slate-600">{item.duration}</span>
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
                      <p className="text-[11px] font-semibold text-slate-500 mr-7 mt-0.5 italic">
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

              {/* Custom Elements from Stage B Canvas */}
              {page.isLastPage &&
                template?.elements
                  ?.filter((el) => el.visible && el.type === 'custom_text' && el.customText)
                  .map((el) => (
                    <div
                      key={el.id}
                      className="mt-3 p-2 rounded-lg bg-teal-50/60 border border-teal-200/60 text-xs text-teal-900 font-bold"
                      style={{ textAlign: el.alignment }}
                    >
                      {el.customText}
                    </div>
                  ))}
            </main>
          </div>

          {/* Footer Area */}
          <footer className="relative z-10 border-t-2 border-slate-200 pt-2.5 mt-3 text-[11px] text-slate-600">
            {page.isLastPage && (
              <div className="flex items-center justify-between mb-1.5">
                {showReturnPolicy && (
                  <div className="flex items-center gap-1.5 font-bold" style={{ color: primaryColor }}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{returnDays}</span>
                  </div>
                )}

                {/* Doctor Signature & Stamp Area */}
                <div className="flex items-center gap-3">
                  {showStamp && template?.stampUrl && (
                    <div className="w-14 h-14 rounded-full overflow-hidden opacity-85 border border-dashed border-slate-300">
                      <img
                        src={template.stampUrl}
                        alt="Stamp"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {showSignature && (
                    <div className="text-center font-bold">
                      <span className="text-slate-400 block text-[10px]">توقيع الطبيب</span>
                      {template?.signatureUrl ? (
                        <img
                          src={template.signatureUrl}
                          alt="Signature"
                          className="h-8 object-contain inline-block"
                        />
                      ) : (
                        <span className="text-slate-800 font-serif italic text-sm">
                          {doctorName}
                        </span>
                      )}
                    </div>
                  )}
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
            <header
              className="border-b-2 pb-2.5 mb-4 text-center"
              style={{ borderColor: primaryColor }}
            >
              <div className="inline-flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5" style={{ color: primaryColor }} />
                <h2 className="text-lg sm:text-xl font-black" style={{ color: primaryColor }}>
                  إرشادات وتعليمات طبية هامة
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                حرصاً على سلامتكم وسرعة استجابتكم للعلاج، يرجى الالتزام بالتعليمات التالية
              </p>
            </header>

            <main className="space-y-3.5 text-xs">
              {/* General Medicine Compliance */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
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
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">ملاحظات خاصة من الطبيب</h3>
                  <p className="text-slate-700 leading-relaxed font-medium text-[11px] whitespace-pre-line">
                    {backNotes}
                  </p>
                </div>
              )}

              {/* Return Policy */}
              {showReturnPolicy && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm">ميعاد استشارة المتابعة (الإعادة)</h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-[11px]">
                    المتابعة الدقيقة تضمن التعافي التام والتأكد من استقرار الحالة. {returnDays}. يرجى إحضار هذه الروشتة في موعد الاستشارة.
                  </p>
                </div>
              )}
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
