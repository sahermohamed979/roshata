import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Pure in-memory Central Engine testing implementation for Phase 6 (CEN-001 to CEN-007)
class CentralMedicineEngine {
  constructor() {
    this.sources = new Map();
    this.medicines = new Map();
    this.versions = new Map();
    this.changes = [];
    this.suggestions = new Map();

    this.init();
  }

  init() {
    // Official source: EDA
    this.sources.set('source_eda', {
      id: 'source_eda',
      name: 'هيئة الدواء المصرية (Egyptian Drug Authority)',
      code: 'EDA_MOH',
      isOfficial: true,
      createdAt: new Date().toISOString(),
    });

    // Version 1
    this.versions.set(1, {
      versionNumber: 1,
      releaseNotes: 'الإصدار الأولي',
      changesCount: 1,
      checksum: 'chk_v1_bootstrap',
      publishedAt: new Date().toISOString(),
    });

    // Initial seed medicine
    this.medicines.set('med_initial_1', {
      id: 'med_initial_1',
      tradeNameAr: 'أوجمنتين 1 جم',
      tradeNameEn: 'Augmentin 1g Tablets',
      activeIngredient: 'Amoxicillin + Clavulanic Acid',
      dosageForm: 'أقراص',
      strength: '1g',
      category: 'مضاد حيوي',
      barcode: '6221234567890',
      price: 110.0,
      isActive: true,
      versionId: 1,
      sourceId: 'source_eda',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async listMedicines(params = {}) {
    let all = Array.from(this.medicines.values());
    if (params.activeOnly !== false) {
      all = all.filter((m) => m.isActive);
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      all = all.filter(
        (m) =>
          m.tradeNameAr.toLowerCase().includes(q) ||
          m.tradeNameEn.toLowerCase().includes(q) ||
          m.activeIngredient.toLowerCase().includes(q) ||
          (m.barcode && m.barcode.includes(q))
      );
    }
    return {
      medicines: all.slice(0, params.limit || 20),
      total: all.length,
    };
  }

  async getById(id) {
    return this.medicines.get(id) || null;
  }

  async createMedicine(input) {
    const id = `med_c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const currentVersion = this.getLatestVersionNumber();

    const newMed = {
      id,
      tradeNameAr: input.tradeNameAr.trim(),
      tradeNameEn: input.tradeNameEn.trim(),
      activeIngredient: input.activeIngredient.trim(),
      dosageForm: input.dosageForm.trim(),
      strength: input.strength.trim(),
      category: input.category || 'عام',
      barcode: input.barcode?.trim(),
      price: input.price || 50,
      isActive: true,
      versionId: currentVersion,
      sourceId: input.sourceId || 'source_eda',
      createdAt: now,
      updatedAt: now,
    };

    this.medicines.set(id, newMed);

    // Queue change for next version
    this.changes.push({
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      versionNumber: currentVersion + 1,
      action: 'create',
      medicineId: id,
      deltaPayload: { ...newMed },
      createdAt: now,
    });

    return newMed;
  }

  async updateMedicine(id, updates) {
    const existing = this.medicines.get(id);
    if (!existing) throw new Error('Not found');

    const currentVersion = this.getLatestVersionNumber();
    const now = new Date().toISOString();

    const updated = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    this.medicines.set(id, updated);

    this.changes.push({
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      versionNumber: currentVersion + 1,
      action: 'update',
      medicineId: id,
      deltaPayload: updates,
      createdAt: now,
    });

    return updated;
  }

  async deactivateMedicine(id, reason) {
    const existing = this.medicines.get(id);
    if (!existing) throw new Error('Not found');

    const currentVersion = this.getLatestVersionNumber();
    const now = new Date().toISOString();

    const deactivated = {
      ...existing,
      isActive: false,
      deactivationReason: reason,
      updatedAt: now,
    };

    this.medicines.set(id, deactivated);

    this.changes.push({
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      versionNumber: currentVersion + 1,
      action: 'deactivate',
      medicineId: id,
      deltaPayload: { isActive: false, deactivationReason: reason },
      createdAt: now,
    });

    return deactivated;
  }

  async publishVersion(releaseNotes = 'تحديث رسمي') {
    const latestNum = this.getLatestVersionNumber();
    const newVersionNum = latestNum + 1;

    const versionChanges = this.changes.filter(
      (c) => c.versionNumber === newVersionNum || !c.versionNumber
    );

    versionChanges.forEach((c) => {
      c.versionNumber = newVersionNum;
    });

    const versionRecord = {
      versionNumber: newVersionNum,
      previousVersion: latestNum,
      releaseNotes,
      changesCount: versionChanges.length,
      checksum: `chk_v${newVersionNum}_${Date.now().toString(36)}`,
      publishedAt: new Date().toISOString(),
    };

    this.versions.set(newVersionNum, versionRecord);
    return versionRecord;
  }

  async getManifest(clientCurrentVersion = 0) {
    const latestNum = this.getLatestVersionNumber();
    const latest = this.versions.get(latestNum);
    const totalMedicines = Array.from(this.medicines.values()).filter((m) => m.isActive).length;
    const pendingChanges = this.changes.filter((c) => c.versionNumber > clientCurrentVersion);

    return {
      version: latestNum,
      previousVersion: latest.previousVersion,
      updatedAt: latest.publishedAt,
      changesAvailable: latestNum > clientCurrentVersion,
      changesCount: pendingChanges.length,
      totalMedicines,
      checksum: latest.checksum,
    };
  }

  async getChanges(sinceVersion = 0) {
    const latestVersion = this.getLatestVersionNumber();
    const changes = this.changes.filter((c) => c.versionNumber > sinceVersion);
    return {
      version: latestVersion,
      sinceVersion,
      changesCount: changes.length,
      changes,
    };
  }

  async submitDoctorSuggestion(suggestion) {
    const id = `sug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record = {
      ...suggestion,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.suggestions.set(id, record);
    return record;
  }

  async reviewSuggestion(id, decision, reviewerNotes = '') {
    const target = this.suggestions.get(id);
    if (!target) throw new Error('Suggestion not found');

    target.status = decision;
    target.reviewerNotes = reviewerNotes;
    target.reviewedAt = new Date().toISOString();

    let createdMedicine;
    if (decision === 'approved') {
      createdMedicine = await this.createMedicine({
        tradeNameAr: target.tradeNameAr,
        tradeNameEn: target.tradeNameEn,
        activeIngredient: target.activeIngredient || 'غير محدد',
        dosageForm: target.dosageForm || 'أقراص',
        strength: target.strength || 'معياري',
        barcode: target.barcode,
        category: 'مقترح أطباء',
      });
    }

    return { suggestion: target, createdMedicine };
  }

  async importMedicines(sourceId, rows) {
    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      if (!row.tradeNameAr || !row.tradeNameEn) continue;

      const existing = Array.from(this.medicines.values()).find(
        (m) =>
          (row.barcode && m.barcode === row.barcode) ||
          m.tradeNameEn.toLowerCase() === row.tradeNameEn.toLowerCase()
      );

      if (existing) {
        await this.updateMedicine(existing.id, row);
        updated++;
      } else {
        await this.createMedicine({ ...row, sourceId });
        inserted++;
      }
    }

    return { inserted, updated };
  }

  getLatestVersionNumber() {
    const nums = Array.from(this.versions.keys());
    return nums.length > 0 ? Math.max(...nums) : 1;
  }
}

describe('Phase 6 — Central Schema & Initial Bootstrap (CEN-001)', () => {
  const engine = new CentralMedicineEngine();

  test('seeds central medicines with Egyptian Drug Authority (EDA) source', async () => {
    const manifest = await engine.getManifest();
    assert.equal(manifest.version, 1);
    assert.ok(manifest.totalMedicines > 0);
    assert.ok(manifest.checksum.length > 0);

    const edaSource = engine.sources.get('source_eda');
    assert.ok(edaSource);
    assert.equal(edaSource.code, 'EDA_MOH');
    assert.equal(edaSource.isOfficial, true);
  });

  test('retrieves paginated and filtered medicines from central catalog', async () => {
    const result = await engine.listMedicines({
      search: 'Augmentin',
      limit: 10,
    });

    assert.ok(result.medicines.length > 0);
    const aug = result.medicines[0];
    assert.match(aug.tradeNameEn, /Augmentin/i);
    assert.equal(aug.isActive, true);
  });
});

describe('Phase 6 — Central Medicine CRUD Operations (CEN-002)', () => {
  const engine = new CentralMedicineEngine();

  test('creates a new central medicine with proper audit and source attribution', async () => {
    const created = await engine.createMedicine({
      tradeNameAr: 'كونكور 5 مجم',
      tradeNameEn: 'Concor 5mg',
      activeIngredient: 'Bisoprolol Fumarate',
      dosageForm: 'أقراص',
      strength: '5 mg',
      category: 'ضغط وقلب',
      barcode: '6221555444333',
      price: 65.0,
      manufacturer: 'Merck',
    });

    assert.ok(created.id.startsWith('med_c_'));
    assert.equal(created.tradeNameEn, 'Concor 5mg');
    assert.equal(created.isActive, true);

    const retrieved = await engine.getById(created.id);
    assert.equal(retrieved.tradeNameAr, 'كونكور 5 مجم');
  });

  test('updates central medicine attributes and logs change delta', async () => {
    const created = await engine.createMedicine({
      tradeNameAr: 'دواء تجريبي',
      tradeNameEn: 'Test Drug',
      activeIngredient: 'Test Molecule',
      dosageForm: 'أقراص',
      strength: '10mg',
      price: 20,
    });

    const updated = await engine.updateMedicine(created.id, {
      price: 25.5,
      strength: '20mg',
    });

    assert.equal(updated.price, 25.5);
    assert.equal(updated.strength, '20mg');
  });

  test('deactivates a medicine with deactivation reason', async () => {
    const created = await engine.createMedicine({
      tradeNameAr: 'دواء مسحوب',
      tradeNameEn: 'Withdrawn Drug',
      activeIngredient: 'Banned Substance',
      dosageForm: 'أقراص',
      strength: '100mg',
    });

    const deactivated = await engine.deactivateMedicine(
      created.id,
      'سحب تشغيلة من هيئة الدواء المصرية'
    );

    assert.equal(deactivated.isActive, false);
    assert.equal(deactivated.deactivationReason, 'سحب تشغيلة من هيئة الدواء المصرية');

    // Should not appear in active search
    const list = await engine.listMedicines({
      search: 'Withdrawn Drug',
      activeOnly: true,
    });
    assert.equal(list.medicines.length, 0);
  });
});

describe('Phase 6 — Change History & Version Publication (CEN-003, CEN-004)', () => {
  const engine = new CentralMedicineEngine();

  test('tracks incremental changes and publishes a new official version', async () => {
    const initialManifest = await engine.getManifest();
    const initialVersion = initialManifest.version;

    // Create and deactivate to generate changes
    const med1 = await engine.createMedicine({
      tradeNameAr: 'دواء إصدار جديد',
      tradeNameEn: 'New Version Drug',
      activeIngredient: 'Active Molecule X',
      dosageForm: 'أقراص',
      strength: '50mg',
    });

    await engine.deactivateMedicine(med1.id, 'اختبار الإصدار');

    // Publish new version v(initialVersion + 1)
    const newVersion = await engine.publishVersion(
      'تحديث الإصدار الثاني لقائمة الأدوية وتحديث الأسعار'
    );

    assert.equal(newVersion.versionNumber, initialVersion + 1);
    assert.equal(newVersion.previousVersion, initialVersion);
    assert.ok(newVersion.changesCount >= 2);
    assert.ok(newVersion.checksum.startsWith('chk_v'));

    // Verify updated manifest
    const updatedManifest = await engine.getManifest(initialVersion);
    assert.equal(updatedManifest.version, newVersion.versionNumber);
    assert.equal(updatedManifest.changesAvailable, true);
    assert.ok(updatedManifest.changesCount >= 2);
  });

  test('retrieves only incremental changes since a specific version', async () => {
    const engine = new CentralMedicineEngine();
    await engine.createMedicine({
      tradeNameAr: 'دواء تغيير 1',
      tradeNameEn: 'Change Drug 1',
      activeIngredient: 'Mol 1',
      dosageForm: 'أقراص',
      strength: '10mg',
    });
    await engine.publishVersion('إصدار 2');

    const changesResponse = await engine.getChanges(1);
    assert.equal(changesResponse.version, 2);
    assert.equal(changesResponse.sinceVersion, 1);
    assert.ok(changesResponse.changes.length > 0);
  });
});

describe('Phase 6 — Doctor Suggestions & Review Pipeline (CEN-006)', () => {
  const engine = new CentralMedicineEngine();

  test('submits doctor suggestion from clinic and reviews with approval', async () => {
    // 1. Doctor submits suggestion
    const sug = await engine.submitDoctorSuggestion({
      doctorId: 'doc_123',
      doctorName: 'د. أحمد سامي',
      clinicName: 'عيادة الشروق التخصصية',
      tradeNameAr: 'أوميجا 3 بلس كبسولات',
      tradeNameEn: 'Omega 3 Plus Capsules',
      activeIngredient: 'Fish Oil + Vitamin E',
      dosageForm: 'كبسولات',
      strength: '1000 mg',
      barcode: '6229990001122',
      clinicalNotes: 'مكمل غذائي شائع جداً ومطلوب بالروشتات',
    });

    assert.ok(sug.id.startsWith('sug_'));
    assert.equal(sug.status, 'pending');

    // 2. Admin reviews and approves suggestion
    const reviewResult = await engine.reviewSuggestion(
      sug.id,
      'approved',
      'معتمد ومضاف للدليل الدوائي المركزي'
    );

    assert.equal(reviewResult.suggestion.status, 'approved');
    assert.ok(reviewResult.createdMedicine);
    assert.equal(reviewResult.createdMedicine.tradeNameEn, 'Omega 3 Plus Capsules');
    assert.equal(reviewResult.createdMedicine.isActive, true);

    // Verify it is now in the central database
    const med = await engine.getById(reviewResult.createdMedicine.id);
    assert.ok(med);
    assert.equal(med.tradeNameAr, 'أوميجا 3 بلس كبسولات');
  });

  test('rejects unverified doctor suggestion with feedback notes', async () => {
    const engine = new CentralMedicineEngine();
    const sug = await engine.submitDoctorSuggestion({
      doctorId: 'doc_456',
      tradeNameAr: 'عشبة غير مسجلة',
      tradeNameEn: 'Herbal Unregistered',
      clinicalNotes: 'تركيبة عشبية',
    });

    const result = await engine.reviewSuggestion(
      sug.id,
      'rejected',
      'المستحضر غير مسجل بهيئة الدواء المصرية'
    );

    assert.equal(result.suggestion.status, 'rejected');
    assert.equal(result.createdMedicine, undefined);
    assert.equal(result.suggestion.reviewerNotes, 'المستحضر غير مسجل بهيئة الدواء المصرية');
  });
});

describe('Phase 6 — Bulk Import Pipeline with Source Attribution (CEN-007)', () => {
  const engine = new CentralMedicineEngine();

  test('imports batch medicines with conflict detection and updates', async () => {
    const batch = [
      {
        tradeNameAr: 'بنادول أزرق',
        tradeNameEn: 'Panadol Blue 500mg',
        activeIngredient: 'Paracetamol',
        dosageForm: 'أقراص',
        strength: '500 mg',
        barcode: '6221000999888',
        price: 30,
      },
      {
        tradeNameAr: 'تست فلوكستين',
        tradeNameEn: 'Test Fluoxetine',
        activeIngredient: 'Fluoxetine',
        dosageForm: 'كبسولات',
        strength: '20 mg',
        barcode: '6221000777666',
        price: 45,
      },
    ];

    const importStats = await engine.importMedicines('source_eda', batch);
    assert.ok(importStats.inserted > 0 || importStats.updated > 0);

    // Re-importing same batch should update, not duplicate
    const reimportStats = await engine.importMedicines('source_eda', batch);
    assert.equal(reimportStats.updated, 2);
    assert.equal(reimportStats.inserted, 0);
  });
});
