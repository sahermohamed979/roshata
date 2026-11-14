'use client';

import React from 'react';
import { DrawingCanvasOverlay } from './drawing-canvas-overlay';
import { DrawingSnapshot } from '../types/ent-examination.types';
import { Check } from 'lucide-react';

/**
 * رسومات توضيحية وصور حقيقية لأقسام كشف الأنف والأذن والحنجرة
 * مع إمكانية الرسم والتأشير الحر بالقلم والممحاة وحفظ لقطات للزيارات
 */

export function EarAnatomyDiagram({
  selectedWeber,
  onSelectWeber,
  drawing,
  onSaveDrawing,
  drawingHistory = [],
  onAddSnapshot,
  readOnly = false,
}: {
  selectedWeber?: string;
  onSelectWeber?: (val: string) => void;
  drawing?: string;
  onSaveDrawing?: (dataUrl: string) => void;
  drawingHistory?: DrawingSnapshot[];
  onAddSnapshot?: (snapshot: DrawingSnapshot) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-1 bg-transparent border-none select-none print:border-none print:p-0 print:bg-transparent">
      {/* عنوان الفحص كما في الأصل بـ Double Underline */}
      <div className="text-center mb-1.5">
        <span className="font-serif text-2xl sm:text-3xl font-black text-black underline decoration-double underline-offset-4 tracking-wide">
          Ear
        </span>
      </div>

      <DrawingCanvasOverlay
        initialDrawing={drawing}
        onSaveDrawing={onSaveDrawing}
        drawingHistory={drawingHistory}
        onAddSnapshot={onAddSnapshot}
        width={560}
        height={270}
        readOnly={readOnly}
      >
        <div className="flex items-center justify-between w-full h-full px-4 text-black font-serif">
          {/* Right Ear (الأذن اليمنى) - صورة المنظار الحقيقية */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-black font-serif mb-1 tracking-tight text-slate-900">Rt</span>
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-2 border-slate-800 shadow-md bg-black">
              <img
                src="/images/ear-right.jpg"
                alt="Right Ear Tympanic Membrane"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500 mt-1">Right Ear (OD)</span>
          </div>

          {/* Weber in Center - في المنتصف بين الأذنين */}
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-28 h-16 text-black"
              viewBox="0 0 110 65"
              fill="none"
              stroke="currentColor"
            >
              <ellipse
                cx="55"
                cy="32"
                rx="50"
                ry="28"
                strokeWidth="2.8"
                stroke="currentColor"
                fill="white"
              />
              <text
                x="55"
                y="39"
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                fontFamily="serif"
                fill="currentColor"
              >
                Weber
              </text>
            </svg>
            {selectedWeber && (
              <span className="text-[11px] font-bold mt-1 text-[#0B7B5E] bg-[#E3F5EE] px-2.5 py-0.5 rounded-full border border-[#D0E5DC] print:text-black print:bg-transparent print:border-none">
                {selectedWeber}
              </span>
            )}
          </div>

          {/* Left Ear (الأذن اليسرى) - صورة المنظار الحقيقية */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-black font-serif mb-1 tracking-tight text-slate-900">Lt</span>
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-2 border-slate-800 shadow-md bg-black">
              <img
                src="/images/ear-left.jpg"
                alt="Left Ear Tympanic Membrane"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500 mt-1">Left Ear (OS)</span>
          </div>
        </div>
      </DrawingCanvasOverlay>

      {/* أزرار اختيار اختبار ويبر السريعة */}
      {!readOnly && (
        <div className="flex items-center gap-1.5 mt-2 print:hidden">
          <span className="text-[11px] font-bold text-slate-600 ml-1">اختبار ويبر (Weber):</span>
          {['Rt', 'Center', 'Lt'].map((pos) => {
            const val = pos === 'Center' ? 'Centralized' : `Lateralized ${pos}`;
            const isSelected = selectedWeber === val;
            return (
              <button
                key={pos}
                type="button"
                onClick={() => onSelectWeber?.(val)}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0B7B5E] text-white shadow-2xs scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {pos === 'Center' ? 'Midline (Center)' : pos}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NoseAnatomyDiagram({
  drawing,
  onSaveDrawing,
  drawingHistory = [],
  onAddSnapshot,
  readOnly = false,
}: {
  drawing?: string;
  onSaveDrawing?: (dataUrl: string) => void;
  drawingHistory?: DrawingSnapshot[];
  onAddSnapshot?: (snapshot: DrawingSnapshot) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-50/70 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <span className="text-[11px] font-black text-[#074C3A] uppercase tracking-wider mb-1 print:hidden">
        Nose Pyramid & Septum (متاح الرسم بالقلم ✍️)
      </span>

      <DrawingCanvasOverlay
        initialDrawing={drawing}
        onSaveDrawing={onSaveDrawing}
        drawingHistory={drawingHistory}
        onAddSnapshot={onAddSnapshot}
        width={320}
        height={220}
        readOnly={readOnly}
      >
        <div className="relative w-full h-full flex items-center justify-center text-black font-serif">
          <svg
            className="w-44 h-44 text-black"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {/* Triangular pyramid outline */}
            <polygon points="50,10 15,90 85,90" strokeWidth="2.8" />
            {/* Central Septum */}
            <line
              x1="50"
              y1="10"
              x2="50"
              y2="90"
              strokeWidth="2.4"
              strokeDasharray="4 2"
            />
            {/* Right Turbinates */}
            <circle cx="36" cy="45" r="9.5" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="30" cy="72" r="13" strokeWidth="2" strokeDasharray="3 2" />
            {/* Left Turbinates */}
            <circle cx="64" cy="45" r="9.5" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="70" cy="72" r="13" strokeWidth="2" strokeDasharray="3 2" />
          </svg>
          <span className="absolute top-3 left-4 text-base font-black">Rt</span>
          <span className="absolute top-3 right-4 text-base font-black">Lt</span>
        </div>
      </DrawingCanvasOverlay>
    </div>
  );
}

export function MallampatiSelector({
  selectedClass = 'Class I',
  onSelect,
}: {
  selectedClass?: string;
  onSelect?: (val: string) => void;
}) {
  const classes = [
    {
      id: 'Class I',
      label: 'Class I',
      sublabel: 'حلق لين + لهاة + رتوج',
      img: '/images/mallampati-1.svg',
    },
    {
      id: 'Class II',
      label: 'Class II',
      sublabel: 'حلق لين + لهاة',
      img: '/images/mallampati-2.svg',
    },
    {
      id: 'Class III',
      label: 'Class III',
      sublabel: 'حلق لين + قاعدة اللهاة',
      img: '/images/mallampati-3.svg',
    },
    {
      id: 'Class IV',
      label: 'Class IV',
      sublabel: 'حلق صلب فقط',
      img: '/images/mallampati-4.svg',
    },
  ];

  return (
    <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-900">Mallampati classification:</span>
          <span className="text-[11px] font-bold text-slate-500">اختر درجة الرؤية المناسبة للمريض</span>
        </div>
        <span className="text-xs font-black text-[#0B7B5E] bg-[#E3F5EE] border border-[#D0E5DC] px-3 py-0.5 rounded-full print:border-black print:text-black print:bg-transparent">
          {selectedClass || 'Class I'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {classes.map((c) => {
          const isSelected = selectedClass === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect?.(c.id)}
              className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-[#E3F5EE]/90 border-[#0B7B5E] ring-2 ring-blue-500/30 shadow-xs print:border-black print:bg-transparent'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 print:border-none'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#0B7B5E] rounded-full flex items-center justify-center text-white print:hidden">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
              {/* صورة الصنف من SVG الأصلي */}
              <div className="w-full h-24 sm:h-28 flex items-center justify-center bg-white rounded-lg p-1 mb-1.5 border border-slate-100">
                <img
                  src={c.img}
                  alt={c.label}
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              <span className={`text-xs font-black ${isSelected ? 'text-[#074C3A]' : 'text-slate-900'}`}>
                {c.label}
              </span>
              <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {c.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LarynxVocalCordDiagram({
  drawing,
  onSaveDrawing,
  drawingHistory = [],
  onAddSnapshot,
  readOnly = false,
}: {
  drawing?: string;
  onSaveDrawing?: (dataUrl: string) => void;
  drawingHistory?: DrawingSnapshot[];
  onAddSnapshot?: (snapshot: DrawingSnapshot) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-50/70 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <span className="text-[11px] font-black text-[#074C3A] uppercase tracking-wider mb-1 print:hidden">
        Larynx & Vocal Cords (متاح الرسم بالقلم ✍️)
      </span>

      <DrawingCanvasOverlay
        initialDrawing={drawing}
        onSaveDrawing={onSaveDrawing}
        drawingHistory={drawingHistory}
        onAddSnapshot={onAddSnapshot}
        width={320}
        height={210}
        readOnly={readOnly}
      >
        <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden shadow-inner">
          <img
            src="/images/larynx.png"
            alt="Larynx Endoscopic View"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        </div>
      </DrawingCanvasOverlay>
    </div>
  );
}
