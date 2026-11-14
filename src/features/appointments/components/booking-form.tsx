'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '../schemas/booking.schema';
import { AppointmentPayload, BookingFormType } from '../types/booking';
import { PatientStepCard } from './patient-step-card';
import { AppointmentTypeStepCard } from './appointment-type-step-card';
import { DoctorTimingStepCard } from './doctor-timing-step-card';
import { FinancialStepCard } from './financial-step-card';
import { AttachmentsNotesStepCard } from './attachments-notes-step-card';
import { BookingSummaryPanel } from './booking-summary-panel';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateAppointmentMutation } from '../hooks/appointments.hook';
import { to24HourTime, getCurrentTime24 } from '../services/doctors.service';
import { fileToBase64, uploadAttachmentsApi } from '../services/attachments.service';
import { getPriceForType } from '@/features/pricing/pricing-storage';


export function BookingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createAppointment, isPending: isCreating } = useCreateAppointmentMutation();

  const methods = useForm<BookingFormType>({
    resolver: zodResolver(bookingSchema()),
    defaultValues: {
      patientId: '',
      patientName: '',
      patientPhone: '',
      patientGender: '',
      patientAge: undefined,
      isChild: false,
      hasChronicDisease: false,
      chronicDiseases: [],
      chronicNotes: '',
      appointmentType: 'CONSULTATION',
      doctorId: '',
      appointmentDate: new Date().toISOString().slice(0, 10),
      appointmentTime: '',
      source: 'WALK_IN',
      examinationFee: 300,
      discount: 0,
      paidAmount: 0,
      isExempt: false,
      exemptionReason: '',
      attachments: [],
      notes: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const fee = getPriceForType('CONSULTATION', 150);
    methods.setValue('examinationFee', fee);
  }, [methods]);

  console.log(methods.formState.errors);


  async function onSubmit(data: BookingFormType) {
    setIsSubmitting(true);
    try {
      console.log('✅ تم إرسال بيانات الحجز بنجاح:', data);

      // 1. تحويل الوقت لنظام 24 ساعة الموحد (مثل "16:30")
      let time24 = to24HourTime(data.appointmentTime);

      // 2. إذا كان كشف مباشر (WALK_IN) ولم يُحدد وقت، نعتمد الوقت الحالي تلقائياً
      if (!time24 && data.source === 'WALK_IN') {
        time24 = getCurrentTime24();
      }

      // 3. حماية تامة: إذا كان موعد مسبق (SCHEDULED) ولم يختر المستخدم وقتاً
      if (data.source === 'SCHEDULED' && !time24) {
        toast.error('يرجى اختيار وقت الموعد من قائمة المواعيد المتاحة أولاً.');
        setIsSubmitting(false);
        return;
      }

      // 4. معالجة الصور والمرفقات: التأكد من اكتمال الرفع
      const rawAttachments = (data.attachments || []) as any[];
      const isAnyUploading = rawAttachments.some((att) => att.isUploading);
      if (isAnyUploading) {
        toast.warning('جاري استكمال رفع الصور في الخلفية، يرجى الانتظار لحظات...');
        setIsSubmitting(false);
        return;
      }

      let finalAttachments: any[] = rawAttachments
        .filter((att) => att.url)
        .map((att) => ({
          id: att.id,
          fileName: att.name || att.fileName,
          fileSize: att.size || att.fileSize,
          mimeType: att.type || att.mimeType,
          url: att.url,
        }));

      // في حال وجود صور تم اختيارها ولم يتم استكمال رفعها تلقائياً
      const unuploaded = rawAttachments.filter((att) => !att.url && att.file);
      if (unuploaded.length > 0) {
        toast.info('جاري رفع الصور المتبقية...');
        const toUploadPayload = await Promise.all(
          unuploaded.map(async (att) => ({
            name: att.name,
            data: await fileToBase64(att.file),
          }))
        );
        const uploadedBatch = await uploadAttachmentsApi(toUploadPayload);
        const newMetas = uploadedBatch.map((u) => ({
          id: u.id,
          fileName: u.fileName,
          fileSize: u.fileSize,
          mimeType: u.mimeType,
          url: u.url,
        }));
        finalAttachments = [...finalAttachments, ...newMetas];
      }

      const scheduledAtIso = time24
        ? `${data.appointmentDate}T${time24}:00.000Z`
        : undefined;

      const examFee = Number(data.examinationFee) || 0;
      const discountVal = Number(data.discount) || 0;
      const netTotal = Math.max(0, examFee - discountVal);

      const childTag = data.isChild ? '👶 طفل' : '';
      const chronicList = data.hasChronicDisease && data.chronicDiseases?.length
        ? `أمراض مزمنة: ${data.chronicDiseases.join('، ')}`
        : '';
      const chronicDetails = data.chronicNotes ? `تفاصيل: ${data.chronicNotes}` : '';
      const combinedNotes = [childTag, chronicList, chronicDetails, data.notes].filter(Boolean).join(' | ');

      // التحقق الصارم من أن المبلغ المدفوع لا يتجاوز صافي الكشف
      if (!data.isExempt && (Number(data.paidAmount) || 0) > netTotal) {
        toast.error(`المبلغ المدفوع (${data.paidAmount} ج.م) لا يمكن أن يتجاوز صافي سعر الكشف (${netTotal} ج.م)`);
        return;
      }

      const payload: AppointmentPayload = {
        patientId: data.patientId,
        doctorId: data.doctorId,
        clinicDate: data.appointmentDate,
        appointmentTime: time24,
        startTime: time24,
        scheduledAt: scheduledAtIso,
        type: data.appointmentType,
        originalFee: data.isExempt ? 0 : examFee,
        discount: data.isExempt ? 0 : discountVal,
        totalAmount: data.isExempt ? 0 : netTotal,
        paidAmount: data.isExempt ? 0 : Number(data.paidAmount) || 0,
        source: data.source,
        isExempt: data.isExempt,
        exemptionReason: data.isExempt ? data.exemptionReason : undefined,
        attachments: finalAttachments,
        notes: combinedNotes,
      };

      console.log('🚀 إرسال الـ Payload للخادم:', payload);

      const result = await createAppointment(payload);
      console.log('✅ نتيجة الحجز من الخادم:', result);

      if (result && !result.status) {
        toast.error(result.message || 'فشل في حفظ الحجز');
        return;
      }

      toast.success('تم تأكيد وحفظ الحجز بنجاح!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Submit booking error:', error);
      toast.error(error?.message || 'حدث خطأ أثناء حفظ الحجز، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  }



  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 pb-24 lg:pb-8">
        {/* شريط الإلغاء والعودة للرئيسية */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span>إلغاء والعودة</span>
          </Link>
        </div>

        {/* رأس الصفحة الرئيسي */}
        <div className="text-start">
          <h2 className="text-2xl sm:text-3xl font-black text-[#074C3A] tracking-tight">
            حجز موعد جديد
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            أدخل بيانات الحجز في شاشة واحدة، والملخص يُحدث تلقائياً
          </p>
        </div>

        {/* التخطيط الشبكي: عمود النموذج الرئيسي (يمين في RTL) + عمود الملخص الجانبي (يسار في RTL) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* العمود الرئيسي للبطاقات */}
          <div className="flex-1 w-full space-y-5">
            {/* 1. القسم الأول: المريض والتاريخ المرضي */}
            <PatientStepCard />

            {/* 2. القسم الثاني: نوع الموعد */}
            <AppointmentTypeStepCard />

            {/* 3. القسم الثالث: الطبيب والتوقيت */}
            <DoctorTimingStepCard />

            {/* 4. القسم الرابع: الرسوم والبيانات المالية */}
            <FinancialStepCard />

            {/* 5. القسم الخامس: المرفقات والملاحظات */}
            <AttachmentsNotesStepCard />
          </div>

          {/* عمود الملخص الجانبي الثابت */}
          <BookingSummaryPanel
            isSubmitting={isSubmitting || isCreating}
            onCancel={() => router.push('/dashboard')}
          />
        </div>
      </form>
    </FormProvider>
  );
}
