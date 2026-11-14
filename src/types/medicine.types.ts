export type MedicineStatus = 'active' | 'inactive' | 'discontinued';

export interface Medicine {
  id: string;
  nameAr: string;
  nameEn: string;
  brandName?: string;
  genericName?: string;
  activeIngredient?: string;
  strength?: string;
  pharmaceuticalForm?: string;
  dosageForm?: string;
  concentration?: string;
  packageInfo?: string;
  manufacturer?: string;
  barcode?: string;
  price?: number;
  category?: string;
  routeOfAdministration?: string;
  status: MedicineStatus;
  version: number;
  source?: string;
  searchTokens?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomMedicine {
  id: string;
  doctorId: string;
  nameAr: string;
  nameEn: string;
  brandName?: string;
  activeIngredient?: string;
  strength?: string;
  dosageForm?: string;
  category?: string;
  barcode?: string;
  price?: number;
  defaultDosage?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
  notes?: string;
  isCustom: true;
  submittedForReview?: boolean;
  searchTokens?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CatalogMetadata {
  key: string;
  version: number;
  lastSyncAt: string;
  itemCount: number;
  checksum?: string;
}

export interface MedicineSearchQuery {
  term: string;
  category?: string;
  dosageForm?: string;
  barcode?: string;
  onlyCustom?: boolean;
  limit?: number;
}
