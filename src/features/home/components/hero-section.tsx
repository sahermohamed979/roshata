'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, LogIn, FileText, CheckCircle2, Users, Sparkles, Stethoscope } from 'lucide-react';
import { COMPANY_WEBSITE_URL } from '../constants';
import { toast } from 'sonner';

export const HeroSection = () => {
  const handleTryDemo = (e: React.MouseEvent) => {
    toast.info('تواصل مع فريق تطوير Vyro Software لتجربة المنظومة ومعرفة كل التفاصيل: https://www.vyro.software/en', {
      duration: 6000,
    });
  };

  return (
    <section id="hero" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden select-none" dir="rtl">
      {/* خلفية جمالية خفيفة بالأخضر الزمردي والنعناعي */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E3F5EE]/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-[#45DBA5]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* الجانب الأيمن (النص التعريفي والأزرار) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            {/* الشارة العلوية */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E3F5EE] border border-[#D0E5DC] text-[#0B7B5E] text-xs sm:text-sm font-bold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#0B7B5E] animate-pulse" />
              <span>منظومة إدارة العيادات</span>
            </motion.div>

            {/* العنوان الرئيسي */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-[#0B241D] tracking-tight leading-[1.25]"
            >
              نظّم عيادتك من الحجز
              <br />
              <span className="text-[#0B7B5E]">حتى الروشتة</span>
            </motion.h1>

            {/* النص الوصفي لمنظومة نَفَس */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#4A635B] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium"
            >
              &ldquo;نَفَس: منظومة متكاملة لإدارة العيادات، حجز وطابور حي، وروشتة إلكترونية، وملف لكل مريض، وتقارير مالية. كلها في مكان واحد وبصلاحيات واضحة لكل فرد في الفريق.&rdquo;
            </motion.p>

            {/* أزرار الإجراءات الرئيسية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              <a
                href={COMPANY_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleTryDemo}
                className="bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-150 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>جرب الموقع تجريبياً</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              <Link
                href="/auth/login"
                className="bg-white hover:bg-[#F2F8F4] active:scale-95 text-[#074C3A] border-2 border-[#074C3A] font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 rounded-xl transition-all duration-150 inline-flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <LogIn className="w-4 h-4 text-[#074C3A]" />
                <span>تسجيل الدخول</span>
              </Link>
            </motion.div>

            {/* مميزات سريعة تحت الأزرار */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-3 text-xs sm:text-sm font-semibold text-[#8D9D97] flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <span>يعمل أوفلاين</span>
              <span>•</span>
              <span>يستخدمه مئات العيادات</span>
              <span>•</span>
              <span>ملفاتك تحت أيديك</span>
            </motion.div>
          </div>

          {/* الجانب الأيسر: كرت الطابور الحي والروشتة الإلكترونية المطابق للصورة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="w-full max-w-md bg-white border border-[#D0E5DC] rounded-3xl p-6 shadow-xl space-y-5 relative">
              {/* ترويسة كرت الطابور الحي */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D0E5DC]">
                <h3 className="font-heading font-black text-base text-[#0B241D]">
                  الطابور الحي
                </h3>
                <span className="px-3 py-1 rounded-full bg-[#E3F5EE] text-[#0B7B5E] text-xs font-bold border border-[#D0E5DC]">
                  3 في الانتظار
                </span>
              </div>

              {/* عناصر الطابور التفاعلية */}
              <div className="space-y-2.5">
                {/* 1. داخل الكشف (الحالة النشطة بالأخضر) */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#E3F5EE] border border-[#D0E5DC] transition-all">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#0B7B5E] text-white font-black text-xs flex items-center justify-center shadow-xs">
                      12
                    </span>
                    <div>
                      <p className="font-bold text-xs text-[#0B241D]">داخل الكشف</p>
                      <p className="text-[11px] text-[#4A635B]">الطبيب المعالج</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B7B5E] animate-pulse" />
                </div>

                {/* 2. التالي */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#0B7B5E]/40 hover:border-[#0B7B5E] transition-all shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white border border-[#0B7B5E] text-[#0B7B5E] font-black text-xs flex items-center justify-center">
                      13
                    </span>
                    <div>
                      <p className="font-bold text-xs text-[#0B241D]">التالي</p>
                      <p className="text-[11px] text-[#4A635B]">كشف جديد</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#0B7B5E]">جاهز</span>
                </div>

                {/* 3. في الانتظار */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FBF9] border border-[#D0E5DC] text-[#4A635B]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white border border-[#D0E5DC] text-[#8D9D97] font-black text-xs flex items-center justify-center">
                      14
                    </span>
                    <div>
                      <p className="font-bold text-xs text-[#4A635B]">في الانتظار</p>
                      <p className="text-[11px] text-[#8D9D97]">متابعة كشف</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#8D9D97]">في الصالة</span>
                </div>
              </div>

              {/* كرت الروشتة الإلكترونية المطابق للديزاين */}
              <div className="p-4 rounded-2xl bg-[#F8FBF9] border border-[#D0E5DC] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-xs text-[#0B241D]">
                    روشتة إلكترونية
                  </h4>
                  <p className="text-[11px] text-[#4A635B] font-medium">
                    تُطبع بضغطة واحدة، للقياس على كرت العيادة
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
