'use client';

import React from 'react';
import { PatientInfoForm } from './patient-info-form';
import { MedicineSearchCombobox } from './medicine-search-combobox';
import { PrescriptionMedicineList } from './prescription-medicine-list';
import { PrescriptionActionBar } from './prescription-action-bar';
import { FileEdit, Sparkles, ShieldCheck } from 'lucide-react';

export function PrescriptionEditor() {
  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#D0E5DC] shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] border border-[#0B7B5E]/20 flex items-center justify-center text-[#0B7B5E]">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              محرر الروشتة الطبية الذكي
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              كتابة سريعة مع فحص فوري للأدوية وقوالب طباعة جاهزة بدون إنترنت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F5EE] text-[#074C3A] text-xs font-black border border-[#45DBA5]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0B7B5E]" />
            حفظ تلقائي محلي (IndexedDB)
          </span>
        </div>
      </div>

      {/* 1. Patient Data & Clinical Diagnosis */}
      <PatientInfoForm />

      {/* 2. Medicine Search & Quick Add */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-700 block pr-1">
          إضافة دواء للروشتة
        </label>
        <MedicineSearchCombobox />
      </div>

      {/* 3. Prescription Items Table / Cards */}
      <PrescriptionMedicineList />

      {/* 4. Action & Print Bar */}
      <PrescriptionActionBar />
    </div>
  );
}
