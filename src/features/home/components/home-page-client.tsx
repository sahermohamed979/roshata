'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Navbar } from './navbar';
import { HeroSection } from './hero-section';
import { ComparisonSection } from './comparison-section';
import { FeaturesGridSection } from './features-grid-section';
import { RolesSection } from './roles-section';
import { HowItWorksSection } from './how-it-works-section';
import { CtaSection } from './cta-section';
import { Footer } from './footer';

export const HomePageClient = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FBF9] text-[#0B241D] selection:bg-[#45DBA5]/30 selection:text-[#0B7B5E] relative font-sans">
      {/* شريط تقدم التمرير الزمردي الأنيق */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B7B5E] via-[#45DBA5] to-[#0B7B5E] origin-left z-50 pointer-events-none"
        style={{ scaleX }}
      />

      {/* شريط التنقل العلوي الجديد */}
      <Navbar />

      {/* المحتوى الرئيسي للمنظومة */}
      <main className="flex-1 space-y-4">
        {/* 1. قسم الواجهة والكرت التفاعلي */}
        <HeroSection />

        {/* 2. مقارنة قبل نَفَس ومع نَفَس */}
        <ComparisonSection />

        {/* 3. شبكة المميزات */}
        <FeaturesGridSection />

        {/* 4. الأدوار والصلاحيات */}
        <RolesSection />

        {/* 5. كيف نعمل في أربع خطوات */}
        <HowItWorksSection />

        {/* 6. كرت الدعوة للتسجيل والتجربة */}
        <CtaSection />
      </main>

      {/* التذييل الجديد */}
      <Footer />
    </div>
  );
};
