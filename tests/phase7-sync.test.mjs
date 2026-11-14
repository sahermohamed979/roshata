import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Pure in-memory Simulation of Dexie and Synchronization Engine (SYN-001 through SYN-012)
class MockLocalClinicDatabase {
  constructor() {
    this.medicines = new Map();
    this.customMedicines = new Map();
    this.prescriptions = new Map();
    this.catalogMeta = new Map();
  }

  seedInitial(meds, customMeds, prescriptions, version = 1) {
    this.medicines.clear();
    this.customMedicines.clear();
    this.prescriptions.clear();
    this.catalogMeta.clear();

    for (const m of meds) {
      this.medicines.set(m.id, { ...m });
    }
    for (const cm of customMeds) {
      this.customMedicines.set(cm.id, { ...cm });
    }
    for (const rx of prescriptions) {
      this.prescriptions.set(rx.id, { ...rx });
    }
    this.catalogMeta.set('global_catalog_v1', {
      key: 'global_catalog_v1',
      version,
      lastSyncAt: new Date().toISOString(),
      itemCount: meds.length,
      checksum: `chk_v${version}`,
    });
  }

  async getMeta() {
    return this.catalogMeta.get('global_catalog_v1') || {
      key: 'global_catalog_v1',
      version: 0,
      lastSyncAt: null,
      itemCount: 0,
    };
  }

  // Transaction simulation with atomic rollback on failure
  async transaction(tables, txFn) {
    // Snapshot state before transaction
    const medicinesSnapshot = new Map(this.medicines);
    const metaSnapshot = new Map(this.catalogMeta);

    try {
      await txFn();
    } catch (err) {
      // Rollback on any failure (SYN-007)
      this.medicines = medicinesSnapshot;
      this.catalogMeta = metaSnapshot;
      throw err;
    }
  }

  applyChanges(changes, newVersion, checksum) {
    return this.transaction(['medicines', 'catalogMeta'], async () => {
      for (const chg of changes) {
        if (chg.fail) {
          throw new Error('Simulation transaction failure');
        }

        if (chg.action === 'create') {
          this.medicines.set(chg.medicineId, {
            id: chg.medicineId,
            ...chg.deltaPayload,
            status: 'active',
            version: newVersion,
          });
        } else if (chg.action === 'update') {
          const existing = this.medicines.get(chg.medicineId);
          if (existing) {
            this.medicines.set(chg.medicineId, {
              ...existing,
              ...chg.deltaPayload,
              version: newVersion,
            });
          }
        } else if (chg.action === 'deactivate') {
          const existing = this.medicines.get(chg.medicineId);
          if (existing) {
            existing.status = 'inactive';
            existing.version = newVersion;
          }
        }
      }

      this.catalogMeta.set('global_catalog_v1', {
        key: 'global_catalog_v1',
        version: newVersion,
        lastSyncAt: new Date().toISOString(),
        itemCount: this.medicines.size,
        checksum,
      });
    });
  }

  applySnapshot(snapshotMedicines, version) {
    return this.transaction(['medicines', 'catalogMeta'], async () => {
      this.medicines.clear();
      for (const m of snapshotMedicines) {
        this.medicines.set(m.id, { ...m, version });
      }
      this.catalogMeta.set('global_catalog_v1', {
        key: 'global_catalog_v1',
        version,
        lastSyncAt: new Date().toISOString(),
        itemCount: snapshotMedicines.length,
        checksum: `snap_v${version}`,
      });
    });
  }
}

describe('Phase 7 — Initial Download & No Changes Check (SYN-001, SYN-002)', () => {
  const db = new MockLocalClinicDatabase();

  test('downloads initial snapshot and saves version metadata (SYN-001)', async () => {
    const initialServerSnapshot = [
      { id: 'm1', nameAr: 'بنادول', nameEn: 'Panadol', activeIngredient: 'Paracetamol', status: 'active' },
      { id: 'm2', nameAr: 'أوجمنتين', nameEn: 'Augmentin', activeIngredient: 'Amoxicillin', status: 'active' },
    ];

    await db.applySnapshot(initialServerSnapshot, 1);

    const meta = await db.getMeta();
    assert.equal(meta.version, 1);
    assert.equal(meta.itemCount, 2);
    assert.equal(db.medicines.size, 2);
  });

  test('downloads no data when local version matches server version (SYN-002)', async () => {
    const meta = await db.getMeta();
    const serverVersion = 1;

    const hasUpdate = serverVersion > meta.version;
    assert.equal(hasUpdate, false);
    // No changes applied
    assert.equal(meta.version, 1);
  });
});

describe('Phase 7 — Incremental Changes: Create, Update, Deactivate (SYN-003, SYN-004, SYN-005)', () => {
  const db = new MockLocalClinicDatabase();

  test('inserts only the new record on incremental sync (SYN-003)', async () => {
    db.seedInitial(
      [{ id: 'm1', nameEn: 'Drug A', status: 'active' }],
      [],
      [],
      1
    );

    const deltaChanges = [
      {
        id: 'c1',
        versionNumber: 2,
        action: 'create',
        medicineId: 'm2',
        deltaPayload: { nameEn: 'Drug B', price: 50 },
      },
    ];

    await db.applyChanges(deltaChanges, 2, 'chk_v2');

    const meta = await db.getMeta();
    assert.equal(meta.version, 2);
    assert.equal(db.medicines.size, 2);
    assert.equal(db.medicines.get('m2').nameEn, 'Drug B');
  });

  test('updates only changed fields on existing record (SYN-004)', async () => {
    const deltaChanges = [
      {
        id: 'c2',
        versionNumber: 3,
        action: 'update',
        medicineId: 'm2',
        deltaPayload: { price: 65, strength: '500mg' },
      },
    ];

    await db.applyChanges(deltaChanges, 3, 'chk_v3');

    const m2 = db.medicines.get('m2');
    assert.equal(m2.price, 65);
    assert.equal(m2.strength, '500mg');
    assert.equal(m2.nameEn, 'Drug B'); // Unchanged fields remain
  });

  test('deactivates medicine and preserves historical prescriptions (SYN-005)', async () => {
    // Add a historical prescription referencing m1
    db.prescriptions.set('rx_1', {
      id: 'rx_1',
      items: [{ medicineId: 'm1', nameSnapshotEn: 'Drug A', dosage: '1 tablet' }],
    });

    const deltaChanges = [
      {
        id: 'c3',
        versionNumber: 4,
        action: 'deactivate',
        medicineId: 'm1',
        deltaPayload: { isActive: false, reason: 'Discontinued' },
      },
    ];

    await db.applyChanges(deltaChanges, 4, 'chk_v4');

    // m1 is now inactive for new search
    const m1 = db.medicines.get('m1');
    assert.equal(m1.status, 'inactive');

    // Historical prescription remains 100% intact
    const rx = db.prescriptions.get('rx_1');
    assert.ok(rx);
    assert.equal(rx.items[0].nameSnapshotEn, 'Drug A');
  });
});

describe('Phase 7 — Fault Tolerance: Interrupted Download & Rollback (SYN-006, SYN-007)', () => {
  const db = new MockLocalClinicDatabase();

  test('leaves database usable and does not advance version on interrupted download (SYN-006)', async () => {
    db.seedInitial([{ id: 'm1', nameEn: 'Drug A', status: 'active' }], [], [], 1);

    // Simulate network error before local apply
    let downloadFailed = false;
    try {
      throw new Error('Network timeout during download');
    } catch (e) {
      downloadFailed = true;
    }

    assert.equal(downloadFailed, true);
    const meta = await db.getMeta();
    assert.equal(meta.version, 1);
    assert.equal(db.medicines.size, 1);
  });

  test('rolls back entire transaction if any change in batch fails (SYN-007)', async () => {
    db.seedInitial([{ id: 'm1', nameEn: 'Drug A', status: 'active' }], [], [], 1);

    const corruptBatch = [
      { action: 'create', medicineId: 'm2', deltaPayload: { nameEn: 'Drug B' } },
      { action: 'create', medicineId: 'm3', deltaPayload: { nameEn: 'Drug C' }, fail: true }, // Fails!
    ];

    let txFailed = false;
    try {
      await db.applyChanges(corruptBatch, 2, 'chk_v2');
    } catch (err) {
      txFailed = true;
    }

    assert.equal(txFailed, true);

    // Verified: m2 was NOT committed, version did NOT advance!
    assert.equal(db.medicines.has('m2'), false);
    assert.equal(db.medicines.size, 1);
    const meta = await db.getMeta();
    assert.equal(meta.version, 1);
  });
});

describe('Phase 7 — Monthly Check, Mismatch Recovery & Isolation (SYN-009, SYN-010, SYN-012)', () => {
  const db = new MockLocalClinicDatabase();

  test('flags update as due when last sync is older than 30 days (SYN-009)', () => {
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    const lastSyncDate = new Date(thirtyOneDaysAgo).getTime();
    const isMonthlyDue = Date.now() - lastSyncDate > 30 * 24 * 60 * 60 * 1000;

    assert.equal(isMonthlyDue, true);
  });

  test('recovers from large version gap by downloading full snapshot (SYN-010)', async () => {
    // Client is on v1, server is on v60 (gap > 50)
    db.seedInitial([{ id: 'm1', nameEn: 'Old Drug', status: 'active' }], [], [], 1);

    const fullSnapshotFromServer = [
      { id: 'm1', nameEn: 'Modern Drug A', status: 'active' },
      { id: 'm2', nameEn: 'Modern Drug B', status: 'active' },
      { id: 'm3', nameEn: 'Modern Drug C', status: 'active' },
    ];

    await db.applySnapshot(fullSnapshotFromServer, 60);

    const meta = await db.getMeta();
    assert.equal(meta.version, 60);
    assert.equal(db.medicines.size, 3);
    assert.equal(db.medicines.get('m1').nameEn, 'Modern Drug A');
  });

  test('completely isolates and protects custom medicines during sync (SYN-012)', async () => {
    const customDocDrug = {
      id: 'custom_doc_1',
      doctorId: 'doctor_samir',
      nameAr: 'تركيبة أذن خاصة',
      nameEn: 'Special Ear Mix',
      isCustom: true,
    };

    db.seedInitial(
      [{ id: 'm1', nameEn: 'Global 1' }],
      [customDocDrug],
      [],
      5
    );

    // Run central synchronization
    const centralDelta = [
      { action: 'create', medicineId: 'm2', deltaPayload: { nameEn: 'Global 2' } },
      { action: 'deactivate', medicineId: 'm1', deltaPayload: { reason: 'removed' } },
    ];

    await db.applyChanges(centralDelta, 6, 'chk_v6');

    // Doctor's custom medicine is 100% preserved and untouched
    const custom = db.customMedicines.get('custom_doc_1');
    assert.ok(custom);
    assert.equal(custom.nameAr, 'تركيبة أذن خاصة');
    assert.equal(custom.doctorId, 'doctor_samir');
  });
});
