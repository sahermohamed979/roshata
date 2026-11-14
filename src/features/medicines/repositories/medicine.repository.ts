import { db } from '@/lib/database/dexie';
import type { Medicine, CustomMedicine, MedicineSearchQuery } from '@/types/medicine.types';
import { normalizeArabicText, normalizeEnglishText, extractSearchTokens } from '../utils/arabic-normalizer';

export interface UnifiedMedicineResult {
  id: string;
  nameAr: string;
  nameEn: string;
  brandName?: string;
  activeIngredient?: string;
  strength?: string;
  dosageForm?: string;
  category?: string;
  barcode?: string;
  price?: number;
  manufacturer?: string;
  routeOfAdministration?: string;
  isCustom: boolean;
  notes?: string;
  defaultDosage?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
}

export class MedicineRepository {
  /**
   * Fast offline search across Global and Custom medicines with relevance ranking,
   * barcode lookup, category filtering, and active ingredient matching.
   */
  static async search(query: MedicineSearchQuery, doctorId = 'default-doctor'): Promise<UnifiedMedicineResult[]> {
    const rawTerm = (query.term || '').trim();
    const barcodeTerm = (query.barcode || '').trim();
    const category = query.category?.trim();
    const dosageForm = query.dosageForm?.trim();
    const limit = query.limit || 40;

    const normAr = normalizeArabicText(rawTerm);
    const normEn = normalizeEnglishText(rawTerm);
    const isBarcodeQuery = Boolean(barcodeTerm || /^\d{6,}$/.test(rawTerm));
    const cleanBarcode = barcodeTerm || (isBarcodeQuery ? rawTerm : '');

    // 1. Search custom medicines (Doctor-specific)
    const customMatches = await db.customMedicines
      .filter((m) => {
        if (m.doctorId !== doctorId && m.doctorId !== 'default-doctor') return false;

        if (category && category !== 'الكل' && category !== 'أدوية مخصصة') {
          if (!m.category?.includes(category.split(' ')[0])) return false;
        }

        if (dosageForm && dosageForm !== 'الكل') {
          if (!m.dosageForm?.includes(dosageForm)) return false;
        }

        // Direct barcode match
        if (cleanBarcode && m.barcode) {
          return m.barcode.includes(cleanBarcode);
        }

        if (!rawTerm) return true;

        const targetAr = normalizeArabicText(
          `${m.nameAr} ${m.brandName || ''} ${m.activeIngredient || ''}`
        );
        const targetEn = normalizeEnglishText(
          `${m.nameEn} ${m.brandName || ''} ${m.activeIngredient || ''}`
        );

        return (
          targetAr.includes(normAr) ||
          targetEn.includes(normEn) ||
          (m.barcode ? m.barcode.includes(rawTerm) : false)
        );
      })
      .limit(limit)
      .toArray();

    // 2. Search global catalog (Skip if onlyCustom is requested)
    let globalMatches: Medicine[] = [];
    if (!query.onlyCustom) {
      globalMatches = await db.medicines
        .filter((m) => {
          if (m.status === 'discontinued') return false;

          if (category && category !== 'الكل') {
            if (!m.category?.includes(category.split(' ')[0])) return false;
          }

          if (dosageForm && dosageForm !== 'الكل') {
            const form = m.dosageForm || m.pharmaceuticalForm;
            if (!form?.includes(dosageForm)) return false;
          }

          // Direct barcode match
          if (cleanBarcode && m.barcode) {
            return m.barcode.includes(cleanBarcode);
          }

          if (!rawTerm) return true;

          const targetAr = normalizeArabicText(
            `${m.nameAr} ${m.brandName || ''} ${m.activeIngredient || ''}`
          );
          const targetEn = normalizeEnglishText(
            `${m.nameEn} ${m.brandName || ''} ${m.activeIngredient || ''}`
          );

          return (
            targetAr.includes(normAr) ||
            targetEn.includes(normEn) ||
            (m.barcode ? m.barcode.includes(rawTerm) : false)
          );
        })
        .limit(limit)
        .toArray();
    }

    // 3. Map into unified structure
    const unifiedCustom: UnifiedMedicineResult[] = customMatches.map((c) => ({
      id: c.id,
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      brandName: c.brandName,
      activeIngredient: c.activeIngredient,
      strength: c.strength,
      dosageForm: c.dosageForm,
      category: c.category,
      barcode: c.barcode,
      price: c.price,
      isCustom: true,
      notes: c.notes,
      defaultDosage: c.defaultDosage,
      defaultFrequency: c.defaultFrequency,
      defaultDuration: c.defaultDuration,
    }));

    const unifiedGlobal: UnifiedMedicineResult[] = globalMatches.map((g) => ({
      id: g.id,
      nameAr: g.nameAr,
      nameEn: g.nameEn,
      brandName: g.brandName,
      activeIngredient: g.activeIngredient,
      strength: g.strength,
      dosageForm: g.dosageForm || g.pharmaceuticalForm,
      category: g.category,
      barcode: g.barcode,
      price: g.price,
      manufacturer: g.manufacturer,
      routeOfAdministration: g.routeOfAdministration,
      isCustom: false,
    }));

    // 4. Score and Rank Results by Relevance
    const combined = [...unifiedCustom, ...unifiedGlobal];

    if (!rawTerm && !cleanBarcode) {
      return combined.slice(0, limit);
    }

    const scored = combined.map((item) => {
      let score = 0;
      const lowerEn = (item.nameEn || '').toLowerCase();
      const lowerAr = normalizeArabicText(item.nameAr || '');
      const lowerBrand = (item.brandName || '').toLowerCase();
      const lowerActive = (item.activeIngredient || '').toLowerCase();

      // Custom medicines get a base boost
      if (item.isCustom) score += 5;

      // Barcode exact match
      if (cleanBarcode && item.barcode === cleanBarcode) score += 100;

      // Exact name matches
      if (lowerEn === normEn || lowerAr === normAr || lowerBrand === normEn) score += 80;

      // Prefix matches (user typing start of drug name)
      if (lowerEn.startsWith(normEn) || lowerAr.startsWith(normAr) || lowerBrand.startsWith(normEn)) {
        score += 50;
      }

      // Active ingredient matches
      if (lowerActive.includes(normEn) || lowerActive.includes(normAr)) {
        score += 30;
      }

      // Contains match
      if (lowerEn.includes(normEn) || lowerAr.includes(normAr)) {
        score += 15;
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item).slice(0, limit);
  }

  /**
   * Get single medicine by ID (checks custom first, then global)
   */
  static async getById(id: string): Promise<UnifiedMedicineResult | undefined> {
    const custom = await db.customMedicines.get(id);
    if (custom) {
      return {
        id: custom.id,
        nameAr: custom.nameAr,
        nameEn: custom.nameEn,
        brandName: custom.brandName,
        activeIngredient: custom.activeIngredient,
        strength: custom.strength,
        dosageForm: custom.dosageForm,
        category: custom.category,
        barcode: custom.barcode,
        price: custom.price,
        isCustom: true,
        notes: custom.notes,
        defaultDosage: custom.defaultDosage,
        defaultFrequency: custom.defaultFrequency,
        defaultDuration: custom.defaultDuration,
      };
    }

    const global = await db.medicines.get(id);
    if (global) {
      return {
        id: global.id,
        nameAr: global.nameAr,
        nameEn: global.nameEn,
        brandName: global.brandName,
        activeIngredient: global.activeIngredient,
        strength: global.strength,
        dosageForm: global.dosageForm || global.pharmaceuticalForm,
        category: global.category,
        barcode: global.barcode,
        price: global.price,
        manufacturer: global.manufacturer,
        routeOfAdministration: global.routeOfAdministration,
        isCustom: false,
      };
    }

    return undefined;
  }

  /**
   * Save a doctor-specific custom medicine into local IndexedDB
   */
  static async addCustomMedicine(
    dto: Omit<CustomMedicine, 'id' | 'isCustom' | 'searchTokens' | 'createdAt' | 'updatedAt'>
  ): Promise<CustomMedicine> {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const searchTokens = extractSearchTokens([
      dto.nameAr,
      dto.nameEn,
      dto.brandName,
      dto.activeIngredient,
      dto.barcode,
    ]);

    const record: CustomMedicine = {
      ...dto,
      id,
      isCustom: true,
      searchTokens,
      createdAt: now,
      updatedAt: now,
    };

    await db.customMedicines.add(record);
    return record;
  }

  /**
   * Update an existing custom medicine
   */
  static async updateCustomMedicine(
    id: string,
    updates: Partial<Omit<CustomMedicine, 'id' | 'isCustom' | 'createdAt'>>
  ): Promise<CustomMedicine> {
    const existing = await db.customMedicines.get(id);
    if (!existing) {
      throw new Error(`Custom medicine with id ${id} not found`);
    }

    const searchTokens = extractSearchTokens([
      updates.nameAr || existing.nameAr,
      updates.nameEn || existing.nameEn,
      updates.brandName || existing.brandName,
      updates.activeIngredient || existing.activeIngredient,
      updates.barcode || existing.barcode,
    ]);

    const updated: CustomMedicine = {
      ...existing,
      ...updates,
      searchTokens,
      updatedAt: new Date().toISOString(),
    };

    await db.customMedicines.put(updated);
    return updated;
  }

  /**
   * Delete a custom medicine
   */
  static async deleteCustomMedicine(id: string): Promise<void> {
    await db.customMedicines.delete(id);
  }

  /**
   * Get all custom medicines for a specific doctor
   */
  static async getDoctorCustomMedicines(doctorId = 'default-doctor'): Promise<CustomMedicine[]> {
    return db.customMedicines
      .filter((m) => m.doctorId === doctorId || m.doctorId === 'default-doctor')
      .reverse()
      .toArray();
  }

  /**
   * Bulk seed or update global catalog medicines (without touching custom medicines)
   */
  static async bulkUpsertGlobal(medicines: Medicine[]): Promise<number> {
    const recordsWithTokens = medicines.map((m) => ({
      ...m,
      searchTokens: extractSearchTokens([
        m.nameAr,
        m.nameEn,
        m.brandName,
        m.activeIngredient,
        m.barcode,
      ]),
    }));

    await db.medicines.bulkPut(recordsWithTokens);
    return recordsWithTokens.length;
  }

  /**
   * Total medicines count
   */
  static async getCounts(): Promise<{ global: number; custom: number }> {
    const [global, custom] = await Promise.all([
      db.medicines.count(),
      db.customMedicines.count(),
    ]);
    return { global, custom };
  }

  /**
   * Get all distinct categories
   */
  static async getCategories(): Promise<string[]> {
    const medicines = await db.medicines.toArray();
    const custom = await db.customMedicines.toArray();
    const set = new Set<string>();

    for (const m of medicines) {
      if (m.category) set.add(m.category);
    }
    for (const c of custom) {
      if (c.category) set.add(c.category);
    }

    return Array.from(set).sort();
  }
}
