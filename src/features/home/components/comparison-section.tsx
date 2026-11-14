'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export const ComparisonSection = () => {
  return (
    <section className="py-8 select-none" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* كرت قبل نَفَس */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-7 rounded-3xl bg-[#F2F8F4] border border-[#D0E5DC] space-y-3 shadow-2xs"
          >
            <div className="flex items-center gap-2 text-[#C0282E]">
              <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center font-bold text-xs">
                <X className="w-4 h-4 text-[#C0282E]" />
              </div>
              <h3 className="font-heading font-black text-lg text-[#0B241D]">
                قبل نَفَس
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#4A635B] leading-relaxed font-medium">
              دفاتر ورق، وزحام في الاستقبال، ووقت ضائع، وحسابات متفرقة بين أكثر من مكان، وسجلات مفقودة يصعب تتبعها في الزيارات المتكررة.
            </p>
          </motion.div>

          {/* كرت مع نَفَس (بالأخضر الزمردي) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-7 rounded-3xl bg-[#0B7B5E] text-white space-y-3 shadow-lg"
          >
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                <Check className="w-4 h-4 text-[#45DBA5]" />
              </div>
              <h3 className="font-heading font-black text-lg text-white">
                مع نَفَس
              </h3>
            </div>
            <p className="text-sm sm:text-base text-emerald-50 leading-relaxed font-medium">
              حجز منظم، دور واضح لكل مريض، وروشتة مطبوعة في ثوانٍ، وحسابات تنتهي بضغطة زر واحدة، وعيادتك جاهزة للبداية في أي وقت.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

