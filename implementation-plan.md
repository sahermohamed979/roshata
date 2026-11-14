# Roshteh — Implementation Plan

## Development Strategy

Build the system incrementally.

Complete and validate each phase before proceeding to the next.

## Phase 0: Project Inspection

Tasks:
- Inspect existing project structure.
- Inspect package dependencies.
- Identify existing components.
- Review current architecture.
- Verify Next.js and React versions.
- Establish coding conventions.
- Define feature boundaries.

Deliverables:
- Architecture assessment.
- Folder structure.
- Dependency audit.
- Development roadmap.

## Phase 1: Application Foundation

Tasks:
- Configure TypeScript.
- Configure Tailwind CSS.
- Configure shadcn/ui.
- Configure Zustand.
- Configure Dexie.
- Create database schema.
- Implement migrations.
- Create application layout.
- Build navigation.
- Implement Arabic RTL and English LTR.

Deliverables:
- Working application shell.
- Local database.
- Reusable UI components.

## Phase 2: Medicine Database

Tasks:
- Investigate Egyptian medicine data sources.
- Verify licensing.
- Verify API documentation.
- Build import pipeline.
- Normalize medicine records.
- Create search indexes.
- Implement Arabic search.
- Implement English search.
- Implement active ingredient search.
- Implement barcode search.
- Implement custom medicine creation.

Deliverables:
- Local medicine database.
- Medicine search interface.
- Custom medicine management.

## Phase 3: Prescription Editor

Tasks:
- Create prescription editor.
- Add patient information.
- Build medicine search dropdown.
- Add medicine selection.
- Add dosage fields.
- Add frequency fields.
- Add duration fields.
- Add instructions.
- Implement medicine reordering.
- Implement editing and removal.
- Save prescriptions locally.

Deliverables:
- Fully functional offline prescription editor.

## Phase 4: Printing Engine

Tasks:
- Build prescription renderer.
- Implement page dimensions.
- Implement front layout.
- Implement back layout.
- Detect content overflow.
- Distribute medicines across pages.
- Build print preview.
- Add print-specific CSS.
- Add PDF export.

Deliverables:
- Professional printable prescriptions.
- Front and back support.

## Phase 5: Template Builder

### Stage A: Simple Editor

- Doctor profile settings.
- Clinic information.
- Logo upload.
- Signature and stamp.
- Color settings.
- Typography settings.
- Header configuration.
- Footer configuration.
- Paper dimensions.

### Stage B: Advanced Editor

- Drag and drop.
- Element positioning.
- Element resizing.
- Add text elements.
- Add image elements.
- Configure styles.
- Configure alignment.
- Undo and redo.
- Live preview.
- Save and duplicate templates.

Deliverables:
- Multiple doctor-specific templates.
- Canva-like editing experience.
- Default template selection.

## Phase 6: Central Backend

Tasks:
- Configure PostgreSQL.
- Design central schema.
- Implement medicine CRUD.
- Implement medicine import pipeline.
- Implement source tracking.
- Implement version management.
- Implement change history.
- Build admin dashboard.
- Implement medicine suggestion review.

Deliverables:
- Central medicine management system.
- Admin dashboard.
- Versioned medicine database.

## Phase 7: Incremental Synchronization

Tasks:
- Implement manifest endpoint.
- Implement changes endpoint.
- Implement snapshot endpoint.
- Implement version comparison.
- Implement monthly update checks.
- Implement manual synchronization.
- Implement batch downloads.
- Implement transactional local updates.
- Implement retry logic.
- Implement snapshot recovery.
- Implement sync status UI.

Deliverables:
- Reliable incremental synchronization.
- Offline database updates.

## Phase 8: Quality Assurance

Tasks:
- Test offline startup.
- Test medicine searches.
- Test large datasets.
- Test custom medicines.
- Test prescription creation.
- Test multiple medicines.
- Test front and back printing.
- Test template persistence.
- Test template editing.
- Test interrupted synchronization.
- Test corrupted update recovery.
- Test RTL and LTR.
- Test responsive layouts.
- Test data integrity.

Deliverables:
- Validated application.
- Test reports.
- Resolved critical bugs.

## Phase 9: Production Readiness

Tasks:
- Performance optimization.
- Security review.
- Database backup strategy.
- Logging.
- Error monitoring.
- Production configuration.
- PWA installation testing.
- Documentation.
- Deployment.

Deliverables:
- Production-ready Roshteh.

## Implementation Rules

- Complete one phase at a time.
- Do not skip validation.
- Do not replace existing working functionality without justification.
- Keep components reusable.
- Avoid unnecessary dependencies.
- Keep business logic outside UI components.
- Use strict TypeScript.
- Use Zod for validation.
- Add loading, empty, and error states.
- Do not use fake data in production flows.
- Document architectural decisions.
- Keep the application usable offline.

Each phase must include:
- Files created or modified.
- Architectural decisions.
- Functional tests.
- TypeScript checks.
- Build validation.
- Remaining limitations.