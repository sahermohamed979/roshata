import React from 'react';
import { ExaminationPageView, ExaminationPageViewProps } from '@/features/examination/components/examination-page-view';

export async function generateMetadata({ params }: ExaminationPageViewProps) {
  return {
    title: `كشف واستمارة فحص المريض | العيادة`,
  };
}

export default function Page(props: ExaminationPageViewProps) {
  return <ExaminationPageView {...props} />;
}
