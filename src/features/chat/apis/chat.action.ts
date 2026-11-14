'use server';

import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { RESPONSES } from '@/shared/constant/api.responses';
import { HEADERS } from '@/shared/constant/api.constant';

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'DOCTOR' | 'RECEPTION' | 'ADMIN';
  message: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * جلب الرسائل الأخيرة في شات العيادة
 */
export async function getChatMessagesAction(): Promise<ApiResponse<ChatMessageItem[]>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/chat/messages`, {
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
    console.error('getChatMessagesAction error:', error);
    return { status: false, code: 500, message: 'فشل تحميل الرسائل' };
  }
}

/**
 * إرسال رسالة جديدة في الشات
 */
export async function sendChatMessageAction(message: string): Promise<ApiResponse<ChatMessageItem>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('sendChatMessageAction error:', error);
    return { status: false, code: 500, message: 'فشل إرسال الرسالة' };
  }
}

