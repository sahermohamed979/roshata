'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Roshteh Critical Global Error:', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">
              خطأ في تحميل واجهة النظام
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              واجه التطبيق مشكلة غير متوقعة أثناء التحميل. يرجى الضغط على زر التحديث أدناه لاستعادة الجلسة.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs h-10 px-6 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تشغيل النظام</span>
          </button>
        </div>
      </body>
    </html>
  );
}
