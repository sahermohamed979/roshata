'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { BookingFormType, PatientBasic } from '../types/booking';
import { CHRONIC_DISEASES } from '../constants/booking.constant';
import { UserPlus, Check, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SearchPatientInput } from './search-patient-input';
import { CreatePatientForm } from '@/features/patient/components/create-patient-form';

/**
 * القسم 1: المريض والتاريخ المرضي
 * - بحث فوري مع Debounce وربط حقيقي بـ API السيرفر
 * - إضافة مريض جديد سريع
 * - تحديد ما إذا كان المريض طفلاً (Pediatric)
 * - تحديد وكتابة الأمراض المزمنة المخصصة وتحديث ملخص الحجز لحظياً
 */
export function PatientStepCard() {
  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<BookingFormType>();

  // استخدام useWatch لضمان التفاعل اللحظي الفوري
  const selectedPatientId = useWatch({ control, name: 'patientId' });
  const selectedPatientName = useWatch({ control, name: 'patientName' });
  const selectedPatientPhone = useWatch({ control, name: 'patientPhone' });
  const selectedPatientGender = useWatch({ control, name: 'patientGender' });
  const selectedPatientAge = useWatch({ control, name: 'patientAge' });
  const isChild = useWatch({ control, name: 'isChild' });
  const hasChronicDisease = useWatch({ control, name: 'hasChronicDisease' });
  const selectedDiseases = useWatch({ control, name: 'chronicDiseases' }) || [];

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  // قائمة الأمراض المزمنة المخصصة التي كتبها موظف الاستقبال
  const [customChronicDiseases, setCustomChronicDiseases] = useState<string[]>([]);
  const [newCustomDiseaseText, setNewCustomDiseaseText] = useState('');

  // استرجاع الأمراض المزمنة المخصصة من LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('clinic_custom_chronic_diseases');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCustomChronicDiseases(parsed);
      }
    } catch {}
  }, []);

  // 1. اختيار مريض من نتائج البحث وتحديث النموذج وملخص الحجز فوراً
  const handleSelectPatient = (patient: PatientBasic) => {
    setValue('patientId', patient.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientName', patient.fullName || patient.name || '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientPhone', patient.phone, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    if (patient.gender) {
      setValue('patientGender', patient.gender, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
    if (patient.age !== undefined && patient.age !== null) {
      setValue('patientAge', patient.age, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      if (Number(patient.age) < 18) {
        setValue('isChild', true, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      } else {
        setValue('isChild', false, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }
    }
    if (patient.chronicConditions && patient.chronicConditions.length > 0) {
      setValue('hasChronicDisease', true, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setValue('chronicDiseases', patient.chronicConditions, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
  };

  // 2. مسح المريض المختار لإعادة البحث
  const handleClearPatient = () => {
    setValue('patientId', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientName', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientPhone', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientGender', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientAge', undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('isChild', false, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  // 3. تبديل اختيار مرض مزمن قياسي أو مخصص
  const handleToggleDisease = (diseaseId: string) => {
    const updated = selectedDiseases.includes(diseaseId)
      ? selectedDiseases.filter((id) => id !== diseaseId)
      : [...selectedDiseases, diseaseId];
    setValue('chronicDiseases', updated, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  // 4. كتابة وإضافة مرض مزمن غير موجود في القائمة
  const handleAddCustomDisease = () => {
    const trimmed = newCustomDiseaseText.trim();
    if (!trimmed) {
      toast.info('يرجى كتابة اسم المرض المزمن أولاً');
      return;
    }
    // إضافته للأمراض المختارة
    if (!selectedDiseases.includes(trimmed)) {
      setValue('chronicDiseases', [...selectedDiseases, trimmed], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
    // إضافته للقائمة المخصصة الدائمة
    if (!customChronicDiseases.includes(trimmed)) {
      const next = [...customChronicDiseases, trimmed];
      setCustomChronicDiseases(next);
      try {
        localStorage.setItem('clinic_custom_chronic_diseases', JSON.stringify(next));
      } catch {}
    }
    setNewCustomDiseaseText('');
    toast.success(`تمت إضافة "${trimmed}" إلى الأمراض المزمنة للمريض`);
  };

  // 5. حذف مرض مخصص من القائمة
  const handleDeleteCustomDisease = (name: string) => {
    if (selectedDiseases.includes(name)) {
      setValue('chronicDiseases', selectedDiseases.filter((d) => d !== name), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
    const next = customChronicDiseases.filter((d) => d !== name);
    setCustomChronicDiseases(next);
    try {
      localStorage.setItem('clinic_custom_chronic_diseases', JSON.stringify(next));
    } catch {}
    toast.success(`تم حذف "${name}"`);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 space-y-6">
      {/* حقول مخفية مسجلة في النموذج لضمان التوافق التام مع react-hook-form */}
      <input type="hidden" {...register('patientId')} />
      <input type="hidden" {...register('patientName')} />
      <input type="hidden" {...register('patientPhone')} />
      <input type="hidden" {...register('patientGender')} />
      <input type="hidden" {...register('patientAge')} />
      <input type="hidden" {...register('isChild')} />

      {/* رأس القسم: الرقم 1 والعنوان */}
      <div className="flex items-start gap-3.5">
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0B7B5E] text-white flex items-center justify-center font-black text-sm shrink-0">
          1
        </span>
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#074C3A] tracking-tight">
            المريض والتاريخ المرضي
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ابحث عن مريض مسجل أو سجل مريضاً جديداً
          </p>
        </div>
      </div>

      {/* نموذج البحث أو إضافة مريض جديد عند عدم اختيار مريض */}
      {!selectedPatientId ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* شريط البحث المباشر مع Debounce ومؤشر التحميل */}
            <SearchPatientInput />
            {/* زر تسجيل مريض جديد */}
            <button
              type="button"
              onClick={() => {
                setIsQuickAddOpen((prev) => !prev);
                setQuickError(null);
              }}
              className="h-11 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4 text-[#0B7B5E]" />
              <span>{isQuickAddOpen ? 'إلغاء' : '+ مريض جديد'}</span>
            </button>
          </div>

          {/* نموذج الإضافة السريعة لمريض جديد */}
          {isQuickAddOpen && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-[#074C3A] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#0B7B5E]" />
                  <span>تسجيل مريض جديد فوري</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    setQuickError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

              {/* تنبيه الخطأ إن وُجد */}
              {quickError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{quickError}</span>
                </div>
              )}

              <CreatePatientForm setIsQuickAddOpen={setIsQuickAddOpen} />
            </div>
          )}

          {errors.patientId && (
            <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.patientId.message}</span>
            </p>
          )}
        </div>
      ) : (
        <>
          {/* بطاقة المريض المختار */}
          <div className="p-4 rounded-2xl bg-[#E3F5EE]/60 border border-[#D0E5DC]/70 flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#074C3A] text-white flex items-center justify-center font-black text-sm shrink-0">
                {selectedPatientName ? selectedPatientName.charAt(0) : 'م'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-sm text-[#074C3A]">{selectedPatientName}</p>
                  {isChild && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black">
                      👶 طفل
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedPatientPhone ? `${selectedPatientPhone} · ` : ''}
                  {selectedPatientAge ? `السن: ${selectedPatientAge} سنة · ` : ''}
                  {selectedPatientGender
                    ? selectedPatientGender === 'FEMALE' || selectedPatientGender === 'female'
                      ? 'أنثى · '
                      : 'ذكر · '
                    : ''}
                  سجل مريض معتمد
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearPatient}
              className="text-xs font-bold text-[#0B7B5E] hover:underline cursor-pointer"
            >
              تغيير
            </button>
          </div>

          {/* خيار: هل المريض طفل أم لا؟ (مباشر وسهل للاستقبال) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👶</span>
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                  تصنيف المريض: هل المريض طفل؟ (Pediatric)
                </span>
                <span className="text-[11px] text-slate-500">
                  لتنبيه الطبيب في شاشة الكشف لمراعاة جرعات الأطفال ورعايتهم الخاصة
                </span>
              </div>
            </div>

            <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setValue('isChild', true, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  isChild
                    ? 'bg-[#074C3A] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <span>نعم (طفل) 👶</span>
                {isChild && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
              <button
                type="button"
                onClick={() => setValue('isChild', false, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  !isChild
                    ? 'bg-[#074C3A] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <span>بالغ</span>
              </button>
            </div>
          </div>

          {/* قسم التاريخ المرضي والأمراض المزمنة */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF0] border border-amber-300 space-y-4">
            {/* السؤال وزر التبديل (نعم / لا) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="font-bold text-xs sm:text-sm text-slate-800">
                هل يعاني المريض من مرض مزمن؟ <span className="text-amber-600">*</span>
              </span>

              <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setValue('hasChronicDisease', true, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                  className={cn(
                    'px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    hasChronicDisease
                      ? 'bg-[#074C3A] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  نعم
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('hasChronicDisease', false, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                    setValue('chronicDiseases', [], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                    setValue('chronicNotes', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  }}
                  className={cn(
                    'px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    !hasChronicDisease
                      ? 'bg-[#074C3A] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  لا
                </button>
              </div>
            </div>

            {/* قائمة شرائح الأمراض المزمنة عند اختيار "نعم" */}
            {hasChronicDisease && (
              <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in-50">
                <div className="flex flex-wrap gap-2">
                  {/* الأمراض المزمنة القياسية */}
                  {CHRONIC_DISEASES.map((disease) => {
                    const isSelected = selectedDiseases.includes(disease.id);
                    return (
                      <button
                        key={disease.id}
                        type="button"
                        onClick={() => handleToggleDisease(disease.id)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs',
                          isSelected
                            ? 'bg-brand-yellow text-slate-950 font-black shadow-xs ring-1 ring-amber-400'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{disease.label}</span>
                      </button>
                    );
                  })}

                  {/* الأمراض المزمنة المخصصة المكتوبة */}
                  {customChronicDiseases.map((cust) => {
                    const isSelected = selectedDiseases.includes(cust);
                    return (
                      <div
                        key={cust}
                        className={cn(
                          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs border',
                          isSelected
                            ? 'bg-brand-yellow text-slate-950 font-black border-amber-400'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleDisease(cust)}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>{cust}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomDisease(cust);
                          }}
                          className="text-slate-400 hover:text-rose-600 text-xs px-0.5 cursor-pointer"
                          title="حذف من القائمة"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* حقل كتابة وإضافة مرض مزمن غير موجود في الاختيارات */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newCustomDiseaseText}
                    onChange={(e) => setNewCustomDiseaseText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomDisease();
                      }
                    }}
                    placeholder="اكتب مرضاً مزمناً غير موجود بالاختيارات (مثال: حساسية بنسلين، روماتيزم، سيولة)..."
                    className="flex-1 h-9 px-3.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDisease}
                    className="h-9 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>

                {/* تفاصيل أو أدوية يتناولها المريض */}
                <div className="space-y-1">
                  <Controller
                    name="chronicNotes"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        placeholder="تفاصيل إضافية أو أدوية منتظمة يتناولها المريض (اختياري)..."
                        className="w-full h-10 px-3.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-200/30 transition-all shadow-2xs"
                        {...field}
                      />
                    )}
                  />
                </div>

                {errors.chronicDiseases && (
                  <p className="text-xs text-rose-500 font-semibold">{errors.chronicDiseases.message}</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
