import { AdminDashboardView } from '@/features/admin/components/admin-dashboard-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'لوحة الإدارة المركزية | منصة روشتة',
  description: 'إدارة الدليل الدوائي المركزي، مصادر هيئة الدواء، ونشر الإصدارات الرسمية للعيادات',
};

export default function AdminPage() {
  return <AdminDashboardView />;
}
