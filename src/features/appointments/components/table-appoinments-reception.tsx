import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getTodayWaitingAppointmentsApi } from '../apis/appointment.api';
import { ReceptionQueueSearchTable } from './reception-queue-search-table';

interface TableAppoinmentsReceptionProps {
  doctorId?: string;
}

/**
 * جدول قائمة انتظار مواعيد اليوم لشاشة الاستقبال (Server Component)
 * يجلب البيانات مباشرة من GET /api/v1/queue/today
 * ويعرض 10 مرضى كحد أقصى دائم مع شريط بحث فوري يجلب أي مريض حتى لو لم يكن في القائمة
 */
export async function TableAppoinmentsReception({ doctorId }: TableAppoinmentsReceptionProps = {}) {
  const t = await getTranslations('Dashboard.receptionist.table');

  const patientsResponse = await getTodayWaitingAppointmentsApi(doctorId);

  if (!patientsResponse || !patientsResponse.status || !Array.isArray(patientsResponse.payload)) {
    const errorMsg =
      patientsResponse && 'message' in patientsResponse
        ? (patientsResponse.message as string)
        : t('errorMessage');
    throw new Error(errorMsg);
  }

  const patients = patientsResponse.payload;

  const translations = {
    number: t('number'),
    patient: t('patient'),
    doctor: t('doctor'),
    appointmentType: t('appointmentType'),
    status: t('status'),
    waitingDuration: t('waitingDuration'),
    financialStatus: t('financialStatus'),
    actions: t('actions'),
    checkup: t('checkup'),
    consultation: t('consultation'),
    inCheckup: t('inCheckup'),
    pendingCheckout: t('pendingCheckout'),
    waiting: t('waiting'),
    exempt: t('exempt'),
    paidInFull: t('paidInFull'),
    partiallyPaid: t('partiallyPaid'),
    unpaid: t('unpaid'),
    remaining: t('remaining'),
    minutes: t('minutes', { count: 1 }),
  };

  return (
    <ReceptionQueueSearchTable
      initialPatients={patients as any}
      doctorId={doctorId}
      translations={translations}
    />
  );
}
