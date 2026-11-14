'use client';

import React from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { BookingFormType } from '../types/booking';
import { EXEMPTION_PRESETS } from '../constants/booking.constant';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * القسم 4: الرسوم والبيانات المالية
 * - تحديد سعر الكشف والمسدد مقدماً (المدفوع الآن)
 * - خيار إعفاء المريض من الرسوم (حالة خاصة / مجاني) مع تحديد سبب الإعفاء
 */
export function FinancialStepCard() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormType>();

  const isExempt = useWatch({ control, name: 'isExempt' });
  const exemptionReason = useWatch({ control, name: 'exemptionReason' });
  const examinationFee = useWatch({ control, name: 'examinationFee' }) || 0;
  const discount = useWatch({ control, name: 'discount' }) || 0;
  const paidAmount = useWatch({ control, name: 'paidAmount' }) || 0;

  const netFee = isExempt ? 0 : Math.max(0, examinationFee - discount);
  const remaining = isExempt ? 0 : Math.max(0, netFee - paidAmount);
  const isOverpaid = !isExempt && paidAmount > netFee;

  const handleToggleExemption = () => {
    const nextState = !isExempt;
    setValue('isExempt', nextState, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    if (nextState) {
      if (!exemptionReason) {
        setValue('exemptionReason', EXEMPTION_PRESETS[0], {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
  };

  const handleSelectPreset = (preset: string) => {
    setValue('exemptionReason', preset, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 space-y-5 animate-in fade-in-50">
      {/* رأس القسم: الرقم 4 والعنوان */}
      <div className="flex items-start gap-3.5">
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0B7B5E] text-white flex items-center justify-center font-black text-sm shrink-0">
          4
        </span>
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#074C3A] tracking-tight">
            الرسوم والبيانات المالية
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            رسوم الكشف، السداد مقدماً، أو تطبيق الإعفاء من الرسوم
          </p>
        </div>
      </div>

      {/* حقول الإدخال المالية: سعر الكشف كامل + قيمة الخصم + المدفوع الآن */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* 1. سعر الكشف كامل */}
        <div>
          <label className="block text-xs font-bold text-[#074C3A] mb-1.5">
            سعر الكشف كامل <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="examinationFee"
            control={control}
            render={({ field }) => (
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  step="10"
                  disabled={isExempt}
                  value={isExempt ? 0 : field.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    field.onChange(val);
                  }}
                  placeholder="[سعر الكشف]"
                  className={cn(
                    'w-full h-11 px-3.5 pe-12 rounded-2xl border text-xs sm:text-sm font-bold transition-all focus:outline-none',
                    isExempt
                      ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                      : 'bg-white border-slate-200 text-[#074C3A] focus:border-[#0B7B5E] focus:ring-2 focus:ring-[#0B7B5E]/15'
                  )}
                />
                <span className="absolute end-3.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
                  ج.م
                </span>
              </div>
            )}
          />
          {errors.examinationFee && (
            <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.examinationFee.message}</span>
            </p>
          )}
        </div>

        {/* 2. قيمة الخصم المالي */}
        <div>
          <label className="block text-xs font-bold text-[#074C3A] mb-1.5">
            قيمة الخصم
          </label>
          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  step="5"
                  disabled={isExempt}
                  value={isExempt ? 0 : field.value ?? 0}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    field.onChange(val);
                  }}
                  placeholder="0"
                  className={cn(
                    'w-full h-11 px-3.5 pe-12 rounded-2xl border text-xs sm:text-sm font-bold transition-all focus:outline-none',
                    isExempt
                      ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-rose-600 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                  )}
                />
                <span className="absolute end-3.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
                  ج.م
                </span>
              </div>
            )}
          />
          {errors.discount && (
            <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.discount.message}</span>
            </p>
          )}
        </div>

        {/* 3. المدفوع الآن */}
        <div>
          <label className="block text-xs font-bold text-[#074C3A] mb-1.5">
            المدفوع الآن
          </label>
          <Controller
            name="paidAmount"
            control={control}
            render={({ field }) => (
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  step="10"
                  disabled={isExempt}
                  value={isExempt ? 0 : field.value ?? 0}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    field.onChange(val);
                  }}
                  placeholder="0"
                  className={cn(
                    'w-full h-11 px-3.5 pe-12 rounded-2xl border text-xs sm:text-sm font-bold transition-all focus:outline-none',
                    isExempt
                      ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      : isOverpaid
                      ? 'bg-rose-50/60 border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'bg-white border-slate-200 text-[#074C3A] focus:border-[#0B7B5E] focus:ring-2 focus:ring-[#0B7B5E]/15'
                  )}
                />
                <span className="absolute end-3.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
                  ج.م
                </span>
              </div>
            )}
          />
          {isOverpaid && (
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 mt-1.5 bg-rose-50 border border-rose-200 p-2 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>المبلغ المدفوع ({paidAmount} ج.م) أكبر من صافي الكشف ({netFee} ج.م)</span>
            </p>
          )}
          {errors.paidAmount && !isOverpaid && (
            <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.paidAmount.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* شريط الحساب المالي التلقائي (الصافي + المتبقي) */}
      {!isExempt && (
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500">الصافي بعد الخصم:</span>
            <span className="text-sm font-black text-[#0B7B5E]">{netFee} ج.م</span>
          </div>
          <div className="flex items-center justify-between px-2 border-r border-slate-200">
            <span className="text-xs font-bold text-slate-500">المبلغ المتبقي:</span>
            <span
              className={cn(
                'text-sm font-black',
                remaining > 0 ? 'text-amber-600' : 'text-emerald-600'
              )}
            >
              {remaining > 0 ? `${remaining} ج.م` : 'مسدد بالكامل ✓'}
            </span>
          </div>
        </div>
      )}

      {/* زر سويتش: إعفاء المريض من الرسوم (حالة خاصة / مجاني) */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          role="switch"
          aria-checked={isExempt}
          onClick={handleToggleExemption}
          dir="ltr"
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
            isExempt ? 'bg-[#0B7B5E]' : 'bg-slate-200'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
              isExempt ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
        <span
          onClick={handleToggleExemption}
          className="text-xs sm:text-sm font-bold text-[#074C3A] cursor-pointer select-none"
        >
          إعفاء المريض من الرسوم (حالة خاصة / مجاني)
        </span>
      </div>

      {/* المربع الأصفر لسبب الإعفاء عند تفعيل المفتاح */}
      {isExempt && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF0] border border-amber-300 space-y-3 animate-in fade-in-50">
          <label className="block text-xs font-black text-[#074C3A]">
            سبب الإعفاء من الرسوم <span className="text-rose-500">*</span>
          </label>
          <div className="space-y-2">
            {EXEMPTION_PRESETS.map((preset) => {
              const isSelected = exemptionReason === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={cn(
                    'w-full py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 select-none',
                    isSelected
                      ? 'bg-[#074C3A] border-[#074C3A] text-white shadow-xs font-black'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
                  )}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3] shrink-0" />}
                  <span>{preset}</span>
                </button>
              );
            })}
          </div>
          {errors.exemptionReason && (
            <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.exemptionReason.message}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

