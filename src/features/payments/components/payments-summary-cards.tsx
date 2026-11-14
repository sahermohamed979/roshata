'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PaymentsSummary } from '../types/payments';

interface PaymentsSummaryCardsProps {
  summary: PaymentsSummary;
  dateLabel?: string;
}

export function PaymentsSummaryCards({ summary }: PaymentsSummaryCardsProps) {
  const t = useTranslations('Payments');

  const formatMoney = (val: number) => {
    return Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4.5 select-none">
      {/* 1. إجمالي التحصيل اليوم (البطاقة الكحلية الرئيسية في اليمين) */}
      <div className="bg-[#074C3A] text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-800/20 relative overflow-hidden flex flex-col justify-between min-h-[120px] transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            {t('dailyCollection')}
          </span>
          <div className="w-8 h-8 rounded-full bg-[#EAB308] flex items-center justify-center shrink-0 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
            {formatMoney(summary.totalCollected)}
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-300">
            {t('currency')}
          </span>
        </div>
      </div>

      {/* 2. عربون وحجوزات جزئية (البطاقة الصفراء/الكريمية في الوسط) */}
      <div className="bg-[#FEFCE8] text-[#074C3A] rounded-3xl p-5 sm:p-6 shadow-xs border border-[#FEF08A] relative overflow-hidden flex flex-col justify-between min-h-[120px] transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-700">
            {t('depositAndPartial')}
          </span>
          <div className="w-8 h-8 rounded-full bg-[#EAB308] flex items-center justify-center shrink-0 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#074C3A] font-sans">
            {formatMoney(summary.totalDeposits)}
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-600">
            {t('currency')}
          </span>
        </div>
      </div>

      {/* 3. مبالغ متبقية للتحصيل (البطاقة الزرقاء الفاتحة في اليسار) */}
      <div className="bg-[#F0F7FF] text-[#074C3A] rounded-3xl p-5 sm:p-6 shadow-xs border border-[#D0E5DC] relative overflow-hidden flex flex-col justify-between min-h-[120px] transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-700">
            {t('remainingToCollect')}
          </span>
          <div className="w-8 h-8 rounded-full bg-[#0B7B5E] flex items-center justify-center shrink-0 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#074C3A] font-sans">
            {formatMoney(summary.totalRemaining)}
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-600">
            {t('currency')}
          </span>
        </div>
      </div>
    </div>
  );
}
