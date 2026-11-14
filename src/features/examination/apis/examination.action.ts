'use server';

import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { HEADERS } from '@/shared/constant/api.constant';
import { RESPONSES } from '@/shared/constant/api.responses';
import { revalidateAppointmentsCache } from '@/features/appointments/apis/appointment.action';
import { EntExaminationData } from '../types/ent-examination.types';

export interface AppointmentExaminationPayload {
  appointment: any;
  patient: any;
  doctor: any;
  visit: any;
}

/**
 * جلب بيانات الموعد والمريض والزيارة السابقة إن وجدت لبدء الكشف
 */
export async function getAppointmentExaminationAction(
  appointmentId: string
): Promise<ApiResponse<AppointmentExaminationPayload>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/appointments/${appointmentId}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getAppointmentExaminationAction error:', error);
    return { status: false, code: 500, message: 'فشل تحميل بيانات الكشف' };
  }
}

/**
 * حفظ بيانات كشف الأنف والأذن والحنجرة بالكامل مع الروشتة
 */
export async function saveAppointmentExaminationAction(
  appointmentId: string,
  visitId: string,
  version: number,
  examData: EntExaminationData
): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    // 1. تحديث الزيارة ببيانات الكشف الكاملة (Auto-save)
    const patchRes = await fetch(`${process.env.API_URL}/visits/${visitId}`, {
      method: 'PATCH',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify({
        version,
        complaint: examData.complaint,
        diagnosis: examData.diagnosis,
        notes: examData.treatmentNotes,
        instructions: examData.operationNeeded,
        followUpDate: examData.followUpDate,
        entExamination: examData,
      }),
    });

    const patchData = await patchRes.json();
    if (!patchData.status) {
      return patchData;
    }

    // 2. إذا كانت هناك أصناف روشتة صالحة، نحفظها أيضاً في نموذج Prescriptions
    const validItems = (examData.prescriptionItems || []).filter(
      (item) => item && item.drugName && item.drugName.trim().length > 0
    );

    if (validItems.length > 0) {
      await fetch(`${process.env.API_URL}/visits/${visitId}/prescriptions`, {
        method: 'POST',
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token.accessToken),
        },
        body: JSON.stringify({
          notes: examData.treatmentNotes || '',
          items: validItems.map((item, idx) => ({
            drugName: item.drugName.trim(),
            form: item.form?.trim() || '',
            concentration: item.concentration?.trim() || '',
            dose: item.dose?.trim() || 'حسب الإرشاد',
            frequency: item.frequency?.trim() || 'يومياً',
            duration: item.duration?.trim() || 'أسبوع',
            instructions: item.instructions?.trim() || '',
            sortOrder: idx,
          })),
        }),
      });
    }

    await revalidateAppointmentsCache();
    return {
      status: true,
      code: 200,
      message: 'تم حفظ بيانات الكشف والروشتة بنجاح',
      payload: patchData.payload || null,
    };
  } catch (error) {
    console.error('saveAppointmentExaminationAction error:', error);
    return { status: false, code: 500, message: 'فشل حفظ بيانات الكشف' };
  }
}

/**
 * إنهاء الكشف واعتماد الروشتة وتسليم المريض للاستقبال
 */
export async function finishAndSubmitExamAction(
  appointmentId: string,
  visitId: string,
  version: number,
  examData: EntExaminationData
): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    // 1. حفظ البيانات أولاً إذا وُجد visitId
    if (visitId) {
      try {
        await saveAppointmentExaminationAction(
          appointmentId,
          visitId,
          version,
          examData
        );
      } catch (saveErr) {
        console.warn('saveAppointmentExaminationAction error:', saveErr);
      }

      // 2. إغلاق الزيارة
      try {
        await fetch(`${process.env.API_URL}/visits/${visitId}/close`, {
          method: 'POST',
          headers: {
            ...HEADERS.JsonBody,
            ...HEADERS.authorize(token.accessToken),
          },
        });
      } catch (closeErr) {
        console.warn('close visit error:', closeErr);
      }
    }

    // 3. تحويل حالة الموعد إلى finish-exam (ينتقل للاستقبال لتسوية الحساب)
    const finishRes = await fetch(
      `${process.env.API_URL}/appointments/${appointmentId}/finish-exam`,
      {
        method: 'POST',
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token.accessToken),
        },
      }
    );

    const finishData = await finishRes.json();
    await revalidateAppointmentsCache();
    return finishData;
  } catch (error) {
    console.error('finishAndSubmitExamAction error:', error);
    return { status: false, code: 500, message: 'فشل اعتماد وإنهاء الكشف' };
  }
}
