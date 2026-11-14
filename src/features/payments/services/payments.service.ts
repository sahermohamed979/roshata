import { signOut } from 'next-auth/react';
import { PaymentsListResponse } from '../types/payments';

/**
 * جلب سجل المدفوعات حسب اليوم المحدد والطبيب
 */
export async function fetchPayments(
  date: string,
  doctorId?: string,
  signal?: AbortSignal
): Promise<PaymentsListResponse> {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (doctorId && doctorId !== 'all') params.set('doctorId', doctorId);
  const qs = params.toString();
  const url = qs ? `/api/payments?${qs}` : '/api/payments';

  const response = await fetch(url, {
    method: 'GET',
    signal,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      await signOut({ callbackUrl: '/auth/login?expired=true' });
    }
    throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
  }

  const data: ApiResponse<any> = await response.json();

  if (
    data.code === 401 ||
    data.message === 'Invalid or expired access token' ||
    data.message === 'No token provided.' ||
    data.message === 'Unauthorized'
  ) {
    if (typeof window !== 'undefined') {
      await signOut({ callbackUrl: '/auth/login?expired=true' });
    }
    throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
  }

  if (!data.status) {
    throw new Error(data.message || 'فشل جلب سجل المدفوعات');
  }

  const metadata = (data as any).metadata || {};

  return {
    data: Array.isArray(data.payload) ? data.payload : [],
    meta: {
      page: metadata.page || 1,
      limit: metadata.limit || 50,
      total: metadata.total || (Array.isArray(data.payload) ? data.payload.length : 0),
      totalPages: metadata.totalPages || 1,
      summary: metadata.summary,
    },
  };
}

