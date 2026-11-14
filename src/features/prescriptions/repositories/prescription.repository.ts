import { db } from '@/lib/database/dexie';
import type { Prescription, PrescriptionStatus } from '@/types/prescription.types';

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
   * Search prescriptions by patient name, phone, or diagnosis
   */
  static async searchByPatient(nameTerm: string): Promise<Prescription[]> {
    const cleanTerm = nameTerm.trim().toLowerCase();
    if (!cleanTerm) return this.listRecent(50);

    return db.prescriptions
      .filter((rx) => {
        const patientName = rx.patient.name.toLowerCase();
        const patientPhone = (rx.patient.phone || '').toLowerCase();
        const diagnosis = (rx.diagnosis || '').toLowerCase();
        return (
          patientName.includes(cleanTerm) ||
          patientPhone.includes(cleanTerm) ||
          diagnosis.includes(cleanTerm)
        );
      })
      .reverse()
      .toArray();
  }

  /**
   * Get the latest active draft for a doctor to resume editing
   */
  static async getLatestDraft(doctorId = 'default-doctor'): Promise<Prescription | undefined> {
    const drafts = await db.prescriptions
      .filter((rx) => rx.status === 'draft' && (rx.doctorId === doctorId || rx.doctorId === 'default-doctor'))
      .reverse()
      .sortBy('updatedAt');

    return drafts[0];
  }

  /**
   * List prescriptions by status ('draft' | 'completed' | 'archived')
   */
  static async listByStatus(status: PrescriptionStatus, limit = 50): Promise<Prescription[]> {
    return db.prescriptions
      .filter((rx) => rx.status === status)
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * Duplicate an existing prescription as a brand-new draft
   */
  static async duplicateAsNewDraft(id: string): Promise<Prescription> {
    const original = await db.prescriptions.get(id);
    if (!original) {
      throw new Error(`Prescription with id ${id} not found`);
    }

    const now = new Date().toISOString();
    const newRx: Prescription = {
      ...original,
      id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      items: original.items.map((item, idx) => ({
        ...item,
        id: `item_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
        displayOrder: idx + 1,
      })),
    };

    await db.prescriptions.add(newRx);
    return newRx;
  }

  /**
   * Update prescription status
   */
  static async updateStatus(id: string, status: PrescriptionStatus): Promise<void> {
    await db.prescriptions.update(id, {
      status,
      updatedAt: new Date().toISOString(),
    });
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
