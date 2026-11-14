'use server';

import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { RESPONSES } from '@/shared/constant/api.responses';
import { HEADERS } from '@/shared/constant/api.constant';
import { revalidatePath } from 'next/cache';

export interface UserItem {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTION';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * جلب قائمة مستخدمي النظام (أطباء، استقبال، مديري نظام)
 */
export async function getUsersAction(page = 1, pageSize = 50): Promise<ApiResponse<UserItem[]>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/users?page=${page}&pageSize=${pageSize}`, {
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
    console.error('getUsersAction error:', error);
    return { status: false, code: 500, message: 'فشل تحميل قائمة المستخدمين' };
  }
}

/**
 * إنشاء مستخدم جديد (طبيب أو موظف استقبال أو مدير)
 */
export async function createUserAction(dto: {
  name: string;
  username: string;
  password?: string;
  role: string;
}): Promise<ApiResponse<UserItem>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/users`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify(dto),
    });

    const data = await res.json();
    if (data.status) {
      revalidatePath('/dashboard/users');
    }
    return data;
  } catch (error) {
    console.error('createUserAction error:', error);
    return { status: false, code: 500, message: 'فشل إنشاء المستخدم' };
  }
}

/**
 * تعديل بيانات مستخدم (الاسم، اسم المستخدم، الصلاحية، الحالة)
 */
export async function updateUserAction(
  id: string,
  dto: {
    name?: string;
    username?: string;
    role?: string;
    isActive?: boolean;
  }
): Promise<ApiResponse<UserItem>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify(dto),
    });

    const data = await res.json();
    if (data.status) {
      revalidatePath('/dashboard/users');
    }
    return data;
  } catch (error) {
    console.error('updateUserAction error:', error);
    return { status: false, code: 500, message: 'فشل تحديث بيانات المستخدم' };
  }
}

/**
 * تعديل / إعادة تعيين كلمة المرور لأي مستخدم
 */
export async function resetUserPasswordAction(
  id: string,
  newPassword: string
): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/users/${id}/reset-password`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify({ newPassword }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('resetUserPasswordAction error:', error);
    return { status: false, code: 500, message: 'فشل تغيير كلمة المرور' };
  }
}

/**
 * حذف المستخدم نهائياً من النظام (صلاحية المدير Admin)
 */
export async function deleteUserAction(id: string): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });

    const data = await res.json();
    if (data.status) {
      revalidatePath('/dashboard/users');
    }
    return data;
  } catch (error) {
    console.error('deleteUserAction error:', error);
    return { status: false, code: 500, message: 'فشل حذف المستخدم' };
  }
}

/**
 * إلغاء تفعيل أو حذف المستخدم
 */
export async function deactivateUserAction(id: string): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });

    const data = await res.json();
    if (data.status) {
      revalidatePath('/dashboard/users');
    }
    return data;
  } catch (error) {
    console.error('deactivateUserAction error:', error);
    return { status: false, code: 500, message: 'فشل إلغاء تفعيل المستخدم' };
  }
}

