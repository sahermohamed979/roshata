import { db } from '@/lib/database/dexie';
import type { Prescription } from '@/types/prescription.types';

export class PrescriptionRepository {
  /**
   * Save or update a prescription in IndexedDB
   */
  static async save(rx: Prescription): Promise<Prescription> {
    const record: Prescription = {
      ...rx,
      updatedAt: new Date().toISOString(),
    };
    await db.prescriptions.put(record);
    return record;
  }

  /**
   * Get prescription by ID
   */
  static async getById(id: string): Promise<Prescription | undefined> {
    return db.prescriptions.get(id);
  }

  /**
   * List recent prescriptions
   */
  static async listRecent(limit = 50): Promise<Prescription[]> {
    return db.prescriptions
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * Search prescriptions by patient name or diagnosis
   */
  static async searchByPatient(nameTerm: string): Promise<Prescription[]> {
    const cleanTerm = nameTerm.trim().toLowerCase();
    if (!cleanTerm) return this.listRecent(30);

    return db.prescriptions
      .filter((rx) => rx.patient.name.toLowerCase().includes(cleanTerm))
      .reverse()
      .toArray();
  }

  /**
   * Delete a prescription
   */
  static async delete(id: string): Promise<void> {
    await db.prescriptions.delete(id);
  }

  /**
   * Total prescriptions count
   */
  static async count(): Promise<number> {
    return db.prescriptions.count();
  }
}
