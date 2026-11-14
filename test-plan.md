# Roshteh — Quality Assurance and Test Plan

## 1. Testing Objectives

Ensure that Roshteh is:

- Reliable.
- Offline-capable.
- Fast.
- Accurate.
- Secure.
- Compatible with Arabic and English.
- Capable of producing professional prescriptions.
- Resistant to data loss during synchronization.

## 2. Testing Strategy

| Testing Type        | Purpose                                    |
| ------------------- | ------------------------------------------ |
| Unit Testing        | Validate isolated business logic           |
| Integration Testing | Validate database and feature interactions |
| Component Testing   | Validate UI behavior                       |
| E2E Testing         | Validate complete workflows                |
| Offline Testing     | Validate offline functionality             |
| Printing Testing    | Validate physical output                   |
| Performance Testing | Validate large datasets                    |
| Security Testing    | Validate data protection                   |

Recommended tools:

- Vitest.
- React Testing Library.
- Playwright.
- Zod.
- TypeScript compiler.
- Browser DevTools.

## 3. Medicine Search Tests

### MED-001: Arabic Search

Given an installed local medicine database.

When a doctor searches using an Arabic medicine name.

Expected:

- Matching results appear.
- No network request is required.

### MED-002: English Search

Search using English medicine names.

Expected:

- Matching medicines appear.
- Partial matches work.
- Search remains local.

### MED-003: Active Ingredient Search

Search using an active ingredient.

Expected:

- Medicines containing the matching ingredient appear.

### MED-004: Strength Filtering

Search or filter by strength.

Expected:

- Different concentrations remain distinguishable.

### MED-005: Barcode Search

Search by barcode when available.

Expected:

- Matching medicine is returned.

### MED-006: Offline Search

Disconnect internet.

Expected:

- Search continues working.
- No network dependency occurs.

### MED-007: Large Dataset

Test with at least 50,000 medicine records.

Expected:

- Search remains responsive.
- Indexes are used appropriately.
- No full-table scan on every keystroke.

## 4. Custom Medicine Tests

### CUS-001: Add Medicine

Expected:

- Medicine is saved locally.
- Medicine appears in local search.

### CUS-002: Offline Creation

Expected:

- Medicine can be added without internet.

### CUS-003: Global Synchronization Isolation

Expected:

- Custom medicines remain unchanged after global synchronization.

### CUS-004: Duplicate Handling

Expected:

- Existing global medicines are clearly distinguished.
- Records are not silently merged.

## 5. Prescription Tests

### PRE-001: Create Prescription

Expected:

- Prescription is saved locally.

### PRE-002: Add Multiple Medicines

Expected:

- All medicines appear in the correct order.

### PRE-003: Edit Medicine

Expected:

- Dosage, frequency, duration, and instructions update correctly.

### PRE-004: Remove Medicine

Expected:

- Remaining medicines are preserved.

### PRE-005: Offline Prescription

Expected:

- Complete prescription workflow remains functional offline.

### PRE-006: Historical Data Integrity

Expected:

- Historical prescription snapshots remain unchanged after medicine updates.

## 6. Template Builder Tests

### TMP-001: Create Template

Expected:

- Template is stored locally.

### TMP-002: Customize Doctor Information

Expected:

- Preview reflects the changes.

### TMP-003: Upload Logo

Expected:

- Logo appears correctly.

### TMP-004: Advanced Editor

Expected:

- Element position and dimensions are saved.

### TMP-005: Undo and Redo

Expected:

- Changes are correctly restored.

### TMP-006: Multiple Templates

Expected:

- Each template remains independent.

### TMP-007: Default Template

Expected:

- New prescriptions use the default template.

### TMP-008: Offline Template Editing

Expected:

- Template creation and editing work offline.

## 7. Printing Tests

### PRT-001: A4 Printing

Expected:

- Correct physical dimensions.

### PRT-002: A5 Printing

Expected:

- Correct dimensions and layout.

### PRT-003: Front and Back

Expected:

- Overflow content moves to the back.

### PRT-004: Long Medicine Instructions

Expected:

- Text is not cut off.
- Layout adjusts correctly.

### PRT-005: Arabic Printing

Expected:

- RTL layout works.
- Arabic characters render correctly.

### PRT-006: Mixed Languages

Expected:

- Arabic and English text directions are correct.

### PRT-007: PDF Export

Expected:

- PDF preserves the selected template.

## 8. Synchronization Tests

### SYN-001: Initial Download

Expected:

- Initial medicine snapshot downloads.
- Local version is saved.

### SYN-002: No Changes

Expected:

- No medicine data is downloaded.

### SYN-003: New Medicine

Expected:

- Only the new record is downloaded.

### SYN-004: Updated Medicine

Expected:

- Only the changed record is updated.

### SYN-005: Deactivated Medicine

Expected:

- Medicine is unavailable for new selection according to its status.
- Historical prescriptions remain intact.

### SYN-006: Interrupted Download

Expected:

- Previous database remains usable.
- Version does not advance.

### SYN-007: Interrupted Transaction

Expected:

- Transaction rolls back.
- Previous state remains intact.

### SYN-008: Manual Update

Expected:

- Synchronization starts and status is displayed.

### SYN-009: Monthly Update Check

Expected:

- Application checks for updates when opened and connected after the scheduled interval.

### SYN-010: Version Mismatch

Expected:

- Incompatible update sequence is rejected.
- Recovery snapshot is requested.

### SYN-011: Duplicate Change

Expected:

- No duplicate records are created.

### SYN-012: Custom Medicine Protection

Expected:

- Custom medicines remain untouched.

## 9. Offline Tests

### OFF-001: Application Startup

Expected:

- Installed application loads from cached assets.

### OFF-002: Medicine Search

Expected:

- Local search works.

### OFF-003: Prescription Creation

Expected:

- Data persists after closing and reopening.

### OFF-004: Template Editing

Expected:

- Changes persist.

### OFF-005: Printing

Expected:

- Printing works without network requests.

### OFF-006: Reconnection

Expected:

- Existing data remains intact.
- Synchronization can resume.

## 10. Performance Tests

Test:

- 50,000+ medicine records.
- Repeated medicine searches.
- Large prescription lists.
- Multiple templates.
- Long Arabic text.
- Large logos and images.
- Multiple synchronization batches.

Expected:

- No major UI freezing.
- No unnecessary full database reads.
- Efficient rendering.
- Stable memory usage.

Define measurable performance budgets after establishing a baseline on representative hardware.

## 11. Security Tests

- Validate API payloads.
- Validate imported medicine records.
- Protect admin endpoints.
- Prevent unauthorized medicine modifications.
- Protect patient data.
- Verify doctor data isolation.
- Prevent unsafe template content injection.
- Verify file upload restrictions.
- Verify database access boundaries.

## 12. Regression Testing

Whenever a feature changes, rerun relevant tests.

Critical regression areas:

- Medicine search.
- Custom medicines.
- Prescription persistence.
- Template rendering.
- Printing.
- Offline startup.
- Synchronization.
- Historical prescription integrity.

## 13. Release Acceptance Criteria

A release is acceptable only when:

- Core application works offline.
- Medicine search works locally.
- Custom medicines work.
- Prescription creation works.
- Templates can be created and edited.
- Front and back printing works.
- Incremental updates work.
- Failed synchronization does not corrupt data.
- Historical prescriptions remain intact.
- Arabic and English layouts work.
- Critical tests pass.
- TypeScript checks pass.
- Production build succeeds.

## 14. Test Execution Report

For each release, record:

- Test ID.
- Test description.
- Environment.
- Expected result.
- Actual result.
- Status.
- Bug reference.
- Tested application version.

Statuses:

- PASS
- FAIL
- BLOCKED
- NOT TESTED

Never mark a feature as tested unless the test was actually executed.
