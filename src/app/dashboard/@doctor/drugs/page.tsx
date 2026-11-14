import React from 'react';
import { Metadata } from 'next';
import { DrugsManagementView } from '@/features/drugs/components/drugs-management-view';

export const metadata: Metadata = {
  title: 'صيدلية وقاموس أدوية العيادة | العيادة',
  description: 'إدارة أدوية العيادة، الجرعات الافتراضية، ومتابعة إحصائيات الأدوية الأكثر استخداماً',
};

export default function DoctorDrugsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      <DrugsManagementView />
    </div>
  );
}

