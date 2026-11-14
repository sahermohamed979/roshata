'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Calendar, Phone, Activity, Weight, AlertCircle } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { usePrescriptionStore } from '@/stores/prescription.store';
import {
  patientInfoFormSchema,
  type PatientInfoFormValues,
} from '../schemas/patient-info.schema';
import { cn } from '@/lib/utils';

export function PatientInfoForm() {
  // State from Zustand store
  const { patient, diagnosis, setPatientInfo, setDiagnosis } = usePrescriptionStore();

  // Form & validation setup with react-hook-form and Zod
  const {
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PatientInfoFormValues>({
    resolver: zodResolver(patientInfoFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: patient.name || '',
      age: patient.age ? String(patient.age) : '',
      gender: patient.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
      phone: patient.phone || '',
      weight: patient.weight ? String(patient.weight) : '',
      diagnosis: diagnosis || '',
    },
  });

  // Watch values for real-time synchronization to prescription store
  const watchedValues = watch();

  // Sync external store changes (e.g. draft resume or reset) into form
  useEffect(() => {
    reset({
      name: patient.name || '',
      age: patient.age ? String(patient.age) : '',
      gender: patient.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
      phone: patient.phone || '',
      weight: patient.weight ? String(patient.weight) : '',
      diagnosis: diagnosis || '',
    });
  }, [patient.name, patient.age, patient.gender, patient.phone, patient.weight, diagnosis, reset]);

  // Handle immediate field changes and sync to store
  const handleGenderChange = (gender: 'MALE' | 'FEMALE') => {
    setValue('gender', gender, { shouldValidate: true });
    setPatientInfo({ gender });
  };

  /**
   * Sanitizes input in real-time to strictly reject invalid character types:
   * - Name: Disallow all digits (Arabic & Western)
   * - Age: Disallow all non-digits
   * - Phone: Disallow all non-digits (except leading +)
   * - Weight: Disallow all non-numbers/decimals
   */
  const handleSanitizedChange = (
    fieldName: keyof PatientInfoFormValues,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let raw = e.target.value;
    let sanitized = raw;

    if (fieldName === 'name') {
      // Remove any digits (both 0-9 and Eastern Arabic numerals ٠-٩)
      sanitized = raw.replace(/[\d\u0660-\u0669]/g, '');
    } else if (fieldName === 'age') {
      // Remove any non-digits
      sanitized = raw.replace(/[^\d]/g, '').slice(0, 3);
    } else if (fieldName === 'phone') {
      // Allow only digits and optional leading +
      sanitized = raw.replace(/[^\d+]/g, '').slice(0, 16);
    } else if (fieldName === 'weight') {
      // Allow only digits and at most one decimal point
      sanitized = raw.replace(/[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1').slice(0, 5);
    }

    // Force update DOM input value immediately if sanitized
    if (sanitized !== raw) {
      e.target.value = sanitized;
    }

    setValue(fieldName, sanitized as string, { shouldValidate: true });

    if (fieldName === 'diagnosis') {
      setDiagnosis(sanitized);
    } else {
      setPatientInfo({ [fieldName]: sanitized });
    }
  };

  return (
    <Card className="border-[#D0E5DC] bg-white shadow-2xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-black text-sm sm:text-base">
            <User className="w-4 h-4 text-[#0B7B5E]" />
            <span>بيانات المريض والتشخيص</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">فحص دقيق وحفظ تلقائي فوري</span>
        </div>

        {/* First Row: Name, Age, Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Patient Name (Letters only - no numbers allowed) */}
          <div className="sm:col-span-6 space-y-1.5">
            <Label htmlFor="patient-name" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>اسم المريض (حروف فقط بدون أرقام)</span>
              <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="patient-name"
                {...register('name')}
                onChange={(e) => handleSanitizedChange('name', e)}
                placeholder="مثال: أحمد محمود علي"
                className={cn(
                  'bg-slate-50/70 border-slate-200 focus:bg-white text-sm font-semibold h-10 px-3.5',
                  errors.name && 'border-rose-400 focus-visible:ring-rose-500/20 bg-rose-50/30'
                )}
                autoComplete="off"
              />
            </div>
            {errors.name && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in-50">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Age (Numbers only - 1 to 125) */}
          <div className="sm:col-span-3 space-y-1.5">
            <Label htmlFor="patient-age" className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>العمر (أرقام فقط)</span>
            </Label>
            <Input
              id="patient-age"
              type="text"
              inputMode="numeric"
              {...register('age')}
              onChange={(e) => handleSanitizedChange('age', e)}
              placeholder="مثال: 32"
              className={cn(
                'bg-slate-50/70 border-slate-200 focus:bg-white text-sm h-10 font-medium',
                errors.age && 'border-rose-400 focus-visible:ring-rose-500/20 bg-rose-50/30'
              )}
            />
            {errors.age && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in-50">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.age.message}</span>
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="sm:col-span-3 space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">النوع</Label>
            <div className="grid grid-cols-2 gap-1.5 h-10 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleGenderChange('MALE')}
                className={cn(
                  'rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer',
                  watchedValues.gender === 'MALE'
                    ? 'bg-white text-[#0B7B5E] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                ذكر
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('FEMALE')}
                className={cn(
                  'rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer',
                  watchedValues.gender === 'FEMALE'
                    ? 'bg-white text-rose-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                أنثى
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Phone, Weight, Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Phone (Numbers only - 11 digits starting with 01) */}
          <div className="sm:col-span-4 space-y-1.5">
            <Label htmlFor="patient-phone" className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>رقم الهاتف (أرقام فقط)</span>
            </Label>
            <Input
              id="patient-phone"
              type="tel"
              inputMode="tel"
              {...register('phone')}
              onChange={(e) => handleSanitizedChange('phone', e)}
              placeholder="01XXXXXXXXX"
              className={cn(
                'bg-slate-50/70 border-slate-200 focus:bg-white text-sm h-10',
                errors.phone && 'border-rose-400 focus-visible:ring-rose-500/20 bg-rose-50/30'
              )}
              dir="ltr"
            />
            {errors.phone && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in-50">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone.message}</span>
              </p>
            )}
          </div>

          {/* Weight (Numbers only) */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="patient-weight" className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-slate-400" />
              <span>الوزن (كجم - أرقام)</span>
            </Label>
            <Input
              id="patient-weight"
              type="text"
              inputMode="decimal"
              {...register('weight')}
              onChange={(e) => handleSanitizedChange('weight', e)}
              placeholder="مثال: 70"
              className={cn(
                'bg-slate-50/70 border-slate-200 focus:bg-white text-sm h-10',
                errors.weight && 'border-rose-400 focus-visible:ring-rose-500/20 bg-rose-50/30'
              )}
            />
            {errors.weight && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in-50">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.weight.message}</span>
              </p>
            )}
          </div>

          {/* Diagnosis */}
          <div className="sm:col-span-6 space-y-1.5">
            <Label htmlFor="rx-diagnosis" className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#0B7B5E]" />
              <span>التشخيص المبدئي (Diagnosis)</span>
            </Label>
            <Input
              id="rx-diagnosis"
              {...register('diagnosis')}
              onChange={(e) => handleSanitizedChange('diagnosis', e)}
              placeholder="مثال: التهاب حاد في الجيوب الأنفية / Acute Sinusitis"
              className="bg-slate-50/70 border-slate-200 focus:bg-white text-sm h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
