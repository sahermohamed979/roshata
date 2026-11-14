import { RoshtehAppShell } from "@/shared/components/layout/roshteh-app-shell";
import { TemplateEditorView } from "@/features/templates/components/template-editor-view";

export const metadata = {
  title: "قوالب الروشتات والطباعة | منصة روشتة",
  description: "تخصيص ترويسة الطبيب وهوية العيادة وقوالب طباعة الروشتات A4 و A5",
};

export default function TemplatesPage() {
  return (
    <RoshtehAppShell>
      <TemplateEditorView />
    </RoshtehAppShell>
  );
}
