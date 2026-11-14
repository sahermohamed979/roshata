import { RoshtehAppShell } from "@/shared/components/layout/roshteh-app-shell";
import { RoshtehHomeView } from "@/features/dashboard/components/roshteh-home-view";

export const metadata = {
  title: "منصة روشتة الطبية | الصفحة الرئيسية",
  description: "المنصة الطبية المستقلة لإدارة وتحرير وطباعة الروشتات الطبية بدون إنترنت",
};

export default function HomePage() {
  return (
    <RoshtehAppShell>
      <RoshtehHomeView />
    </RoshtehAppShell>
  );
}
