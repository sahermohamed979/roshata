'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  FileText,
  UserCheck,
  Radio,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const FeaturesGridSection = () => {
  const features = [
    {
      icon: CalendarDays,
      title: 'الحجز والطابور الحي',
      description: 'حجز حضور أو سابق، وقت دور واضح، ومتابعة الطابور لحظة بلحظة بين الاستقبال والعيادة.',
    },
    {
      icon: FileText,
      title: 'الروشتة الإلكترونية',
      description: 'يكتبها الطبيب وتُطبع وتُحفظ تلقائياً في ملف المريض للرجوع إليها في أي زيارة.',
    },
    {
      icon: UserCheck,
      title: 'ملف المريض',
      description: 'الزيارات السابقة، والتشخيصات، والروشتات السابقة، والصور الطبية في مكان واحد متكامل.',
    },
    {
      icon: Radio,
      title: 'إشارة بين الطبيب والاستقبال',
      description: 'عند انتهاء الكشف، يُنبه الطبيب لينتقل المريض التالي، مع إرسال أي تعليمات أو شات فوري.',
    },
    {
      icon: ShieldCheck,
      title: 'أدوار وصلاحيات',
      description: 'كل شخص يرى ما يخصه فقط، شاشة الطبيب مخصصة للفحص والروشتة، وشاشة الاستقبال للطابور والحسابات.',
    },
    {
      icon: TrendingUp,
      title: 'لوحة مالية',
      description: 'إيرادات اليوم، والمصروفات، ومتابعة الدخل وصافي الصندوق في شاشة واضحة ومباشرة للمدير.',
    },
  ];

  return (
    <section id="features" className="py-14 lg:py-20 select-none" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* عنوان القسم */}
        <div className="text-center space-y-3 mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#E3F5EE] text-[#0B7B5E] text-xs font-bold border border-[#D0E5DC]">
            المميزات
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[#0B241D]">
            كل ما تحتاجه العيادة في يومها، من غير تعقيد
          </h2>
        </div>

        {/* شبكة البطاقات الستة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white border border-[#D0E5DC] hover:border-[#0B7B5E] p-6 rounded-3xl transition-all duration-200 hover:shadow-lg space-y-3.5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E3F5EE] group-hover:bg-[#0B7B5E] text-[#0B7B5E] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                  <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-heading font-black text-lg text-[#0B241D]">
                  {feat.title}
                </h3>
                <p className="text-sm text-[#4A635B] leading-relaxed font-medium">
                  {feat.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

