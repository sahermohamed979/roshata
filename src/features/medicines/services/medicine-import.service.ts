import { MedicineRepository } from '../repositories/medicine.repository';
import { medicineBaseSchema } from '../schemas/medicine.schema';
import type { Medicine } from '@/types/medicine.types';
import { db } from '@/lib/database/dexie';

export interface ImportResult {
  success: boolean;
  totalParsed: number;
  importedCount: number;
  errors: { row: number; reason: string }[];
  durationMs: number;
}

export class MedicineImportService {
  /**
   * Import medicines from a JSON string or object array.
   */
  static async importFromJson(jsonContent: string | Record<string, unknown>[]): Promise<ImportResult> {
    const startTime = Date.now();
    const errors: { row: number; reason: string }[] = [];
    const validMedicines: Medicine[] = [];

    let rawList: unknown[];
    try {
      if (typeof jsonContent === 'string') {
        const parsed = JSON.parse(jsonContent);
        rawList = Array.isArray(parsed) ? parsed : (parsed.medicines || parsed.data || []);
      } else {
        rawList = jsonContent;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON content';
      return {
        success: false,
        totalParsed: 0,
        importedCount: 0,
        errors: [{ row: 0, reason: `JSON syntax error: ${message}` }],
        durationMs: Date.now() - startTime,
      };
    }

    const now = new Date().toISOString();

    for (let i = 0; i < rawList.length; i++) {
      const row = rawList[i];
      const validation = medicineBaseSchema.safeParse(row);

      if (!validation.success) {
        errors.push({
          row: i + 1,
          reason: validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        });
        continue;
      }

      const item = validation.data;
      const id = (row as { id?: string }).id || `med_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;

      validMedicines.push({
        ...item,
        id,
        status: 'active',
        version: (row as { version?: number }).version || 1,
        source: (row as { source?: string }).source || 'import_pipeline',
        createdAt: (row as { createdAt?: string }).createdAt || now,
        updatedAt: now,
      });
    }

    if (validMedicines.length > 0) {
      await MedicineRepository.bulkUpsertGlobal(validMedicines);

      // Update Catalog Metadata
      const currentMeta = await db.catalogMeta.get('global_catalog_v1');
      const nextVersion = (currentMeta?.version || 1) + 1;
      const totalCount = await db.medicines.count();

      await db.catalogMeta.put({
        key: 'global_catalog_v1',
        version: nextVersion,
        lastSyncAt: now,
        itemCount: totalCount,
      });
    }

    return {
      success: errors.length === 0,
      totalParsed: rawList.length,
      importedCount: validMedicines.length,
      errors,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Import medicines from a CSV string.
   * Expected columns: nameAr, nameEn, brandName, activeIngredient, strength, dosageForm, category, barcode, price, manufacturer
   */
  static async importFromCsv(csvContent: string): Promise<ImportResult> {
    const startTime = Date.now();
    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length === 0) {
      return {
        success: false,
        totalParsed: 0,
        importedCount: 0,
        errors: [{ row: 0, reason: 'Empty CSV file' }],
        durationMs: Date.now() - startTime,
      };
    }

    const header = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV splitter respecting quotes
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const rowObj: Record<string, unknown> = {};

      header.forEach((key, colIdx) => {
        let val = (values[colIdx] || '').trim().replace(/^["']|["']$/g, '');
        if (key === 'price') {
          const num = parseFloat(val);
          rowObj[key] = isNaN(num) ? undefined : num;
        } else {
          rowObj[key] = val || undefined;
        }
      });

      rows.push(rowObj);
    }

    return this.importFromJson(rows);
  }
}
