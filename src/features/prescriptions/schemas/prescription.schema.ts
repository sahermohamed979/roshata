import { z } from 'zod';

export const patientGenderSchema = z.enum(['MALE', 'FEMALE', 'OTHER']);

export const patientInfoSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'اسم المريض مطلوب'),
  age: z.union([z.string(), z.number()]).optional(),
  gender: patientGenderSchema.default('MALE'),
  phone: z.string().optional(),
  weight: z.union([z.string(), z.number()]).optional(),
});

export const prescriptionMedicineItemSchema = z.object({
  id: z.string().min(1),
  medicineId: z.string().min(1),
  isCustom: z.boolean(),

  // Immutable historical snapshots
  nameSnapshotAr: z.string().min(1),
  nameSnapshotEn: z.string().min(1),
  strengthSnapshot: z.string().optional(),
  dosageFormSnapshot: z.string().optional(),
  activeIngredientSnapshot: z.string().optional(),

  // Clinical directions
  dosage: z.string().min(1, 'الجرعة مطلوبة'),
  frequency: z.string().min(1, 'التكرار مطلوب'),
  duration: z.string().min(1, 'المدة مطلوبة'),
  timing: z.string().optional(),
  route: z.string().optional(),
  instructions: z.string().optional(),
  quantity: z.string().optional(),
  displayOrder: z.number().int().positive(),
});

export const paperSizeSchema = z.enum(['A4', 'A5', 'CUSTOM']);
export const prescriptionStatusSchema = z.enum(['draft', 'completed', 'archived']);

export const prescriptionSchema = z.object({
  id: z.string().min(1),
  doctorId: z.string().min(1),
  templateId: z.string().optional(),
  prescriptionNumber: z.string().optional(),

  patient: patientInfoSchema,
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(prescriptionMedicineItemSchema),

  paperSize: paperSizeSchema.default('A5'),
  status: prescriptionStatusSchema.default('draft'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PatientInfoInput = z.infer<typeof patientInfoSchema>;
export type PrescriptionItemInput = z.infer<typeof prescriptionMedicineItemSchema>;
export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
