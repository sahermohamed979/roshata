import { create } from 'zustand';
import type {
  Prescription,
  PrescriptionMedicineItem,
  PatientInfo,
  PrescriptionStatus,
} from '@/types/prescription.types';
import type { UnifiedMedicineResult } from '@/features/medicines/repositories/medicine.repository';
import { PrescriptionRepository } from '@/features/prescriptions/repositories/prescription.repository';

interface PrescriptionState {
  // Prescription Header & Metadata
  id: string;
  doctorId: string;
  templateId: string;
  patient: PatientInfo;
  diagnosis: string;
  notes: string;
  paperSize: 'A4' | 'A5' | 'CUSTOM';
  status: PrescriptionStatus;
  items: PrescriptionMedicineItem[];
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: string | null;

  // Actions
  setPatientInfo: (patient: Partial<PatientInfo>) => void;
  setDiagnosis: (diagnosis: string) => void;
  setNotes: (notes: string) => void;
  setTemplateId: (templateId: string) => void;
  setPaperSize: (paperSize: 'A4' | 'A5' | 'CUSTOM') => void;
  setStatus: (status: PrescriptionStatus) => void;

  // Item Management
  addMedicine: (medicine: UnifiedMedicineResult, defaults?: Partial<PrescriptionMedicineItem>) => void;
  updateItem: (id: string, updates: Partial<PrescriptionMedicineItem>) => void;
  removeItem: (id: string) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  duplicateItem: (id: string) => void;

  // Lifecycle & Persistence
  autoSaveDraft: () => Promise<void>;
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
  status: 'draft',
  items: [],
  isSaving: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,

  setPatientInfo: (updates) => {
    set((state) => ({
      patient: { ...state.patient, ...updates },
      hasUnsavedChanges: true,
    }));
  },

  setDiagnosis: (diagnosis) => set({ diagnosis, hasUnsavedChanges: true }),

  setNotes: (notes) => set({ notes, hasUnsavedChanges: true }),

  setTemplateId: (templateId) => set({ templateId, hasUnsavedChanges: true }),

  setPaperSize: (paperSize) => set({ paperSize, hasUnsavedChanges: true }),

  setStatus: (status) => set({ status, hasUnsavedChanges: true }),

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
      dosage: defaults.dosage || med.defaultDosage || 'قرص واحد',
      frequency: defaults.frequency || med.defaultFrequency || 'كل 8 ساعات (3 مرات يومياً)',
      duration: defaults.duration || med.defaultDuration || 'لمدة 5 أيام',
      timing: defaults.timing || 'بعد الأكل',
      route: defaults.route || med.routeOfAdministration || 'فموي',
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
      if (fromIndex < 0 || fromIndex >= state.items.length || toIndex < 0 || toIndex >= state.items.length) {
        return state;
      }
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

  autoSaveDraft: async () => {
    const s = get();
    // Only save if there is content
    if (!s.patient.name.trim() && s.items.length === 0) return;

    set({ isSaving: true });
    try {
      const record: Prescription = {
        id: s.id,
        doctorId: s.doctorId,
        templateId: s.templateId,
        patient: s.patient,
        diagnosis: s.diagnosis,
        notes: s.notes,
        items: s.items,
        paperSize: s.paperSize,
        status: s.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await PrescriptionRepository.save(record);
      set({ hasUnsavedChanges: false, isSaving: false, lastSavedAt: new Date().toLocaleTimeString('ar-EG') });
    } catch (err) {
      console.error('Failed to auto-save draft:', err);
      set({ isSaving: false });
    }
  },

  resetPrescription: () =>
    set({
      id: `rx_${Date.now()}`,
      patient: initialPatient,
      diagnosis: '',
      notes: '',
      items: [],
      status: 'draft',
      hasUnsavedChanges: false,
      lastSavedAt: null,
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
      status: rx.status,
      items: rx.items,
      hasUnsavedChanges: false,
      lastSavedAt: new Date(rx.updatedAt).toLocaleTimeString('ar-EG'),
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
      status: s.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
}));
