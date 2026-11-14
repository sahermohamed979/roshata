'use client';

import React, { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  EntExaminationData,
} from '../types/ent-examination.types';
import {
  EarAnatomyDiagram,
  NoseAnatomyDiagram,
  MallampatiSelector,
  LarynxVocalCordDiagram,
} from './ent-examination-diagrams';

interface EntPaperSheetProps {
  examData: EntExaminationData;
  patient: any;
  doctor?: any;
  onChange: (updater: (prev: EntExaminationData) => EntExaminationData) => void;
  isPrintOnly?: boolean;
}

/**
 * مكون حقل كتابة متعدد الأسطر بمظهر الشيت الورقي (خط منقط سفلي مع إمكانية النزول لسطر جديد تلقائياً)
 */
function PaperTextarea({
  value,
  onChange,
  className = '',
  placeholder = '',
  rows = 1,
  readOnly = false,
}: {
  value?: string;
  onChange?: (val: string) => void;
  className?: string;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.max(ref.current.scrollHeight, rows * 20)}px`;
    }
  }, [value, rows]);

  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value || ''}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => {
        onChange?.(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      className={`w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none resize-none leading-snug overflow-hidden ${className}`}
    />
  );
}

/**
 * شيت الكشف الطبي الكامل لعيادة الأنف والأذن والحنجرة
 * مطابق 100% للأصل الورقي في الصورتين (الصفحة الأولى والصفحة الثانية)
 */
export function EntPaperSheet({
  examData,
  patient,
  doctor,
  onChange,
  isPrintOnly = false,
}: EntPaperSheetProps) {
  // تحديث حقل مباشر
  const setField = <K extends keyof EntExaminationData>(key: K, value: EntExaminationData[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  // 🚀 وظيفة القفز الفوري لأقسام الشيت وتركيز المؤشر
  const jumpToSection = (sectionId: string, focusSelector?: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // وميض تأكيدي هادئ لإرشاد عين الطبيب للقسم المقصود
    el.classList.add('ring-4', 'ring-[#0B7B5E]/60', 'bg-emerald-50/50', 'rounded-xl', 'transition-all');
    setTimeout(() => {
      el.classList.remove('ring-4', 'ring-[#0B7B5E]/60', 'bg-emerald-50/50');
    }, 1500);

    // توجيه مؤشر الكتابة تلقائياً للحقل
    if (focusSelector) {
      setTimeout(() => {
        const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(focusSelector);
        if (input) {
          input.focus();
        }
      }, 350);
    }
  };

  // الاستماع لاختصارات لوحة المفاتيح H, E, D, V أو Alt+H, Alt+E, Alt+D, Alt+V
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      const isInputFocused =
        targetTag === 'INPUT' ||
        targetTag === 'TEXTAREA' ||
        (e.target as HTMLElement)?.isContentEditable;

      const key = e.key.toUpperCase();
      const match = (letter: string) =>
        (e.altKey && key === letter) ||
        (!isInputFocused && !e.ctrlKey && !e.altKey && !e.metaKey && key === letter);

      if (match('H')) {
        e.preventDefault();
        jumpToSection('section-history', 'textarea');
      } else if (match('E')) {
        e.preventDefault();
        jumpToSection('section-examination', 'input, textarea');
      } else if (match('N')) {
        e.preventDefault();
        jumpToSection('section-nose', 'input, textarea');
      } else if (match('L')) {
        e.preventDefault();
        jumpToSection('section-larynx', 'input, textarea');
      } else if (match('D')) {
        e.preventDefault();
        jumpToSection('section-diagnosis', 'textarea, input');
      } else if (match('V')) {
        e.preventDefault();
        jumpToSection('section-visits', 'textarea, input');
      } else if (match('C') && !isInputFocused) {
        e.preventDefault();
        jumpToSection('section-complaint', 'textarea');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // تحديث فحص الأذن
  const updateEar = (side: 'rt' | 'lt', prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      ear: {
        ...prev.ear,
        [side]: { ...prev.ear[side], [prop]: val },
      },
    }));
  };

  // تحديث فحص الاتزان
  const updateVestibular = (prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      ear: {
        ...prev.ear,
        vestibular: { ...prev.ear.vestibular, [prop]: val },
      },
    }));
  };

  // تحديث فحص الأنف
  const updateNose = (side: 'rt' | 'lt', prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      nose: {
        ...prev.nose,
        [side]: { ...prev.nose[side], [prop]: val },
      },
    }));
  };

  // تحديث فحص البلعوم
  const updateOropharynx = (prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      oropharynx: { ...prev.oropharynx, [prop]: val },
    }));
  };

  // تحديث فحص الحنجرة والرقبة
  const updateLarynx = (prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      larynx: { ...prev.larynx, [prop]: val },
    }));
  };

  // قائمة عناصر فحص الأذن
  const earItems = [
    { id: 'swelling', label: 'Swelling' },
    { id: 'tenderness', label: 'Tenderness' },
    { id: 'discharge', label: 'Discharge' },
    { id: 'rinne', label: 'Rinné' },
    { id: 'fistula', label: 'Fistula' },
    { id: 'deformity', label: 'Deformity' },
    { id: 'battleSign', label: 'Battle sign' },
    { id: 'facialPalsy', label: 'Facial palsy' },
    { id: 'others', label: 'Others' },
  ];

  // قائمة عناصر فحص الأنف
  const noseItems = [
    { id: 'septum', label: 'Septum' },
    { id: 'infTurbinate', label: 'Inf Turbinate' },
    { id: 'bleeders', label: 'Bleeders' },
    { id: 'discharge', label: 'Discharge' },
    { id: 'polypsGrade', label: 'Polyps: Grade' },
    { id: 'mass', label: 'Mass' },
    { id: 'eye', label: 'Eye' },
    { id: 'nasopharynx', label: 'Nasopharynx' },
  ];

  // قائمة عناصر فحص الحنجرة والرقبة
  const larynxItems = [
    { id: 'lymphNode', label: 'Lymph node' },
    { id: 'swelling', label: 'Swelling' },
    { id: 'mouresSign', label: "Moure's sign" },
    { id: 'thyroid', label: 'Thyroid' },
    { id: 'parotid', label: 'Parotid' },
    { id: 'submandibular', label: 'Submandibular' },
    { id: 'indirectLaryngoscope', label: 'Indirect laryngoscope' },
    { id: 'others', label: 'Others' },
  ];

  // قوائم الفحوصات المتعددة (Investigations: Present & Need)
  const presentList = examData.investigations?.presentList && examData.investigations.presentList.length > 0
    ? examData.investigations.presentList
    : (
        examData.investigations?.present
          ? [{ id: 'p1', name: examData.investigations.present, revealed: examData.investigations.presentRevealed || '' }]
          : [{ id: 'p1', name: '', revealed: '' }]
      );

  const needList = examData.investigations?.needList && examData.investigations.needList.length > 0
    ? examData.investigations.needList
    : (
        examData.investigations?.need
          ? [{ id: 'n1', name: examData.investigations.need, revealed: examData.investigations.needRevealed || '' }]
          : [{ id: 'n1', name: '', revealed: '' }]
      );

  const updatePresentItem = (index: number, field: 'name' | 'revealed', value: string) => {
    const updated = [...presentList];
    updated[index] = { ...updated[index], [field]: value };
    onChange((prev) => ({
      ...prev,
      investigations: {
        ...prev.investigations,
        presentList: updated,
        present: updated[0]?.name || '',
        presentRevealed: updated[0]?.revealed || '',
      },
    }));
  };

  const addPresentItem = () => {
    const updated = [...presentList, { id: 'p_' + Date.now(), name: '', revealed: '' }];
    onChange((prev) => ({
      ...prev,
      investigations: { ...prev.investigations, presentList: updated },
    }));
  };

  const removePresentItem = (index: number) => {
    const updated = presentList.filter((_, i) => i !== index);
    const final = updated.length > 0 ? updated : [{ id: 'p_' + Date.now(), name: '', revealed: '' }];
    onChange((prev) => ({
      ...prev,
      investigations: {
        ...prev.investigations,
        presentList: final,
        present: final[0]?.name || '',
        presentRevealed: final[0]?.revealed || '',
      },
    }));
  };

  const updateNeedItem = (index: number, field: 'name' | 'revealed', value: string) => {
    const updated = [...needList];
    updated[index] = { ...updated[index], [field]: value };
    onChange((prev) => ({
      ...prev,
      investigations: {
        ...prev.investigations,
        needList: updated,
        need: updated[0]?.name || '',
        needRevealed: updated[0]?.revealed || '',
      },
    }));
  };

  const addNeedItem = () => {
    const updated = [...needList, { id: 'n_' + Date.now(), name: '', revealed: '' }];
    onChange((prev) => ({
      ...prev,
      investigations: { ...prev.investigations, needList: updated },
    }));
  };

  const removeNeedItem = (index: number) => {
    const updated = needList.filter((_, i) => i !== index);
    const final = updated.length > 0 ? updated : [{ id: 'n_' + Date.now(), name: '', revealed: '' }];
    onChange((prev) => ({
      ...prev,
      investigations: {
        ...prev.investigations,
        needList: final,
        need: final[0]?.name || '',
        needRevealed: final[0]?.revealed || '',
      },
    }));
  };

  // قائمة الزيارات الإضافية المتعددة (Visits: 2nd, 3rd, 4th, 5th...)
  const getOrdinalLabel = (n: number) => {
    if (n === 2) return '2nd Visit:';
    if (n === 3) return '3rd Visit:';
    return `${n}th Visit:`;
  };

  const visitsList = examData.additionalVisits && examData.additionalVisits.length > 0
    ? examData.additionalVisits
    : [
        { id: 'v2', visitNumber: 2, label: '2nd Visit:', date: '', notes: examData.secondVisitNotes || '' },
      ];

  const updateVisit = (index: number, field: 'date' | 'notes', val: string) => {
    const updated = [...visitsList];
    updated[index] = { ...updated[index], [field]: val };
    onChange((prev) => ({
      ...prev,
      additionalVisits: updated,
      secondVisitNotes: updated[0]?.notes || '',
      thirdVisitNotes: updated[1]?.notes || '',
    }));
  };

  const addVisit = () => {
    const nextNum = visitsList.length + 2;
    const newVisit = {
      id: 'v_' + Date.now(),
      visitNumber: nextNum,
      label: getOrdinalLabel(nextNum),
      date: '',
      notes: '',
    };
    const updated = [...visitsList, newVisit];
    onChange((prev) => ({
      ...prev,
      additionalVisits: updated,
    }));
  };

  const removeVisit = (index: number) => {
    const updated = visitsList.filter((_, i) => i !== index).map((v, i) => ({
      ...v,
      visitNumber: i + 2,
      label: getOrdinalLabel(i + 2),
    }));
    onChange((prev) => ({
      ...prev,
      additionalVisits: updated,
      secondVisitNotes: updated[0]?.notes || '',
      thirdVisitNotes: updated[1]?.notes || '',
    }));
  };

  return (
    <div
      dir="ltr"
      className="w-full text-black font-serif select-text space-y-8 print:space-y-0 print:p-0 print:m-0 relative"
    >
      {/* 🚀 شريط التنقل والاختصارات السريعة على الجانب الأيسر (طلب د. إسلام) */}
      {!isPrintOnly && (
        <aside
          aria-label="اختصارات الانتقال السريع"
          className="fixed left-3 top-1/2 -translate-y-1/2 z-40 print:hidden flex flex-col items-center gap-1.5 p-2 bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl shadow-xl transition-all"
        >
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200 px-1 text-center select-none font-sans">
            JUMP
          </div>

          {/* H -> History of present illness */}
          <button
            type="button"
            onClick={() => jumpToSection('section-history', 'textarea')}
            title="History of present illness (اضغط H أو Alt+H)"
            className="group relative w-11 h-11 rounded-xl bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-800 border border-sky-300 flex flex-col items-center justify-center font-black font-sans transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="text-sm leading-none font-black">H</span>
            <span className="text-[8px] font-bold leading-none opacity-80 group-hover:opacity-100">History</span>
            <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 font-sans">
              History of present illness (H)
            </span>
          </button>

          {/* E -> Examination */}
          <button
            type="button"
            onClick={() => jumpToSection('section-examination', 'input, textarea')}
            title="Examination (اضغط E أو Alt+E)"
            className="group relative w-11 h-11 rounded-xl bg-emerald-50 hover:bg-[#0B7B5E] hover:text-white text-[#0B7B5E] border border-emerald-300 flex flex-col items-center justify-center font-black font-sans transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="text-sm leading-none font-black">E</span>
            <span className="text-[8px] font-bold leading-none opacity-80 group-hover:opacity-100">Exam</span>
            <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 font-sans">
              Examination : (E)
            </span>
          </button>

          {/* N -> Nose */}
          <button
            type="button"
            onClick={() => jumpToSection('section-nose', 'input, textarea')}
            title="Nose Examination (اضغط N أو Alt+N)"
            className="group relative w-11 h-11 rounded-xl bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-800 border border-orange-300 flex flex-col items-center justify-center font-black font-sans transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="text-sm leading-none font-black">N</span>
            <span className="text-[8px] font-bold leading-none opacity-80 group-hover:opacity-100">Nose</span>
            <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 font-sans">
              Nose : (N)
            </span>
          </button>

          {/* L -> Larynx */}
          <button
            type="button"
            onClick={() => jumpToSection('section-larynx', 'input, textarea')}
            title="Larynx & Head & Neck (اضغط L أو Alt+L)"
            className="group relative w-11 h-11 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 border border-teal-300 flex flex-col items-center justify-center font-black font-sans transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="text-sm leading-none font-black">L</span>
            <span className="text-[8px] font-bold leading-none opacity-80 group-hover:opacity-100">Larynx</span>
            <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 font-sans">
              Larynx & Head & Neck : (L)
            </span>
          </button>

          {/* D -> Diagnosis */}
          <button
            type="button"
            onClick={() => jumpToSection('section-diagnosis', 'textarea, input')}
            title="Diagnosis (اضغط D أو Alt+D)"
            className="group relative w-11 h-11 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-800 border border-purple-300 flex flex-col items-center justify-center font-black font-sans transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="text-sm leading-none font-black">D</span>
            <span className="text-[8px] font-bold leading-none opacity-80 group-hover:opacity-100">Diag</span>
            <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 font-sans">
              Diagnosis : (D)
            </span>
          </button>

          {/* V -> Visits History */}
          <button
            type="button"
            onClick={() => jumpToSection('section-visits', 'textarea, input')}
            title="Visits History (اضغط V أو Alt+V)"
            className="group relative w-11 h-11 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 border border-amber-300 flex flex-col items-center justify-center font-black font-sans transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="text-sm leading-none font-black">V</span>
            <span className="text-[8px] font-bold leading-none opacity-80 group-hover:opacity-100">Visits</span>
            <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 font-sans">
              Visits History : (V)
            </span>
          </button>

          {/* Rx -> الانتقال الفوري للروشتة */}
          <button
            type="button"
            onClick={() => {
              const rxBtn = document.querySelector('[aria-label="الانتقال السريع للروشتة"] button') as HTMLButtonElement;
              if (rxBtn) rxBtn.click();
            }}
            title="الروشتة الطبية (اضغط Alt+R)"
            className="group relative w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400 flex flex-col items-center justify-center font-black font-sans transition-all cursor-pointer shadow-md active:scale-95 mt-1"
          >
            <span className="text-xs leading-none font-black">Rx</span>
            <span className="text-[7px] font-bold leading-none opacity-90">روشتة</span>
            <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 font-sans">
              الروشتة الطبية (Rx)
            </span>
          </button>
        </aside>
      )}

      {/* ============================================================== */}
      {/* 📄 الورقة الأولى (Sheet 1) - مطابقة تماماً للصورة الأولى         */}
      {/* ============================================================== */}
      <div className="sheet-page-1 bg-white border-2 border-black p-4 sm:p-5 rounded-none shadow-sm space-y-3 print:border-2 print:border-black print:p-4 print:shadow-none print:w-full">
        {/* الترويسة العلوية: File NO | Name | Date */}
        <div className="border border-black grid grid-cols-12 text-[13px]">
          <div className="col-span-3 border-r border-black p-1.5 flex items-baseline gap-1">
            <span className="font-bold uppercase tracking-tight shrink-0">File NO:</span>
            <input
              type="text"
              value={examData.fileNo || ''}
              onChange={(e) => setField('fileNo', e.target.value)}
              className="w-full bg-transparent border-none p-0 text-[13px] font-mono font-bold focus:outline-none"
            />
          </div>
          <div className="col-span-6 border-r border-black p-1.5 flex items-baseline gap-1.5">
            <span className="font-bold text-[14px] uppercase tracking-tight shrink-0">Name:</span>
            <span className="font-black text-[16px] text-black tracking-wide">
              {patient?.fullName || '................................................'}
            </span>
          </div>
          <div className="col-span-3 p-1.5 flex items-baseline gap-1">
            <span className="font-bold uppercase tracking-tight shrink-0">Date:</span>
            <input
              type="text"
              value={examData.date || ''}
              onChange={(e) => setField('date', e.target.value)}
              className="w-full bg-transparent border-none p-0 text-[13px] font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* سطر البيانات الديموغرافية الأول: Age | Sex | Residence | Marital states */}
        <div className="grid grid-cols-12 gap-2 text-[12px] pt-1">
          <div className="col-span-2 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Age:</span>
            <span className="w-full border-b border-dotted border-black px-1 font-bold">
              {patient?.age ? `${patient.age} Y` : '......'}
            </span>
          </div>
          <div className="col-span-2 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Sex:</span>
            <span className="w-full border-b border-dotted border-black px-1 font-bold">
              {patient?.gender === 'MALE' ? 'Male' : patient?.gender === 'FEMALE' ? 'Female' : '......'}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Residence:</span>
            <PaperTextarea
              rows={1}
              value={examData.residence || ''}
              onChange={(val) => setField('residence', val)}
              className="text-[12px]"
            />
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Marital states:</span>
            <PaperTextarea
              rows={1}
              value={examData.maritalStatus || ''}
              onChange={(val) => setField('maritalStatus', val)}
              className="text-[12px]"
            />
          </div>
        </div>

        {/* سطر البيانات الديموغرافية الثاني: Work | Habits | Smoking index | Tele */}
        <div className="grid grid-cols-12 gap-2 text-[12px]">
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Work:</span>
            <PaperTextarea
              rows={1}
              value={examData.work || ''}
              onChange={(val) => setField('work', val)}
              className="text-[12px]"
            />
          </div>
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Habits:</span>
            <PaperTextarea
              rows={1}
              value={examData.habits || ''}
              onChange={(val) => setField('habits', val)}
              className="text-[12px]"
            />
          </div>
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Smoking index:</span>
            <PaperTextarea
              rows={1}
              value={examData.smokingIndex || ''}
              onChange={(val) => setField('smokingIndex', val)}
              className="text-[12px]"
            />
          </div>
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Tele:</span>
            <span className="w-full border-b border-dotted border-black px-1 font-mono text-[11px] font-bold">
              {patient?.phone || '............'}
            </span>
          </div>
        </div>

        {/* Complaint (الشكوى الرئيسية) */}
        <div id="section-complaint" className="space-y-1 pt-1 scroll-mt-24 transition-all duration-300">
          <span className="font-black text-[13px] inline-block px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">Complaint:</span>
          <textarea
            rows={2}
            value={examData.complaint || ''}
            onChange={(e) => setField('complaint', e.target.value)}
            placeholder="اكتب شكوى المريض الرئيسية..."
            className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] leading-6 focus:outline-none resize-none"
          />
        </div>

        {/* History of present illness (تاريخ المرض الحالي) */}
        <div id="section-history" className="space-y-1 scroll-mt-24 transition-all duration-300">
          <span className="font-black text-[13px] inline-block px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">History of present illness:</span>
          <textarea
            rows={5}
            value={examData.historyOfPresentIllness || ''}
            onChange={(e) => setField('historyOfPresentIllness', e.target.value)}
            placeholder="تفاصيل الشكوى الحالية وتطور الأعراض..."
            className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] leading-6 focus:outline-none resize-none"
          />
        </div>

        {/* Past history (التاريخ المرضي السابق) */}
        <div id="section-past-history" className="space-y-1.5 text-[12px] scroll-mt-24 transition-all duration-300">
          <span className="font-black text-[13px] inline-block px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">Past history:</span>

          <div className="flex items-baseline gap-1">
            <span className="font-bold shrink-0 text-indigo-950">- Medical problems:</span>
            <PaperTextarea
              rows={1}
              value={examData.medicalProblems || ''}
              onChange={(val) => setField('medicalProblems', val)}
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold shrink-0">- Drugs:</span>
            <PaperTextarea
              rows={1}
              value={examData.drugs || ''}
              onChange={(val) => setField('drugs', val)}
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold shrink-0">- Previous operations: (Not related)</span>
            <PaperTextarea
              rows={1}
              value={examData.previousOperationsNotRelated || ''}
              onChange={(val) => setField('previousOperationsNotRelated', val)}
            />
          </div>

          <div className="flex items-baseline gap-1 pl-6">
            <span className="font-bold shrink-0">(Related)</span>
            <PaperTextarea
              rows={1}
              value={examData.previousOperationsRelated || ''}
              onChange={(val) => setField('previousOperationsRelated', val)}
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[13px] shrink-0">Family history:</span>
            <PaperTextarea
              rows={1}
              value={examData.familyHistory || ''}
              onChange={(val) => setField('familyHistory', val)}
            />
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Examination : & فحص الأذن (Ear) المكبّر والمطابق للصورة المرفقة */}
        <div id="section-examination" className="space-y-1 scroll-mt-24 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="font-black text-[13px] inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">Examination :</span>
          </div>

          <div className="grid grid-cols-12 gap-1.5 items-start">
            {/* القائمة اليسرى (Rt Ear) */}
            <div className="col-span-2 space-y-1 text-[12px] pt-4">
              {earItems.map((it) => (
                <div key={it.id} className="flex items-baseline gap-1">
                  <span className="font-bold shrink-0 text-[10px] sm:text-[11px]">- {it.label}:</span>
                  <PaperTextarea
                    rows={1}
                    value={(examData.ear.rt as any)?.[it.id] || ''}
                    onChange={(val) => updateEar('rt', it.id, val)}
                    className="py-0.5 text-[11px]"
                  />
                </div>
              ))}
            </div>

            {/* في المنتصف: رسم الأذن التشريحي المكبّر إلى أقصى حد ممكن واختبار ويبر مع إمكانية الرسم بالقلم */}
            <div className="col-span-8 flex flex-col items-center justify-center">
              <EarAnatomyDiagram
                selectedWeber={examData.ear.weber}
                onSelectWeber={(val) =>
                  onChange((prev) => ({
                    ...prev,
                    ear: { ...prev.ear, weber: val },
                  }))
                }
                drawing={examData.ear.drawing}
                onSaveDrawing={(val) =>
                  onChange((prev) => ({
                    ...prev,
                    ear: { ...prev.ear, drawing: val },
                  }))
                }
                drawingHistory={examData.ear.drawingHistory}
                onAddSnapshot={(snap) =>
                  onChange((prev) => ({
                    ...prev,
                    ear: {
                      ...prev.ear,
                      drawingHistory: [...(prev.ear.drawingHistory || []), snap],
                    },
                  }))
                }
                readOnly={isPrintOnly}
              />
            </div>

            {/* القائمة اليمنى (Lt Ear) */}
            <div className="col-span-2 space-y-1 text-[12px] pt-4">
              {earItems.map((it) => (
                <div key={it.id} className="flex items-baseline gap-1">
                  <span className="font-bold shrink-0 text-[10px] sm:text-[11px]">- {it.label}:</span>
                  <PaperTextarea
                    rows={1}
                    value={(examData.ear.lt as any)?.[it.id] || ''}
                    onChange={(val) => updateEar('lt', it.id, val)}
                    className="py-0.5 text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* فحص الاتزان (Vestibular Assessment) - 3 أعمدة */}
        <div className="space-y-1.5 text-[12px]">
          <span className="font-bold text-[13px] underline block">Vestibular Assessment:</span>

          <div className="grid grid-cols-12 gap-3">
            {/* العمود 1 */}
            <div className="col-span-4 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Romberg test:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.ear.vestibular?.rombergTest || ''}
                  onChange={(val) => updateVestibular('rombergTest', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Head Shaking:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.ear.vestibular?.headShaking || ''}
                  onChange={(val) => updateVestibular('headShaking', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Others:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.ear.vestibular?.others || ''}
                  onChange={(val) => updateVestibular('others', val)}
                  className="text-[11px]"
                />
              </div>
            </div>

            {/* العمود 2 */}
            <div className="col-span-4 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Dexahallpike:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.ear.vestibular?.dexahallpike || ''}
                  onChange={(val) => updateVestibular('dexahallpike', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Head Thrust (Impulse):</span>
                <PaperTextarea
                  rows={1}
                  value={examData.ear.vestibular?.headThrust || ''}
                  onChange={(val) => updateVestibular('headThrust', val)}
                  className="text-[11px]"
                />
              </div>
            </div>

            {/* العمود 3 */}
            <div className="col-span-4 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- High steppage:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.ear.vestibular?.highSteppage || ''}
                  onChange={(val) => updateVestibular('highSteppage', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Caloric test:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.ear.vestibular?.caloricTest || ''}
                  onChange={(val) => updateVestibular('caloricTest', val)}
                  className="text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 📄 الورقة الثانية (Sheet 2) - مطابقة تماماً للصورة الثانية       */}
      {/* ============================================================== */}
      <div className="sheet-page-2 bg-white border-2 border-black p-4 sm:p-5 rounded-none shadow-sm space-y-3 print:border-2 print:border-black print:p-4 print:shadow-none print:w-full">
        {/* عنوان فحص الأنف (Nose) في المنتصف */}
        <div id="section-nose" className="space-y-3 scroll-mt-24 transition-all duration-300">
          <div className="text-center font-black text-[16px]">
            <span className="inline-block px-4 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">
              Nose
            </span>
          </div>

        {/* فحص الأنف المفصل مع رسم الهرم الأنفي */}
        <div className="grid grid-cols-12 gap-3 items-start">
          {/* القائمة اليسرى (Rt Nose) */}
          <div className="col-span-4 space-y-1 text-[12px]">
            {noseItems.map((it) => (
              <div key={it.id} className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">{it.label}:</span>
                <PaperTextarea
                  rows={1}
                  value={(examData.nose.rt as any)?.[it.id] || ''}
                  onChange={(val) => updateNose('rt', it.id, val)}
                  className="py-0.5 text-[11px]"
                />
              </div>
            ))}
          </div>

          {/* في المنتصف: رسم الهرم الأنفي + Deformity & Edema مع إمكانية الرسم بالقلم */}
          <div className="col-span-4 flex flex-col items-center justify-center space-y-1">
            <NoseAnatomyDiagram
              drawing={examData.nose.drawing}
              onSaveDrawing={(val) =>
                onChange((prev) => ({
                  ...prev,
                  nose: { ...prev.nose, drawing: val },
                }))
              }
              drawingHistory={examData.nose.drawingHistory}
              onAddSnapshot={(snap) =>
                onChange((prev) => ({
                  ...prev,
                  nose: {
                    ...prev.nose,
                    drawingHistory: [...(prev.nose.drawingHistory || []), snap],
                  },
                }))
              }
              readOnly={isPrintOnly}
            />
            <div className="w-full space-y-1 text-[11px]">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Deformity:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.nose.deformity || ''}
                  onChange={(val) =>
                    onChange((prev) => ({
                      ...prev,
                      nose: { ...prev.nose, deformity: val },
                    }))
                  }
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Edema:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.nose.rt?.edema || ''}
                  onChange={(val) => updateNose('rt', 'edema', val)}
                  className="text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* القائمة اليمنى (Lt Nose) */}
          <div className="col-span-4 space-y-1 text-[12px]">
            {noseItems.map((it) => (
              <div key={it.id} className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">{it.label}:</span>
                <PaperTextarea
                  rows={1}
                  value={(examData.nose.lt as any)?.[it.id] || ''}
                  onChange={(val) => updateNose('lt', it.id, val)}
                  className="py-0.5 text-[11px]"
                />
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Oropharynx & Mallampati classification */}
        <div className="grid grid-cols-12 gap-3 items-start">
          <div className="col-span-7 space-y-2">
            <span className="font-black text-[14px] inline-block px-3 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">
              Oropharynx
            </span>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Tonsils:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.oropharynx.tonsils || ''}
                  onChange={(val) => updateOropharynx('tonsils', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Adenoid:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.oropharynx.adenoid || ''}
                  onChange={(val) => updateOropharynx('adenoid', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Soft palate:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.oropharynx.softPalate || ''}
                  onChange={(val) => updateOropharynx('softPalate', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Uvula:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.oropharynx.uvula || ''}
                  onChange={(val) => updateOropharynx('uvula', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Tongue:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.oropharynx.tongue || ''}
                  onChange={(val) => updateOropharynx('tongue', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Sublingual area:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.oropharynx.sublingualArea || ''}
                  onChange={(val) => updateOropharynx('sublingualArea', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Buccal mucosa:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.oropharynx.buccalMucosa || ''}
                  onChange={(val) => updateOropharynx('buccalMucosa', val)}
                  className="text-[11px]"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Signs of reflux:</span>
                <PaperTextarea
                  rows={1}
                  value={examData.oropharynx.signsOfReflux || ''}
                  onChange={(val) => updateOropharynx('signsOfReflux', val)}
                  className="text-[11px]"
                />
              </div>
            </div>
          </div>

          <div className="col-span-5">
            <MallampatiSelector
              selectedClass={examData.oropharynx.mallampati}
              onSelect={(val) =>
                onChange((prev) => ({
                  ...prev,
                  oropharynx: { ...prev.oropharynx, mallampati: val },
                }))
              }
            />
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Larynx & Head & Neck */}
        <div id="section-larynx" className="space-y-1 scroll-mt-24 transition-all duration-300">
          <div className="text-center font-black text-[15px]">
            <span className="inline-block px-4 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">
              Larynx & Head & Neck
            </span>
          </div>

          <div className="grid grid-cols-12 gap-3 items-start">
            <div className="col-span-8 space-y-1 text-[12px]">
              {larynxItems.map((it) => (
                <div key={it.id} className="flex items-baseline gap-1">
                  <span className="font-bold shrink-0">{it.label}:</span>
                  <PaperTextarea
                    rows={1}
                    value={(examData.larynx as any)?.[it.id] || ''}
                    onChange={(val) => updateLarynx(it.id, val)}
                    className="py-0.5 text-[11px]"
                  />
                </div>
              ))}
            </div>

            <div className="col-span-4 flex flex-col items-center justify-center pt-1">
              <LarynxVocalCordDiagram
                drawing={examData.larynx.drawing}
                onSaveDrawing={(val) =>
                  onChange((prev) => ({
                    ...prev,
                    larynx: { ...prev.larynx, drawing: val },
                  }))
                }
                drawingHistory={examData.larynx.drawingHistory}
                onAddSnapshot={(snap) =>
                  onChange((prev) => ({
                    ...prev,
                    larynx: {
                      ...prev.larynx,
                      drawingHistory: [...(prev.larynx.drawingHistory || []), snap],
                    },
                  }))
                }
                readOnly={isPrintOnly}
              />
            </div>
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Investigations (فحوصات الحاضر والمطلوب مع إمكانية إضافة وحذف أكثر من فحص) */}
        <div className="space-y-2 text-[12px]">
          <span className="font-black text-[13px] inline-block px-3 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">Investigations:</span>

          {/* قسم Present (الفحوصات الحاضرة مع المريض) */}
          <div className="space-y-1 pl-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-800 uppercase">- Present:</span>
              {!isPrintOnly && (
                <button
                  type="button"
                  onClick={addPresentItem}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0B7B5E] hover:text-[#074C3A] cursor-pointer print:hidden"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Present</span>
                </button>
              )}
            </div>

            {presentList.map((item, idx) => (
              <div key={item.id || idx} className="grid grid-cols-12 gap-2 items-baseline">
                <div className="col-span-6 flex items-baseline gap-1">
                  <span className="font-bold shrink-0 text-[11px]">{idx + 1}.</span>
                  <PaperTextarea
                    rows={1}
                    value={item.name || ''}
                    onChange={(val) => updatePresentItem(idx, 'name', val)}
                    placeholder="Investigation..."
                    className="text-[11px]"
                  />
                </div>
                <div className="col-span-6 flex items-baseline gap-1">
                  <span className="font-bold shrink-0 text-[11px]">Revealed:</span>
                  <PaperTextarea
                    rows={1}
                    value={item.revealed || ''}
                    onChange={(val) => updatePresentItem(idx, 'revealed', val)}
                    placeholder="Revealed results..."
                    className="text-[11px]"
                  />
                  {!isPrintOnly && presentList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePresentItem(idx)}
                      title="حذف هذا الفحص"
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer print:hidden"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* قسم Need (الفحوصات المطلوبة) */}
          <div className="space-y-1 pl-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-800 uppercase">- Need:</span>
              {!isPrintOnly && (
                <button
                  type="button"
                  onClick={addNeedItem}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0B7B5E] hover:text-[#074C3A] cursor-pointer print:hidden"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Need</span>
                </button>
              )}
            </div>

            {needList.map((item, idx) => (
              <div key={item.id || idx} className="grid grid-cols-12 gap-2 items-baseline">
                <div className="col-span-6 flex items-baseline gap-1">
                  <span className="font-bold shrink-0 text-[11px]">{idx + 1}.</span>
                  <PaperTextarea
                    rows={1}
                    value={item.name || ''}
                    onChange={(val) => updateNeedItem(idx, 'name', val)}
                    placeholder="Investigation needed..."
                    className="text-[11px]"
                  />
                </div>
                <div className="col-span-6 flex items-baseline gap-1">
                  <span className="font-bold shrink-0 text-[11px]">Revealed:</span>
                  <PaperTextarea
                    rows={1}
                    value={item.revealed || ''}
                    onChange={(val) => updateNeedItem(idx, 'revealed', val)}
                    placeholder="Results if any..."
                    className="text-[11px]"
                  />
                  {!isPrintOnly && needList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNeedItem(idx)}
                      title="حذف هذا الفحص"
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer print:hidden"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Diagnosis (التشخيص الطبي) - تم وضعه قبل Treatment مباشرة بناءً على طلب الدكتور */}
        <div id="section-diagnosis" className="space-y-1 scroll-mt-24 transition-all duration-300">
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-[13px] inline-block px-3 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline shrink-0">Diagnosis:</span>
            <PaperTextarea
              rows={1}
              value={examData.diagnosis || ''}
              onChange={(val) => setField('diagnosis', val)}
              placeholder="اكتب التشخيص الطبي للحالة..."
              className="font-bold text-[13px]"
            />
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Treatment (ملاحظات العلاج الأساسية بالورقة) */}
        <div className="space-y-1">
          <span className="font-black text-[13px] inline-block px-3 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">Treatment:</span>
          <PaperTextarea
            rows={2}
            value={examData.treatmentNotes || ''}
            onChange={(val) => setField('treatmentNotes', val)}
            placeholder="ملاحظات وتفاصيل خطة العلاج..."
            className="text-[12px] leading-6"
          />
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Follow up & Operations */}
        <div className="space-y-1.5 text-[12px]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-[13px] inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline shrink-0">Follow up:</span>
            <PaperTextarea
              rows={1}
              value={examData.followUpDate || ''}
              onChange={(val) => setField('followUpDate', val)}
              placeholder="تاريخ أو موعد المتابعة..."
              className="font-bold text-[12px]"
            />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-[13px] inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline shrink-0">Operation Needed:</span>
            <PaperTextarea
              rows={1}
              value={examData.operationNeeded || ''}
              onChange={(val) => setField('operationNeeded', val)}
              placeholder="العملية المطلوبة إن وجدت..."
              className="text-[12px]"
            />
          </div>

          <div className="space-y-1">
            <span className="font-bold text-[13px] inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">Operative data:</span>
            <PaperTextarea
              rows={2}
              value={examData.operativeData || ''}
              onChange={(val) => setField('operativeData', val)}
              placeholder="تفاصيل وبيانات التدخل الجراحي..."
              className="text-[12px] leading-6"
            />
          </div>

          {/* خط فاصل منقط */}
          <div className="border-b border-dotted border-black my-2" />

          {/* قسم الزيارات الإضافية المتعددة (2nd, 3rd, 4th, 5th... Visits) */}
          <div id="section-visits" className="space-y-2 pt-1 scroll-mt-24 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="font-black text-[13px] inline-block px-3 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-300 print:bg-transparent print:border-none print:text-black print:p-0 print:underline">Visits History:</span>
              {!isPrintOnly && (
                <button
                  type="button"
                  onClick={addVisit}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold cursor-pointer transition-all border border-slate-300 print:hidden"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ إضافة زيارة ({getOrdinalLabel(visitsList.length + 2)})</span>
                </button>
              )}
            </div>

            <div className={`grid grid-cols-1 ${visitsList.length > 1 ? 'sm:grid-cols-2' : ''} gap-x-4 gap-y-3`}>
              {visitsList.map((visit, idx) => (
                <div key={visit.id || idx} className="space-y-1 border-b border-dotted border-slate-300 pb-2">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-bold shrink-0 text-[12px]">
                      {visit.label || getOrdinalLabel(visit.visitNumber || idx + 2)}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-[11px] text-slate-600 shrink-0">Date:</span>
                      <input
                        type="text"
                        value={visit.date || ''}
                        onChange={(e) => updateVisit(idx, 'date', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-24 border-b border-dotted border-black bg-transparent px-1 text-[11px] font-mono focus:outline-none"
                      />
                      {!isPrintOnly && visitsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVisit(idx)}
                          title="حذف هذه الزيارة"
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer print:hidden"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <PaperTextarea
                    rows={1}
                    value={visit.notes || ''}
                    onChange={(val) => updateVisit(idx, 'notes', val)}
                    placeholder="ملاحظات الزيارة والعلاج..."
                    className="text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* توقيع الطبيب وتاريخ الزيارة */}
        <div className="pt-4 border-t border-black flex items-center justify-between text-[11px] font-bold">
          <div>
            <span>Date: </span>
            <span>{examData.date}</span>
          </div>
          <div>
            <span>Doctor Signature: </span>
            <span className="font-black underline">{doctor?.name || 'د. إسلام عبدالله كريمة'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

