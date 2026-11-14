'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Check,
  AlertTriangle,
  Edit2,
  Plus,
  Stethoscope,
  LogIn,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react';
import { DaySlotItem, DaySlotAppointment } from '../types/calendar';

interface CalendarDayTimelineViewProps {
  slots: DaySlotItem[];
  selectedDate: string;
  selectedDoctorId?: string;
  isDoctorView?: boolean;
  onAdmit?: (id: string) => void;
  isAdmitting?: boolean;
  admittingId?: string | null;
  onFinishExam?: (id: string) => void;
  isFinishingExam?: boolean;
  finishingExamId?: string | null;
}

export function CalendarDayTimelineView({
  slots,
  selectedDate,
  selectedDoctorId,
  isDoctorView,
  onAdmit,
  isAdmitting,
  admittingId,
  onFinishExam,
  isFinishingExam,
  finishingExamId,
}: CalendarDayTimelineViewProps) {
  const [filter, setFilter] = React.useState<'all' | 'booked' | 'waiting' | 'available'>(
    isDoctorView ? 'booked' : 'all'
  );

  const bookedSlots = slots.filter((s) => s.isBooked);
  const availableSlots = slots.filter((s) => !s.isBooked);
  const waitingSlots = slots.filter((s) => {
    const appts = s.appointments && s.appointments.length > 0 ? s.appointments : s.appointment ? [s.appointment] : [];
    return appts.some((a) => a.status === 'WAITING' || a.status === 'IN_PROGRESS');
  });

  const totalBookedAppointments = slots.reduce((acc, s) => {
    const count = s.appointments?.length || (s.appointment ? 1 : 0);
    return acc + count;
  }, 0);

  const filteredSlots =
    filter === 'booked'
      ? bookedSlots
      : filter === 'waiting'
      ? waitingSlots
      : filter === 'available'
      ? availableSlots
      : slots;

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'FOLLOW_UP':
        return 'إعادة';
      case 'OPERATION_FOLLOWUP':
        return 'متابعة عملية';
      case 'ENDOSCOPY':
        return 'منظار';
      case 'SURGERY':
      case 'POST_OPERATIVE':
        return 'تدخل جراحي';
      case 'TEST_RESULTS_REVIEW':
        return 'مراجعة فحوصات';
      case 'CONSULTATION':
        return 'استشارة';
      case 'LAB_TESTS_IMAGING':
        return 'منظار';
      default:
        return 'كشف';
    }
  };

  const formatDoctorName = (name?: string) => {
    if (!name || !name.trim()) return 'د. إسلام عبدالله';
    const clean = name.trim();
    if (clean.startsWith('د.') || clean.startsWith('Dr.') || clean.startsWith('د/')) {
      return clean;
    }
    return `د. ${clean}`;
  };

  const renderAppointmentCard = (appt: DaySlotAppointment, slotTime: string, totalInSlot: number) => {
    const isInProgress = appt.status === 'IN_PROGRESS';
    const isWaiting = appt.status === 'WAITING';
    const isBookedStatus = appt.status === 'BOOKED';
    const isCompleted = appt.status === 'COMPLETED' || appt.status === 'PENDING_CHECKOUT';

    // ألوان خلفية وإطارات عالية التباين والوضوح حسب الحالة
    let containerStyle = 'bg-white border-slate-200';
    let indicatorColor = 'bg-slate-400';
    let statusBadge = (
      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-500 text-white">
        {appt.status}
      </span>
    );
    let timeBadgeStyle = 'bg-slate-100 text-slate-700';

    if (isInProgress) {
      // أخضر زمردي بارز وواضح جداً — كشف جاري الآن
      containerStyle = 'bg-emerald-50/90 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-300/60';
      indicatorColor = 'bg-emerald-600';
      timeBadgeStyle = 'bg-emerald-600 text-white shadow-2xs';
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>كشف جاري الآن 🩺</span>
        </span>
      );
    } else if (isWaiting) {
      // أصفر كهرماني دافئ — مريض في صالة الانتظار
      containerStyle = 'bg-amber-50/90 border-2 border-amber-400 shadow-sm ring-1 ring-amber-300/60';
      indicatorColor = 'bg-amber-500';
      timeBadgeStyle = 'bg-amber-500 text-white shadow-2xs';
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-amber-500 text-white shadow-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>في صالة الانتظار ⏳</span>
        </span>
      );
    } else if (isBookedStatus) {
      // أزرق ملكي مريح — حجز مسبق مؤكد لم يحضر بعد
      containerStyle = 'bg-[#E3F5EE]/70 border-2 border-[#D0E5DC] shadow-xs';
      indicatorColor = 'bg-[#0B7B5E]';
      timeBadgeStyle = 'bg-[#E3F5EE] text-[#0B7B5E]';
      statusBadge = (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-[#0B7B5E] text-white shadow-2xs">
          <span>حجز مسبق مؤكد 📅</span>
        </span>
      );
    } else if (isCompleted) {
      // رمادي هادئ — كشف مكتمل
      containerStyle = 'bg-slate-50/90 border border-slate-200 opacity-90';
      indicatorColor = 'bg-slate-400';
      timeBadgeStyle = 'bg-slate-200 text-slate-700';
      statusBadge = (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-slate-500 text-white">
          <Check className="w-3.5 h-3.5" />
          <span>{appt.status === 'PENDING_CHECKOUT' ? 'بانتظار المحاسبة' : 'تم الكشف ✓'}</span>
        </span>
      );
    }

    return (
      <div
        key={appt.id}
        className={`rounded-3xl border transition-all p-4 sm:p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${containerStyle}`}
      >
        {/* شريط الإشارة الملون في اليمين */}
        <div className={`absolute right-0 top-0 bottom-0 w-2.5 ${indicatorColor}`} />

        {/* الجانب الأيمن: وقت الحجز + بيانات المريض ورقم الدور */}
        <div className="flex items-center gap-4 sm:gap-5 pr-2 flex-1">
          {/* توقيت الساعة */}
          <div className="text-center shrink-0 min-w-[75px]">
            <div className={`text-base sm:text-lg font-black font-mono px-3 py-1.5 rounded-2xl ${timeBadgeStyle}`}>
              {slotTime}
            </div>
            <div className="text-[11px] text-slate-500 font-bold mt-1">
              {totalInSlot > 1 ? `${totalInSlot} مرضى بهذه الساعة` : 'موعد مجدول'}
            </div>
          </div>

          {/* تفاصيل المريض */}
          <div className="space-y-1.5 text-start">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base sm:text-lg font-black text-[#074C3A]">
                {appt.patientName}
              </h4>
              {appt.queueNumber > 0 && (
                <span className="px-2.5 py-0.5 rounded-lg bg-[#074C3A] text-white font-mono text-xs font-black shadow-2xs">
                  #{String(appt.queueNumber).padStart(2, '0')}
                </span>
              )}

              {/* شارة اسم الطبيب البارزة */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E3F5EE] text-[#074C3A] text-xs font-black border border-[#D0E5DC] shadow-2xs">
                <Stethoscope className="w-3.5 h-3.5 text-[#0B7B5E]" />
                <span>الطبيب: {formatDoctorName(appt.doctorName)}</span>
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap font-medium">
              {appt.patientPhone && (
                <span dir="ltr" className="font-mono text-slate-600 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200/60">
                  {appt.patientPhone}
                </span>
              )}
              {appt.notes && (
                <span className="text-slate-500 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200/60">
                  ملاحظة: {appt.notes}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* الجانب الأوسط والأيسر: الشارات والإجراءات المباشرة */}
        <div className="flex items-center gap-2.5 flex-wrap justify-start md:justify-end">
          {/* شارة نوع الكشف */}
          <span className="px-3 py-1 rounded-xl bg-white text-[#0B7B5E] text-xs font-bold border border-[#D0E5DC] shadow-2xs">
            {getTypeLabel(appt.type)}
          </span>

          {/* شارة الموقف المالي */}
          {appt.isFullyPaid ? (
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1 shadow-2xs">
              <Check className="w-3.5 h-3.5" />
              <span>مدفوع ({appt.totalAmount} ج.م)</span>
            </span>
          ) : appt.hasRemaining ? (
            <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>
                عربون {appt.paidAmount} · متبقي {appt.remainingAmount} ج.م
              </span>
            </span>
          ) : null}

          {/* شارة الحالة الملونة الكبيرة */}
          {statusBadge}

          {/* أزرار الإجراءات التفاعلية */}
          <div className="flex items-center gap-2">
            {/* زر فتح الكشف والروشتة */}
            <Link
              href={`/dashboard/examination/${appt.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white text-xs font-black transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Stethoscope className="w-4 h-4 stroke-[2.2]" />
              <span>كشف وروشتة 📋</span>
            </Link>

            {/* إذا كان كشف جاري: زر إنهاء الكشف */}
            {isInProgress && onFinishExam && (
              <button
                type="button"
                disabled={isFinishingExam}
                onClick={() => onFinishExam(appt.id)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isFinishingExam && finishingExamId === appt.id ? 'جاري الإنهاء...' : 'إنهاء الكشف ✓'}</span>
              </button>
            )}

            {/* إذا كان في الانتظار: زر إدخال للكشف */}
            {isWaiting && onAdmit && (
              <button
                type="button"
                disabled={isAdmitting}
                onClick={() => onAdmit(appt.id)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>{isAdmitting && admittingId === appt.id ? 'جاري الإدخال...' : 'إدخال للكشف 🚪'}</span>
              </button>
            )}

            {/* زر فتح ملف المريض الطبي */}
            <Link
              href={`/dashboard/view-patients/${appt.patientId}`}
              title="فتح الملف الطبي للمريض"
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer transition-colors shadow-2xs"
            >
              <FileText className="w-4 h-4 text-[#0B7B5E]" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 select-none text-start" dir="rtl">
      {/* الشريط الفرعي التوضيحي مع دليل الألوان الفسفوري عالي الوضوح وأزرار الفلترة */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs font-bold px-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        {/* أزرار الفلترة السريعة */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('booked')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              filter === 'booked'
                ? 'bg-[#0B7B5E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            المحجوزة فقط ({totalBookedAppointments})
          </button>

          <button
            type="button"
            onClick={() => setFilter('waiting')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              filter === 'waiting'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            في الانتظار ({waitingSlots.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#0B7B5E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الساعات ({slots.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('available')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              filter === 'available'
                ? 'bg-[#0B7B5E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الشاغرة ({availableSlots.length})
          </button>
        </div>

        {/* دليل الألوان عالي التباين (High Contrast Visual Legend) */}
        <div className="flex items-center gap-3 text-xs font-bold flex-wrap bg-slate-50 p-2 rounded-2xl border border-slate-200/60">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>كشف جاري الآن</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>في صالة الانتظار</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#E3F5EE] text-[#074C3A] border border-[#D0E5DC]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B7B5E]" />
            <span>حجز مسبق مؤكد</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-200 text-slate-800 border border-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>تم الكشف</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white text-slate-600 border border-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
            <span>ساعة شاغرة</span>
          </div>
        </div>
      </div>

      {/* قائمة الفترات الزمنية لليوم بالساعات */}
      <div className="space-y-3">
        {filteredSlots.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center text-slate-400 font-bold text-sm shadow-xs">
            لا توجد فترات أو مواعيد مطابقة في هذا اليوم
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const appts =
              slot.appointments && slot.appointments.length > 0
                ? slot.appointments
                : slot.appointment
                ? [slot.appointment]
                : [];

            if (slot.isBooked && appts.length > 0) {
              return (
                <div key={slot.time} className="space-y-2.5">
                  {appts.map((appt) => renderAppointmentCard(appt, slot.time, appts.length))}
                </div>
              );
            }

            // فترة شاغرة متاحة للحجز
            return (
              <div
                key={slot.time}
                className="bg-white rounded-3xl border-2 border-dashed border-slate-200 hover:border-[#0B7B5E] hover:bg-[#E3F5EE]/20 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all shadow-2xs"
              >
                {/* وقت الفترة */}
                <div className="text-base sm:text-lg font-black text-slate-400 font-mono min-w-[75px] text-center px-3 py-1 bg-slate-50 rounded-xl border border-slate-200/60">
                  {slot.time}
                </div>

                {/* نص توضيحي */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>ساعة شاغرة — متاحة لاستقبال كشف جديد</span>
                </div>

                {/* شارة أو زر */}
                {!isDoctorView ? (
                  <Link
                    href={`/dashboard/appointments/new?date=${selectedDate}&time=${slot.time}${
                      selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''
                    }`}
                    className="h-9 px-4 rounded-xl border border-[#D0E5DC] bg-[#E3F5EE] hover:bg-[#E3F5EE] text-[#0B7B5E] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>حجز هذه الفترة</span>
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400 font-bold px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/60">
                    متاحة
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
