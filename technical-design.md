# Roshteh — Technical Design Document

## 1. Architecture Overview

Roshteh follows an Offline-First architecture.

The local application is the primary runtime environment for doctors.

The central backend manages global medicine data, versions, synchronization, and administrative operations.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| State | Zustand |
| Server State | TanStack Query |
| Local Database | Dexie.js |
| Storage | IndexedDB |
| Offline | PWA + Service Worker |
| Central Database | PostgreSQL |
| Backend | Next.js API Routes |
| Printing | HTML/CSS |
| Validation | Zod |

## 3. Project Structure

```text
src/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── prescriptions/
│   │   ├── medicines/
│   │   ├── patients/
│   │   ├── templates/
│   │   └── settings/
│   ├── admin/
│   │   ├── medicines/
│   │   ├── imports/
│   │   ├── versions/
│   │   └── suggestions/
│   └── api/
│       └── v1/
│           ├── medicines/
│           ├── sync/
│           └── suggestions/
├── features/
│   ├── medicines/
│   ├── prescriptions/
│   ├── templates/
│   ├── patients/
│   ├── printing/
│   ├── synchronization/
│   └── administration/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── lib/
│   ├── database/
│   ├── api/
│   ├── validation/
│   └── utils/
├── stores/
├── hooks/
└── types/
```

## 4. Local Database Design

Use Dexie.js.

### medicines

```ts
interface Medicine {
  id: string;
  nameAr: string;
  nameEn: string;
  brandName?: string;
  activeIngredient?: string;
  strength?: string;
  pharmaceuticalForm?: string;
  manufacturer?: string;
  barcode?: string;
  price?: number;
  category?: string;
  status: "active" | "inactive";
  version: number;
  source?: string;
  updatedAt: string;
}
```

### customMedicines

```ts
interface CustomMedicine {
  id: string;
  ownerId: string;
  nameAr: string;
  nameEn?: string;
  activeIngredient?: string;
  strength?: string;
  pharmaceuticalForm?: string;
  manufacturer?: string;
  createdAt: string;
  updatedAt: string;
}
```

### patients

```ts
interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}
```

### prescriptions

```ts
interface Prescription {
  id: string;
  patientId?: string;
  templateId: string;
  medicines: PrescriptionMedicine[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### prescriptionTemplates

```ts
interface PrescriptionTemplate {
  id: string;
  name: string;
  page: {
    width: number;
    height: number;
    unit: "mm";
  };
  layout: {
    front: TemplateElement[];
    back: TemplateElement[];
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### syncMetadata

```ts
interface SyncMetadata {
  id: string;
  currentVersion: number;
  lastSuccessfulSync?: string;
  lastAttemptedSync?: string;
  status: "idle" | "syncing" | "failed";
}
```

## 5. Prescription Data Model

```ts
interface PrescriptionMedicine {
  id: string;
  medicineId?: string;
  medicineNameSnapshot: string;
  activeIngredientSnapshot?: string;
  strengthSnapshot?: string;
  pharmaceuticalFormSnapshot?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  sortOrder: number;
}
```

Historical prescriptions must remain independent of future medicine database updates.

## 6. Central PostgreSQL Database

Recommended tables:

- medicines
- medicine_sources
- medicine_versions
- medicine_changes
- medicine_imports
- medicine_suggestions
- doctors
- audit_logs

Use UUID identifiers and appropriate indexes for Arabic names, English names, brand names, active ingredients, barcodes, and versions.

Consider PostgreSQL full-text search and trigram indexes for administrative search.

## 7. Central Medicine API

### GET /api/v1/medicines/manifest

Returns the current database version.

Example:

```json
{
  "version": 105,
  "previousVersion": 104,
  "updatedAt": "2026-11-14T00:00:00Z",
  "changesAvailable": true,
  "changesCount": 173
}
```

### GET /api/v1/medicines/changes?since=104

Returns changes after a given version.

Supported actions:

- create
- update
- delete

### GET /api/v1/medicines/snapshot

Returns the initial dataset or a recovery snapshot.

### POST /api/v1/medicines/sync

Supports authenticated synchronization reporting and future device registration.

## 8. Incremental Synchronization

```text
Application Starts
       |
Read Local Version
       |
Check Internet
       |
No Internet ---> Use Local Database
       |
Fetch Manifest
       |
Compare Versions
       |
No Changes ---> Continue
       |
Download Changes
       |
Validate Payload
       |
Apply IndexedDB Transaction
       |
Update Local Version
       |
Synchronization Complete
```

Rules:

1. Never update local version before applying all changes.
2. Never partially modify the database.
3. Keep previous data available during failed synchronization.
4. Use stable medicine IDs.
5. Validate version continuity.
6. Use a full snapshot when incremental recovery is impossible.
7. Preserve historical prescription data.

## 9. Template Rendering Architecture

```text
Template Builder
      |
Template JSON
      |
Template Storage
      |
Prescription Renderer
      |
      +---- Patient Information
      +---- Medicines
      +---- Doctor Information
      |
Page Layout Engine
      |
      +---- Front
      +---- Back
      |
Print / PDF
```

Template elements should support:

- id
- type
- x
- y
- width
- height
- rotation
- zIndex
- styles
- content

Use millimeters for physical dimensions.

Keep the renderer independent of the editor's internal state.

## 10. Printing Architecture

- Dedicated print renderer.
- A4, A5, and custom sizes.
- Accurate physical dimensions.
- Print-specific CSS.
- Arabic RTL and English LTR.
- Front and back support.
- Automatic overflow detection.
- Avoid splitting individual medicine blocks.

Use actual browser layout measurements to determine overflow.

## 11. Offline Architecture

Use a PWA Service Worker for application assets.

Use Dexie for persistent application data.

Separate:

- Application asset caching.
- Local medicine storage.
- Patient records.
- Prescription records.
- Template storage.

Do not depend on network access for essential features.

Do not use localStorage as the primary database.