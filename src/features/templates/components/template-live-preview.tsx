'use client';

import React from 'react';
import {
  Eye,
  FileText,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  Pill,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useTemplateStore } from '@/stores/template.store';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

export function TemplateLivePreview() {
  const { activeTemplate, previewPage, setPreviewPage } = useTemplateStore();

  if (!activeTemplate) return null;

  const isA5 = activeTemplate.paperSize === 'A5';
  const primaryColor = activeTemplate.primaryColor || '#0B7B5E';
  const fontFamily = activeTemplate.fontFamily || 'Cairo';

  // Sample medication items for realistic preview
  const sampleItems = [
    {
      name: 'Augmentin 1g',
      type: 'مضاد حيوي',
      dosage: 'قرص واحد',
      frequency: 'كل 12 ساعة',
      duration: 'لمدة 7 أيام',
      timing: 'بعد الأكل',
      instructions: 'يرجى إكمال الكورس العلاجي بالكامل',
    },
    {
      name: 'Panadol Extra',
      type: 'مسكن وخافض حرارة',
      dosage: 'قرصان',
      frequency: 'عند اللزوم',
      duration: 'لمدة 5 أيام',
      timing: 'بعد الأكل',
      instructions: 'لا تتجاوز 8 أقراص يومياً',
    },
    {
      name: 'Otrivin 0.1% Drops',
      type: 'نقط للأنف',
      dosage: 'نقطتان في كل جهة',
      frequency: '3 مرات يومياً',
      duration: 'لمدة 5 أيام فقط',
      timing: '',
      instructions: 'لا تستخدم أكثر من 5 أيام لتجنب احتقان الارتداد',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#D0E5DC] shadow-2xs overflow-hidden flex flex-col h-full sticky top-4">
      {/* Preview Bar */}
      <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#0B7B5E]" />
          <span className="text-xs font-black text-slate-800">معاينة حية ومباشرة للروشتة</span>
          <Badge className="bg-white text-slate-700 border-slate-200 text-[10px] font-bold">
            {activeTemplate.paperSize}
          </Badge>
        </div>

        {/* Page Switcher */}
        {activeTemplate.hasBackPage && (
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewPage(1)}
              className={`px-2.5 py-1 rounded text-[11px] font-black transition-all ${
                previewPage === 1 ? 'bg-[#0B7B5E] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الوجه (الأدوية)
            </button>
            <button
              type="button"
              onClick={() => setPreviewPage(2)}
              className={`px-2.5 py-1 rounded text-[11px] font-black transition-all ${
                previewPage === 2 ? 'bg-[#0B7B5E] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الظهر (التعليمات)
            </button>
          </div>
        )}
      </div>

      {/* Simulated Paper Canvas Container */}
      <div className="p-4 sm:p-6 bg-slate-100/70 overflow-auto flex items-center justify-center min-h-[540px]">
        {/* Paper Sheet */}
        <div
          className="bg-white shadow-md border border-slate-200 relative flex flex-col justify-between transition-all"
          style={{
            width: isA5 ? '135mm' : '170mm',
            minHeight: isA5 ? '190mm' : '240mm',
            padding: isA5 ? '14mm 12mm 12mm 12mm' : '18mm 16mm 16mm 16mm',
            fontFamily: fontFamily,
            boxSizing: 'border-box',
          }}
          dir="rtl"
        >
          {/* Rx Background Watermark */}
          {activeTemplate.showWatermark && (
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center select-none"
              style={{ opacity: activeTemplate.watermarkOpacity }}
            >
              <span
                className="font-serif italic font-black text-slate-900"
                style={{ fontSize: isA5 ? '140px' : '200px' }}
              >
                ℞
              </span>
            </div>
          )}

          {/* ════════════════════ PAGE 1: FRONT (MEDICATIONS) ════════════════════ */}
          {previewPage === 1 ? (
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div>
                {/* 1. Header Layout */}
                <header
                  className={`pb-3 mb-3 border-b-2 ${
                    activeTemplate.headerLayout === 'modern'
                      ? 'bg-slate-50/80 p-2.5 rounded-xl border-slate-200'
                      : ''
                  }`}
                  style={{ borderColor: primaryColor }}
                >
                  <div
                    className={`flex gap-3 ${
                      activeTemplate.headerLayout === 'centered'
                        ? 'flex-col items-center text-center'
                        : 'items-center justify-between'
                    }`}
                  >
                    {/* Doctor Info */}
                    <div className="space-y-0.5">
                      <h2
                        className="text-base sm:text-lg font-black leading-tight"
                        style={{ color: primaryColor }}
                      >
                        {activeTemplate.doctorNameAr || 'د. إسلام عبدالله كريمة'}
                      </h2>
                      <p className="text-[11px] font-bold text-slate-700 leading-snug">
                        {activeTemplate.medicalTitleAr || 'استشاري جراحة الأنف والأذن والحنجرة'}
                      </p>
                      {activeTemplate.qualificationsAr && (
                        <p className="text-[9.5px] text-slate-500 font-medium">
                          {activeTemplate.qualificationsAr}
                        </p>
                      )}
                      <p className="text-[9.5px] text-slate-400 font-semibold" dir="ltr">
                        {activeTemplate.doctorNameEn || 'Dr. Eslam Abdallah Karima'}
                      </p>
                    </div>

                    {/* Logo & Clinic Info */}
                    <div
                      className={`flex items-center gap-2.5 ${
                        activeTemplate.headerLayout === 'centered' ? 'justify-center' : 'text-left'
                      }`}
                    >
                      {activeTemplate.showLogo && activeTemplate.logoUrl && (
                        <img
                          src={activeTemplate.logoUrl}
                          alt="Logo"
                          className="w-10 h-10 object-contain rounded-lg border border-slate-200/60 p-0.5"
                        />
                      )}
                      <div>
                        <div
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[10px] font-black"
                          style={{
                            color: primaryColor,
                            borderColor: `${primaryColor}40`,
                            backgroundColor: `${primaryColor}10`,
                          }}
                        >
                          <Building2 className="w-3 h-3" />
                          <span>{activeTemplate.clinicNameAr || 'عيادة نَفَس التخصصية'}</span>
                        </div>
                        {activeTemplate.syndicateNumber && (
                          <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                            {activeTemplate.syndicateNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </header>

                {/* 2. Patient Info Bar */}
                {activeTemplate.showPatientBox && (
                  <section className="bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5 mb-3 grid grid-cols-12 gap-2 text-[10px]">
                    <div className="col-span-6 font-bold flex items-center gap-1">
                      <span className="text-slate-400">اسم المريض:</span>
                      <span className="font-black text-slate-900">محمد أحمد إبراهيم</span>
                    </div>
                    <div className="col-span-3 font-semibold flex items-center gap-1">
                      <span className="text-slate-400">العمر:</span>
                      <span className="font-bold text-slate-800">32 سنة</span>
                    </div>
                    <div className="col-span-3 font-semibold flex items-center gap-1 justify-end">
                      <span className="text-slate-400">التاريخ:</span>
                      <span className="font-mono text-slate-700">
                        {new Date().toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </section>
                )}

                {/* 3. Rx Symbol Header */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="font-serif italic font-black text-xl leading-none select-none"
                    style={{ color: primaryColor }}
                  >
                    ℞
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-400">
                    العلاج الموصوف (Prescribed Medication)
                  </span>
                </div>

                {/* 4. Medications List */}
                <div className="space-y-2 border-r-2 pr-2.5" style={{ borderColor: `${primaryColor}60` }}>
                  {sampleItems.map((item, idx) => (
                    <div key={idx} className="pb-1.5 border-b border-slate-100 last:border-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-black text-slate-900 text-xs" dir="ltr">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold">{item.type}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 mt-1 mr-5">
                        <span className="text-slate-900">{item.dosage}</span>
                        <span>•</span>
                        <span style={{ color: primaryColor }}>{item.frequency}</span>
                        <span>•</span>
                        <span className="text-slate-600">{item.duration}</span>
                        {item.timing && (
                          <>
                            <span>•</span>
                            <span className="text-amber-800 bg-amber-50 px-1 py-0.2 rounded text-[9px]">
                              {item.timing}
                            </span>
                          </>
                        )}
                      </div>

                      {item.instructions && (
                        <p className="text-[9px] text-slate-500 mr-5 mt-0.5 italic">
                          ملاحظة: {item.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom Elements Rendered Inline */}
                {activeTemplate.elements
                  ?.filter((el) => el.visible && el.type === 'custom_text' && el.customText)
                  .map((el) => (
                    <div
                      key={el.id}
                      className="mt-3 p-2 rounded-lg bg-teal-50/60 border border-teal-200/60 text-[10px] text-teal-900 font-bold"
                      style={{ textAlign: el.alignment }}
                    >
                      {el.customText}
                    </div>
                  ))}
              </div>

              {/* 5. Footer & Signature */}
              <footer className="pt-2 border-t border-slate-200 text-[9px] text-slate-600 space-y-1.5 mt-auto">
                <div className="flex items-center justify-between">
                  {activeTemplate.showReturnPolicy && (
                    <div className="flex items-center gap-1 font-bold" style={{ color: primaryColor }}>
                      <Calendar className="w-3 h-3" />
                      <span>{activeTemplate.returnNotice || 'الكشف ساري لمدة 14 يوماً'}</span>
                    </div>
                  )}

                  {/* Doctor Signature / Stamp */}
                  <div className="flex items-center gap-3">
                    {activeTemplate.showStamp && activeTemplate.stampUrl && (
                      <div className="w-12 h-12 rounded-full overflow-hidden opacity-80 border border-dashed border-slate-300">
                        <img src={activeTemplate.stampUrl} alt="Stamp" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {activeTemplate.showSignature && (
                      <div className="text-center font-bold">
                        <span className="text-slate-400 block text-[8px]">توقيع الطبيب</span>
                        {activeTemplate.signatureUrl ? (
                          <img
                            src={activeTemplate.signatureUrl}
                            alt="Signature"
                            className="h-7 object-contain inline-block"
                          />
                        ) : (
                          <span className="font-serif italic text-slate-800 text-[11px]">
                            {activeTemplate.doctorNameAr || 'د. إسلام كريمة'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Address & Phone */}
                <div className="flex items-center justify-between text-slate-400 text-[8.5px] pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                    <span>{activeTemplate.clinicAddress || 'القاهرة - المعادي'}</span>
                  </div>

                  <div className="flex items-center gap-1 font-mono font-bold" dir="ltr">
                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                    <span>{activeTemplate.clinicPhones?.[0] || '01000000000'}</span>
                  </div>
                </div>
              </footer>
            </div>
          ) : (
            /* ════════════════════ PAGE 2: BACK (INSTRUCTIONS) ════════════════════ */
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div>
                <header className="border-b-2 pb-2.5 mb-3" style={{ borderColor: primaryColor }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" style={{ color: primaryColor }} />
                      <h3 className="text-sm font-black text-slate-900">
                        تعليمات وإرشادات ما بعد الكشف الطبي
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">ظهر الروشتة</span>
                  </div>
                </header>

                <div className="space-y-3 text-[10px] text-slate-700 leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-black text-slate-900 mb-1">الالتزام بمواعيد وجرعات العلاج:</h4>
                    <p className="text-slate-600">
                      {activeTemplate.backPageNotes ||
                        'يرجى الالتزام بالجرعات المحددة ومواعيد الدواء المقررة، وعدم التوقف عن تناول المضاد الحيوي قبل إكمال المدة المحددة حتى لو شعرت بالتحسن.'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
                    <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>علامات تستدعي التواصل الفوري أو التوجه للطوارئ:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-950 font-medium mr-1 text-[9.5px]">
                      <li>صعوبة في التنفس أو بلع السوائل</li>
                      <li>ارتفاع مفاجئ ومستمر في درجة الحرارة لا يستجيب للخافض</li>
                      <li>ظهور طفح جلدي تحسسي مفاجئ أو تورم في الشفتين</li>
                    </ul>
                  </div>

                  {activeTemplate.emergencyPhone && (
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-900 text-center font-bold">
                      خط الطوارئ الساخن:{' '}
                      <span className="font-mono text-xs font-black" dir="ltr">
                        {activeTemplate.emergencyPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <footer className="pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
                <span>{activeTemplate.clinicNameAr} · تمنياتنا لكم بالشفاء العاجل وموفور الصحة</span>
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
