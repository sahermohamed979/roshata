import { z } from 'zod';

export const medicineStatusSchema = z.enum(['active', 'inactive', 'discontinued']);

export const medicineBaseSchema = z.object({
  nameAr: z.string().min(1, 'الاسم بالعربية مطلوب'),
  nameEn: z.string().min(1, 'الاسم بالإنجليزية مطلوب'),
  brandName: z.string().optional(),
  genericName: z.string().optional(),
  activeIngredient: z.string().optional(),
  strength: z.string().optional(),
  pharmaceuticalForm: z.string().optional(),
  dosageForm: z.string().optional(),
  concentration: z.string().optional(),
  packageInfo: z.string().optional(),
  manufacturer: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().min(0).optional(),
  category: z.string().optional(),
  routeOfAdministration: z.string().optional(),
});

export const medicineSchema = medicineBaseSchema.extend({
  id: z.string().min(1),
  status: medicineStatusSchema.default('active'),
  version: z.number().int().positive().default(1),
  source: z.string().optional(),
  searchTokens: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const customMedicineSchema = medicineBaseSchema.extend({
  id: z.string().min(1),
  doctorId: z.string().min(1),
  isCustom: z.literal(true),
  defaultDosage: z.string().optional(),
  defaultFrequency: z.string().optional(),
  defaultDuration: z.string().optional(),
  notes: z.string().optional(),
  submittedForReview: z.boolean().optional(),
  searchTokens: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createCustomMedicineInputSchema = z.object({
  nameAr: z.string().min(1, 'يرجى كتابة الاسم بالعربية'),
  nameEn: z.string().min(1, 'يرجى كتابة الاسم بالإنجليزية'),
  brandName: z.string().optional(),
  activeIngredient: z.string().optional(),
  strength: z.string().optional(),
  dosageForm: z.string().min(1, 'الشكل الدوائي مطلوب'),
  category: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().min(0).optional(),
  defaultDosage: z.string().optional(),
  defaultFrequency: z.string().optional(),
  defaultDuration: z.string().optional(),
  notes: z.string().optional(),
});

export type MedicineSchemaType = z.infer<typeof medicineSchema>;
export type CustomMedicineSchemaType = z.infer<typeof customMedicineSchema>;
export type CreateCustomMedicineInput = z.infer<typeof createCustomMedicineInputSchema>;
