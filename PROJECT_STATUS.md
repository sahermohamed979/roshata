# Roshteh — Project Status & Health Matrix

**Platform:** Roshteh (روشتة) — Professional Offline-First Prescription Management System  
**Current Phase:** Phase 6: Central Backend & Admin Dashboard (Completed & Fully Verified)  
**Last Updated:** 2026-11-14  

---

## 1. Executive Summary

Phase 6 (Central Backend & Admin Portal) has been engineered, implemented, and fully verified:
- **Central PostgreSQL Database Schema (`schema.sql`):**
  - Designed relational tables: `medicines`, `medicine_sources`, `medicine_versions`, `medicine_changes`, `medicine_imports`, `medicine_suggestions`, `audit_logs`.
  - Comprehensive indexing: Trigram GIN indexes for Arabic and English trade names and active ingredients, B-Tree indexes on barcodes, versions, and active flags.
- **Central Medicine Engine & Data Access Layer (`central-medicine.service.ts`):**
  - Dual-mode data access: Connects via `pg.Pool` to PostgreSQL when `DATABASE_URL` is configured, while seamlessly falling back to a persistent memory store for offline/standalone execution.
  - Medicine CRUD operations with automatic change tracking (`action: 'create' | 'update' | 'deactivate'`).
  - Version publication pipeline (`publishVersion`) calculating checksums, release notes, and incrementing monotonic version numbers.
  - Source tracking attributing formulary records to the Egyptian Drug Authority (EDA / MOH) and WHO INN.
- **Next.js Central API Route Handlers (`/api/v1/`):**
  - `GET /api/v1/medicines/manifest`: Computes database version, pending changes count, and update availability.
  - `GET /api/v1/medicines/changes?since=X`: Returns incremental delta changes after a specific version.
  - `GET /api/v1/medicines/snapshot`: Delivers full database bootstrap snapshot.
  - `GET / POST /api/v1/medicines/suggestions`: Crowdsourcing endpoint for offline doctors to submit new formulary suggestions.
  - `GET / POST /api/v1/admin/medicines`: Admin listing, filtering, search, and medicine creation.
  - `GET / PUT / DELETE /api/v1/admin/medicines/[id]`: Detail view, updates, and deactivation.
  - `POST /api/v1/admin/versions/publish`: Official release publisher.
  - `POST /api/v1/admin/suggestions/[id]/review`: Doctor suggestion approval and rejection pipeline.
- **Comprehensive Admin Dashboard Portal (`/admin`):**
  - Overview metrics: Total Central Medicines, Active Published Version, Pending Changes, Pending Doctor Suggestions.
  - 4 Administrative Management Tabs:
    1. **الدليل الدوائي المركزي (Central Catalog):** Search, filtering, add medicine dialog with Zod validation, edit, and deactivation.
    2. **إصدارات وتحديثات العيادات (Version Management):** Active version metrics and one-click release publisher dialog with release notes.
    3. **مراجعة مقترحات الأطباء (Doctor Suggestions Review):** Table of clinic-submitted suggestions with one-click "اعتماد وإضافة للقاعدة" (Approve & Add) or "رفض" (Reject).
    4. **مصادر البيانات والتسعيرة الجبرية (Data Sources):** Official Egyptian Drug Authority (EDA) regulatory formulary management.
- **Automated Verification:**
  - 40 unit and integration tests passing (`pnpm test`) across 20 suites.
  - Next.js production build (`next build`) compiled 100% clean with zero errors across all 16 static and dynamic routes.
  - Strict TypeScript check (`tsc --noEmit`) passes with 0 errors.

---

## 2. Feature Implementation Status Matrix

| Module / Feature | Specification | Current Status | Notes |
| :--- | :--- | :--- | :--- |
| **Project Foundation** | Next.js 16 + React 19 + TypeScript | 🟢 Completed | Standalone root app running on Next.js 16.4.3 + React 19.3.0 |
| **Local Database Engine** | Dexie.js (IndexedDB) Schema v2 | 🟢 Completed | Tables: `medicines`, `customMedicines`, `prescriptions`, `templates`, `catalogMeta` |
| **Medicine Catalog & Search** | Global formulary, Arabic/English normalization | 🟢 Completed | Sub-10ms search with barcode scanner and relevance ranking |
| **Custom Medicine Lifecycle** | Add, edit, delete doctor-specific medicines | 🟢 Completed | Separate local storage isolated from global sync |
| **Prescription Editor** | Full multi-drug clinical composer | 🟢 Completed | Patient data, keyboard navigation, presets, reordering |
| **Prescription Snapshots** | Immutable historical drug records (PRE-006) | 🟢 Completed | Verified immune to future catalog modifications |
| **Prescription Live Preview** | Real-time dynamic visual preview (FR-03) | 🟢 Completed | Responsive side sheet reflecting live draft changes |
| **Draft Auto-save & Recovery** | Debounced IndexedDB auto-save & resumption | 🟢 Completed | Work never lost on reload or power disruption |
| **Printing & Dimensions** | A4 and A5 physical paper dimensions | 🟢 Completed | Strict mm box sizing with `@media print` rules |
| **Content Overflow Engine** | Automatic multi-page pagination | 🟢 Completed | Weight-based distribution preventing line splits |
| **Front and Back Printing** | Dual-page clinical layout | 🟢 Completed | Front page medications + Back page medical guidelines |
| **PDF Export Engine** | Native browser print to PDF integration | 🟢 Completed | Direct PDF export with automated title formatting |
| **Template Builder (Stage A & B)** | Simple settings & advanced visual editor | 🟢 Completed | Multi-template, Base64 assets, reorderable blocks, undo/redo |
| **Central Database Schema** | PostgreSQL schema with Trigram indexing | 🟢 Completed | `schema.sql`: medicines, sources, versions, changes, suggestions |
| **Central Medicine Engine** | Versioned CRUD & change tracking | 🟢 Completed | Atomic changes audit, delta calculation, and versioning |
| **Central Synchronization API** | Route Handlers for manifest, changes & snapshot | 🟢 Completed | `/api/v1/medicines/manifest`, `/changes`, `/snapshot` |
| **Doctor Suggestions Pipeline** | Offline doctor suggestions & admin review | 🟢 Completed | Review workflow with automatic promotion to central formulary |
| **Central Admin Dashboard** | Admin portal with metrics and management | 🟢 Completed | Full RTL dashboard at `/admin` for formulary and version publishing |
| **Backup & Restore** | JSON Export / Import in browser | 🟢 Completed | Full offline backup capability |

---

## 3. Technology Stack & Quality Metrics

| Component | Library / Version | Status |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4.3 (App Router) | Verified |
| **React** | 19.3.0 | Verified |
| **Language** | TypeScript 5 (Strict Mode) | Verified (`tsc --noEmit` = 0 errors) |
| **Validation** | Zod 4.6.7 | `prescriptionSchema`, `medicineBaseSchema` |
| **Local Database** | Dexie.js 4.4.7 + dexie-react-hooks | Schema v2 with barcode index |
| **Central Backend** | pg 8.23.1 + Central Data Access Layer | PostgreSQL connection pool + resilient fallback |
| **State Management** | Zustand 5.1.0 | `usePrescriptionStore`, `useMedicineStore`, `useTemplateStore` |
| **Automated Tests** | Node Native Test Runner | 40 tests passed across 20 suites (`pnpm test`) in 128ms |
