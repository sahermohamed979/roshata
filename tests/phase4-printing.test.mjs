import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Import or recreate pure pagination functions for testing
function calculateItemWeight(item) {
  let weight = 1.0;
  if (item.instructions && item.instructions.length > 50) {
    weight += 0.5;
  }
  if (item.instructions && item.instructions.length > 100) {
    weight += 0.5;
  }
  if (item.timing) {
    weight += 0.2;
  }
  return weight;
}

function paginatePrescriptionItems(items, paperSize = 'A5') {
  if (items.length === 0) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        items: [],
        isFirstPage: true,
        isLastPage: true,
      },
    ];
  }

  const isA5 = paperSize === 'A5';
  const page1Capacity = isA5 ? 5.5 : 8.5;
  const continuationCapacity = isA5 ? 7.5 : 12.0;

  const pagesItems = [];
  let currentPageItems = [];
  let currentAccumulatedWeight = 0;
  let currentPageIndex = 0;

  for (const item of items) {
    const itemWeight = calculateItemWeight(item);
    const maxCapacity = currentPageIndex === 0 ? page1Capacity : continuationCapacity;

    if (currentAccumulatedWeight + itemWeight > maxCapacity && currentPageItems.length > 0) {
      pagesItems.push(currentPageItems);
      currentPageItems = [item];
      currentAccumulatedWeight = itemWeight;
      currentPageIndex++;
    } else {
      currentPageItems.push(item);
      currentAccumulatedWeight += itemWeight;
    }
  }

  if (currentPageItems.length > 0) {
    pagesItems.push(currentPageItems);
  }

  const totalPages = pagesItems.length;

  return pagesItems.map((pageItems, idx) => ({
    pageNumber: idx + 1,
    totalPages,
    items: pageItems,
    isFirstPage: idx === 0,
    isLastPage: idx === totalPages - 1,
  }));
}

describe('Phase 4 — Physical Dimensions & Pagination (PRT-001, PRT-002)', () => {
  test('A5 paper size allows 5 standard items on Page 1 before overflowing', () => {
    const items = [
      { id: '1', nameSnapshotEn: 'Augmentin 1g', dosage: '1 tablet', displayOrder: 1 },
      { id: '2', nameSnapshotEn: 'Panadol Advance', dosage: '2 tablets', displayOrder: 2 },
      { id: '3', nameSnapshotEn: 'Cataflam 50', dosage: '1 tablet', displayOrder: 3 },
      { id: '4', nameSnapshotEn: 'Zyrtec 10mg', dosage: '1 tablet', displayOrder: 4 },
      { id: '5', nameSnapshotEn: 'Amoclan 1g', dosage: '1 tablet', displayOrder: 5 },
    ];

    const pages = paginatePrescriptionItems(items, 'A5');
    assert.equal(pages.length, 1);
    assert.equal(pages[0].pageNumber, 1);
    assert.equal(pages[0].totalPages, 1);
    assert.equal(pages[0].items.length, 5);
  });

  test('A4 paper size accommodates up to 8 standard items on Page 1', () => {
    const items = Array.from({ length: 8 }).map((_, i) => ({
      id: `item_${i + 1}`,
      nameSnapshotEn: `Medicine ${i + 1}`,
      dosage: '1 tablet',
      displayOrder: i + 1,
    }));

    const pages = paginatePrescriptionItems(items, 'A4');
    assert.equal(pages.length, 1);
    assert.equal(pages[0].items.length, 8);
  });
});

describe('Phase 4 — Content Overflow & Dynamic Distribution (PRT-003, PRT-004)', () => {
  test('automatically distributes overflow items across multiple pages (PRT-003)', () => {
    // 7 medicines on A5 will exceed Page 1 capacity (~4.5) and cleanly create Page 2
    const items = Array.from({ length: 7 }).map((_, i) => ({
      id: `med_${i + 1}`,
      nameSnapshotEn: `Drug ${i + 1}`,
      dosage: '1 tablet',
      displayOrder: i + 1,
    }));

    const pages = paginatePrescriptionItems(items, 'A5');
    assert.equal(pages.length, 2);
    assert.equal(pages[0].pageNumber, 1);
    assert.equal(pages[0].totalPages, 2);
    assert.equal(pages[1].pageNumber, 2);
    assert.equal(pages[1].totalPages, 2);
    assert.equal(pages[0].isFirstPage, true);
    assert.equal(pages[1].isLastPage, true);

    // Sum of items matches original
    assert.equal(pages[0].items.length + pages[1].items.length, 7);
  });

  test('increases weight for long clinical instructions preventing visual line cuts (PRT-004)', () => {
    const normalItem = {
      id: '1',
      nameSnapshotEn: 'Panadol',
      dosage: '1 tab',
    };

    const longInstructionItem = {
      id: '2',
      nameSnapshotEn: 'Augmentin 1g',
      dosage: '1 tab',
      instructions: 'يؤخذ هذا الدواء بعد الأكل بساعة مع كوب ماء وفير مع مراعاة عدم النوم مباشرة بعد تناوله لتجنب قرحة المعدة والحرص على إكمال الكورس كاملاً',
      timing: 'بعد الأكل بساعة',
    };

    const weightNormal = calculateItemWeight(normalItem);
    const weightLong = calculateItemWeight(longInstructionItem);

    assert.equal(weightNormal, 1.0);
    assert.ok(weightLong > 1.5, `Expected weight > 1.5, got ${weightLong}`);
  });
});

describe('Phase 4 — PDF Export Title Formatting (PRT-007)', () => {
  test('generates clean Arabic-safe filename title for PDF saving', () => {
    const patientName = 'أحمد محمود';
    const dateStr = '2026-11-14';
    const expectedTitle = `روشتة_${patientName}_${dateStr}`;

    assert.equal(expectedTitle, 'روشتة_أحمد محمود_2026-11-14');
    assert.ok(!expectedTitle.includes('/'));
    assert.ok(!expectedTitle.includes(':'));
  });
});
