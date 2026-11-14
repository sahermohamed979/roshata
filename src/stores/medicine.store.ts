import { create } from 'zustand';
import { MedicineRepository, type UnifiedMedicineResult } from '@/features/medicines/repositories/medicine.repository';

interface MedicineSearchState {
  searchTerm: string;
  results: UnifiedMedicineResult[];
  isSearching: boolean;
  totalGlobalCount: number;
  totalCustomCount: number;
  selectedMedicine: UnifiedMedicineResult | null;

  setSearchTerm: (term: string) => void;
  executeSearch: (term: string) => Promise<void>;
  setSelectedMedicine: (med: UnifiedMedicineResult | null) => void;
  refreshCounts: () => Promise<void>;
  clearSearch: () => void;
}

export const useMedicineStore = create<MedicineSearchState>((set, get) => ({
  searchTerm: '',
  results: [],
  isSearching: false,
  totalGlobalCount: 0,
  totalCustomCount: 0,
  selectedMedicine: null,

  setSearchTerm: (term) => {
    set({ searchTerm: term });
    get().executeSearch(term);
  },

  executeSearch: async (term) => {
    if (!term || term.trim().length === 0) {
      set({ results: [], isSearching: false });
      return;
    }

    set({ isSearching: true });
    try {
      const results = await MedicineRepository.search({ term, limit: 25 });
      set({ results, isSearching: false });
    } catch (err) {
      console.error('Error executing medicine search:', err);
      set({ results: [], isSearching: false });
    }
  },

  setSelectedMedicine: (med) => set({ selectedMedicine: med }),

  refreshCounts: async () => {
    try {
      const counts = await MedicineRepository.getCounts();
      set({ totalGlobalCount: counts.global, totalCustomCount: counts.custom });
    } catch {}
  },

  clearSearch: () => set({ searchTerm: '', results: [], selectedMedicine: null }),
}));
