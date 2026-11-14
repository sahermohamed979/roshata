'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface NafsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'light' | 'dark' | 'white';
  href?: string;
  className?: string;
}

/**
 * أيقونة وشعار نَفَس الرسمي:
 * - شكل المربع المنحني الزمردي (#0B7B5E)
 * - الابتسامة / حرف النون بالأبيض الناصع
 * - النقطة باللون الأخضر النعناعي (#45DBA5)
 */
export const NafsIcon = ({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'relative rounded-2xl bg-[#0B7B5E] flex items-center justify-center shrink-0 shadow-xs overflow-hidden select-none',
        className
      )}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[78%] h-[78%]"
      >
        {/* النقطة النعناعية في الأعلى */}
        <circle cx="50" cy="30" r="13" fill="#45DBA5" />
        {/* ابتسامة النون البيضاء المنحنية الأطراف */}
        <path
          d="M23 48C23 64 35 74 50 74C65 74 77 64 77 48"
          stroke="white"
          strokeWidth="11"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export const NafsLogo = ({
  size = 'md',
  showText = true,
  showSubtitle = false,
  variant = 'light',
  href,
  className,
}: NafsLogoProps) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 52,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const isWhite = variant === 'white';
  const isDark = variant === 'dark';

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <NafsIcon size={iconSizes[size]} />
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-heading font-black tracking-tight transition-colors',
                textSizes[size],
                isWhite
                  ? 'text-white'
                  : isDark
                  ? 'text-emerald-300'
                  : 'text-[#0B241D] dark:text-[#ECF8F3]'
              )}
            >
              نَفَس
            </span>
          </div>
          {showSubtitle && (
            <span
              className={cn(
                'text-[10px] font-bold tracking-normal',
                isWhite
                  ? 'text-emerald-100/80'
                  : 'text-[#4A635B] dark:text-[#A2C2B6]'
              )}
            >
              منظومة إدارة العيادات
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-transform hover:opacity-95 active:scale-95">
        {content}
      </Link>
    );
  }

  return content;
};

