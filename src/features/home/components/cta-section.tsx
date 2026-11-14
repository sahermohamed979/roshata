'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, LogIn } from 'lucide-react';
import { COMPANY_WEBSITE_URL } from '../constants';
import { toast } from 'sonner';

export const CtaSection = () => {
  const handleTryDemo = () => {
    toast.info('تواصل مع فريق تطوير Vyro Software لتجربة المنظومة ومعرفة كل التفاصيل: https://www.vyro.software/en', {
      duration: 6000,
    });
  };

  return (
    <section className="py-12 select-none" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#074C3A] to-[#0B7B5E] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* تأثير ضوئي جمالي */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#45DBA5]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight">
            جاهز تنظّم عيادتك؟
          </h2>

          <p className="text-base sm:text-lg text-emerald-100 max-w-xl mx-auto font-medium">
            تواصل معنا لعرض تجريبي، أو ادخل إلى عيادتك إن كنت عميلاً بالفعل
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={COMPANY_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleTryDemo}
              className="bg-white hover:bg-emerald-50 active:scale-95 text-[#074C3A] font-black text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-lg transition-all duration-150 cursor-pointer inline-flex items-center gap-2"
            >
              <span>جرب الموقع تجريبياً</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>

            <Link
              href="/auth/login"
              className="border-2 border-white/60 hover:border-white hover:bg-white/10 active:scale-95 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl transition-all duration-150 inline-flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>تسجيل الدخول</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

