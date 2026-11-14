import { z } from 'zod';

export const patientInfoFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'اسم المريض مطلوب')
    .min(3, 'اسم المريض يجب ألا يقل عن 3 أحرف')
    .refine((val) => !/\d/.test(val), {
      message: 'اسم المريض يجب أن يتكون من حروف فقط (بدون أرقام)',
    })
    .refine((val) => /^[\p{L}\s.'-]+$/u.test(val), {
      message: 'اسم المريض يجب أن يحتوي على حروف صالحة فقط',
    }),
  age: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        if (!/^\d+$/.test(val)) return false;
        const num = Number(val);
        return num >= 1 && num <= 125;
      },
      {
        message: 'العمر يجب أن يكون رقماً صحيحاً بين 1 و 125 سنة (أرقام فقط)',
      }
    ),
  gender: z.enum(['MALE', 'FEMALE']),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        const clean = val.replace(/[\s-]/g, '');
        return /^01[0125][0-9]{8}$/.test(clean) || /^\+?[0-9]{8,15}$/.test(clean);
      },
      {
        message: 'رقم الهاتف يجب أن يتكون من أرقام فقط (11 رقماً تبدأ بـ 01)',
      }
    ),
  weight: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        if (!/^\d+(\.\d+)?$/.test(val)) return false;
        const num = Number(val);
        return num >= 1 && num <= 300;
      },
      {
        message: 'الوزن يجب أن يكون رقماً بين 1 و 300 كجم (أرقام فقط)',
      }
    ),
  diagnosis: z.string().trim(),
});

export type PatientInfoFormValues = z.infer<typeof patientInfoFormSchema>;
