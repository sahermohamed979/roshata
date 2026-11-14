'use client';

import React from 'react';
import { User, Calendar, Phone, Activity, FileText, Weight } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { cn } from '@/lib/utils';

export function PatientInfoForm() {
  // State from Zustand store
  const { patient, diagnosis, notes, setPatientInfo, setDiagnosis, setNotes } = usePrescriptionStore();

  // Functions
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientInfo({ name: e.target.value });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientInfo({ age: e.target.value });
  };

  const handleGenderChange = (gender: 'MALE' | 'FEMALE') => {
    setPatientInfo({ gender });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientInfo({ phone: e.target.value });
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientInfo({ weight: e.target.value });
  };

  return (
    <Card className="border-[#D0E5DC] bg-white shadow-2xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-black text-sm sm:text-base">
            <User className="w-4 h-4 text-[#0B7B5E]" />
            <span>بيانات المريض والتشخيص</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">حفظ تلقائي وفوري</span>
        </div>

        {/* First Row: Name, Age, Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Patient Name */}
          <div className="sm:col-span-6 space-y-1.5">
            <Label htmlFor="patient-name" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>اسم المريض</span>
              <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="patient-name"
                value={patient.name}
                onChange={handleNameChange}
                placeholder="مثال: أحمد محمود علي"
                className="bg-slate-50/70 border-slate-200 focus:bg-white text-sm font-semibold h-10 px-3.5"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Age */}
          <div className="sm:col-span-3 space-y-1.5">
            <Label htmlFor="patient-age" className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>العمر</span>
            </Label>
            <Input
              id="patient-age"
              value={patient.age || ''}
              onChange={handleAgeChange}
              placeholder="مثال: 32 سنة"
              className="bg-slate-50/70 border-slate-200 focus:bg-white text-sm h-10"
            />
          </div>

          {/* Gender */}
          <div className="sm:col-span-3 space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">النوع</Label>
            <div className="grid grid-cols-2 gap-1.5 h-10 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleGenderChange('MALE')}
                className={cn(
                  'rounded-xl text-xs font-black transition-all flex items-center justify-center',
                  patient.gender === 'MALE'
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
                  'rounded-xl text-xs font-black transition-all flex items-center justify-center',
                  patient.gender === 'FEMALE'
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
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Phone */}
          <div className="sm:col-span-4 space-y-1.5">
            <Label htmlFor="patient-phone" className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>رقم الهاتف (اختياري)</span>
            </Label>
            <Input
              id="patient-phone"
              value={patient.phone || ''}
              onChange={handlePhoneChange}
              placeholder="01XXXXXXXXX"
              className="bg-slate-50/70 border-slate-200 focus:bg-white text-sm h-10"
              dir="ltr"
            />
          </div>

          {/* Weight */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="patient-weight" className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-slate-400" />
              <span>الوزن (كجم)</span>
            </Label>
            <Input
              id="patient-weight"
              value={patient.weight || ''}
              onChange={handleWeightChange}
              placeholder="مثال: 70"
              className="bg-slate-50/70 border-slate-200 focus:bg-white text-sm h-10"
            />
          </div>

          {/* Diagnosis */}
          <div className="sm:col-span-6 space-y-1.5">
            <Label htmlFor="rx-diagnosis" className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#0B7B5E]" />
              <span>التشخيص المبدئي (Diagnosis)</span>
            </Label>
            <Input
              id="rx-diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="مثال: التهاب حاد في الجيوب الأنفية / Acute Sinusitis"
              className="bg-slate-50/70 border-slate-200 focus:bg-white text-sm h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
