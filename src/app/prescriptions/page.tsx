import { RoshtehAppShell } from "@/shared/components/layout/roshteh-app-shell";
import { PrescriptionsArchiveView } from "@/features/prescriptions/components/prescriptions-archive-view";

export const metadata = {
  title: "أرشيف الروشتات الطبية | منصة روشتة",
  description: "سجل الروشتات والوصفات الطبية المحفوظة محلياً للبحث والمراجعة والطباعة",
};

export default function PrescriptionsPage() {
  return (
    <RoshtehAppShell>
      <PrescriptionsArchiveView />
    </RoshtehAppShell>
  );
}
