'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Stethoscope,
  Plus,
  Calendar as CalendarIcon,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LogIn,
} from 'lucide-react';
import { DaySlotItem, DaySlotAppointment, WeekAppointmentItem } from '../types/calendar';
import { TodayQueueItem } from '../apis/appointment.api';

export interface CalendarDayGridViewProps {
  date: string;
  dayName?: string;
  dayNumber?: number;
  isToday?: boolean;
  slots: DaySlotItem[];
  appointments?: WeekAppointmentItem[];
  queueItems?: TodayQueueItem[];
  selectedDoctorId?: string;
  isDoctorView?: boolean;
  compactHeader?: boolean;
  onAdmit?: (id: string) => void;
  isAdmitting?: boolean;
  admittingId?: string | null;
  onFinishExam?: (id: string) => void;
  isFinishingExam?: boolean;
  finishingExamId?: string | null;
}

const HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

const INTERVAL_MINUTES = ['00', '15', '30', '45'];

function formatTime12h(time24?: string): string {
  if (!time24) return '--:--';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1].padStart(2, '0');
  const period = hour >= 12 ? 'م' : 'ص';
  hour = hour % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${minute} ${period}`;
}

function getTypeLabel(type?: string): string {
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
}

function formatDoctorName(name?: string): string {
  if (!name || !name.trim()) return 'د. إسلام عبدالله';
  const clean = name.trim();
  if (clean.startsWith('د.') || clean.startsWith('Dr.') || clean.startsWith('د/')) {
    return clean;
  }
  return `د. ${clean}`;
}

export function CalendarDayGridView({
  date,
  dayName,
  dayNumber,
  isToday: initialIsToday,
  slots = [],
  appointments = [],
  queueItems = [],
  selectedDoctorId,
  isDoctorView,
  compactHeader = false,
  onAdmit,
  isAdmitting,
  admittingId,
  onFinishExam,
  isFinishingExam,
  finishingExamId,
}: CalendarDayGridViewProps) {
  const router = useRouter();

  // نمط العرض: شبكة مربعات مرنة vs جدول تفصيلي بالساعات
  const [layoutMode, setLayoutMode] = useState<'grid' | 'table'>('grid');
  // فلترة الحالات
  const [statusFilter, setStatusFilter] = useState<'all' | 'booked_only' | 'waiting_only' | 'available_only'>('all');
  // إظهار/إخفاء الساعات السابقة (الافتراضي: مخفية لتبدأ الشاشة من الساعة الحالية)
  const [showPastHours, setShowPastHours] = useState(false);

  // حساب معلومات اليوم
  const dayInfo = useMemo(() => {
    try {
      const d = new Date(date + 'T12:00:00Z');
      const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      const computedDayName = dayName || arabicDays[d.getUTCDay()];
      const computedDayNumber = dayNumber || d.getUTCDate();
      const monthName = arabicMonths[d.getUTCMonth()];
      const year = d.getUTCFullYear();

      const todayIso = new Date().toISOString().split('T')[0];
      const isToday = initialIsToday !== undefined ? initialIsToday : date === todayIso;

      return {
        dayName: computedDayName,
        dayNumber: computedDayNumber,
        monthName,
        year,
        fullFormattedDate: `${computedDayName} ${computedDayNumber} ${monthName} ${year}`,
        isToday,
      };
    } catch {
      return {
        dayName: dayName || 'اليوم',
        dayNumber: dayNumber || 1,
        monthName: '',
        year: 2026,
        fullFormattedDate: date,
        isToday: Boolean(initialIsToday),
      };
    }
  }, [date, dayName, dayNumber, initialIsToday]);

  // تجميع المواعيد لهذا اليوم من slots و appointments و queueItems
  const dayAppointments = useMemo(() => {
    const map = new Map<string, any>();

    // 1. من slots
    slots.forEach((s) => {
      const appts = s.appointments && s.appointments.length > 0 ? s.appointments : s.appointment ? [s.appointment] : [];
      appts.forEach((a: any) => {
        if (a && a.id) {
          map.set(a.id, {
            ...a,
            id: a.id,
            patientId: a.patientId || a.patient?.id || a.patient?._id || '',
            patientName: a.patientName || a.patient?.fullName || 'مريض مسجل',
            patientPhone: a.patientPhone || a.patient?.phone || '',
            startTime: a.startTime || s.time,
            type: a.type,
            status: a.status,
            queueNumber: a.queueNumber,
            queueOrder: a.queueOrder,
            doctorName: a.doctorName,
            doctorId: a.doctorId,
            totalAmount: Number(a.totalAmount || a.examinationFee || 0),
            paidAmount: Number(a.paidAmount || 0),
            remainingAmount: Number(a.remainingAmount || 0),
            discount: Number(a.discount || 0),
            isExempt: Boolean(a.isExempt || a.totalAmount === 0),
            isFullyPaid: Boolean(a.isFullyPaid || (a.totalAmount > 0 && a.paidAmount >= a.totalAmount)),
            hasRemaining: Boolean(a.hasRemaining || (a.remainingAmount > 0)),
          });
        }
      });
    });

    // 2. من appointments (WeekAppointmentItem)
    appointments.forEach((a: any) => {
      if (a.clinicDate === date && !map.has(a.id)) {
        map.set(a.id, {
          ...a,
          id: a.id,
          patientId: a.patientId || a.patient?.id || a.patient?._id || '',
          patientName: a.patientName || a.patient?.fullName || 'مريض مسجل',
          startTime: a.startTime,
          type: a.type,
          status: a.status,
          queueNumber: a.queueNumber,
          doctorName: a.doctorName,
          doctorId: a.doctorId,
          totalAmount: Number(a.totalAmount || a.examinationFee || 0),
          paidAmount: Number(a.paidAmount || 0),
          remainingAmount: Number(a.remainingAmount || 0),
          discount: Number(a.discount || 0),
          isExempt: Boolean(a.isExempt || a.totalAmount === 0),
          isFullyPaid: Boolean(a.isFullyPaid || (a.totalAmount > 0 && a.paidAmount >= a.totalAmount)),
          hasRemaining: Boolean(a.hasRemaining || (a.remainingAmount > 0)),
        });
      }
    });

    // 3. من queueItems (TodayQueueItem)
    queueItems.forEach((q: any) => {
      if (!map.has(q.id)) {
        map.set(q.id, {
          ...q,
          id: q.id,
          patientId: q.patientId || q.patient?.id || q.patient?._id || '',
          patientName: q.patientName || q.patient?.fullName || 'مريض مسجل',
          patientPhone: q.patientPhone || q.patient?.phone || '',
          startTime: q.startTime || '09:00',
          type: q.type,
          status: q.status,
          queueNumber: q.queueNumber,
          queueOrder: q.queueOrder,
          doctorName: '',
          totalAmount: Number(q.totalAmount || q.examinationFee || 0),
          paidAmount: Number(q.paidAmount || 0),
          remainingAmount: Number(q.remainingAmount || 0),
          discount: Number(q.discount || 0),
          isExempt: Boolean(q.isExempt || q.totalAmount === 0),
          isFullyPaid: Boolean(q.isFullyPaid || (q.totalAmount > 0 && q.paidAmount >= q.totalAmount)),
          hasRemaining: Boolean(q.hasRemaining || (q.remainingAmount > 0)),
        });
      }
    });

    return Array.from(map.values());
  }, [slots, appointments, queueItems, date]);

  // خريطة لتسريع البحث عن المواعيد في وقت محدد
  const apptsByExactTime = useMemo(() => {
    const m = new Map<string, any[]>();
    dayAppointments.forEach((a) => {
      const t = (a.startTime || '09:00').trim();
      const list = m.get(t) || [];
      list.push(a);
      m.set(t, list);
    });
    return m;
  }, [dayAppointments]);

  // إحصائيات سريعة لليوم
  const stats = useMemo(() => {
    const totalBooked = dayAppointments.length;
    const completed = dayAppointments.filter((a) => a.status === 'COMPLETED' || a.status === 'DONE').length;
    const waiting = dayAppointments.filter((a) => a.status === 'WAITING' || a.status === 'IN_PROGRESS').length;
    const bookedOnly = dayAppointments.filter((a) => a.status === 'BOOKED' || a.status === 'CONFIRMED').length;
    const availableSlotsCount = slots.filter((s) => !s.isBooked).length;
    return {
      totalBooked,
      completed,
      waiting,
      bookedOnly,
      availableSlotsCount: Math.max(availableSlotsCount, 32 - totalBooked),
    };
  }, [dayAppointments, slots]);

  // حساب الساعة الحالية بالـ local time
  const currentHourNum = useMemo(() => {
    const now = new Date();
    return now.getHours();
  }, []);

  const currentHourStr = useMemo(() => {
    return `${currentHourNum.toString().padStart(2, '0')}:00`;
  }, [currentHourNum]);

  // المربعات الزمنية الكاملة
  const allSlotBoxes = useMemo(() => {
    const standardTimes = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
      '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
      '23:00', '23:30',
    ];

    const allTimesSet = new Set(standardTimes);
    dayAppointments.forEach((a) => {
      if (a.startTime) allTimesSet.add(a.startTime);
    });

    const sortedTimes = Array.from(allTimesSet).sort();

    return sortedTimes.map((timeStr) => {
      const appts = apptsByExactTime.get(timeStr) || [];
      const isBooked = appts.length > 0;
      const primaryAppt = appts[0] || null;
      const slotHour = parseInt(timeStr.split(':')[0], 10);
      const isPast = dayInfo.isToday && slotHour < currentHourNum;
      const hasWaitingPatient = appts.some((a) => a.status === 'WAITING' || a.status === 'IN_PROGRESS');

      return {
        time: timeStr,
        isBooked,
        appointment: primaryAppt,
        appointments: appts,
        isPast,
        hasWaitingPatient,
      };
    });
  }, [dayAppointments, apptsByExactTime, dayInfo.isToday, currentHourNum]);

  // حساب عدد الفترات السابقة التي تم إخفاؤها
  const hiddenPastSlotsCount = useMemo(() => {
    if (!dayInfo.isToday) return 0;
    return allSlotBoxes.filter((b) => b.isPast && !b.hasWaitingPatient).length;
  }, [allSlotBoxes, dayInfo.isToday]);

  // الفترات بعد تصفية الساعات السابقة وتطبيق فلاتر الحالات
  const visibleSlotBoxes = useMemo(() => {
    let list = allSlotBoxes;

    // 1. استبعاد الساعات السابقة إلا إذا طلب المستخدم إظهارها أو إذا كان هناك مريض في الانتظار
    if (dayInfo.isToday && !showPastHours) {
      list = list.filter((b) => !b.isPast || b.hasWaitingPatient);
    }

    // 2. تطبيق فلتر الحالة
    if (statusFilter === 'booked_only') {
      list = list.filter((b) => b.isBooked);
    } else if (statusFilter === 'waiting_only') {
      list = list.filter(
        (b) =>
          b.isBooked &&
          b.appointments.some((a) => a.status === 'WAITING' || a.status === 'IN_PROGRESS')
      );
    } else if (statusFilter === 'available_only') {
      list = list.filter((b) => !b.isBooked);
    }

    return list;
  }, [allSlotBoxes, dayInfo.isToday, showPastHours, statusFilter]);

  // الساعات المعروضة لجدول الساعات التفصيلي
  const visibleHours = useMemo(() => {
    if (!dayInfo.isToday || showPastHours) return HOURS;
    return HOURS.filter((hour) => {
      const h = parseInt(hour.split(':')[0], 10);
      if (h >= currentHourNum) return true;
      const hasWaiting = INTERVAL_MINUTES.some((min) => {
        const appts = apptsByExactTime.get(`${hour.split(':')[0]}:${min}`) || [];
        return appts.some((a) => a.status === 'WAITING' || a.status === 'IN_PROGRESS');
      });
      return hasWaiting;
    });
  }, [dayInfo.isToday, showPastHours, currentHourNum, apptsByExactTime]);

  // فتح شاشة الحجز لموعد جديد
  const handleEmptySlotClick = (timeStr: string) => {
    if (!isDoctorView) {
      router.push(
        `/dashboard/appointments/new?date=${date}&time=${timeStr}${
          selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''
        }`
      );
    }
  };

  // إدخال المريض فورياً ونقله لشيت الكشف الطبي
  const handleAdmitAndOpenExam = (e: React.MouseEvent, apptId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAdmit) {
      onAdmit(apptId);
    }
    router.push(`/dashboard/examination/${apptId}`);
  };

  // رابط الملف الطبي للمريض (للشاشات المختلفة)
  const getPatientProfileUrl = (patientId?: string) => {
    if (!patientId) return null;
    return isDoctorView
      ? `/dashboard/view-patients/${patientId}`
      : `/dashboard/patients/${patientId}`;
  };

  // دالة تحديد وسم الحالة المالية للمريض (طلب الطبيب لمعرفة المعفى / الخصم / المسدد)
  const renderFinancialBadge = (appt: any) => {
    if (!appt) return null;
    const isExempt = Boolean(appt.isExempt || (appt.totalAmount === 0 && appt.paidAmount === 0));
    const discount = Number(appt.discount || 0);
    const paidAmount = Number(appt.paidAmount || 0);
    const totalAmount = Number(appt.totalAmount || 0);
    const remainingAmount = Number(appt.remainingAmount || 0);
    const isFullyPaid = Boolean(appt.isFullyPaid || (totalAmount > 0 && paidAmount >= totalAmount));

    if (isExempt) {
      return (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-900 border border-purple-200 text-[9px] font-black shrink-0"
          title="المريض معفى من الرسوم (حالة خاصة / مجاني)"
        >
          <span>🟣 مجاني</span>
        </span>
      );
    }

    if (discount > 0 || (paidAmount > 0 && remainingAmount > 0)) {
      return (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-950 border border-amber-300 text-[9px] font-black shrink-0"
          title={`معمول له خصم: ${discount} ج.م | مدفوع: ${paidAmount} ج.م | متبقي: ${remainingAmount} ج.م`}
        >
          <span>🟡 {discount > 0 ? `خصم (${discount})` : 'دفع جزئي'}</span>
        </span>
      );
    }

    if (isFullyPaid) {
      return (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] font-black shrink-0"
          title={`مسدد بالكامل (${paidAmount} ج.م)`}
        >
          <span>🟢 دافع كامل</span>
        </span>
      );
    }

    if (remainingAmount > 0 || totalAmount > 0) {
      return (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-900 border border-rose-300 text-[9px] font-black shrink-0"
          title={`متبقي عليه: ${remainingAmount || totalAmount} ج.م`}
        >
          <span>🔴 متبقي ({remainingAmount || totalAmount})</span>
        </span>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3.5 select-none" dir="rtl">
      {/* ================== الشريط العلوي الهادئ والمريح للعين ================== */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* معلومات اليوم وتنبيه بداية الساعات من الوقت الحالي */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#074C3A]">
              {dayInfo.dayName} {dayInfo.dayNumber} {dayInfo.monthName}
            </span>
            {dayInfo.isToday && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#074C3A] text-[11px] font-black border border-emerald-300">
                اليوم
              </span>
            )}
          </div>

          {/* زر تبديل إظهار / إخفاء الساعات السابقة */}
          {dayInfo.isToday && hiddenPastSlotsCount > 0 && (
            <button
              type="button"
              onClick={() => setShowPastHours(!showPastHours)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer shadow-2xs"
              title="الضغط لعرض أو إخفاء الساعات الصباحية السابقة"
            >
              {showPastHours ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>إخفاء الساعات السابقة</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#0B7B5E]" />
                  <span>الساعات السابقة مخفية ({hiddenPastSlotsCount} فترة)</span>
                </>
              )}
            </button>
          )}

          {dayInfo.isToday && !showPastHours && (
            <span className="text-xs font-bold text-[#0B7B5E] flex items-center gap-1 bg-[#E3F5EE]/70 px-2.5 py-1 rounded-xl border border-[#D0E5DC]">
              <Clock className="w-3.5 h-3.5" />
              <span>يبدأ من الساعة الحالية ({formatTime12h(currentHourStr)})</span>
            </span>
          )}
        </div>

        {/* فلاتر الحالات ونمط العرض */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* فلاتر الحالات */}
          <div className="h-8 p-0.5 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`h-7 px-2.5 rounded-lg cursor-pointer transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-[#074C3A] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({stats.totalBooked})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('waiting_only')}
              className={`h-7 px-2.5 rounded-lg cursor-pointer transition-all ${
                statusFilter === 'waiting_only'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              انتظار ({stats.waiting})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('booked_only')}
              className={`h-7 px-2.5 rounded-lg cursor-pointer transition-all ${
                statusFilter === 'booked_only'
                  ? 'bg-[#074C3A] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              محجوزة ({stats.totalBooked})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('available_only')}
              className={`h-7 px-2.5 rounded-lg cursor-pointer transition-all ${
                statusFilter === 'available_only'
                  ? 'bg-emerald-700 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              متاحة
            </button>
          </div>

          {/* أزرار نمط العرض (شبكة vs جدول) */}
          <div className="h-8 p-0.5 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`h-7 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                layoutMode === 'grid'
                  ? 'bg-[#074C3A] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="شبكة المربعات"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>مربعات</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('table')}
              className={`h-7 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                layoutMode === 'table'
                  ? 'bg-[#074C3A] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="جدول الساعات التفصيلي"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>جدول</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================== محتوى المربعات ================== */}
      {layoutMode === 'grid' ? (
        /* النمط 1: شبكة المربعات الصغيرة (Compact Box Grid) */
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          {visibleSlotBoxes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">
              لا توجد فترات مطابقة للفلتر المحدد
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {visibleSlotBoxes.map((slotBox) => {
                const { time, isBooked, appointment, appointments, isPast, hasWaitingPatient } = slotBox;
                const isCurrentHour = dayInfo.isToday && time.startsWith(currentHourStr.slice(0, 2));

                if (!isBooked) {
                  /* مربع فترة شاغرة / متاح */
                  return (
                    <div
                      key={time}
                      onClick={() => handleEmptySlotClick(time)}
                      className={`p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-[#0B7B5E] transition-all flex flex-col justify-between min-h-[96px] group relative ${
                        isDoctorView ? 'cursor-default' : 'cursor-pointer hover:shadow-xs'
                      } ${isCurrentHour ? 'ring-2 ring-emerald-500/30 border-[#0B7B5E]' : ''}`}
                    >
                      {isCurrentHour && (
                        <div className="absolute top-0 right-0 left-0 h-1 bg-[#0B7B5E] rounded-t-xl" />
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-600 group-hover:text-[#074C3A]">
                          {formatTime12h(time)}
                        </span>
                        {isCurrentHour ? (
                          <span className="text-[10px] font-black text-[#0B7B5E] bg-emerald-100 px-1.5 py-0.2 rounded-md">
                            الآن 🔴
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">متاح</span>
                        )}
                      </div>

                      <div className="text-center py-1">
                        {!isDoctorView ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B7B5E] opacity-70 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>حجز</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-300 font-bold">— فارغ —</span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono text-center">
                        {time}
                      </div>
                    </div>
                  );
                }

                /* مربع موعد محجوز */
                const isCompleted =
                  appointment?.status === 'COMPLETED' || appointment?.status === 'DONE';
                const isWaiting =
                  appointment?.status === 'WAITING' || appointment?.status === 'IN_PROGRESS';
                const isInProgress = appointment?.status === 'IN_PROGRESS';

                const boxStyle = isCompleted
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 hover:border-emerald-400 hover:shadow-xs'
                  : isWaiting
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 hover:border-amber-400 hover:shadow-xs ring-1 ring-amber-400/40'
                  : 'bg-sky-50/90 border-sky-300 text-[#074C3A] hover:border-sky-400 hover:shadow-xs';

                return (
                  <div
                    key={time}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[102px] relative ${boxStyle} ${
                      isCurrentHour ? 'ring-2 ring-rose-400' : ''
                    }`}
                  >
                    {/* وسم الوقت الحالي */}
                    {isCurrentHour && (
                      <div className="absolute -top-1.5 right-3 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                        الآن 🔴
                      </div>
                    )}

                    {/* تنبيه إذا كانت الحالة السابقة لا تزال في الانتظار */}
                    {isPast && hasWaitingPatient && (
                      <div className="absolute -top-1.5 left-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                        ⚠️ فترة سابقة
                      </div>
                    )}

                    {/* السطر الأول: الوقت ورقم الانتظار ونوع الكشف */}
                    <div className="flex items-center justify-between gap-1 text-[11px] mt-0.5">
                      <span className="font-mono font-black">{formatTime12h(time)}</span>
                      <div className="flex items-center gap-1">
                        {appointment?.queueNumber && (
                          <span className="px-1.5 py-0.2 rounded-md bg-white font-mono font-black text-[10px] shadow-2xs">
                            #{appointment.queueNumber}
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded-md bg-white/90 font-black text-[10px] shadow-2xs">
                          {getTypeLabel(appointment?.type)}
                        </span>
                      </div>
                    </div>

                    {/* الوسم المالي للطبيب + أيقونة فتح ملف المريض */}
                    <div className="flex items-center justify-between gap-1 mt-1">
                      {renderFinancialBadge(appointment)}
                      {appointment?.patientId && (
                        <Link
                          href={getPatientProfileUrl(appointment.patientId) || '#'}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-white/90 hover:bg-white text-slate-700 hover:text-[#074C3A] text-[9px] font-bold border border-slate-200 transition-all shadow-2xs shrink-0"
                          title="عرض ملف المريض والزيارات السابقة 👤"
                        >
                          <User className="w-2.5 h-2.5 text-slate-500" />
                          <span>الملف</span>
                        </Link>
                      )}
                    </div>

                    {/* السطر الثاني: اسم المريض بخط عريض وواضح */}
                    <div className="my-1.5">
                      <div className="font-black text-xs truncate" title={appointment?.patientName}>
                        {appointment?.patientName || 'مريض مسجل'}
                      </div>
                      {appointments.length > 1 && (
                        <span className="text-[10px] font-bold text-slate-500">
                          +{appointments.length - 1} موعد إضافي
                        </span>
                      )}
                    </div>

                    {/* السطر الثالث: الحالة والإجراءات المباشرة */}
                    <div className="pt-1 border-t border-black/5 flex items-center justify-between text-[10px] gap-1">
                      <div className="flex items-center gap-1 font-bold">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-600'
                              : isWaiting
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-sky-600'
                          }`}
                        />
                        <span className="truncate">
                          {isInProgress
                            ? 'جاري الكشف'
                            : isWaiting
                            ? 'في الانتظار'
                            : isCompleted
                            ? 'مكتمل'
                            : 'محجوز'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {isDoctorView ? (
                          <>
                            {/* زر إدخال فوري والانتقال للكشف فوراً إذا كان بالانتظار أو محجوز */}
                            {(isWaiting || !isCompleted) && (
                              <button
                                type="button"
                                onClick={(e) => handleAdmitAndOpenExam(e, appointment?.id)}
                                className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-[10px] transition-all shadow-2xs cursor-pointer flex items-center gap-0.5 shrink-0"
                                title="إدخال المريض وفتح استمارة الكشف فوراً 🚪🩺"
                              >
                                <LogIn className="w-2.5 h-2.5" />
                                <span>دخول</span>
                              </button>
                            )}

                            <Link
                              href={`/dashboard/examination/${appointment?.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded-lg bg-[#074C3A] hover:bg-[#0B7B5E] text-white font-black text-[10px] transition-all shadow-2xs cursor-pointer flex items-center gap-0.5 shrink-0"
                              title="فتح استمارة الكشف والروشتة 🩺"
                            >
                              <Stethoscope className="w-2.5 h-2.5" />
                              <span>{isInProgress ? 'كشف' : isCompleted ? 'روشتة' : 'فحص'}</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={`/dashboard/appointments?date=${date}${
                              selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''
                            }`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-1.5 py-0.5 rounded-md bg-white/80 hover:bg-white text-slate-700 font-bold text-[10px] transition-all cursor-pointer"
                          >
                            تفاصيل
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* النمط 2: جدول الساعات التفصيلي (Hourly Grid Matrix) */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* ترويسة الأعمدة */}
              <div className="grid grid-cols-5 border-b border-slate-200 text-center text-xs font-black bg-slate-50/80">
                <div className="py-3 px-2 border-l border-slate-200 text-slate-700">
                  الساعة / الفترة
                </div>
                {INTERVAL_MINUTES.map((min) => (
                  <div
                    key={min}
                    className="py-3 px-2 border-l border-slate-200 text-slate-700 font-mono"
                  >
                    :{min} دقيقة
                  </div>
                ))}
              </div>

              {/* صفوف الساعات (تبدأ من الساعة الحالية) */}
              <div className="divide-y divide-slate-100">
                {visibleHours.map((hour) => {
                  const hourNumber = parseInt(hour.split(':')[0], 10);
                  const isCurrentHourRow = dayInfo.isToday && hour === currentHourStr;

                  return (
                    <div
                      key={hour}
                      className={`grid grid-cols-5 min-h-[76px] group transition-colors ${
                        isCurrentHourRow ? 'bg-rose-50/30' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      {/* عمود تسمية الساعة */}
                      <div className="p-2 border-l border-slate-100 flex flex-col items-center justify-center font-mono text-xs font-black text-slate-700 bg-slate-50/30">
                        <div className="flex items-center gap-1">
                          <span>{formatTime12h(hour)}</span>
                          {isCurrentHourRow && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {hourNumber < 12
                            ? 'صباحاً'
                            : hourNumber < 17
                            ? 'ظهراً'
                            : 'مساءً'}
                        </span>
                      </div>

                      {/* خلايا الأرباع لهذا اليوم والساعة */}
                      {INTERVAL_MINUTES.map((min) => {
                        const cellTime = `${hour.split(':')[0]}:${min}`;
                        const cellAppts = apptsByExactTime.get(cellTime) || [];
                        const primaryAppt = cellAppts[0];
                        const isBooked = cellAppts.length > 0;

                        if (!isBooked) {
                          return (
                            <div
                              key={cellTime}
                              onClick={() => handleEmptySlotClick(cellTime)}
                              className={`p-1.5 border-l border-slate-100 flex flex-col justify-center items-center text-center transition-colors ${
                                !isDoctorView
                                  ? 'hover:bg-emerald-50/50 cursor-pointer group/cell'
                                  : 'cursor-default'
                              }`}
                            >
                              <span className="text-[11px] font-mono text-slate-300 font-bold group-hover/cell:text-[#0B7B5E]">
                                {cellTime}
                              </span>
                              {!isDoctorView && (
                                <span className="text-[10px] text-slate-300 group-hover/cell:text-[#0B7B5E] font-bold">
                                  + متاح
                                </span>
                              )}
                            </div>
                          );
                        }

                        const isCompleted =
                          primaryAppt.status === 'COMPLETED' || primaryAppt.status === 'DONE';
                        const isWaiting =
                          primaryAppt.status === 'WAITING' || primaryAppt.status === 'IN_PROGRESS';

                        const cellStyle = isCompleted
                          ? 'bg-emerald-100/90 border-emerald-300 text-emerald-950'
                          : isWaiting
                          ? 'bg-amber-100/90 border-amber-300 text-amber-950'
                          : 'bg-sky-100/90 border-sky-300 text-[#074C3A]';

                        return (
                          <div
                            key={cellTime}
                            className="p-1.5 border-l border-slate-100 flex items-center justify-center"
                          >
                            <Link
                              href={
                                isDoctorView
                                  ? `/dashboard/examination/${primaryAppt.id}`
                                  : `/dashboard/appointments?date=${date}${
                                      selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''
                                    }`
                              }
                              onClick={(e) => e.stopPropagation()}
                              title={
                                isDoctorView
                                  ? 'اضغط لفتح استمارة الكشف والروشتة 🩺'
                                  : 'عرض تفاصيل الموعد'
                              }
                              className={`w-full h-full p-2 rounded-xl border text-[11px] font-bold shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${cellStyle}`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono font-black">
                                <span>{cellTime}</span>
                                <span className="px-1 py-0.2 rounded bg-white/80 font-black">
                                  {getTypeLabel(primaryAppt.type)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 mt-0.5">
                                <div className="font-black truncate text-xs">
                                  {primaryAppt.patientName}
                                </div>
                                {renderFinancialBadge(primaryAppt)}
                              </div>
                              <div className="text-[10px] text-slate-600 font-bold truncate mt-0.5 flex items-center justify-between">
                                <span>{primaryAppt.queueNumber ? `#${primaryAppt.queueNumber} • ` : ''}{isWaiting ? 'انتظار' : isCompleted ? 'مكتمل' : 'محجوز'}</span>
                                {primaryAppt.patientId && (
                                  <span
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const url = getPatientProfileUrl(primaryAppt.patientId);
                                      if (url) router.push(url);
                                    }}
                                    className="hover:underline text-[9px] text-[#074C3A] cursor-pointer"
                                  >
                                    👤 الملف
                                  </span>
                                )}
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
