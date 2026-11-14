'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  FileText,
  Pill,
  Printer,
  Edit,
  Sparkles,
  Stethoscope,
  ChevronLeft,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { PrescriptionPrintModal } from '@/features/prescriptions/components/prescription-print-modal';
import { useDashboardData } from '../hooks/use-dashboard-data';
import type { Prescription } from '@/types/prescription.types';

export function RoshtehHomeView() {
  // Navigation
  const router = useRouter();

  // Stores
  const { loadPrescription } = usePrescriptionStore();

  // State
  const [selectedForPrint, setSelectedForPrint] = useState<Prescription | null>(null);

  // Queries (TanStack React Query - eliminates useEffect)
  const { data: dashboardData } = useDashboardData();

  // Derived data
  const recentPrescriptions = dashboardData?.recentPrescriptions ?? [];
  const totalRxCount = dashboardData?.totalRxCount ?? 0;
  const totalMedicinesCount = dashboardData
    ? dashboardData.medicineCounts.global + dashboardData.medicineCounts.custom
    : 0;

  // Functions
  const handleEdit = (rx: Prescription) => {
    loadPrescription(rx);
    router.push('/prescriptions/new');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#074C3A] via-[#0B7B5E] to-[#0D946F] rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        {/* Abstract medical cross watermark */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 font-serif italic text-9xl text-white/10 select-none pointer-events-none">
          ℞
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#45DBA5]" />
            <span>منصة روشتة الطبية · الإصدار المحلي المستقل (Offline-First)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            أهلاً بك يا دكتور، جاهز لتحرير روشتة مريضك القادم؟
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            محرك روشتة يعمل محلياً في متصفحك بشكل كامل وفوري بدون الحاجة للاتصال بالإنترنت، مع بحث سريع في الأدوية وقوالب طباعة جاهزة بنقرة زر.
          </p>

          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <Link
              href="/prescriptions/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-[#074C3A] hover:bg-emerald-50 text-sm font-black shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#0B7B5E]" />
              <span>تحرير روشتة جديدة الآن</span>
            </Link>

            <Link
              href="/medicines"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold border border-white/20 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>تصفح دليل الأدوية ({totalMedicinesCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Prescriptions */}
        <Card className="border border-[#D0E5DC] bg-white rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">إجمالي الروشتات المسجلة</span>
              <span className="text-2xl sm:text-3xl font-black text-[#0B7B5E] mt-1 block">
                {totalRxCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center font-black">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Local Medicines */}
        <Card className="border border-[#D0E5DC] bg-white rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">الأدوية المحملة محلياً</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 block">
                {totalMedicinesCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              <Pill className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Offline Engine Ready */}
        <Card className="border border-[#D0E5DC] bg-white rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">حالة قاعدة البيانات (IndexedDB)</span>
              <span className="text-base sm:text-lg font-black text-[#074C3A] mt-1 block flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-[#0B7B5E]" />
                مفعلة وتعمل أوفلاين
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center font-black">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Prescriptions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">أحدث الروشتات الصادرة</h2>
            <Badge variant="outline" className="bg-white border-[#D0E5DC] font-black text-[#0B7B5E]">
              {recentPrescriptions.length} من {totalRxCount}
            </Badge>
          </div>

          <Link
            href="/prescriptions"
            className="text-xs font-bold text-[#0B7B5E] hover:text-[#074C3A] flex items-center gap-1 hover:underline"
          >
            <span>عرض كل الأرشيف</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {recentPrescriptions.length > 0 ? (
          <div className="space-y-2.5">
            {recentPrescriptions.map((rx) => (
              <Card
                key={rx.id}
                onClick={() => handleEdit(rx)}
                className="border border-[#D0E5DC] bg-white hover:border-[#0B7B5E]/50 transition-all rounded-2xl cursor-pointer group"
              >
                <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 group-hover:text-[#0B7B5E] transition-colors truncate">
                        {rx.patient.name || 'مريض غير مسمى'}
                      </span>
                      {rx.patient.age && (
                        <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                          {rx.patient.age}
                        </span>
                      )}
                      <Badge
                        variant={rx.status === 'completed' ? 'success' : 'warning'}
                        className="text-[10px] font-black"
                      >
                        {rx.status === 'completed' ? 'مكتملة' : 'مسودة'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                      {rx.diagnosis && (
                        <span className="font-bold text-[#0B7B5E]">{rx.diagnosis} • </span>
                      )}
                      <span>{rx.items.length} أدوية مقررة</span>
                      <span>•</span>
                      <span className="text-slate-400" dir="ltr">
                        {rx.items.slice(0, 3).map((it) => it.nameSnapshotEn).join(', ')}
                        {rx.items.length > 3 ? '...' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedForPrint(rx);
                      }}
                      className="border-slate-200 text-slate-700 hover:bg-[#E3F5EE] text-xs font-bold rounded-xl h-8 px-3 gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleEdit(rx)}
                      className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white text-xs font-bold rounded-xl h-8 px-3 gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-[#D0E5DC] bg-white p-8 text-center rounded-2xl">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-black text-slate-800">لا توجد روشتات مسجلة بعد</p>
            <p className="text-xs text-slate-500 mt-0.5">ابدأ بتحرير أول روشتة وستظهر هنا مباشرة</p>
          </Card>
        )}
      </div>

      {/* Print Preview Modal */}
      {selectedForPrint && (
        <PrescriptionPrintModal
          open={!!selectedForPrint}
          onOpenChange={(open) => {
            if (!open) setSelectedForPrint(null);
          }}
          prescription={selectedForPrint}
        />
      )}
    </div>
  );
}
