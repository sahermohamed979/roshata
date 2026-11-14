'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  Printer,
  Filter,
  FileSpreadsheet,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-11');

  const handleExport = (format: string) => {
    toast.success(`جاري تصدير التقرير المالي بصيغة ${format}...`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* 1. الترويسة الرئيسية والفلترة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-[#E3F5EE] text-[#0B7B5E]">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#074C3A] tracking-tight">
              التقارير المالية والتشغيلية الشاملة
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-400">
            تحليل حركة الإيرادات والمصروفات وصافي الأرباح وأداء العيادة
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
            <Filter className="w-4 h-4 text-slate-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => handleExport('Excel')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#0B7B5E] hover:bg-[#09634C] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* 2. بطاقات مؤشرات الأداء الرئيسية (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي إيرادات الشهر</span>
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#074C3A]">48,500 ج.م</div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% مقارنة بالشهر السابق</span>
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي المصروفات المعتمدة</span>
            <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600">6,200 ج.م</div>
          <span className="text-[11px] font-bold text-slate-400">
            ضمن الميزانية المحددة للعيادة
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">صافي الأرباح</span>
            <span className="p-1.5 rounded-xl bg-[#E3F5EE] text-[#0B7B5E]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#0B7B5E]">42,300 ج.م</div>
          <span className="text-[11px] font-bold text-[#0B7B5E]">
            هامش ربح تشغيلي 87%
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي الكشوفات المنفذة</span>
            <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#074C3A]">162 كشف</div>
          <span className="text-[11px] font-bold text-slate-400">
            متوسط 300 ج.م للكشف
          </span>
        </div>
      </div>

      {/* 3. تفاصيل حركة الإيرادات ومصادر الدخل */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-[#074C3A] pb-3 border-b border-slate-100">
            توزيع الإيرادات حسب نوع الخدمة
          </h2>

          <div className="space-y-3 text-xs font-bold">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-700">الكشوفات العادية والزيارات الأولى</span>
                <span className="text-[#074C3A]">32,400 ج.م (67%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#0B7B5E] h-full rounded-full" style={{ width: '67%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-700">استشارات ومتابعات</span>
                <span className="text-[#074C3A]">9,600 ج.م (20%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-700">عمليات صغرى وإجراءات بالعيادة</span>
                <span className="text-[#074C3A]">6,500 ج.م (13%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '13%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-[#074C3A] pb-3 border-b border-slate-100">
            توزيع طرق التحصيل المالي
          </h2>

          <div className="space-y-3 text-xs font-bold">
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-700">نقداً بالخزينة (Cash)</span>
              </div>
              <span className="font-black text-[#074C3A]">41,200 ج.م (85%)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0B7B5E]" />
                <span className="text-slate-700">بطاقات بنكية (Visa / MasterCard)</span>
              </div>
              <span className="font-black text-[#074C3A]">5,800 ج.م (12%)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-700">محافظ إلكترونية (Vodafone Cash / InstaPay)</span>
              </div>
              <span className="font-black text-[#074C3A]">1,500 ج.م (3%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

