'use client';

import React from 'react';
import { NafsLogo } from '@/shared/components/nafs-logo';
import { COMPANY_WEBSITE_URL } from '../constants';
import { ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-10 border-t border-[#D0E5DC] bg-white select-none text-center" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex justify-center">
          <NafsLogo size="md" showText={true} />
        </div>
        <p className="text-xs sm:text-sm text-[#4A635B] font-medium">
          أهلاً بك في منظومة نَفَس • لإدارة العيادات • 2026 • لإصدار دكتور عيادتك
        </p>
        <div>
          <a
            href={COMPANY_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B7B5E] hover:text-[#09634C] hover:underline"
          >
            <span>تطوير ودعم تقني بواسطة Vyro Software</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
