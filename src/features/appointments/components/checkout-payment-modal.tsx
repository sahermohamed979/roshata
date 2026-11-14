'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CreditCard,
  Banknote,
  Wallet,
  X,
  CheckCircle2,
  ShieldCheck,
  Split,
  CircleDollarSign,
  HeartHandshake,
} from 'lucide-react';
import { useCheckoutAppointmentMutation } from '../hooks/appointments.hook';

interface CheckoutPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
  remainingAmount: number;
  totalAmount: number;
  paidAmount: number;
  onSuccess: () => void;
}

export function CheckoutPaymentModal({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  remainingAmount,
  totalAmount,
  paidAmount,
  onSuccess,
}: CheckoutPaymentModalProps) {
  const t = useTranslations('Dashboard.receptionist.table');
  const [settlementType, setSettlementType] = useState<'FULL' | 'PARTIAL' | 'EXEMPT'>('FULL');
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'WALLET'>('CASH');
  const [amount, setAmount] = useState<number>(remainingAmount);
  const [exemptionReason, setExemptionReason] = useState<string>('بتعليمات الطبيب المعالج');
  const [notes, setNotes] = useState<string>('');

  const checkoutMutation = useCheckoutAppointmentMutation();
  const isPending = checkoutMutation.isPending;

  if (!isOpen) return null;

  const handleConfirm = () => {
    const payAmount =
      settlementType === 'EXEMPT'
        ? 0
        : settlementType === 'FULL'
        ? remainingAmount
        : Number(amount) || 0;

    checkoutMutation.mutate(
      {
        id: appointmentId,
        payload: {
          method: settlementType === 'EXEMPT' ? undefined : method,
          amount: payAmount,
          settlementType,
          isExempt: settlementType === 'EXEMPT',
          exemptionReason: settlementType === 'EXEMPT' ? exemptionReason : undefined,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess();
        },
      },
    );
  };

  const calculatedRemainingAfterPartial = Math.max(0, remainingAmount - (Number(amount) || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E3F5EE] border border-[#D0E5DC] flex items-center justify-center text-[#0B7B5E] shadow-2xs">
              <CircleDollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#074C3A]">
                تسوية الحساب ومغادرة المريض
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                المريض: <span className="font-bold text-slate-800">{patientName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Card Summary */}
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">سعر الكشف الإجمالي:</span>
              <span className="font-black text-slate-700 text-sm">{totalAmount} ج.م</span>
            </div>
            <div className="text-center">
              <span className="text-slate-400 block mb-0.5">المسدد مسبقاً (عربون):</span>
              <span className="font-black text-emerald-600 text-sm">{paidAmount} ج.م</span>
            </div>
            <div className="text-end">
              <span className="text-slate-400 block mb-0.5">المتبقي المطلوب:</span>
              <span className="font-black text-amber-700 text-base">{remainingAmount} ج.م</span>
            </div>
          </div>

          {remainingAmount > 0 ? (
            <>
              {/* خيارات تسوية المتبقي (سداد كامل / سداد جزء / إعفاء) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  اختر إجراء تسوية المبلغ المتبقي:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* خيار 1: سداد كامل المتبقي */}
                  <button
                    type="button"
                    onClick={() => {
                      setSettlementType('FULL');
                      setAmount(remainingAmount);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      settlementType === 'FULL'
                        ? 'border-[#0B7B5E] bg-[#E3F5EE] text-[#0B7B5E] shadow-xs ring-2 ring-[#0B7B5E]/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 mb-1.5 text-[#0B7B5E]" />
                    <span>سداد كامل</span>
                    <span className="text-[10px] opacity-75 font-normal">({remainingAmount} ج.م)</span>
                  </button>

                  {/* خيار 2: سداد جزء من المتبقي */}
                  <button
                    type="button"
                    onClick={() => {
                      setSettlementType('PARTIAL');
                      setAmount(Math.floor(remainingAmount / 2) || 10);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      settlementType === 'PARTIAL'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Split className="w-5 h-5 mb-1.5 text-amber-600" />
                    <span>سداد جزء</span>
                    <span className="text-[10px] opacity-75 font-normal">دفعة وتأجيل الباقي</span>
                  </button>

                  {/* خيار 3: إعفاء من باقي المبلغ */}
                  <button
                    type="button"
                    onClick={() => {
                      setSettlementType('EXEMPT');
                      setAmount(0);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      settlementType === 'EXEMPT'
                        ? 'border-purple-500 bg-purple-50 text-purple-800 shadow-xs ring-2 ring-purple-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <HeartHandshake className="w-5 h-5 mb-1.5 text-purple-600" />
                    <span>إعفاء من المتبقي</span>
                    <span className="text-[10px] opacity-75 font-normal">تصفير الحساب</span>
                  </button>
                </div>
              </div>

              {/* تفاصيل حالة السداد الكامل أو الجزئي */}
              {settlementType !== 'EXEMPT' && (
                <div className="space-y-4 pt-1">
                  {/* حقل إدخال المبلغ في حالة السداد الجزئي */}
                  {settlementType === 'PARTIAL' && (
                    <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-900">
                          المبلغ المُسدد الآن من المريض:
                        </label>
                        <span className="text-xs font-bold text-amber-800">
                          سيتبقى: {calculatedRemainingAfterPartial} ج.م
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max={remainingAmount}
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-black text-amber-950 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">
                          ج.م
                        </span>
                      </div>
                    </div>
                  )}

                  {/* طريقة الدفع */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      {t('selectPaymentMethod')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setMethod('CASH')}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          method === 'CASH'
                            ? 'border-[#0B7B5E] bg-[#E3F5EE]/50 text-[#0B7B5E] shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        <span>{t('cash')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethod('CARD')}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          method === 'CARD'
                            ? 'border-[#0B7B5E] bg-[#E3F5EE]/50 text-[#0B7B5E] shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{t('card')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethod('WALLET')}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          method === 'WALLET'
                            ? 'border-[#0B7B5E] bg-[#E3F5EE]/50 text-[#0B7B5E] shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Wallet className="w-4 h-4" />
                        <span>{t('wallet')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* تفاصيل الإعفاء من المتبقي */}
              {settlementType === 'EXEMPT' && (
                <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-3">
                  <div className="flex items-start gap-2.5 text-purple-900 text-xs">
                    <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">إعفاء المريض وتصفير باقي الحساب</p>
                      <p className="text-purple-700 text-[11px] mt-0.5">
                        سيتم إعفاء المريض من باقي المبلغ ({remainingAmount} ج.م) رسمياً ولن تُحسب كديون متأخرة على العيادة.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1.5">
                      سبب الإعفاء:
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      {[
                        'بتعليمات الطبيب المعالج',
                        'حالة إنسانية / خصم كامل',
                        'متابعة بدون رسوم',
                        'أقارب ومعارف',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setExemptionReason(tag)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                            exemptionReason === tag
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={exemptionReason}
                      onChange={(e) => setExemptionReason(e.target.value)}
                      placeholder="اكتب سبب الإعفاء..."
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs text-purple-950 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
              )}

              {/* ملاحظات إضافية */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات إضافية (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: تم تسليم الروشتة للمريض"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-hidden focus:border-[#0B7B5E] focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
            </>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>المبلغ مدفوع بالكامل مسبقاً، يمكنك تأكيد إنهاء الزيارة ومغادرة المريض الآن.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl active:scale-95 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all cursor-pointer ${
              settlementType === 'EXEMPT'
                ? 'bg-purple-600 hover:bg-purple-700'
                : settlementType === 'PARTIAL'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-[#0B7B5E] hover:bg-[#09634C]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isPending
                ? 'جاري الحفظ...'
                : settlementType === 'EXEMPT'
                ? 'تأكيد الإعفاء وإنهاء الزيارة'
                : settlementType === 'PARTIAL'
                ? `تحصيل ${amount || 0} ج.م ومغادرة المريض`
                : remainingAmount > 0
                ? `تحصيل ${remainingAmount} ج.م ومغادرة المريض`
                : 'تأكيد المغادرة'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
