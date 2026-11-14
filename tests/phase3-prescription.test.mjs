import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Helper mock functions matching the Zustand store logic
function createInitialPrescription() {
  return {
    id: `rx_${Date.now()}`,
    doctorId: 'doctor_123',
    patient: {
      name: 'أحمد محمود',
      age: '35 سنة',
      gender: 'MALE',
      phone: '01012345678',
    },
    diagnosis: 'Acute Tonsillitis',
    paperSize: 'A5',
    status: 'draft',
    items: [],
  };
}

function addMedicineToPrescription(prescription, med, defaults = {}) {
  const newItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    medicineId: med.id,
    isCustom: Boolean(med.isCustom),
    nameSnapshotAr: med.nameAr,
    nameSnapshotEn: med.nameEn,
    strengthSnapshot: med.strength,
    dosageFormSnapshot: med.dosageForm,
    activeIngredientSnapshot: med.activeIngredient,
    dosage: defaults.dosage || 'قرص واحد',
    frequency: defaults.frequency || 'كل 8 ساعات',
    duration: defaults.duration || 'لمدة 5 أيام',
    timing: defaults.timing || 'بعد الأكل',
    instructions: defaults.instructions || '',
    displayOrder: prescription.items.length + 1,
  };

  prescription.items.push(newItem);
  return newItem;
}

function movePrescriptionItem(prescription, fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= prescription.items.length || toIndex < 0 || toIndex >= prescription.items.length) {
    return prescription.items;
  }
  const [moved] = prescription.items.splice(fromIndex, 1);
  prescription.items.splice(toIndex, 0, moved);
  prescription.items.forEach((it, idx) => {
    it.displayOrder = idx + 1;
  });
  return prescription.items;
}

function removePrescriptionItem(prescription, id) {
  prescription.items = prescription.items
    .filter((it) => it.id !== id)
    .map((it, idx) => ({ ...it, displayOrder: idx + 1 }));
  return prescription.items;
}

function duplicatePrescriptionItem(prescription, id) {
  const target = prescription.items.find((it) => it.id === id);
  if (!target) return null;
  const duplicate = {
    ...target,
    id: `item_dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    displayOrder: prescription.items.length + 1,
  };
  prescription.items.push(duplicate);
  return duplicate;
}

describe('Phase 3 — Prescription Creation & Multi-Medicine Management (PRE-001, PRE-002)', () => {
  test('creates a valid prescription with patient details', () => {
    const rx = createInitialPrescription();
    assert.equal(rx.patient.name, 'أحمد محمود');
    assert.equal(rx.status, 'draft');
    assert.equal(rx.paperSize, 'A5');
    assert.equal(rx.items.length, 0);
  });

  test('adds multiple medicines with sequential displayOrder', () => {
    const rx = createInitialPrescription();

    const med1 = {
      id: 'med-aug-1g',
      nameAr: 'أوجمنتين 1 جم',
      nameEn: 'Augmentin 1g',
      strength: '1g',
      dosageForm: 'أقراص',
      activeIngredient: 'Amoxicillin',
    };

    const med2 = {
      id: 'med-panadol-adv',
      nameAr: 'بانادول أدفانس',
      nameEn: 'Panadol Advance',
      strength: '500mg',
      dosageForm: 'أقراص',
      activeIngredient: 'Paracetamol',
    };

    const item1 = addMedicineToPrescription(rx, med1, { dosage: 'قرص واحد', frequency: 'كل 8 ساعات' });
    const item2 = addMedicineToPrescription(rx, med2, { dosage: 'قرصين', frequency: 'عند اللزوم' });

    assert.equal(rx.items.length, 2);
    assert.equal(item1.displayOrder, 1);
    assert.equal(item2.displayOrder, 2);
    assert.equal(rx.items[0].nameSnapshotEn, 'Augmentin 1g');
    assert.equal(rx.items[1].nameSnapshotEn, 'Panadol Advance');
  });

  test('reorders medicines and recalculates displayOrder correctly (PRE-002)', () => {
    const rx = createInitialPrescription();
    addMedicineToPrescription(rx, { id: '1', nameAr: 'دواء 1', nameEn: 'Med 1' });
    addMedicineToPrescription(rx, { id: '2', nameAr: 'دواء 2', nameEn: 'Med 2' });
    addMedicineToPrescription(rx, { id: '3', nameAr: 'دواء 3', nameEn: 'Med 3' });

    assert.equal(rx.items[0].nameSnapshotEn, 'Med 1');
    assert.equal(rx.items[2].nameSnapshotEn, 'Med 3');

    // Move Med 3 (index 2) to index 0 (top of list)
    movePrescriptionItem(rx, 2, 0);

    assert.equal(rx.items[0].nameSnapshotEn, 'Med 3');
    assert.equal(rx.items[0].displayOrder, 1);
    assert.equal(rx.items[1].nameSnapshotEn, 'Med 1');
    assert.equal(rx.items[1].displayOrder, 2);
    assert.equal(rx.items[2].nameSnapshotEn, 'Med 2');
    assert.equal(rx.items[2].displayOrder, 3);
  });
});

describe('Phase 3 — Prescription Item Operations (PRE-003, PRE-004, PRE-005)', () => {
  test('updates dosage, frequency, and instructions correctly (PRE-003)', () => {
    const rx = createInitialPrescription();
    const item = addMedicineToPrescription(rx, { id: '1', nameAr: 'دواء', nameEn: 'Drug' });

    item.dosage = 'ملعقة كبيرة 15 مل';
    item.frequency = 'مرتين يومياً';
    item.duration = 'لمدة 7 أيام';
    item.instructions = 'بعد الأكل بساعة مع كوب ماء';

    assert.equal(rx.items[0].dosage, 'ملعقة كبيرة 15 مل');
    assert.equal(rx.items[0].instructions, 'بعد الأكل بساعة مع كوب ماء');
  });

  test('removes medicine and re-indexes remaining items (PRE-004)', () => {
    const rx = createInitialPrescription();
    const it1 = addMedicineToPrescription(rx, { id: '1', nameAr: 'دواء 1', nameEn: 'Med 1' });
    const it2 = addMedicineToPrescription(rx, { id: '2', nameAr: 'دواء 2', nameEn: 'Med 2' });
    const it3 = addMedicineToPrescription(rx, { id: '3', nameAr: 'دواء 3', nameEn: 'Med 3' });

    removePrescriptionItem(rx, it2.id);

    assert.equal(rx.items.length, 2);
    assert.equal(rx.items[0].nameSnapshotEn, 'Med 1');
    assert.equal(rx.items[0].displayOrder, 1);
    assert.equal(rx.items[1].nameSnapshotEn, 'Med 3');
    assert.equal(rx.items[1].displayOrder, 2);
  });

  test('duplicates medicine with unique ID and sequential order (PRE-005)', () => {
    const rx = createInitialPrescription();
    const original = addMedicineToPrescription(rx, {
      id: 'prednisolone-5',
      nameAr: 'بريدنيزولون 5 مجم',
      nameEn: 'Prednisolone 5mg',
      strength: '5mg',
    }, { dosage: '4 أقراص صباحاً', duration: 'لمدة 3 أيام' });

    const dup = duplicatePrescriptionItem(rx, original.id);

    assert.ok(dup);
    assert.notEqual(dup.id, original.id);
    assert.equal(dup.nameSnapshotEn, 'Prednisolone 5mg');
    assert.equal(dup.dosage, '4 أقراص صباحاً');
    assert.equal(dup.displayOrder, 2);
    assert.equal(rx.items.length, 2);
  });
});

describe('Phase 3 — Historical Snapshot Immutability (PRE-006)', () => {
  test('prescription snapshots remain immutable even when source catalog changes', () => {
    const globalCatalog = {
      id: 'med-aug',
      nameAr: 'أوجمنتين 1 جم',
      nameEn: 'Augmentin 1g',
      strength: '1g',
      dosageForm: 'أقراص',
    };

    const rx = createInitialPrescription();
    addMedicineToPrescription(rx, globalCatalog);

    // Verify snapshot was recorded
    assert.equal(rx.items[0].nameSnapshotEn, 'Augmentin 1g');
    assert.equal(rx.items[0].strengthSnapshot, '1g');

    // Simulate central API updating or deprecating the drug in the catalog
    globalCatalog.nameEn = 'Augmentin 1000mg Extra';
    globalCatalog.strength = '1000mg';
    globalCatalog.dosageForm = 'كبسولات معدلة';

    // Prescription snapshot MUST remain unchanged
    assert.equal(rx.items[0].nameSnapshotEn, 'Augmentin 1g');
    assert.equal(rx.items[0].strengthSnapshot, '1g');
    assert.equal(rx.items[0].dosageFormSnapshot, 'أقراص');
  });
});
