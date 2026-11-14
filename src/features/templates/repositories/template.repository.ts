import { db } from '@/lib/database/dexie';
import {
  type PrescriptionTemplate,
  createDefaultTemplateElements,
  type PaperSize,
} from '@/types/template.types';

export class TemplateRepository {
  /**
   * Get default template for doctor
   */
  static async getDefault(doctorId = 'default-doctor'): Promise<PrescriptionTemplate | undefined> {
    const defaultTpl = await db.templates
      .filter((t) => t.isDefault && (t.doctorId === doctorId || t.doctorId === 'default-doctor'))
      .first();

    if (defaultTpl) {
      return this.ensureElements(defaultTpl);
    }

    // Fallback to any first template
    const firstTpl = await db.templates.toCollection().first();
    return firstTpl ? this.ensureElements(firstTpl) : undefined;
  }

  /**
   * List all templates
   */
  static async listAll(doctorId = 'default-doctor'): Promise<PrescriptionTemplate[]> {
    const list = await db.templates
      .filter((t) => t.doctorId === doctorId || t.doctorId === 'default-doctor')
      .toArray();

    return list.map((t) => this.ensureElements(t));
  }

  /**
   * Get template by ID
   */
  static async getById(id: string): Promise<PrescriptionTemplate | undefined> {
    const tpl = await db.templates.get(id);
    return tpl ? this.ensureElements(tpl) : undefined;
  }

  /**
   * Create a new template with defaults
   */
  static async create(
    params: {
      name: string;
      paperSize?: PaperSize;
      doctorId?: string;
      isDefault?: boolean;
    }
  ): Promise<PrescriptionTemplate> {
    const doctorId = params.doctorId || 'default-doctor';
    const existingCount = await db.templates.count();
    const shouldBeDefault = params.isDefault || existingCount === 0;

    const baseTemplate = await this.getDefault(doctorId);

    const newTemplate: PrescriptionTemplate = {
      id: `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      doctorId,
      name: params.name || 'قالب روشتة جديد',
      isDefault: shouldBeDefault,
      paperSize: params.paperSize || 'A5',
      doctorNameAr: baseTemplate?.doctorNameAr || 'د. إسلام عبدالله كريمة',
      doctorNameEn: baseTemplate?.doctorNameEn || 'Dr. Eslam Abdallah Karima',
      medicalTitleAr: baseTemplate?.medicalTitleAr || 'استشاري جراحة الأنف والأذن والحنجرة',
      medicalTitleEn: baseTemplate?.medicalTitleEn || 'Consultant of ENT Surgery',
      specialtyAr: baseTemplate?.specialtyAr || 'كلية الطب - جامعة القاهرة',
      specialtyEn: baseTemplate?.specialtyEn || 'Faculty of Medicine - Cairo University',
      qualificationsAr: baseTemplate?.qualificationsAr || 'دكتوراه جراحة الرأس والرقبة والمناظير الدقيقة',
      qualificationsEn: baseTemplate?.qualificationsEn || 'M.D., Consultant ENT Surgery',
      syndicateNumber: baseTemplate?.syndicateNumber || '76542/نقابة أطباء مصر',
      clinicNameAr: baseTemplate?.clinicNameAr || 'عيادة نَفَس التخصصية',
      clinicNameEn: baseTemplate?.clinicNameEn || 'Nafs Specialized Clinic',
      clinicAddress: baseTemplate?.clinicAddress || 'القاهرة - المعادي - شارع النصر',
      clinicPhones: baseTemplate?.clinicPhones?.length ? [...baseTemplate.clinicPhones] : ['01000000000'],
      clinicEmail: baseTemplate?.clinicEmail || 'info@roshteh.clinic',
      emergencyPhone: baseTemplate?.emergencyPhone || '01099998888',
      returnNotice: baseTemplate?.returnNotice || 'الكشف ساري لمدة 14 يوماً من تاريخ الزيارة',
      primaryColor: baseTemplate?.primaryColor || '#0B7B5E',
      secondaryColor: baseTemplate?.secondaryColor || '#45DBA5',
      fontFamily: baseTemplate?.fontFamily || 'Cairo',
      fontSize: baseTemplate?.fontSize || 'medium',
      headerLayout: baseTemplate?.headerLayout || 'split',
      footerLayout: baseTemplate?.footerLayout || 'standard',
      showLogo: baseTemplate?.showLogo ?? true,
      showSignature: baseTemplate?.showSignature ?? true,
      showStamp: baseTemplate?.showStamp ?? false,
      showWatermark: baseTemplate?.showWatermark ?? true,
      watermarkOpacity: baseTemplate?.watermarkOpacity ?? 0.08,
      showReturnPolicy: baseTemplate?.showReturnPolicy ?? true,
      showPatientBox: baseTemplate?.showPatientBox ?? true,
      showDiagnosis: baseTemplate?.showDiagnosis ?? true,
      marginTopMm: 15,
      marginBottomMm: 15,
      marginLeftMm: 15,
      marginRightMm: 15,
      hasBackPage: true,
      backPageNotes: baseTemplate?.backPageNotes || 'تعليمات هامة: يرجى الالتزام بالجرعات المقررة ومراجعة الطبيب.',
      elements: createDefaultTemplateElements(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (shouldBeDefault) {
      const all = await db.templates.toArray();
      for (const t of all) {
        if (t.isDefault) {
          await db.templates.update(t.id, { isDefault: false });
        }
      }
    }

    await db.templates.put(newTemplate);
    return newTemplate;
  }

  /**
   * Duplicate existing template
   */
  static async duplicate(id: string, newName?: string): Promise<PrescriptionTemplate> {
    const source = await this.getById(id);
    if (!source) {
      throw new Error(`Template with id ${id} not found.`);
    }

    const cloned: PrescriptionTemplate = {
      ...source,
      id: `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newName || `نسخة من ${source.name}`,
      isDefault: false, // duplicates start as non-default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: source.elements?.map((el) => ({ ...el })) || createDefaultTemplateElements(),
    };

    await db.templates.put(cloned);
    return cloned;
  }

  /**
   * Set template as default and unset others
   */
  static async setDefault(id: string): Promise<void> {
    const target = await db.templates.get(id);
    if (!target) return;

    const all = await db.templates.toArray();
    for (const t of all) {
      if (t.id === id) {
        await db.templates.update(t.id, { isDefault: true, updatedAt: new Date().toISOString() });
      } else if (t.isDefault) {
        await db.templates.update(t.id, { isDefault: false, updatedAt: new Date().toISOString() });
      }
    }
  }

  /**
   * Save or update template
   */
  static async save(template: PrescriptionTemplate): Promise<PrescriptionTemplate> {
    if (template.isDefault) {
      const existing = await db.templates.toArray();
      for (const t of existing) {
        if (t.isDefault && t.id !== template.id) {
          await db.templates.update(t.id, { isDefault: false });
        }
      }
    }

    const updated: PrescriptionTemplate = {
      ...this.ensureElements(template),
      updatedAt: new Date().toISOString(),
    };

    await db.templates.put(updated);
    return updated;
  }

  /**
   * Delete template and ensure a default remains
   */
  static async delete(id: string): Promise<void> {
    const toDelete = await db.templates.get(id);
    await db.templates.delete(id);

    if (toDelete?.isDefault) {
      // Promote the first remaining template to default
      const remaining = await db.templates.toCollection().first();
      if (remaining) {
        await db.templates.update(remaining.id, { isDefault: true });
      }
    }
  }

  /**
   * Helper to ensure elements array always exists
   */
  private static ensureElements(template: PrescriptionTemplate): PrescriptionTemplate {
    if (!template.elements || template.elements.length === 0) {
      return {
        ...template,
        elements: createDefaultTemplateElements(),
      };
    }
    return template;
  }
}
