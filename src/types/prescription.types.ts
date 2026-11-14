export type PrescriptionStatus = 'draft' | 'completed' | 'archived';

export interface PrescriptionMedicineItem {
  id: string;
  medicineId: string;
  isCustom: boolean;
  
  // Snapshots to ensure prescription immutability over time
  nameSnapshotAr: string;
  nameSnapshotEn: string;
  strengthSnapshot?: string;
  dosageFormSnapshot?: string;
  activeIngredientSnapshot?: string;

  // Clinical directions
  dosage: string;                // e.g. "1 قرص" / "5 ml"
  frequency: string;             // e.g. "كل 8 ساعات" / "مرتين يومياً"
  duration: string;              // e.g. "لمدة 5 أيام" / "أسبوع"
  timing?: string;                // e.g. "بعد الأكل" / "على الريق"
  route?: string;                // e.g. "عن طريق الفم" / "موضعي"
  instructions?: string;         // free-text clinical instructions
  quantity?: string;             // e.g. "علبة واحدة"
  displayOrder: number;
}

export interface PatientInfo {
  id?: string;
  name: string;
  age?: number | string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  weight?: number | string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  templateId?: string;
  prescriptionNumber?: string;
  
  patient: PatientInfo;
  diagnosis?: string;
  notes?: string;
  instructionsList?: string[];
  items: PrescriptionMedicineItem[];

  paperSize: 'A4' | 'A5' | 'CUSTOM';
  status: PrescriptionStatus;
  createdAt: string;
  updatedAt: string;
}
