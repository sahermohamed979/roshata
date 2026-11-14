import { Pool } from 'pg';
import type {
  CentralMedicine,
  MedicineSource,
  MedicineVersion,
  MedicineChange,
  DoctorMedicineSuggestion,
  CentralMedicineInput,
} from '@/types/central-backend.types';
import { INITIAL_EGYPTIAN_MEDICINES } from '@/lib/database/seeds/egyptian-medicines.seed';

let pgPool: Pool | null = null;

function getPgPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }

  if (!pgPool) {
    pgPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  return pgPool;
}

// In-Memory Fallback Store (Ensures full functionality when DATABASE_URL is not yet connected)
class CentralMemoryStore {
  sources: Map<string, MedicineSource> = new Map();
  medicines: Map<string, CentralMedicine> = new Map();
  versions: Map<number, MedicineVersion> = new Map();
  changes: MedicineChange[] = [];
  suggestions: Map<string, DoctorMedicineSuggestion> = new Map();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    // 1. Initial official source: Egyptian Drug Authority (EDA)
    const edaSource: MedicineSource = {
      id: 'source_eda',
      name: 'هيئة الدواء المصرية (Egyptian Drug Authority)',
      code: 'EDA_MOH',
      description: 'الدليل الدوائي الرسمي المصري والتسعيرة الجبرية',
      licensingInfo: 'EDA Public Regulatory Formulary',
      isOfficial: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sources.set(edaSource.id, edaSource);

    // 2. Initial Version 1
    const v1: MedicineVersion = {
      versionNumber: 1,
      releaseNotes: 'الإصدار الأولي لقاعدة أدوية جمهورية مصر العربية',
      changesCount: INITIAL_EGYPTIAN_MEDICINES.length,
      checksum: 'chk_v1_initial_bootstrap',
      publishedBy: 'system',
      publishedAt: new Date().toISOString(),
    };
    this.versions.set(1, v1);

    // 3. Seed Central Medicines
    INITIAL_EGYPTIAN_MEDICINES.forEach((m, idx) => {
      const centralMed: CentralMedicine = {
        id: m.id || `med_central_${idx + 1}`,
        tradeNameAr: m.nameAr,
        tradeNameEn: m.nameEn,
        activeIngredient: m.activeIngredient || 'مادة فعالة',
        dosageForm: m.dosageForm || m.pharmaceuticalForm || 'أقراص',
        strength: m.strength || m.concentration || 'معياري',
        category: m.category,
        barcode: m.barcode,
        price: m.price || 45.0,
        manufacturer: m.manufacturer || 'Pharma Egypt',
        isActive: true,
        versionId: 1,
        sourceId: edaSource.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.medicines.set(centralMed.id, centralMed);
    });

    this.initialized = true;
  }
}

const memoryStore = new CentralMemoryStore();

export const CentralDB = {
  isPostgresConnected(): boolean {
    return !!getPgPool();
  },

  async getPool(): Promise<Pool | null> {
    return getPgPool();
  },

  getMemoryStore(): CentralMemoryStore {
    return memoryStore;
  },
};
