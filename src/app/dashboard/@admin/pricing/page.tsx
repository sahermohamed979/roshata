import React from 'react';
import { PricingPageView } from '@/features/pricing/components/pricing-page-view';

export const metadata = {
  title: 'تسعير خدمات العيادة والكشوفات | العيادة',
  description: 'تسعير الكشف والإعادة والمتابعة والفحص بالمنظار والعمليات الجراحية',
};

export default function AdminPricingPage() {
  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      <PricingPageView />
    </div>
  );
}

