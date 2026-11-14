import { RoshtehAppShell } from "@/shared/components/layout/roshteh-app-shell";
import { MedicineCatalogView } from "@/features/medicines/components/medicine-catalog-view";

export const metadata = {
  title: "دليل الأدوية المحلي | منصة روشتة",
  description: "دليل الأدوية المصرية والعالمية المتاحة محلياً بدون اتصال بالإنترنت",
};

export default function MedicinesPage() {
  return (
    <RoshtehAppShell>
      <MedicineCatalogView />
    </RoshtehAppShell>
  );
}
