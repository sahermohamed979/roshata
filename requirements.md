# Roshteh — Product Requirements Document

## 1. Product Overview

Roshteh (روشتة) is an offline-first medical prescription application designed to help doctors create, customize, manage, and print professional prescriptions.

## 2. Product Goals

- Fast prescription creation.
- Comprehensive Egyptian medicine database.
- Arabic and English medicine search.
- Full offline functionality.
- Automatic incremental medicine updates.
- Custom prescription templates for every doctor.
- Front and back printing.
- Scalable architecture for future SaaS expansion.

## 3. Functional Requirements

### FR-01: Medicine Search

- Local medicine search.
- Arabic and English search.
- Brand name search.
- Active ingredient search.
- Strength and pharmaceutical form.
- Barcode search when available.
- Partial matching.
- Fast results.

### FR-02: Medicine Management

Support two categories:

**Global Medicines**
- Centrally managed.
- Updated through the central API.
- Stable identifiers.
- Version tracking.

**Custom Medicines**
- Added manually by doctors.
- Stored locally.
- Immediately available in search.
- Never overwritten by global synchronization.

### FR-03: Prescription Creation

- Create prescriptions.
- Enter patient information.
- Search and select medicines.
- Add multiple medicines.
- Specify dosage.
- Specify frequency.
- Specify duration.
- Add instructions.
- Reorder medicines.
- Edit and remove medicines.
- Save locally.
- Live preview.

### FR-04: Prescription Templates

Each doctor can:

- Create multiple templates.
- Edit and duplicate templates.
- Delete templates.
- Select a default template.
- Customize doctor and clinic information.
- Upload logos.
- Add signatures and stamps.
- Customize colors and typography.
- Configure paper sizes.
- Customize front and back layouts.

### FR-05: Template Builder

**Simple Editor**
- Doctor information.
- Clinic information.
- Logo.
- Header and footer.
- Colors and fonts.
- Paper dimensions.

**Advanced Editor**
- Drag and drop.
- Move and resize elements.
- Add text and images.
- Configure positioning and alignment.
- Undo and redo.
- Live preview.

The advanced editor should provide a simplified Canva-like experience dedicated to prescription design.

### FR-06: Printing

- Print preview.
- Front and back printing.
- Automatic overflow handling.
- A4 and A5 paper sizes.
- Custom paper dimensions.
- PDF export.
- Arabic RTL and English LTR.
- Accurate physical measurements.

### FR-07: Offline Functionality

The application must support:

- Offline startup.
- Local medicine search.
- Prescription creation and editing.
- Template management.
- Patient management.
- Local data persistence.
- Printing.

### FR-08: Medicine Synchronization

- Initial full database download.
- Monthly update checks.
- Manual update action.
- Incremental updates.
- New medicine insertion.
- Existing medicine updates.
- Medicine deactivation.
- Version verification.
- Transactional updates.
- Failed update recovery.

### FR-09: Administration

- Import medicines.
- Add and edit medicines.
- Deactivate medicines.
- Review doctor-submitted medicine suggestions.
- Manage data sources.
- Publish database versions.
- Track changes and imports.

## 4. Non-Functional Requirements

### Performance
- Fast local medicine search.
- Efficient IndexedDB queries.
- No unnecessary network requests.
- Support large medicine databases.

### Reliability
- No data loss during failed synchronization.
- Transactional database updates.
- Stable medicine identifiers.
- Historical prescription snapshots.

### Security
- Validate incoming data.
- Protect patient information.
- Separate doctor-specific records.
- Restrict administrative operations.

### Usability
- Arabic RTL.
- English LTR.
- Responsive interface.
- Accessible controls.
- Minimal interaction steps.

## 5. Initial MVP Exclusions

- Electronic medical records.
- Hospital management.
- Pharmacy inventory.
- Online payment processing.
- Automated diagnosis.
- Automated prescribing recommendations.
- Enterprise multi-clinic management.