export type ChangeAction = 'create' | 'update' | 'deactivate';

export interface MedicineSource {
  id: string;
  name: string;
  code: string;
  description?: string;
  licensingInfo?: string;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CentralMedicine {
  id: string;
  tradeNameAr: string;
  tradeNameEn: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  category?: string;
  barcode?: string;
  edaRegistrationNo?: string;
  price?: number;
  manufacturer?: string;
  isActive: boolean;
  deactivationReason?: string;
  versionId: number;
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CentralMedicineInput {
  tradeNameAr: string;
  tradeNameEn: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  category?: string;
  barcode?: string;
  edaRegistrationNo?: string;
  price?: number;
  manufacturer?: string;
  sourceId?: string;
}

export interface MedicineVersion {
  versionNumber: number;
  previousVersion?: number;
  releaseNotes?: string;
  changesCount: number;
  checksum: string;
  publishedBy: string;
  publishedAt: string;
}

export interface MedicineChange {
  id: string;
  versionNumber: number;
  action: ChangeAction;
  medicineId: string;
  deltaPayload: Partial<CentralMedicine>;
  createdAt: string;
}

export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface DoctorMedicineSuggestion {
  id: string;
  doctorId: string;
  doctorName?: string;
  clinicName?: string;
  tradeNameAr: string;
  tradeNameEn: string;
  activeIngredient?: string;
  dosageForm?: string;
  strength?: string;
  barcode?: string;
  clinicalNotes?: string;
  status: SuggestionStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface SyncManifest {
  version: number;
  previousVersion?: number;
  updatedAt: string;
  changesAvailable: boolean;
  changesCount: number;
  totalMedicines: number;
  checksum: string;
}

export interface SyncChangesResponse {
  version: number;
  sinceVersion: number;
  changesCount: number;
  changes: MedicineChange[];
}

export interface SyncSnapshotResponse {
  version: number;
  totalCount: number;
  generatedAt: string;
  medicines: CentralMedicine[];
}
