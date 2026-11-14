import type { PrescriptionMedicineItem } from '@/types/prescription.types';

export interface PaginatedPage {
  pageNumber: number;
  totalPages: number;
  items: PrescriptionMedicineItem[];
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface PaginationConfig {
  paperSize: 'A4' | 'A5' | 'CUSTOM';
  includeBackInstructionsPage?: boolean;
}

/**
 * Calculates page item capacity based on physical paper size and instruction length.
 */
export function calculateItemWeight(item: PrescriptionMedicineItem): number {
  let weight = 1.0;
  // Extra weight for multi-line clinical instructions
  if (item.instructions && item.instructions.length > 60) {
    weight += 0.5;
  }
  if (item.instructions && item.instructions.length > 120) {
    weight += 0.5;
  }
  // Extra weight for timing / custom remarks
  if (item.timing) {
    weight += 0.1;
  }
  return weight;
}

/**
 * Distributes prescription items across multiple pages to prevent physical overflow
 * and ensure no medicine item is cut across page boundaries.
 */
export function paginatePrescriptionItems(
  items: PrescriptionMedicineItem[] = [],
  paperSize: 'A4' | 'A5' | 'CUSTOM' = 'A5'
): PaginatedPage[] {
  const safeItems = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) {
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

  // Capacity thresholds based on physical mm dimensions
  // A5: Page 1 accommodates exactly 5 standard medicines without overflow (capacity 5.5)
  // A5: Continuation pages have compact header => capacity ~7.5
  // A4: Page 1 capacity ~8.5, continuation ~12
  const isA5 = paperSize === 'A5';
  const page1Capacity = isA5 ? 5.5 : 8.5;
  const continuationCapacity = isA5 ? 7.5 : 12.0;

  const pagesItems: PrescriptionMedicineItem[][] = [];
  let currentPageItems: PrescriptionMedicineItem[] = [];
  let currentAccumulatedWeight = 0;
  let currentPageIndex = 0;

  for (const item of safeItems) {
    const itemWeight = calculateItemWeight(item);
    const maxCapacity = currentPageIndex === 0 ? page1Capacity : continuationCapacity;

    if (currentAccumulatedWeight + itemWeight > maxCapacity && currentPageItems.length > 0) {
      // Push current page and start a new one
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
