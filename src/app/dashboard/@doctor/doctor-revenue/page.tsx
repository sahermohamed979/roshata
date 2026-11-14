import React from 'react';
import { Metadata } from 'next';
import { DoctorRevenueView } from '@/features/reports/components/doctor-revenue-view';

export const metadata: Metadata = {
  title: 'تقرير الكشوفات والإيرادات | العيادة',
  description: 'متابعة عدد كشوفات وحالات الطبيب والإيرادات والمدفوعات والمتبقي',
};

export default function DoctorRevenuePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      <DoctorRevenueView />
    </div>
  );
}

