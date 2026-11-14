'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  FileText,
  BadgePercent,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  AlertCircle,
  User,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

interface ConsultationItem {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  fileNumber: string;
  patientAge?: number;
  patientGender?: string;
  doctorId?: string;
  doctorName?: string;
  clinicDate: string;
  scheduledAt?: string;
  startTime?: string;
  endTime?: string;
  type: string;
  status: string;
  queueNumber: number;
  originalFee: number;
  discount: number;
  fee: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
  isExempt: boolean;
}

interface RevenueData {
  from: string;
  to: string;
  doctorId: string | null;
  allDoctors?: Array<{ id: string; name: string }>;
  summary: {
    totalConsultations: number;
    completedVisits: number;
    totalFees: number;
    totalPaid: number;
    totalRemaining: number;
    freeCount: number;
    collectionRate: number;
  };
  typeBreakdown: Record<string, { count: number; totalFees: number; totalPaid: number }>;
  consultations: ConsultationItem[];
}

export function DoctorRevenueView() {
  const getClinicToday = () => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date());
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const [period, setPeriod] = useState<'today' | 'yesterday' | 'day-select' | 'week' | 'month' | 'custom'>('month');
  const [selectedDay, setSelectedDay] = useState<string>(() => getClinicToday());
  const [fromDate, setFromDate] = useState<string>(() => {
    const today = getClinicToday();
    return today.slice(0, 7) + '-01';
  });
  const [toDate, setToDate] = useState<string>(() => getClinicToday());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [data, setData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT'>('ALL');

  // Compute dates when period button changes
  const handlePeriodChange = (newPeriod: 'today' | 'yesterday' | 'day-select' | 'week' | 'month' | 'custom') => {
    setPeriod(newPeriod);
    const todayStr = getClinicToday();

    if (newPeriod === 'today') {
      setSelectedDay(todayStr);
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (newPeriod === 'yesterday') {
      const d = new Date(todayStr + 'T12:00:00Z');
      d.setUTCDate(d.getUTCDate() - 1);
      const yStr = d.toISOString().split('T')[0];
      setSelectedDay(yStr);
      setFromDate(yStr);
      setToDate(yStr);
    } else if (newPeriod === 'day-select') {
      setFromDate(selectedDay);
      setToDate(selectedDay);
    } else if (newPeriod === 'week') {
      const d = new Date(todayStr + 'T12:00:00Z');
      const day = d.getUTCDay(); // 0 is Sunday, 6 is Saturday
      const diff = (day + 1) % 7;
      d.setUTCDate(d.getUTCDate() - diff);
      const startStr = d.toISOString().split('T')[0];
      setFromDate(startStr);
      setToDate(todayStr);
    } else if (newPeriod === 'month') {
      const startOfMonth = todayStr.slice(0, 7) + '-01';
      setFromDate(startOfMonth);
      setToDate(todayStr);
    }
  };

  const handleStepDay = (delta: number) => {
    const d = new Date(selectedDay + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + delta);
    const nextDay = d.toISOString().split('T')[0];
    setSelectedDay(nextDay);
    setPeriod('day-select');
    setFromDate(nextDay);
    setToDate(nextDay);
  };

  const handleSelectSpecificDay = (day: string) => {
    setSelectedDay(day);
    setPeriod('day-select');
    setFromDate(day);
    setToDate(day);
  };

  const fetchRevenue = async () => {
    setIsLoading(true);
    try {
      let url = `/api/reports/doctor-revenue?from=${fromDate}&to=${toDate}`;
      if (selectedDoctorId && selectedDoctorId !== 'ALL') {
        url += `&doctorId=${encodeURIComponent(selectedDoctorId)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json.payload || json);
      } else {
        toast.error('تعذر تحميل بيانات التقرير المالي');
      }
    } catch {
      toast.error('حدث خطأ أثناء تحميل التقرير');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [fromDate, toDate, selectedDoctorId]);

  // Translate appointment types
  const formatTypeName = (type: string) => {
    switch (type) {
      case 'EXAMINATION':
        return 'كشف جديد';
      case 'FOLLOW_UP':
        return 'إعادة واستشارة';
      case 'POST_OPERATIVE':
        return 'متابعة ما بعد العملية';
      case 'OPERATION_FOLLOWUP':
        return 'متابعة جراحة';
      case 'ENDOSCOPY':
        return 'منظار تشخيصي';
      case 'SURGERY':
        return 'عملية جراحية';
      case 'CONSULTATION':
        return 'استشارة طبية';
      default:
        return type || 'كشف';
    }
  };

  // Filter consultations for table
  const filteredConsultations = (data?.consultations || []).filter((item) => {
    if (statusFilter !== 'ALL' && item.paymentStatus !== statusFilter) return false;
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase().trim();
    return (
      item.patientName.toLowerCase().includes(q) ||
      (item.patientPhone && item.patientPhone.includes(q)) ||
      (item.fileNumber && item.fileNumber.toLowerCase().includes(q)) ||
      (item.doctorName && item.doctorName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* 1. الترويسة الرئيسية */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#074C3A] flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            <DollarSign className="w-6 h-6 text-[#0B7B5E]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#074C3A]">
              تقرير الكشوفات والإيرادات للطبيب
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              متابعة عدد الحالات والكشوفات ومحصلة الإيرادات والمبالغ المحصلة والمتبقية
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRevenue}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0B7B5E]' : ''}`} />
          <span>تحديث التقرير</span>
        </button>
      </div>

      {/* 2. شريط اختيار الفترة الزمنية واختيار الطبيب */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4 text-[#0B7B5E]" />
              <span>الفترة الزمنية:</span>
            </span>

            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center gap-1 text-xs font-bold flex-wrap">
              <button
                type="button"
                onClick={() => handlePeriodChange('today')}
                className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                  period === 'today'
                    ? 'bg-[#074C3A] text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('yesterday')}
                className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                  period === 'yesterday'
                    ? 'bg-[#074C3A] text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                أمس
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('day-select')}
                className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                  period === 'day-select'
                    ? 'bg-[#074C3A] text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                يوم محدد 🗓️
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('week')}
                className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                  period === 'week'
                    ? 'bg-[#074C3A] text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                هذا الأسبوع
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('month')}
                className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                  period === 'month'
                    ? 'bg-[#074C3A] text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                هذا الشهر
              </button>
              <button
                type="button"
                onClick={() => setPeriod('custom')}
                className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                  period === 'custom'
                    ? 'bg-[#074C3A] text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                فترة مخصصة (من - إلى) 📊
              </button>
            </div>
          </div>

          {/* محدد الطبيب */}
          <div className="relative shrink-0 self-start xl:self-auto">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="h-9 pr-3 pl-8 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#074C3A] focus:outline-none focus:border-[#0B7B5E] cursor-pointer appearance-none shadow-2xs"
            >
              <option value="ALL">كافة أطباء وكشوفات العيادة</option>
              {data?.allDoctors?.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* شريط محدد اليوم الفردي (عند اختيار "يوم محدد") */}
        {period === 'day-select' && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 animate-in fade-in-50 flex-wrap text-xs font-bold">
            <span className="text-[#074C3A] font-black flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0B7B5E]" />
              <span>اختر اليوم المطلوب:</span>
            </span>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-emerald-300 shadow-2xs">
              <button
                type="button"
                onClick={() => handleStepDay(-1)}
                title="اليوم السابق"
                className="w-7 h-7 rounded-lg text-slate-500 hover:text-[#074C3A] hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <input
                type="date"
                value={selectedDay}
                onChange={(e) => handleSelectSpecificDay(e.target.value)}
                className="h-7 px-2 font-mono text-xs font-black text-[#074C3A] bg-transparent focus:outline-none cursor-pointer"
              />

              <button
                type="button"
                onClick={() => handleStepDay(1)}
                title="اليوم التالي"
                className="w-7 h-7 rounded-lg text-slate-500 hover:text-[#074C3A] hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSelectSpecificDay(getClinicToday())}
              className="h-8 px-3 rounded-xl bg-white hover:bg-emerald-100 text-[#074C3A] border border-emerald-300 font-bold text-xs transition-colors cursor-pointer"
            >
              الرجوع لليوم الحالي
            </button>

            <span className="text-slate-500 text-[11px] font-medium mr-auto">
              تاريخ الكشوفات المعروضة: <strong className="font-mono text-[#074C3A]">{selectedDay}</strong>
            </span>
          </div>
        )}

        {/* محدد التواريخ للفترة المخصصة (من - إلى) */}
        {period === 'custom' && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in-50 flex-wrap text-xs font-bold text-slate-700">
            <span className="text-[#074C3A] font-black">حدد المدى الزمني:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">من:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold text-[#074C3A] focus:outline-none focus:border-[#0B7B5E]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">إلى:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold text-[#074C3A] focus:outline-none focus:border-[#0B7B5E]"
              />
            </div>
            <button
              type="button"
              onClick={fetchRevenue}
              className="h-8 px-3 rounded-xl bg-[#0B7B5E] text-white font-bold text-xs hover:bg-[#09634C] transition-all cursor-pointer shadow-2xs"
            >
              تطبيق الفترة
            </button>
          </div>
        )}
      </div>

      {/* 3. بطاقات المؤشرات المالية والتشغيلية (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* إجمالي الكشوفات */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">عدد الكشوفات المسجلة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#074C3A] flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4 text-[#0B7B5E]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#074C3A] font-mono">
            {data?.summary?.totalConsultations ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            تم إنجاز {data?.summary?.completedVisits ?? 0} كشف بالكامل
          </p>
        </div>

        {/* إجمالي قيمة الكشوفات */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي قيمة الكشوفات</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#074C3A] font-mono">
            {(data?.summary?.totalFees ?? 0).toLocaleString()} <span className="text-xs font-sans font-bold">ج.م</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            إجمالي أسعار الخدمات والكشوفات
          </p>
        </div>

        {/* المبالغ المحصلة فعلياً */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-300 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#074C3A]">المدفوعات المحصلة</span>
            <div className="w-8 h-8 rounded-xl bg-[#0B7B5E] text-white flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B7B5E] font-mono">
            {(data?.summary?.totalPaid ?? 0).toLocaleString()} <span className="text-xs font-sans font-bold">ج.م</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold">
            نسبة التحصيل: {data?.summary?.collectionRate ?? 100}%
          </p>
        </div>

        {/* المبالغ المتبقية غير المحصلة */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المتبقي غير المحصل</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {(data?.summary?.totalRemaining ?? 0).toLocaleString()} <span className="text-xs font-sans font-bold">ج.م</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {data?.summary?.freeCount ?? 0} حالات كشف مجاني / معفى
          </p>
        </div>
      </div>

      {/* 4. تفصيل الكشوفات بحسب نوع الخدمة */}
      {data?.typeBreakdown && Object.keys(data.typeBreakdown).length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-[#074C3A] flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-[#0B7B5E]" />
            <span>توزيع الكشوفات والتحصيل بحسب نوع الحجز:</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {Object.entries(data.typeBreakdown).map(([typeKey, stats]) => (
              <div
                key={typeKey}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-1"
              >
                <span className="font-bold text-slate-600 block truncate">
                  {formatTypeName(typeKey)}
                </span>
                <div className="text-base font-black text-[#074C3A] font-mono">
                  {stats.count} <span className="text-[10px] font-sans font-normal text-slate-400">حالة</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-[#0B7B5E]">
                  {stats.totalPaid.toLocaleString()} ج.م
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. جدول سجل الكشوفات التفصيلي */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-[#074C3A] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0B7B5E]" />
              <span>سجل الحالات والكشوفات التفصيلي ({filteredConsultations.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              قائمة بجميع المرضى والكشوفات المسجلة وحالة السداد لكل كشف
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* فلتر حالة الدفع */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#074C3A] focus:outline-none focus:border-[#0B7B5E] cursor-pointer"
            >
              <option value="ALL">جميع حالات الدفع</option>
              <option value="PAID">مدفوع بالكامل</option>
              <option value="PARTIAL">دفع جزئي</option>
              <option value="UNPAID">غير مدفوع</option>
              <option value="EXEMPT">معفى / مجاني</option>
            </select>

            {/* بحث في الجدول */}
            <div className="relative w-48 sm:w-60">
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="ابحث باسم المريض أو الطبيب..."
                className="w-full h-9 pr-8 pl-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#074C3A] focus:bg-white focus:outline-none focus:border-[#0B7B5E]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0B7B5E] animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">جاري تحميل سجل الكشوفات...</p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              لا توجد كشوفات مسجلة في هذه الفترة المحددة ({fromDate} إلى {toDate}).
            </p>
            <p className="text-[11px] text-slate-400">
              جرب الضغط على &quot;هذا الشهر&quot; أو اختيار &quot;كافة أطباء وكشوفات العيادة&quot; للاطلاع على جميع الحالات.
            </p>
          </div>
        ) : (
          <>
            {/* عرض شاشات الموبايل والأجهزة الصغيرة (بطاقات سريعة ومتجاوبة) */}
            <div className="block md:hidden space-y-3">
              {filteredConsultations.map((c, idx) => (
                <div
                  key={`mobile-${c.id}`}
                  className="p-4 bg-slate-50/70 hover:bg-[#E3F5EE]/40 rounded-2xl border border-slate-200 text-xs space-y-3 transition-colors shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#074C3A] text-white font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-black text-sm text-[#074C3A]">
                          {c.patientName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          {c.fileNumber && <span>ملف: #{c.fileNumber}</span>}
                          {c.patientPhone && <span>· {c.patientPhone}</span>}
                        </div>
                      </div>
                    </div>
                    <div>
                      {c.isExempt ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black">
                          معفى
                        </span>
                      ) : c.remainingAmount === 0 && c.fee > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                          مدفوع كامل ✓
                        </span>
                      ) : c.paidAmount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
                          دفع جزئي
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black">
                          غير مدفوع
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block">الطبيب:</span>
                      <strong className="text-slate-700">{c.doctorName || 'طبيب العيادة'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">نوع الكشف:</span>
                      <strong className="text-slate-700">{formatTypeName(c.type)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">التاريخ والوقت:</span>
                      <strong className="text-slate-700 font-mono">
                        {c.clinicDate} {c.startTime ? `(${c.startTime})` : ''}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">حالة الكشف:</span>
                      <strong className={c.status === 'COMPLETED' ? 'text-emerald-700' : 'text-slate-700'}>
                        {c.status === 'COMPLETED' ? 'تم الكشف' : c.status === 'IN_PROGRESS' ? 'جاري الفحص' : 'في الانتظار'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">القيمة:</span>
                        <strong className="text-slate-800">{c.fee} ج.م</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">المدفوع:</span>
                        <strong className="text-[#0B7B5E]">{c.paidAmount} ج.م</strong>
                      </div>
                      {c.remainingAmount > 0 && (
                        <div>
                          <span className="text-slate-400 text-[10px] block font-sans">المتبقي:</span>
                          <strong className="text-rose-600">{c.remainingAmount} ج.م</strong>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/examination/${c.appointmentId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0B7B5E] text-white font-bold text-xs shadow-2xs hover:bg-[#09634C] transition-colors"
                    >
                      <span>فتح الكشف</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* عرض شاشات التابلت والكمبيوتر (جدول كامل) */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-black">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">المريض</th>
                  <th className="py-3 px-3">الطبيب المعالج</th>
                  <th className="py-3 px-3">التاريخ والوقت</th>
                  <th className="py-3 px-3">نوع الكشف</th>
                  <th className="py-3 px-3">حالة الكشف</th>
                  <th className="py-3 px-3">قيمة الكشف</th>
                  <th className="py-3 px-3">المدفوع</th>
                  <th className="py-3 px-3">المتبقي</th>
                  <th className="py-3 px-3 text-center">حالة السداد</th>
                  <th className="py-3 px-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConsultations.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-[#E3F5EE]/30 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-bold font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-black text-sm text-[#074C3A] block">
                        {c.patientName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {c.patientPhone || (c.fileNumber ? `ملف: ${c.fileNumber}` : '—')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {c.doctorName || 'طبيب العيادة'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      <div>{c.clinicDate}</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {c.startTime || (c.scheduledAt ? new Date(c.scheduledAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—')}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {formatTypeName(c.type)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {c.status === 'COMPLETED' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم الكشف</span>
                        </span>
                      ) : c.status === 'IN_PROGRESS' ? (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>جاري الفحص</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">في الانتظار</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      {c.fee} ج.م
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-[#0B7B5E]">
                      {c.paidAmount} ج.م
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-600">
                      {c.remainingAmount > 0 ? `${c.remainingAmount} ج.م` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.isExempt ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black">
                          معفى / مجاني
                        </span>
                      ) : c.remainingAmount === 0 && c.fee > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                          مدفوع كامل ✓
                        </span>
                      ) : c.paidAmount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
                          دفع جزئي
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black">
                          غير مدفوع
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Link
                        href={`/dashboard/examination/${c.appointmentId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#074C3A] font-bold text-[11px] transition-colors"
                      >
                        <span>فتح الكشف</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
