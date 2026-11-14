import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white border border-[#D0E5DC] rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#E3F5EE] border border-[#BCE8D6] text-[#0B7B5E] flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#0B7B5E] uppercase tracking-wider">
            خطأ 404
          </span>
          <h1 className="text-xl font-black text-slate-900">
            الصفحة غير موجودة
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            الصفحة أو السجل الذي تبحث عنه قد تم نقله أو لم يعد متاحاً. يمكنك العودة إلى لوحة التحكم الرئيسية.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button
              type="button"
              className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs h-10 px-5 rounded-xl gap-2 shadow-xs cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </Button>
          </Link>

          <Link href="/prescriptions">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold h-10 px-4 rounded-xl gap-2 cursor-pointer"
            >
              <span>أرشيف الروشتات</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
