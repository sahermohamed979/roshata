import { CentralDB } from '../db/central-db';
import type {
  CentralMedicine,
  CentralMedicineInput,
  MedicineVersion,
  MedicineChange,
  DoctorMedicineSuggestion,
  SyncManifest,
  SyncChangesResponse,
  SyncSnapshotResponse,
  SuggestionStatus,
} from '@/types/central-backend.types';

export class CentralMedicineService {
  /**
   * List central medicines with filtering & pagination
   */
  static async listMedicines(params: {
    search?: string;
    category?: string;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ medicines: CentralMedicine[]; total: number; page: number; limit: number }> {
    const store = CentralDB.getMemoryStore();
    let all = Array.from(store.medicines.values());

    if (params.activeOnly !== false) {
      all = all.filter((m) => m.isActive);
    }

    if (params.category && params.category !== 'all') {
      all = all.filter((m) => m.category === params.category);
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      all = all.filter(
        (m) =>
          m.tradeNameAr.toLowerCase().includes(q) ||
          m.tradeNameEn.toLowerCase().includes(q) ||
          m.activeIngredient.toLowerCase().includes(q) ||
          (m.barcode && m.barcode.includes(q))
      );
    }

    // Sort by latest update first
    all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const total = all.length;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginated = all.slice(startIndex, startIndex + limit);

    return {
      medicines: paginated,
      total,
      page,
      limit,
    };
  }

  /**
   * Get single central medicine by ID
   */
  static async getById(id: string): Promise<CentralMedicine | null> {
    const store = CentralDB.getMemoryStore();
    return store.medicines.get(id) || null;
  }

  /**
   * Create a new central medicine
   */
  static async createMedicine(
    input: CentralMedicineInput,
    adminId = 'admin'
  ): Promise<CentralMedicine> {
    const store = CentralDB.getMemoryStore();
    const currentVersion = this.getLatestVersionNumber();

    const id = `med_c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newMed: CentralMedicine = {
      id,
      tradeNameAr: input.tradeNameAr.trim(),
      tradeNameEn: input.tradeNameEn.trim(),
      activeIngredient: input.activeIngredient.trim(),
      dosageForm: input.dosageForm.trim(),
      strength: input.strength.trim(),
      category: input.category || 'عام',
      barcode: input.barcode?.trim(),
      edaRegistrationNo: input.edaRegistrationNo?.trim(),
      price: input.price,
      manufacturer: input.manufacturer?.trim(),
      isActive: true,
      versionId: currentVersion,
      sourceId: input.sourceId || 'source_eda',
      createdAt: now,
      updatedAt: now,
    };

    store.medicines.set(id, newMed);

    // Record change (pending for next version publication)
    const change: MedicineChange = {
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      versionNumber: currentVersion + 1, // queued for next published version
      action: 'create',
      medicineId: id,
      deltaPayload: { ...newMed },
      createdAt: now,
    };
    store.changes.push(change);

    return newMed;
  }

  /**
   * Update an existing central medicine
   */
  static async updateMedicine(
    id: string,
    updates: Partial<CentralMedicineInput>,
    adminId = 'admin'
  ): Promise<CentralMedicine> {
    const store = CentralDB.getMemoryStore();
    const existing = store.medicines.get(id);
    if (!existing) {
      throw new Error(`Medicine with ID ${id} not found.`);
    }

    const currentVersion = this.getLatestVersionNumber();
    const now = new Date().toISOString();

    const updated: CentralMedicine = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    store.medicines.set(id, updated);

    // Record update change
    const change: MedicineChange = {
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      versionNumber: currentVersion + 1,
      action: 'update',
      medicineId: id,
      deltaPayload: updates,
      createdAt: now,
    };
    store.changes.push(change);

    return updated;
  }

  /**
   * Deactivate a medicine
   */
  static async deactivateMedicine(
    id: string,
    reason: string,
    adminId = 'admin'
  ): Promise<CentralMedicine> {
    const store = CentralDB.getMemoryStore();
    const existing = store.medicines.get(id);
    if (!existing) {
      throw new Error(`Medicine with ID ${id} not found.`);
    }

    const currentVersion = this.getLatestVersionNumber();
    const now = new Date().toISOString();

    const deactivated: CentralMedicine = {
      ...existing,
      isActive: false,
      deactivationReason: reason,
      updatedAt: now,
    };

    store.medicines.set(id, deactivated);

    // Record deactivation change
    const change: MedicineChange = {
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      versionNumber: currentVersion + 1,
      action: 'deactivate',
      medicineId: id,
      deltaPayload: { isActive: false, deactivationReason: reason },
      createdAt: now,
    };
    store.changes.push(change);

    return deactivated;
  }

  /**
   * Publish a new database version (Binds all pending changes to the new version)
   */
  static async publishVersion(
    releaseNotes = 'تحديث دوري لقائمة الأدوية المركزية',
    publishedBy = 'admin'
  ): Promise<MedicineVersion> {
    const store = CentralDB.getMemoryStore();
    const latestNum = this.getLatestVersionNumber();
    const newVersionNum = latestNum + 1;

    // Stamp all changes designated for newVersionNum
    const versionChanges = store.changes.filter(
      (c) => c.versionNumber === newVersionNum || !c.versionNumber
    );

    versionChanges.forEach((c) => {
      c.versionNumber = newVersionNum;
    });

    const versionRecord: MedicineVersion = {
      versionNumber: newVersionNum,
      previousVersion: latestNum,
      releaseNotes,
      changesCount: versionChanges.length,
      checksum: `chk_v${newVersionNum}_${Date.now().toString(36)}`,
      publishedBy,
      publishedAt: new Date().toISOString(),
    };

    store.versions.set(newVersionNum, versionRecord);
    return versionRecord;
  }

  /**
   * Get Sync Manifest
   */
  static async getManifest(clientCurrentVersion?: number): Promise<SyncManifest> {
    const store = CentralDB.getMemoryStore();
    const latestVersion = this.getLatestVersionRecord();
    const currentVersionNum = latestVersion.versionNumber;

    const totalMedicines = Array.from(store.medicines.values()).filter((m) => m.isActive).length;

    const clientVer = clientCurrentVersion || 0;
    const pendingChanges = store.changes.filter((c) => c.versionNumber > clientVer);

    return {
      version: currentVersionNum,
      previousVersion: latestVersion.previousVersion,
      updatedAt: latestVersion.publishedAt,
      changesAvailable: currentVersionNum > clientVer,
      changesCount: pendingChanges.length,
      totalMedicines,
      checksum: latestVersion.checksum,
    };
  }

  /**
   * Get incremental changes since a given version
   */
  static async getChanges(sinceVersion = 0): Promise<SyncChangesResponse> {
    const store = CentralDB.getMemoryStore();
    const latestVersion = this.getLatestVersionNumber();

    const changes = store.changes.filter((c) => c.versionNumber > sinceVersion);

    return {
      version: latestVersion,
      sinceVersion,
      changesCount: changes.length,
      changes,
    };
  }

  /**
   * Get full database snapshot for bootstrap or full sync
   */
  static async getSnapshot(): Promise<SyncSnapshotResponse> {
    const store = CentralDB.getMemoryStore();
    const latestVersion = this.getLatestVersionNumber();
    const activeMedicines = Array.from(store.medicines.values()).filter((m) => m.isActive);

    return {
      version: latestVersion,
      totalCount: activeMedicines.length,
      generatedAt: new Date().toISOString(),
      medicines: activeMedicines,
    };
  }

  /**
   * Submit doctor medicine suggestion from offline clinic
   */
  static async submitDoctorSuggestion(
    suggestion: Omit<DoctorMedicineSuggestion, 'id' | 'status' | 'createdAt'>
  ): Promise<DoctorMedicineSuggestion> {
    const store = CentralDB.getMemoryStore();
    const id = `sug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newSuggestion: DoctorMedicineSuggestion = {
      ...suggestion,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    store.suggestions.set(id, newSuggestion);
    return newSuggestion;
  }

  /**
   * List doctor medicine suggestions
   */
  static async listSuggestions(status?: SuggestionStatus): Promise<DoctorMedicineSuggestion[]> {
    const store = CentralDB.getMemoryStore();
    let all = Array.from(store.suggestions.values());

    if (status) {
      all = all.filter((s) => s.status === status);
    }

    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all;
  }

  /**
   * Review doctor suggestion (Approve or Reject)
   */
  static async reviewSuggestion(
    id: string,
    decision: 'approved' | 'rejected',
    reviewerNotes = '',
    reviewedBy = 'admin'
  ): Promise<{ suggestion: DoctorMedicineSuggestion; createdMedicine?: CentralMedicine }> {
    const store = CentralDB.getMemoryStore();
    const target = store.suggestions.get(id);
    if (!target) {
      throw new Error(`Suggestion with ID ${id} not found.`);
    }

    target.status = decision;
    target.reviewerNotes = reviewerNotes;
    target.reviewedBy = reviewedBy;
    target.reviewedAt = new Date().toISOString();

    let createdMedicine: CentralMedicine | undefined;

    if (decision === 'approved') {
      // Automatically add to central formulary
      createdMedicine = await this.createMedicine(
        {
          tradeNameAr: target.tradeNameAr,
          tradeNameEn: target.tradeNameEn,
          activeIngredient: target.activeIngredient || 'غير محدد',
          dosageForm: target.dosageForm || 'أقراص',
          strength: target.strength || 'معياري',
          barcode: target.barcode,
          category: 'مقترح أطباء',
          manufacturer: target.clinicName || 'عيادة خاصة',
        },
        reviewedBy
      );
    }

    return { suggestion: target, createdMedicine };
  }

  /**
   * Bulk import from data sources (EDA, WHO, MOH)
   */
  static async importMedicines(
    sourceId: string,
    rows: CentralMedicineInput[],
    adminId = 'admin'
  ): Promise<{ inserted: number; updated: number }> {
    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      if (!row.tradeNameAr || !row.tradeNameEn) continue;

      const store = CentralDB.getMemoryStore();
      const existing = Array.from(store.medicines.values()).find(
        (m) =>
          (row.barcode && m.barcode === row.barcode) ||
          m.tradeNameEn.toLowerCase() === row.tradeNameEn.toLowerCase()
      );

      if (existing) {
        await this.updateMedicine(existing.id, row, adminId);
        updated++;
      } else {
        await this.createMedicine({ ...row, sourceId }, adminId);
        inserted++;
      }
    }

    return { inserted, updated };
  }

  // Helper: Get highest version number
  private static getLatestVersionNumber(): number {
    const store = CentralDB.getMemoryStore();
    const versionNums = Array.from(store.versions.keys());
    return versionNums.length > 0 ? Math.max(...versionNums) : 1;
  }

  // Helper: Get highest version object
  private static getLatestVersionRecord(): MedicineVersion {
    const store = CentralDB.getMemoryStore();
    const latestNum = this.getLatestVersionNumber();
    return (
      store.versions.get(latestNum) || {
        versionNumber: 1,
        releaseNotes: 'الإصدار الأولي',
        changesCount: 0,
        checksum: 'initial',
        publishedBy: 'system',
        publishedAt: new Date().toISOString(),
      }
    );
  }
}
