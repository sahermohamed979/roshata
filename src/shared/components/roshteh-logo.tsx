'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface RoshtehLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  href?: string;
}

export const RoshtehIcon = ({ size = 36, className }: { size?: number; className?: string }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'relative rounded-2xl bg-gradient-to-br from-[#0B7B5E] to-[#074C3A] flex items-center justify-center shrink-0 shadow-md border border-[#45DBA5]/30 overflow-hidden select-none',
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(69,219,165,0.35),transparent_60%)]" />
      <span className="relative text-white font-black text-sm tracking-tighter flex items-center gap-0.5">
        <span className="font-serif italic text-base text-[#45DBA5]">℞</span>
      </span>
    </div>
  );
};

export const RoshtehLogo = ({
  size = 'md',
  showSubtitle = true,
  className,
  href = '/prescriptions/new',
}: RoshtehLogoProps) => {
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 44 : 38;
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  const content = (
    <div className={cn('flex items-center gap-3 select-none text-right', className)} dir="rtl">
      <RoshtehIcon size={iconSize} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={cn('font-black text-[#0B241D] tracking-tight leading-tight', titleSize)}>
            روشتة
          </span>
          <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-[#E3F5EE] text-[#0B7B5E] tracking-wider uppercase">
            Roshteh
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-bold text-slate-500 leading-none mt-0.5">
            إدارة وطباعة الروشتات الطبية · Offline
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-transform hover:scale-[1.01] active:scale-[0.99]">
        {content}
      </Link>
    );
  }

  return content;
};
