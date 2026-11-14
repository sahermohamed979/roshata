import { z } from 'zod';

export const APPOINTMENT_TYPE_VALUES = [
  "EXAMINATION", "FOLLOW_UP", "OPERATION_FOLLOWUP", "ENDOSCOPY", "SURGERY", "POST_OPERATIVE", "LAB_TESTS_IMAGING", "TEST_RESULTS_REVIEW", "CONSULTATION"
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bookingSchema = (t?: any) =>
  z
    .object({
      // 1. المريض
      patientId: z.string().min(1, t?.('patientRequired') || 'يرجى اختيار مريض أو تسجيل مريض جديد'),
      patientName: z.string().min(3, t?.('patientNameMin') || 'اسم المريض مطلوب'),
      patientPhone: z.string(),
      patientGender: z.string().optional(),
      patientAge: z.union([z.number(), z.string()]).optional(),
      isChild: z.boolean().optional(),
      hasChronicDisease: z.boolean(),
      chronicDiseases: z.array(z.string()),
      chronicNotes: z.string(),

      // 2. نوع الموعد
      appointmentType: z.enum(APPOINTMENT_TYPE_VALUES, {
        message: t?.('typeRequired') || 'نوع الموعد مطلوب',
      }),

      // 3. الطبيب والتوقيت
      doctorId: z.string().min(1, t?.('doctorRequired') || 'يرجى اختيار الطبيب المعالج'),
      appointmentDate: z.string().min(1, t?.('dateRequired') || 'تاريخ الموعد مطلوب'),
      appointmentTime: z.string().optional(),
      source: z.enum(['WALK_IN', 'SCHEDULED']),

      // 4. الرسوم والبيانات المالية
      examinationFee: z.number().min(0, t?.('feePositive') || 'سعر الكشف لا يمكن أن يكون سالباً'),
      discount: z.number().min(0, 'قيمة الخصم لا يمكن أن تكون سالبة'),
      paidAmount: z.number().min(0, t?.('paidPositive') || 'المدفوع لا يمكن أن يكون سالباً'),
      isExempt: z.boolean(),
      exemptionReason: z.string(),

      // 5. المرفقات والملاحظات (غير مقيد بعدد معين مع دعم الصور و PDF)
      attachments: z.array(z.any()),
      notes: z.string(),
    })
    .refine(
      (data) => {
        if (data.source === 'SCHEDULED') {
          return Boolean(data.appointmentTime && data.appointmentTime.trim().length > 0);
        }
        return true;
      },
      {
        message: t?.('timeRequiredForScheduled') || 'يرجى اختيار وقت الموعد من قائمة المواعيد المتاحة',
        path: ['appointmentTime'],
      }
    )
    .refine(
      (data) => {
        if (data.isExempt) {
          return Boolean(data.exemptionReason && data.exemptionReason.trim().length > 0);
        }
        return true;
      },
      {
        message: t?.('exemptionReasonRequired') || 'يرجى تحديد سبب الإعفاء من الرسوم',
        path: ['exemptionReason'],
      }
    )
    .refine(
      (data) => {
        if (data.hasChronicDisease) {
          return data.chronicDiseases.length > 0 || (data.chronicNotes && data.chronicNotes.trim().length > 0);
        }
        return true;
      },
      {
        message: t?.('chronicDiseaseRequired') || 'يرجى تحديد المرض المزمن أو إدخال تفاصيل الحالة',
        path: ['chronicDiseases'],
      }
    )
    .refine(
      (data) => {
        if (data.isExempt) return true;
        const examFee = Number(data.examinationFee) || 0;
        const discount = Number(data.discount) || 0;
        return discount <= examFee;
      },
      {
        message: 'قيمة الخصم لا يمكن أن تتجاوز سعر الكشف',
        path: ['discount'],
      }
    )
    .refine(
      (data) => {
        if (data.isExempt) return true;
        const examFee = Number(data.examinationFee) || 0;
        const discount = Number(data.discount) || 0;
        const paid = Number(data.paidAmount) || 0;
        const netFee = Math.max(0, examFee - discount);
        return paid <= netFee;
      },
      {
        message: 'المبلغ المدفوع لا يمكن أن يتجاوز صافي سعر الكشف',
        path: ['paidAmount'],
      }
    );
