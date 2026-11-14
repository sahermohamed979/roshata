'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Stethoscope, Shield } from 'lucide-react';

export const RolesSection = () => {
  const roles = [
    {
      icon: KeyRound,
      title: 'الاستقبال',
      description: 'إدارة الحجوزات، ومتابعة الطابور الحي، وإدخال المرضى حسب الدور، وتسجيل المدفوعات اليومية والإغلاق.',
      accent: 'border-emerald-300',
    },
    {
      icon: Stethoscope,
      title: 'الطبيب',
      description: 'فتح ملف المريض بضغطة واحدة، كتابة الروشتة وإدارتها وطباعتها، وإضافة الفحوصات والتشخيص والرسم على الصور.',
      accent: 'border-[#0B7B5E]',
    },
    {
      icon: Shield,
      title: 'المدير',
      description: 'رؤية كل تفاصيل العيادة، وإدارة حسابات المستخدمين والصلاحيات، ومتابعة الإيرادات والمصروفات والأرشفة.',
      accent: 'border-[#074C3A]',
    },
  ];

  return (
    <section id="roles" className="py-14 lg:py-20 bg-[#F8FBF9] select-none" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* عنوان القسم */}
        <div className="text-center space-y-3 mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#E3F5EE] text-[#0B7B5E] text-xs font-bold border border-[#D0E5DC]">
            الأدوار
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[#0B241D]">
            لكل فرد في الفريق شاشته وصلاحياته
          </h2>
        </div>

        {/* كروت الأدوار الثلاثة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border border-[#D0E5DC] p-7 rounded-3xl hover:border-[#0B7B5E] hover:shadow-lg transition-all space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-xl text-[#0B241D]">
                  {role.title}
                </h3>
                <p className="text-sm text-[#4A635B] leading-relaxed font-medium">
                  {role.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

