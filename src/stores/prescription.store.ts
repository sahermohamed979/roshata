import { create } from 'zustand';
import type { Prescription, PrescriptionMedicineItem, PatientInfo } from '@/types/prescription.types';
import type { UnifiedMedicineResult } from '@/features/medicines/repositories/medicine.repository';

interface PrescriptionState {
  // Prescription Header & Metadata
  id: string;
  doctorId: string;
  templateId: string;
  patient: PatientInfo;
  diagnosis: string;
  notes: string;
  paperSize: 'A4' | 'A5' | 'CUSTOM';
  items: PrescriptionMedicineItem[];
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  setPatientInfo: (patient: Partial<PatientInfo>) => void;
  setDiagnosis: (diagnosis: string) => void;
  setNotes: (notes: string) => void;
  setTemplateId: (templateId: string) => void;
  setPaperSize: (paperSize: 'A4' | 'A5' | 'CUSTOM') => void;

  // Item Management
  addMedicine: (medicine: UnifiedMedicineResult, defaults?: Partial<PrescriptionMedicineItem>) => void;
  updateItem: (id: string, updates: Partial<PrescriptionMedicineItem>) => void;
  removeItem: (id: string) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  duplicateItem: (id: string) => void;

  // Lifecycle
  resetPrescription: () => void;
  loadPrescription: (prescription: Prescription) => void;
  exportToRecord: () => Prescription;
}

const initialPatient: PatientInfo = {
  name: '',
  age: '',
  gender: 'MALE',
  phone: '',
  weight: '',
};

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  id: `rx_${Date.now()}`,
  doctorId: 'default-doctor',
  templateId: 'template_default',
  patient: initialPatient,
  diagnosis: '',
  notes: '',
  paperSize: 'A5',
  items: [],
  isSaving: false,
  hasUnsavedChanges: false,

  setPatientInfo: (updates) =>
    set((state) => ({
      patient: { ...state.patient, ...updates },
      hasUnsavedChanges: true,
    })),

  setDiagnosis: (diagnosis) => set({ diagnosis, hasUnsavedChanges: true }),

  setNotes: (notes) => set({ notes, hasUnsavedChanges: true }),

  setTemplateId: (templateId) => set({ templateId, hasUnsavedChanges: true }),

  setPaperSize: (paperSize) => set({ paperSize, hasUnsavedChanges: true }),

  addMedicine: (med, defaults = {}) => {
    const newItem: PrescriptionMedicineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      medicineId: med.id,
      isCustom: med.isCustom,
      nameSnapshotAr: med.nameAr,
      nameSnapshotEn: med.nameEn,
      strengthSnapshot: med.strength,
      dosageFormSnapshot: med.dosageForm,
      activeIngredientSnapshot: med.activeIngredient,
      dosage: defaults.dosage || 'قرص واحد',
      frequency: defaults.frequency || 'كل 8 ساعات (3 مرات يومياً)',
      duration: defaults.duration || 'لمدة 5 أيام',
      timing: defaults.timing || 'بعد الأكل',
      instructions: defaults.instructions || '',
      displayOrder: get().items.length + 1,
      ...defaults,
    };

    set((state) => ({
      items: [...state.items, newItem],
      hasUnsavedChanges: true,
    }));
  },

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      hasUnsavedChanges: true,
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items
        .filter((item) => item.id !== id)
        .map((item, idx) => ({ ...item, displayOrder: idx + 1 })),
      hasUnsavedChanges: true,
    })),

  moveItem: (fromIndex, toIndex) =>
    set((state) => {
      const items = [...state.items];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return {
        items: items.map((it, idx) => ({ ...it, displayOrder: idx + 1 })),
        hasUnsavedChanges: true,
      };
    }),

  duplicateItem: (id) => {
    const target = get().items.find((i) => i.id === id);
    if (!target) return;
    const duplicated: PrescriptionMedicineItem = {
      ...target,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      displayOrder: get().items.length + 1,
    };
    set((state) => ({
      items: [...state.items, duplicated],
      hasUnsavedChanges: true,
    }));
  },

  resetPrescription: () =>
    set({
      id: `rx_${Date.now()}`,
      patient: initialPatient,
      diagnosis: '',
      notes: '',
      items: [],
      hasUnsavedChanges: false,
    }),

  loadPrescription: (rx) =>
    set({
      id: rx.id,
      doctorId: rx.doctorId,
      templateId: rx.templateId || 'template_default',
      patient: rx.patient,
      diagnosis: rx.diagnosis || '',
      notes: rx.notes || '',
      paperSize: rx.paperSize,
      items: rx.items,
      hasUnsavedChanges: false,
    }),

  exportToRecord: (): Prescription => {
    const s = get();
    return {
      id: s.id,
      doctorId: s.doctorId,
      templateId: s.templateId,
      patient: s.patient,
      diagnosis: s.diagnosis,
      notes: s.notes,
      items: s.items,
      paperSize: s.paperSize,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
}));
