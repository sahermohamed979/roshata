import { db } from '@/lib/database/dexie';
import type {
  Medicine,
  CustomMedicine,
  CatalogMetadata,
} from '@/types/medicine.types';
import type {
  SyncManifest,
  SyncChangesResponse,
  SyncSnapshotResponse,
  CentralMedicine,
} from '@/types/central-backend.types';
import { extractSearchTokens } from '../utils/arabic-normalizer';

export interface SyncCheckResult {
  hasUpdate: boolean;
  localVersion: number;
  serverVersion: number;
  changesCount: number;
  isMonthlyDue: boolean;
  lastSyncAt: string | null;
  serverChecksum?: string;
}

export interface SyncExecutionResult {
  success: boolean;
  mode: 'incremental' | 'snapshot' | 'none';
  appliedChanges: number;
  previousVersion: number;
  newVersion: number;
  error?: string;
}

const META_KEY = 'global_catalog_v1';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export class MedicineSyncService {
  /**
   * Get current local database metadata and version
   */
  static async getLocalMetadata(): Promise<CatalogMetadata> {
    const meta = await db.catalogMeta.get(META_KEY);
    if (meta) return meta;

    const count = await db.medicines.count();
    const defaultMeta: CatalogMetadata = {
      key: META_KEY,
      version: count > 0 ? 1 : 0,
      lastSyncAt: new Date().toISOString(),
      itemCount: count,
    };
    await db.catalogMeta.put(defaultMeta);
    return defaultMeta;
  }

  /**
   * Check if updates are available on the central server (SYN-001, SYN-002, SYN-009)
   */
  static async checkForUpdates(): Promise<SyncCheckResult> {
    const localMeta = await this.getLocalMetadata();
    const localVersion = localMeta.version || 0;

    try {
      const res = await fetch(`/api/v1/medicines/manifest?clientVersion=${localVersion}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const manifest: SyncManifest = await res.json();
      const serverVersion = manifest.version;

      const lastSyncDate = localMeta.lastSyncAt ? new Date(localMeta.lastSyncAt).getTime() : 0;
      const isMonthlyDue = Date.now() - lastSyncDate > THIRTY_DAYS_MS;

      return {
        hasUpdate: serverVersion > localVersion,
        localVersion,
        serverVersion,
        changesCount: manifest.changesCount,
        isMonthlyDue,
        lastSyncAt: localMeta.lastSyncAt,
        serverChecksum: manifest.checksum,
      };
    } catch (err) {
      console.warn('Unable to reach central sync manifest, operating offline:', err);
      const lastSyncDate = localMeta.lastSyncAt ? new Date(localMeta.lastSyncAt).getTime() : 0;
      return {
        hasUpdate: false,
        localVersion,
        serverVersion: localVersion,
        changesCount: 0,
        isMonthlyDue: Date.now() - lastSyncDate > THIRTY_DAYS_MS,
        lastSyncAt: localMeta.lastSyncAt,
      };
    }
  }

  /**
   * Run Incremental Synchronization (SYN-002, SYN-003, SYN-004, SYN-005, SYN-006, SYN-007)
   */
  static async syncIncremental(): Promise<SyncExecutionResult> {
    const localMeta = await this.getLocalMetadata();
    const localVersion = localMeta.version || 0;

    // 1. Fetch manifest
    const manifestRes = await fetch(`/api/v1/medicines/manifest?clientVersion=${localVersion}`, {
      cache: 'no-store',
    });
    if (!manifestRes.ok) {
      throw new Error(`Failed to retrieve sync manifest: HTTP ${manifestRes.status}`);
    }
    const manifest: SyncManifest = await manifestRes.json();

    // If already up-to-date, return early (SYN-002)
    if (localVersion >= manifest.version) {
      return {
        success: true,
        mode: 'none',
        appliedChanges: 0,
        previousVersion: localVersion,
        newVersion: localVersion,
      };
    }

    // If version gap is too large or localVersion is 0, trigger full recovery snapshot (SYN-010)
    if (localVersion === 0 || manifest.version - localVersion > 50) {
      return this.syncFullSnapshot();
    }

    // 2. Fetch incremental changes
    const changesRes = await fetch(`/api/v1/medicines/changes?since=${localVersion}`, {
      cache: 'no-store',
    });
    if (!changesRes.ok) {
      throw new Error(`Failed to retrieve changes: HTTP ${changesRes.status}`);
    }
    const changesData: SyncChangesResponse = await changesRes.json();
    const changes = changesData.changes || [];

    // 3. Apply changes inside atomic Dexie transaction (SYN-007, SYN-012)
    // Notice: db.customMedicines is NOT included, protecting doctors' custom drugs!
    await db.transaction('rw', [db.medicines, db.catalogMeta], async () => {
      for (const chg of changes) {
        if (chg.action === 'create') {
          const payload = chg.deltaPayload as CentralMedicine;
          const searchTokens = extractSearchTokens([
            payload.tradeNameAr,
            payload.tradeNameEn,
            payload.activeIngredient,
            payload.barcode,
          ]);

          const localMedicine: Medicine = {
            id: chg.medicineId,
            nameAr: payload.tradeNameAr,
            nameEn: payload.tradeNameEn,
            brandName: payload.tradeNameEn,
            activeIngredient: payload.activeIngredient,
            dosageForm: payload.dosageForm,
            strength: payload.strength,
            category: payload.category || 'عام',
            barcode: payload.barcode,
            price: payload.price,
            manufacturer: payload.manufacturer,
            status: payload.isActive ? 'active' : 'inactive',
            version: chg.versionNumber,
            searchTokens,
            createdAt: payload.createdAt || new Date().toISOString(),
            updatedAt: payload.updatedAt || new Date().toISOString(),
          };

          await db.medicines.put(localMedicine);
        } else if (chg.action === 'update') {
          const existing = await db.medicines.get(chg.medicineId);
          if (existing) {
            const delta = chg.deltaPayload as Partial<CentralMedicine>;
            const updatedNameAr = delta.tradeNameAr || existing.nameAr;
            const updatedNameEn = delta.tradeNameEn || existing.nameEn;
            const updatedActive = delta.activeIngredient || existing.activeIngredient;
            const updatedBarcode = delta.barcode || existing.barcode;

            const searchTokens = extractSearchTokens([
              updatedNameAr,
              updatedNameEn,
              updatedActive,
              updatedBarcode,
            ]);

            const updated: Medicine = {
              ...existing,
              nameAr: updatedNameAr,
              nameEn: updatedNameEn,
              brandName: updatedNameEn,
              activeIngredient: updatedActive,
              dosageForm: delta.dosageForm || existing.dosageForm,
              strength: delta.strength || existing.strength,
              category: delta.category || existing.category,
              barcode: updatedBarcode,
              price: delta.price !== undefined ? delta.price : existing.price,
              manufacturer: delta.manufacturer || existing.manufacturer,
              version: chg.versionNumber,
              searchTokens,
              updatedAt: new Date().toISOString(),
            };

            await db.medicines.put(updated);
          }
        } else if (chg.action === 'deactivate') {
          // Deactivate without deleting: preserves historical prescription snapshots! (SYN-005)
          const existing = await db.medicines.get(chg.medicineId);
          if (existing) {
            await db.medicines.update(chg.medicineId, {
              status: 'inactive',
              version: chg.versionNumber,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      // Update metadata version atomically
      const totalCount = await db.medicines.count();
      await db.catalogMeta.put({
        key: META_KEY,
        version: manifest.version,
        lastSyncAt: new Date().toISOString(),
        itemCount: totalCount,
        checksum: manifest.checksum,
      });
    });

    return {
      success: true,
      mode: 'incremental',
      appliedChanges: changes.length,
      previousVersion: localVersion,
      newVersion: manifest.version,
    };
  }

  /**
   * Run Full Recovery Snapshot (SYN-001, SYN-010)
   */
  static async syncFullSnapshot(): Promise<SyncExecutionResult> {
    const localMeta = await this.getLocalMetadata();
    const previousVersion = localMeta.version || 0;

    const res = await fetch('/api/v1/medicines/snapshot', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to retrieve database snapshot: HTTP ${res.status}`);
    }

    const snapshot: SyncSnapshotResponse = await res.json();
    const centralMeds = snapshot.medicines || [];

    // Transform to local Medicine format
    const localRecords: Medicine[] = centralMeds.map((cm) => {
      const searchTokens = extractSearchTokens([
        cm.tradeNameAr,
        cm.tradeNameEn,
        cm.activeIngredient,
        cm.barcode,
      ]);

      return {
        id: cm.id,
        nameAr: cm.tradeNameAr,
        nameEn: cm.tradeNameEn,
        brandName: cm.tradeNameEn,
        activeIngredient: cm.activeIngredient,
        dosageForm: cm.dosageForm,
        strength: cm.strength,
        category: cm.category || 'عام',
        barcode: cm.barcode,
        price: cm.price,
        manufacturer: cm.manufacturer,
        status: cm.isActive ? 'active' : 'inactive',
        version: snapshot.version,
        searchTokens,
        createdAt: cm.createdAt,
        updatedAt: cm.updatedAt,
      };
    });

    // Atomically replace global medicines in local DB (customMedicines remain protected)
    await db.transaction('rw', [db.medicines, db.catalogMeta], async () => {
      await db.medicines.clear();
      await db.medicines.bulkPut(localRecords);

      await db.catalogMeta.put({
        key: META_KEY,
        version: snapshot.version,
        lastSyncAt: new Date().toISOString(),
        itemCount: localRecords.length,
        checksum: `snap_v${snapshot.version}`,
      });
    });

    return {
      success: true,
      mode: 'snapshot',
      appliedChanges: localRecords.length,
      previousVersion,
      newVersion: snapshot.version,
    };
  }

  /**
   * Submit doctor custom medicine as central suggestion
   */
  static async submitCustomMedicineSuggestion(
    customMed: CustomMedicine,
    doctorName?: string,
    clinicName?: string
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/medicines/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: customMed.doctorId,
          doctorName: doctorName || 'طبيب عيادة',
          clinicName: clinicName || 'عيادة خاصة',
          tradeNameAr: customMed.nameAr,
          tradeNameEn: customMed.nameEn,
          activeIngredient: customMed.activeIngredient,
          dosageForm: customMed.dosageForm,
          strength: customMed.strength,
          barcode: customMed.barcode,
          clinicalNotes: customMed.notes,
        }),
      });

      if (res.ok) {
        await db.customMedicines.update(customMed.id, { submittedForReview: true });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to submit medicine suggestion:', err);
      return false;
    }
  }
}
