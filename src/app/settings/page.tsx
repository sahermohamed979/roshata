import { RoshtehAppShell } from "@/shared/components/layout/roshteh-app-shell";
import { SettingsView } from "@/features/settings/components/settings-view";

export const metadata = {
  title: "الإعدادات والنسخ الاحتياطي | منصة روشتة",
  description: "إدارة التخزين المحلي، استيراد وتصدير النسخ الاحتياطية وإعدادات النظام",
};

export default function SettingsPage() {
  return (
    <RoshtehAppShell>
      <SettingsView />
    </RoshtehAppShell>
  );
}
