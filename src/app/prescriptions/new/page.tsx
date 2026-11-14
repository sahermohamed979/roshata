import { RoshtehAppShell } from "@/shared/components/layout/roshteh-app-shell";
import { PrescriptionEditor } from "@/features/prescriptions/components/prescription-editor";

export const metadata = {
  title: "تحرير روشتة جديدة | منصة روشتة الطبية",
  description: "محرر الروشتات الطبية الذكي السريع مع إمكانية البحث والطباعة بدون إنترنت",
};

export default function NewPrescriptionPage() {
  return (
    <RoshtehAppShell>
      <PrescriptionEditor />
    </RoshtehAppShell>
  );
}
