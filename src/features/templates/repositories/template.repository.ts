import { db } from '@/lib/database/dexie';
import type { PrescriptionTemplate } from '@/types/template.types';

export class TemplateRepository {
  /**
   * Get default template for doctor
   */
  static async getDefault(doctorId = 'default-doctor'): Promise<PrescriptionTemplate | undefined> {
    const defaultTpl = await db.templates
      .filter((t) => t.isDefault && (t.doctorId === doctorId || t.doctorId === 'default-doctor'))
      .first();

    if (defaultTpl) return defaultTpl;

    // Fallback to any first template
    return db.templates.toCollection().first();
  }

  /**
   * List all templates
   */
  static async listAll(doctorId = 'default-doctor'): Promise<PrescriptionTemplate[]> {
    return db.templates
      .filter((t) => t.doctorId === doctorId || t.doctorId === 'default-doctor')
      .toArray();
  }

  /**
   * Save or update template
   */
  static async save(template: PrescriptionTemplate): Promise<PrescriptionTemplate> {
    if (template.isDefault) {
      // Unset previous defaults
      const existing = await db.templates.toArray();
      for (const t of existing) {
        if (t.isDefault && t.id !== template.id) {
          await db.templates.update(t.id, { isDefault: false });
        }
      }
    }

    const updated: PrescriptionTemplate = {
      ...template,
      updatedAt: new Date().toISOString(),
    };

    await db.templates.put(updated);
    return updated;
  }

  /**
   * Get template by ID
   */
  static async getById(id: string): Promise<PrescriptionTemplate | undefined> {
    return db.templates.get(id);
  }

  /**
   * Delete template
   */
  static async delete(id: string): Promise<void> {
    await db.templates.delete(id);
  }
}
