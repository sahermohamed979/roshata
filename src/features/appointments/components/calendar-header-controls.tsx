'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  ListFilter,
  Plus,
  ChevronDown,
  Stethoscope,
} from 'lucide-react';
import { CalendarViewMode } from '../types/calendar';

interface CalendarHeaderControlsProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  selectedDoctorId: string;
  onDoctorChange: (doctorId: string) => void;
  doctors: Array<{ id: string; name: string }>;
  doctorName?: string;
  isDoctorView?: boolean;
  weekStartDate?: string;
  weekEndDate?: string;
  monthName?: string;
  monthYear?: number;
  onShiftWeek?: (days: number) => void;
  onShiftMonth?: (months: number) => void;
}

function getTodayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDoctorName(name?: string): string {
  if (!name || !name.trim()) return 'د. إسلام عبدالله';
  const clean = name.trim();
  if (clean.startsWith('د.') || clean.startsWith('Dr.') || clean.startsWith('د/')) {
    return clean;
  }
  return `د. ${clean}`;
}

export function CalendarHeaderControls({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  selectedDoctorId,
  onDoctorChange,
  doctors,
  doctorName,
  isDoctorView,
  weekStartDate,
  weekEndDate,
  monthName,
  monthYear,
  onShiftWeek,
  onShiftMonth,
}: CalendarHeaderControlsProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // التنقل يوماً للأمام أو للخلف في وضع القائمة
  const handleShiftDay = (days: number) => {
    const d = new Date(currentDate + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const formattedDisplayDate = currentDate.replace(/-/g, ' / ');

  const formatDayDisplayLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00Z');
      const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayName = arabicDays[d.getUTCDay()];
      const day = d.getUTCDate().toString().padStart(2, '0');
      const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${dayName} ${day}/${month}/${year}`;
    } catch {
      return dateStr.replace(/-/g, ' / ');
    }
  };

  const formatWeekRangeLabel = (start?: string, end?: string) => {
    if (!start || !end) return formattedDisplayDate;
    try {
      const s = new Date(start + 'T12:00:00Z');
      const e = new Date(end + 'T12:00:00Z');
      const sDay = s.getUTCDate().toString().padStart(2, '0');
      const sMonth = (s.getUTCMonth() + 1).toString().padStart(2, '0');
      const eDay = e.getUTCDate().toString().padStart(2, '0');
      const eMonth = (e.getUTCMonth() + 1).toString().padStart(2, '0');
      const eYear = e.getUTCFullYear();
      return `${sDay}/${sMonth} — ${eDay}/${eMonth}/${eYear}`;
    } catch {
      return `${start} — ${end}`;
    }
  };

  const isCalendarMode = viewMode === 'day' || viewMode === 'week' || viewMode === 'month';

  return (
    <div
      className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 select-none"
      dir="rtl"
    >
      {/* الجانب الأيمن: زر اليوم + منتقي التاريخ + (تبويبات النطاق يوم/أسبوع/شهر) + قائمة الأطباء */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* زر اليوم */}
        <button
          type="button"
          onClick={() => {
            onDateChange(getTodayIso());
          }}
          className="h-10 px-4 rounded-xl bg-[#074C3A] hover:bg-[#111f68] active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
        >
          اليوم
        </button>

        {/* منتقي وملاح التاريخ بحسب النمط (شهر / أسبوع / يوم) */}
        {viewMode === 'month' ? (
          /* وضع الشهر: ملاح الشهر */
          <div className="h-10 px-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center gap-2">
            <button
              type="button"
              onClick={() => onShiftMonth?.(-1)}
              title="الشهر السابق"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-1 text-xs font-black text-[#074C3A]">
              <span>
                {monthName || 'نوفمبر'} {monthYear || 2026}
              </span>
              <CalendarIcon className="w-4 h-4 text-[#0B7B5E]" />
            </div>

            <button
              type="button"
              onClick={() => onShiftMonth?.(1)}
              title="الشهر التالي"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : viewMode === 'week' ? (
          /* وضع الأسبوع: ملاح الأسبوع */
          <div className="h-10 px-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center gap-2">
            <button
              type="button"
              onClick={() => onShiftWeek?.(-7)}
              title="الأسبوع السابق"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-1 text-xs font-bold text-[#074C3A] font-sans">
              <span>{formatWeekRangeLabel(weekStartDate, weekEndDate)}</span>
              <CalendarIcon className="w-4 h-4 text-[#0B7B5E]" />
            </div>

            <button
              type="button"
              onClick={() => onShiftWeek?.(7)}
              title="الأسبوع التالي"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* وضع اليوم والقائمة: ملاح اليوم الفردي */
          <div className="h-10 px-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleShiftDay(-1)}
              title="اليوم السابق"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div
              onClick={() => dateInputRef.current?.showPicker?.()}
              className="flex items-center gap-2 cursor-pointer px-1 text-xs font-bold text-[#074C3A] font-sans"
            >
              <span>{formatDayDisplayLabel(currentDate)}</span>
              <CalendarIcon className="w-4 h-4 text-[#0B7B5E]" />
              <input
                ref={dateInputRef}
                type="date"
                value={currentDate}
                onChange={(e) => {
                  if (e.target.value) onDateChange(e.target.value);
                }}
                className="sr-only"
              />
            </div>

            <button
              type="button"
              onClick={() => handleShiftDay(1)}
              title="اليوم التالي"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* في وضع التقويم (يوم أو أسبوع أو شهر): أزرار التبديل (يوم / أسبوع / شهر) */}
        {isCalendarMode && (
          <div className="h-10 p-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => onViewModeChange('day')}
              className={`h-8 px-3 rounded-lg cursor-pointer transition-all ${
                viewMode === 'day'
                  ? 'bg-[#074C3A] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              يوم
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('week')}
              className={`h-8 px-3 rounded-lg cursor-pointer transition-all ${
                viewMode === 'week'
                  ? 'bg-[#074C3A] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              أسبوع
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('month')}
              className={`h-8 px-3 rounded-lg cursor-pointer transition-all ${
                viewMode === 'month'
                  ? 'bg-[#074C3A] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شهر
            </button>
          </div>
        )}

        {/* اختيار الطبيب أو عرض شارة الطبيب الخاصة */}
        {isDoctorView ? (
          <div className="h-10 px-3.5 rounded-xl border border-[#D0E5DC] bg-[#E3F5EE]/60 text-xs font-black text-[#074C3A] shadow-2xs flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#0B7B5E]" />
            <span>{doctorName ? formatDoctorName(doctorName) : 'جدول مواعيدي الخاصة'}</span>
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedDoctorId || ''}
              onChange={(e) => onDoctorChange(e.target.value)}
              className="h-10 pr-4 pl-9 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#074C3A] shadow-2xs appearance-none focus:outline-none focus:border-[#0B7B5E] cursor-pointer"
            >
              <option value="">جميع الأطباء (كل المواعيد)</option>
              {doctors && doctors.length > 0
                ? doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {formatDoctorName(doc.name)}
                    </option>
                  ))
                : null}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* الجانب الأيسر: التبديل بين طريقة القائمة والتقويم + زر حجز موعد جديد */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* مجموعة أزرار التبديل (قائمة vs تقويم) */}
        <div className="h-10 p-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-[#074C3A] text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>قائمة</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('week')}
            className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isCalendarMode
                ? 'bg-[#074C3A] text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>تقويم</span>
          </button>
        </div>

        {/* زر حجز موعد جديد (للاستقبال والمدير) */}
        {!isDoctorView && (
          <Link
            href={`/dashboard/appointments/new?date=${currentDate}${
              selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''
            }`}
            className="h-10 px-4 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>حجز موعد جديد</span>
          </Link>
        )}
      </div>
    </div>
  );
}
