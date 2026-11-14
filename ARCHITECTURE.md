# Roshteh — System Architecture Document

## 1. High-Level Architecture

Roshteh is designed as a **Local-First, Offline-Primary** prescription platform. All primary medical actions (searching drugs, prescribing, customizing templates, printing) operate directly against the client-side IndexedDB engine via **Dexie.js**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BROWSER RUNTIME (PWA)                           │
│                                                                             │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────┐  │
│  │  Prescription Editor  │   │   Template Builder    │   │  Print Engine │  │
│  │ (Bilingual & Fast UI) │   │ (Simple & Visual)     │   │ (Front / Back)│  │
│  └───────────┬───────────┘   └───────────┬───────────┘   └───────┬───────┘  │
│              │                           │                       │          │
│              └─────────────────┬─────────┴───────────────────────┘          │
│                                │                                            │
│                     ┌──────────▼──────────┐                                 │
│                     │    Zustand Stores   │                                 │
│                     │  (App & UI State)   │                                 │
│                     └──────────┬──────────┘                                 │
│                                │                                            │
│                     ┌──────────▼──────────┐                                 │
│                     │  Data Access Layer  │                                 │
│                     │    (Repositories)   │                                 │
│                     └──────────┬──────────┘                                 │
│                                │                                            │
│                     ┌──────────▼──────────┐                                 │
│                     │   Dexie.js Engine   │                                 │
│                     │  (IndexedDB Store)  │                                 │
│                     └──────────┬──────────┘                                 │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │ Background Sync (When Online)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CENTRAL BACKEND (Next.js API Routes)                     │
│                                                                             │
│   • /api/v1/medicines/manifest       • /api/v1/medicines/changes            │
│   • /api/v1/medicines/snapshot       • /api/v1/sync                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & Feature Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── prescriptions/
│   │   │   ├── new/
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── medicines/
│   │   │   └── page.tsx
│   │   ├── templates/
│   │   │   ├── new/
│   │   │   └── page.tsx
│   │   └── settings/
│   ├── api/
│   │   └── v1/
│   │       ├── medicines/
│   │       └── sync/
│   ├── layout.tsx
│   └── page.tsx
│
├── features/
│   ├── medicines/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── types/
│   ├── prescriptions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── types/
│   ├── templates/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── engine/
│   │   └── types/
│   └── printing/
│       ├── components/
│       ├── engine/
│       └── utils/
│
├── lib/
│   ├── database/
│   │   ├── dexie.ts
│   │   ├── seeds/
│   │   └── migrations/
│   ├── validation/
│   └── utils/
│
├── stores/
│   ├── prescription.store.ts
│   ├── medicine.store.ts
│   └── template.store.ts
│
└── components/
    ├── ui/
    ├── layout/
    └── shared/
```

---

## 3. Data Tier: IndexedDB (Dexie.js) Schema

```ts
// Local Database Schema v1
export interface RoshtehDatabase extends Dexie {
  medicines: EntityTable<Medicine, 'id'>;
  customMedicines: EntityTable<CustomMedicine, 'id'>;
  prescriptions: EntityTable<Prescription, 'id'>;
  templates: EntityTable<PrescriptionTemplate, 'id'>;
  patients: EntityTable<Patient, 'id'>;
  catalogMeta: EntityTable<CatalogMetadata, 'key'>;
}

// Stores index definition:
// medicines: 'id, nameAr, nameEn, brandName, activeIngredient, category, status, version'
// customMedicines: 'id, nameAr, nameEn, brandName, activeIngredient, doctorId'
// prescriptions: 'id, patientId, doctorId, createdAt, status'
// templates: 'id, doctorId, isDefault, name'
```

---

## 4. Separation of Concerns & Security Principles
1. **Zero UI Direct Access to Database:** UI components must consume features via custom React hooks or repositories, never invoking `dexie.table` directly.
2. **Catalog Integrity:** Global synced medicines and doctor custom medicines are maintained in separate IndexedDB tables to prevent sync collisions.
3. **Prescription Immutability:** Prescriptions store full snapshots of drug name, strength, and form so future medicine database updates never alter historical prescriptions.
4. **Deterministic Printing:** Content height is pre-calculated via offscreen measurement to guarantee clean front/back splitting without cutting lines or tables.
