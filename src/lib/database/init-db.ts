import { db } from './dexie';
import { MedicineRepository } from '@/features/medicines/repositories/medicine.repository';
import { INITIAL_EGYPTIAN_MEDICINES } from './seeds/egyptian-medicines.seed';
import type { PrescriptionTemplate } from '@/types/template.types';

export async function seedInitialData(): Promise<number> {
  console.log('🌱 [DEXIE] Forcing re-seed of offline Egyptian medicines database...');
  await MedicineRepository.bulkUpsertGlobal(INITIAL_EGYPTIAN_MEDICINES);
  return INITIAL_EGYPTIAN_MEDICINES.length;
}

export async function initializeLocalDatabase(): Promise<{ initialized: boolean; count: number }> {
  try {
    const count = await db.medicines.count();
    if (count === 0) {
      console.log('🌱 [DEXIE] Seeding initial offline Egyptian medicines database...');
      await MedicineRepository.bulkUpsertGlobal(INITIAL_EGYPTIAN_MEDICINES);

      // Seed default prescription template
      const defaultTemplate: PrescriptionTemplate = {
        id: 'template_default',
        doctorId: 'default-doctor',
        name: 'القالب القياسي للعيادة (A5)',
        isDefault: true,
        paperSize: 'A5',
        doctorNameAr: 'د. إسلام عبدالله كريمة',
        doctorNameEn: 'Dr. Eslam Abdallah Karima',
        medicalTitleAr: 'استشاري جراحة الأنف والأذن والحنجرة',
        medicalTitleEn: 'Consultant of ENT Surgery',
        specialtyAr: 'كلية الطب - جامعة القاهرة',
        specialtyEn: 'Faculty of Medicine - Cairo University',
        clinicNameAr: 'عيادة نَفَس التخصصية',
        clinicNameEn: 'Nafs Specialized Clinic',
        clinicAddress: 'القاهرة - المعادي - شارع النصر',
        clinicPhones: ['01000000000', '01200000000'],
        clinicEmail: 'info@roshteh.clinic',
        primaryColor: '#0B7B5E',
        secondaryColor: '#45DBA5',
        fontFamily: 'Cairo',
        fontSize: 'medium',
        marginTopMm: 15,
        marginBottomMm: 15,
        marginLeftMm: 15,
        marginRightMm: 15,
        hasBackPage: true,
        backPageNotes: 'تعليمات هامة: يرجى الالتزام بالجرعات المحددة ومراجعة الطبيب عند اللزوم.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.templates.put(defaultTemplate);

      await db.catalogMeta.put({
        key: 'global_catalog_v1',
        version: 1,
        lastSyncAt: new Date().toISOString(),
        itemCount: INITIAL_EGYPTIAN_MEDICINES.length,
      });

      console.log(`✅ [DEXIE] Seeded ${INITIAL_EGYPTIAN_MEDICINES.length} medicines and default template.`);
      return { initialized: true, count: INITIAL_EGYPTIAN_MEDICINES.length };
    }

    return { initialized: false, count };
  } catch (error) {
    console.error('❌ [DEXIE] Failed to initialize local database:', error);
    return { initialized: false, count: 0 };
  }
}
