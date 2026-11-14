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
  FileCheck2,
  HeartPulse,
} from 'lucide-react';

interface PrescriptionDocumentProps {
  prescription: Prescription;
  template?: PrescriptionTemplate | null;
  includeBackPage?: boolean;
  documentId?: string;
  targetPage?: 'all' | 'front' | 'back' | number;
}

export function PrescriptionDocument({
  prescription,
  template,
  includeBackPage = false,
  documentId = 'printable-prescription-document',
  targetPage = 'all',
}: PrescriptionDocumentProps) {
  const isA5 = true; // Prescription size is strictly standardized to A5 (148mm × 210mm)

  const doctorName = template?.doctorNameAr || 'د. إسلام عبدالله كريمة';
  const doctorNameEn = template?.doctorNameEn || 'Dr. Eslam Abdallah Karima';
  const doctorTitle =
    template?.medicalTitleAr || 'استشاري جراحة الأنف والأذن والحنجرة وجراحات الرأس والرقبة والمناظير الدقيقة';
  const qualifications = template?.qualificationsAr || '';
  const clinicName = template?.clinicNameAr || 'عيادة نَفَس التخصصية';
  const phone = template?.clinicPhones?.[0] || '01000000000';
  const address = template?.clinicAddress || 'القاهرة - المعادي - شارع النصر';
  const returnDays = template?.returnNotice || 'الكشف ساري لمدة 14 يوماً من تاريخ الزيارة';
  const backNotes =
    template?.backPageNotes ||
    'يرجى الالتزام التام بمواعيد وجرعات العلاج المقررة، وإحضار أصل هذه الروشتة في الاستشارة الطبية القادمة.';

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

  const dateFormatted = new Date(prescription.createdAt || Date.now()).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate dynamic multi-page distribution to prevent physical overflow
  const safeItems = Array.isArray(prescription?.items) ? prescription.items : [];
  const pages = paginatePrescriptionItems(safeItems, prescription?.paperSize || 'A5');

  // Filter pages based on active view mode
  let filteredPages = pages.filter((page) => {
    if (!targetPage || targetPage === 'all') return true;
    if (targetPage === 'front') return page.pageNumber === 1;
    if (targetPage === 'back') return page.pageNumber > 1;
    return page.pageNumber === targetPage;
  });

  // If user explicitly asks for "back" (ظهر الروشتة) but all medicines fit on page 1:
  const showVirtualBackPage = targetPage === 'back' && pages.length === 1;

  return (
    <div
      id={documentId}
      className="print-document-root text-slate-900 selection:bg-none w-full"
      style={{ fontFamily }}
      dir="rtl"
    >
      {/* ════════════════════ PAGINATED MEDICATION PAGES ════════════════════ */}
      {!showVirtualBackPage &&
        filteredPages.map((page) => (
          <div key={`sheet_wrap_${page.pageNumber}`} className="page-print-container mb-8 last:mb-0 w-full flex flex-col items-center">
            {/* Visual Header in Screen View */}
            <div className="print-hidden mb-2.5 px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-bold text-slate-200 flex items-center justify-between shadow-xs w-full max-w-[148mm]">
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${page.isFirstPage ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className="text-white font-black">
                  {page.isFirstPage ? '📄 وجه الروشتة (الصفحة 1)' : '🔄 ظهر الروشتة (الصفحة 2 - بقية العلاج الموصوف)'}
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {page.items.length} {page.items.length === 1 ? 'دواء' : 'أدوية'} في هذه الصفحة
              </span>
            </div>

            <div
              key={`page_${page.pageNumber}`}
              className={`page-sheet relative bg-white flex flex-col justify-between mx-auto shadow-2xl rounded-sm ${
                isA5 ? 'a5-dimensions' : 'a4-dimensions'
              }`}
              style={{
                boxSizing: 'border-box',
                padding: isA5 ? '12mm 12mm 10mm 12mm' : '22mm 18mm 18mm 18mm',
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

              <div className="relative z-10 flex-1 flex flex-col">
                {/* Header: Full on Page 1, Compact Continuation Header on Page 2 (الظهر) */}
                {page.isFirstPage ? (
                  <header
                    className={`pb-2 mb-2 border-b-2 ${
                      headerLayout === 'modern' ? 'bg-slate-50/70 p-2.5 rounded-2xl border-slate-200' : ''
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
                  <header
                    className="border-b-2 pb-2 mb-3 flex items-center justify-between text-xs text-slate-700 font-bold"
                    style={{ borderColor: primaryColor }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[11px] border border-amber-300 flex items-center gap-1">
                        <span>🔄 ظهر الروشتة</span>
                        <span>(صفحة {page.pageNumber})</span>
                      </span>
                      <span className="font-black text-slate-900" style={{ color: primaryColor }}>
                        {doctorName}
                      </span>
                    </div>
                    <span className="text-slate-600 font-semibold">
                      تابع علاج المريض:{' '}
                      <strong className="text-slate-900 font-black">{prescription.patient.name || 'مريض'}</strong>
                    </span>
                  </header>
                )}

                {/* Patient Bar (Full on Page 1, minimal on subsequent) */}
                {page.isFirstPage && showPatientBox ? (
                  <section className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 mb-2 grid grid-cols-12 gap-1.5 text-xs">
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
                      <div className="col-span-12 pt-1 border-t border-slate-200/80 flex items-center gap-4 text-[11px] text-slate-600">
                        {prescription.patient.gender && (
                          <span>
                            النوع:{' '}
                            {prescription.patient.gender === 'MALE'
                              ? 'ذكر'
                              : prescription.patient.gender === 'FEMALE'
                              ? 'أنثى'
                              : 'أخرى'}
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
                <main className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="font-serif italic font-black text-2xl leading-none select-none"
                      style={{ color: primaryColor }}
                    >
                      ℞
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {page.isFirstPage ? 'العلاج الموصوف (Prescribed Medication)' : 'تكملة العلاج الموصوف (Continued)'}
                    </span>
                  </div>

                  {/* Medication List */}
                  <div
                    className="space-y-2 border-r-2 pr-2.5"
                    style={{ borderColor: `${primaryColor}60` }}
                  >
                    {page.items.map((item, idx) => {
                      const drugName =
                        item.nameSnapshotEn?.trim() ||
                        item.nameSnapshotAr?.trim() ||
                        (item as unknown as { name?: string }).name?.trim() ||
                        'دواء موصوف';
                      const isArabic = /[\u0600-\u06FF]/.test(drugName);
                      const displayNum = item.displayOrder || idx + 1;

                      return (
                        <div
                          key={item.id || `med_${idx}`}
                          className="break-inside-avoid pb-1.5 border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                style={{ backgroundColor: primaryColor }}
                              >
                                {displayNum}
                              </span>
                              <h2
                                className="text-sm font-black text-slate-900"
                                dir={isArabic ? 'rtl' : 'ltr'}
                              >
                                {drugName}
                              </h2>
                              {item.nameSnapshotAr &&
                                item.nameSnapshotEn &&
                                item.nameSnapshotAr !== item.nameSnapshotEn && (
                                  <span className="text-xs text-slate-500 font-semibold">
                                    ({item.nameSnapshotAr})
                                  </span>
                                )}
                            </div>
                            <span className="text-xs text-slate-500 font-semibold shrink-0">
                              {item.dosageFormSnapshot || item.strengthSnapshot || ''}
                            </span>
                          </div>

                          {/* Dosage, Frequency, Duration & Timing */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-700 mt-0.5 mr-7">
                            <span className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {item.dosage || 'قرص واحد'}
                            </span>
                            <span>•</span>
                            <span style={{ color: primaryColor }}>
                              {item.frequency || 'يومياً'}
                            </span>
                            <span>•</span>
                            <span className="text-slate-600">
                              {item.duration || 'حسب الحاجة'}
                            </span>
                            {item.timing && item.timing.trim().length > 0 && item.timing.trim() !== 'بعد الأكل' && (
                              <>
                                <span>•</span>
                                <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                                  {item.timing}
                                </span>
                              </>
                            )}
                            {item.route && item.route !== 'فموي' && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500 text-[10px] font-normal">
                                  ({item.route})
                                </span>
                              </>
                            )}
                          </div>

                          {/* Specific Medicine Note (Plain text - سادة) */}
                          {item.instructions && item.instructions.trim().length > 0 && (
                            <p className="text-xs font-semibold text-slate-600 mr-7 mt-0.5">
                              ملاحظة: {item.instructions.trim()}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Empty State when no medicines have been added */}
                    {page.items.length === 0 && (
                      <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl my-3">
                        <p className="text-xs font-bold text-slate-500">لم يتم وصف أدوية في هذه الروشتة بعد</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">أضف أدوية من شريط البحث أو دليل الأدوية</p>
                      </div>
                    )}
                  </div>

                  {/* Custom Elements from Template */}
                  {page.isLastPage &&
                    template?.elements
                      ?.filter((el) => el.visible && el.type === 'custom_text' && el.customText)
                      .map((el) => (
                        <div
                          key={el.id}
                          className="mt-2 p-2 rounded-lg bg-teal-50/60 border border-teal-200/60 text-xs text-teal-900 font-bold"
                          style={{ textAlign: el.alignment }}
                        >
                          {el.customText}
                        </div>
                      ))}

                  {/* Doctor's Custom Instructions (Only shown if added via form - لو مفيش ميكتبهاش) */}
                  {page.isLastPage && (() => {
                    const rawList =
                      prescription.instructionsList && prescription.instructionsList.length > 0
                        ? prescription.instructionsList
                        : prescription.notes
                        ? prescription.notes.split('\n').map((s) => s.trim()).filter(Boolean)
                        : [];

                    if (rawList.length === 0) return null;

                    return (
                      <div
                        className="mt-3 p-2.5 rounded-xl border-2 text-xs"
                        style={{
                          borderColor: `${primaryColor}40`,
                          backgroundColor: '#F7FCF9',
                        }}
                      >
                        <div className="flex items-center gap-1.5 font-black mb-1.5" style={{ color: primaryColor }}>
                          <HeartPulse className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-black">التعليمات والإرشادات الطبية العامة:</span>
                        </div>
                        <div className="space-y-1 pr-1">
                          {rawList.map((inst, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-900 font-bold leading-relaxed">
                              <span
                                className="w-4 h-4 rounded-full text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5"
                                style={{ backgroundColor: primaryColor }}
                              >
                                {idx + 1}
                              </span>
                              <span>{inst}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
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
          </div>
        ))}

      {/* ════════════════════ VIRTUAL BACK PAGE (WHEN 1 PAGE BUT BACK VIEW REQUESTED) ════════════════════ */}
      {showVirtualBackPage && (
        <div className="page-print-container mb-8 last:mb-0 w-full flex flex-col items-center">
          {/* Visual Header in Screen View */}
          <div className="print-hidden mb-2.5 px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-bold text-slate-200 flex items-center justify-between shadow-xs w-full max-w-[148mm]">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-white font-black">🔄 ظهر الروشتة (الصفحة 2)</span>
            </span>
            <span className="text-[11px] text-amber-300 font-medium">
              الوجه كافٍ — لا توجد أدوية منقولة للظهر
            </span>
          </div>

          <div
            className={`page-sheet relative bg-white flex flex-col justify-between mx-auto shadow-2xl rounded-sm ${
              isA5 ? 'a5-dimensions' : 'a4-dimensions'
            }`}
            style={{
              boxSizing: 'border-box',
              padding: isA5 ? '12mm 12mm 10mm 12mm' : '22mm 18mm 18mm 18mm',
            }}
          >
            {/* Watermark */}
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

            <div className="relative z-10 flex-1 flex flex-col">
              {/* Back Page Header */}
              <header
                className="border-b-2 pb-2 mb-4 flex items-center justify-between text-xs text-slate-700 font-bold"
                style={{ borderColor: primaryColor }}
              >
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[11px] border border-amber-300">
                    🔄 ظهر الروشتة (الصفحة 2)
                  </span>
                  <span className="font-black text-slate-900" style={{ color: primaryColor }}>
                    {doctorName}
                  </span>
                </div>
                <span className="text-slate-600 font-semibold">
                  المريض: <strong className="text-slate-900 font-black">{prescription.patient.name || 'مريض'}</strong>
                </span>
              </header>

              {/* Status Notice Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 mb-4 text-center">
                <FileCheck2 className="w-8 h-8 text-amber-700 mx-auto mb-2" />
                <h3 className="text-xs font-black text-amber-900">
                  ظهر الروشتة فارغ — جميع الأدوية مدرجة في وجه الورقة
                </h3>
                <p className="text-[11px] text-amber-800 font-medium mt-1 max-w-sm mx-auto leading-relaxed">
                  عدد الأدوية الموصوفة ({safeItems.length} أدوية) كافٍ ويتسع له وجه الروشتة تماماً (حتى 5 أدوية). عند إضافة أدوية أخرى تتجاوز سعة الوجه، ستُنقل هنا تلقائياً.
                </p>
              </div>

              {/* Doctor's Written Instructions (Only if added via form - لو مفيش ميكتبهاش) */}
              {(() => {
                const rawList =
                  prescription.instructionsList && prescription.instructionsList.length > 0
                    ? prescription.instructionsList
                    : prescription.notes
                    ? prescription.notes.split('\n').map((s) => s.trim()).filter(Boolean)
                    : [];

                if (rawList.length === 0) {
                  return (
                    <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400">
                      <p className="text-xs font-semibold text-slate-400">
                        لا توجد تعليمات إضافية مسجلة لهذه الروشتة
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="flex-1 space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800" style={{ color: primaryColor }}>
                      <HeartPulse className="w-4 h-4" />
                      <span>التعليمات والإرشادات الطبية للمريض:</span>
                    </div>
                    <div className="space-y-1.5 pt-1 pr-1">
                      {rawList.map((inst, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#074C3A] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="font-semibold">{inst}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Back Page Footer */}
            <footer className="relative z-10 border-t-2 border-slate-200 pt-2.5 mt-3 text-[11px] text-slate-600">
              <div className="flex items-center justify-between mb-1.5">
                {showReturnPolicy && (
                  <div className="flex items-center gap-1.5 font-bold" style={{ color: primaryColor }}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{returnDays}</span>
                  </div>
                )}

                <div className="text-center font-bold">
                  <span className="text-slate-400 block text-[10px]">خاتم وتوقيع الطبيب</span>
                  <span className="text-slate-800 font-serif italic text-sm">{doctorName}</span>
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
        </div>
      )}

      {/* ════════════════════ PRINT-SPECIFIC CSS ════════════════════ */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${isA5 ? '148mm 210mm' : '210mm 297mm'} portrait;
            margin: 0;
          }
          .print-hidden {
            display: none !important;
          }
          .page-print-container {
            margin-bottom: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
          }
          html, body {
            background: white !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-document-root {
            width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: block !important;
          }
          .page-sheet {
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            min-height: ${isA5 ? '210mm' : '297mm'} !important;
            height: auto !important;
            overflow: visible !important;
          }
          .page-sheet:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
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
