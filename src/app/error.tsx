'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected client-side errors for diagnostic review
    console.error('Roshteh Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-900">
            حدث خطأ غير متوقع
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            نعتذر عن هذا الخطأ المؤقت. بياناتك وسجلاتك الطبية محفوظة بأمان محلياً في متصفحك.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-400">
              رمز الخطأ: {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs h-10 px-5 rounded-xl gap-2 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </Button>

          <Link href="/">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold h-10 px-4 rounded-xl gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
