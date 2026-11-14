'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NafsLogo } from '@/shared/components/nafs-logo';
import { COMPANY_WEBSITE_URL } from '../constants';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'المميزات', href: '#features' },
    { label: 'الأدوار', href: '#roles' },
    { label: 'كيف نعمل', href: '#how-it-works' },
  ];

  const handleTryDemo = () => {
    toast.info('تواصل مع فريق تطوير Vyro Software لتجربة المنظومة ومعرفة كل التفاصيل: https://www.vyro.software/en', {
      duration: 6000,
    });
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200 select-none',
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-xs border-b border-[#D0E5DC] py-3'
          : 'bg-white/70 backdrop-blur-xs py-4 border-b border-[#D0E5DC]/60'
      )}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* الجانب الأيمن: شعار نَفَس */}
          <div className="flex items-center shrink-0">
            <NafsLogo href="#hero" size="md" />
          </div>

          {/* المنتصف: روابط التنقل الرئيسية */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-[#4A635B] hover:text-[#0B7B5E] transition-colors py-1"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* الجانب الأيسر: زر طلب عرض تجريبي + زر تسجيل الدخول */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/auth/login"
              className="text-[#0B241D] hover:text-[#0B7B5E] border border-[#D0E5DC] hover:border-[#0B7B5E] bg-white font-bold text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogIn className="w-4 h-4 text-[#0B7B5E]" />
              <span>تسجيل الدخول</span>
            </Link>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={COMPANY_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleTryDemo}
              className="bg-[#0B7B5E] hover:bg-[#09634C] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
            >
              <span>جرب الموقع تجريبياً</span>
            </motion.a>

            {/* زر القائمة للشاشات الصغيرة */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#4A635B] hover:text-[#0B7B5E] rounded-xl hover:bg-[#E3F5EE] transition-colors cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الموبايل المنسدلة */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-[#D0E5DC] px-4 py-4 space-y-3 shadow-lg"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-[#4A635B] hover:text-[#0B7B5E] py-2 px-3 rounded-lg hover:bg-[#E3F5EE]"
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
