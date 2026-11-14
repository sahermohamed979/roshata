import Dexie, { type EntityTable } from 'dexie';
import type { Medicine, CustomMedicine, CatalogMetadata } from '@/types/medicine.types';
import type { Prescription } from '@/types/prescription.types';
import type { PrescriptionTemplate } from '@/types/template.types';

export class RoshtehDB extends Dexie {
  medicines!: EntityTable<Medicine, 'id'>;
  customMedicines!: EntityTable<CustomMedicine, 'id'>;
  prescriptions!: EntityTable<Prescription, 'id'>;
  templates!: EntityTable<PrescriptionTemplate, 'id'>;
  catalogMeta!: EntityTable<CatalogMetadata, 'key'>;

  constructor() {
    super('RoshtehMedicalDB');

    // Schema definition with versioning
    this.version(1).stores({
      medicines: 'id, nameAr, nameEn, brandName, activeIngredient, category, status, version, *searchTokens',
      customMedicines: 'id, doctorId, nameAr, nameEn, brandName, activeIngredient, *searchTokens',
      prescriptions: 'id, doctorId, status, createdAt, updatedAt',
      templates: 'id, doctorId, isDefault, name',
      catalogMeta: 'key, version',
    });

    // Version 2: Added barcode indexes for hardware scanning and direct lookup
    this.version(2).stores({
      medicines: 'id, nameAr, nameEn, brandName, activeIngredient, barcode, category, status, version, *searchTokens',
      customMedicines: 'id, doctorId, nameAr, nameEn, brandName, activeIngredient, barcode, *searchTokens',
    });
  }
}

// Global database instance singleton
export const db = new RoshtehDB();
