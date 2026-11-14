import { redirect } from 'next/navigation';

export const metadata = {
  title: 'البحث الطبي السريري الشامل | العيادة',
};

export default function AdminClinicalSearchPage() {
  // صفحة البحث الطبي السريري مخصصة للطبيب فقط
  redirect('/dashboard');
}
