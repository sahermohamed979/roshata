'use client';

import React from 'react';
import { NafsLogo } from '@/shared/components/nafs-logo';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'white';
  showText?: boolean;
  className?: string;
}

export const BrandLogo = ({
  variant = 'light',
  showText = true,
  className,
}: BrandLogoProps) => {
  return (
    <NafsLogo
      href="#hero"
      variant={variant}
      showText={showText}
      showSubtitle={false}
      size="md"
      className={className}
    />
  );
};
