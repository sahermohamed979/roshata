'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, XCircle, CreditCard, LogIn, Stethoscope, Edit2 } from 'lucide-react';
import {
  useAdmitAppointmentMutation,
  useFinishExamAppointmentMutation,
  usePostponeAppointmentMutation,
  useCancelAppointmentMutation,
} from '../hooks/appointments.hook';
import { CheckoutPaymentModal } from './checkout-payment-modal';
import { EditAppointmentModal } from './edit-appointment-modal';

interface TableAppointmentsRowActionsProps {
  appointmentId: string;
  patientName: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'BOOKED' | 'PENDING_CHECKOUT' | 'COMPLETED';
  hasRemaining: boolean;
  remainingAmount: number;
  totalAmount: number;
  paidAmount: number;
  doctorId?: string;
  doctorName?: string;
  type?: string;
  notes?: string;
}

export function TableAppointmentsRowActions({
  appointmentId,
  patientName,
  status,
  hasRemaining,
  remainingAmount,
  totalAmount,
  paidAmount,
  doctorId,
  doctorName,
  type,
  notes,
}: TableAppointmentsRowActionsProps) {
  const t = useTranslations('Dashboard.receptionist.table');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const admitMutation = useAdmitAppointmentMutation();
  const finishExamMutation = useFinishExamAppointmentMutation();
  const postponeMutation = usePostponeAppointmentMutation();
  const cancelMutation = useCancelAppointmentMutation();

  const isAnyPending =
    admitMutation.isPending ||
    finishExamMutation.isPending ||
    postponeMutation.isPending ||
    cancelMutation.isPending;

  const handleAdmit = () => {
    admitMutation.mutate(appointmentId);
  };

  const handleFinishExam = () => {
    finishExamMutation.mutate(appointmentId);
  };

  const handlePostpone = () => {
    postponeMutation.mutate(appointmentId);
  };

  const handleCancel = () => {
    if (!confirm(`هل أنت متأكد من رغبتك في إلغاء حجز المريض ${patientName}؟`)) return;
    cancelMutation.mutate(appointmentId);
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5 justify-end">
        {/* الحالة 1: في صالة الانتظار أو محجوز -> زر إدخال للطبيب */}
        {(status === 'WAITING' || status === 'BOOKED') && (
          <button
            type="button"
            onClick={handleAdmit}
            disabled={isAnyPending}
            title={t('admit')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 disabled:opacity-60 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
          >
            <LogIn className={`w-3.5 h-3.5 ${admitMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{t('admit')}</span>
          </button>
        )}

        {/* الحالة 2: داخل الكشف مع الطبيب -> زر إنهاء الكشف من جانب الطبيب أو الاستقبال */}
        {status === 'IN_PROGRESS' && (
          <button
            type="button"
            onClick={handleFinishExam}
            disabled={isAnyPending}
            title={t('finishExam')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-60 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
          >
            <Stethoscope className={`w-3.5 h-3.5 ${finishExamMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{t('finishExam')}</span>
          </button>
        )}

        {/* الحالة 3: خرج من الكشف أو لديه متبقي مالي -> زر تحصيل / إعفاء المتبقي وإنهاء الزيارة */}
        {(status === 'PENDING_CHECKOUT' || hasRemaining) && (
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(true)}
            disabled={isAnyPending}
            title={hasRemaining ? 'تسوية المتبقي (سداد كامل / جزء / إعفاء)' : t('checkout')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 disabled:opacity-60 text-white font-bold text-xs transition-all cursor-pointer shadow-sm ${
              status === 'PENDING_CHECKOUT'
                ? 'bg-amber-600 hover:bg-amber-700 animate-pulse'
                : 'bg-[#0B7B5E] hover:bg-[#09634C]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{hasRemaining ? 'تسوية المتبقي' : t('checkout')}</span>
          </button>
        )}

        {/* زر تعديل بيانات الحجز والطبيب */}
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          disabled={isAnyPending}
          title="تعديل بيانات الحجز والطبيب والرسوم"
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-[#0B7B5E] active:scale-95 disabled:opacity-60 text-slate-500 transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {/* زر تأجيل الدور (متاح في الانتظار فقط) */}
        {(status === 'WAITING' || status === 'BOOKED') && (
          <button
            type="button"
            onClick={handlePostpone}
            disabled={isAnyPending}
            title={t('postpone')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 active:scale-95 disabled:opacity-60 text-slate-600 transition-colors cursor-pointer"
          >
            <Clock className={`w-3.5 h-3.5 ${postponeMutation.isPending ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* زر إلغاء */}
        {status !== 'PENDING_CHECKOUT' && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isAnyPending}
            title={t('cancel')}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 active:scale-95 disabled:opacity-60 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            <XCircle className={`w-3.5 h-3.5 ${cancelMutation.isPending ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* نافذة تسوية الحساب والمغادرة النهائية */}
      <CheckoutPaymentModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        appointmentId={appointmentId}
        patientName={patientName}
        remainingAmount={remainingAmount}
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        onSuccess={() => {}}
      />

      {/* نافذة تعديل بيانات الحجز والطبيب */}
      <EditAppointmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        appointment={{
          id: appointmentId,
          patientName,
          doctorId: doctorId || '',
          doctorName,
          type: type || 'EXAMINATION',
          totalAmount,
          paidAmount,
          remainingAmount,
          notes,
        }}
        onSuccess={() => {}}
      />
    </>
  );
}
