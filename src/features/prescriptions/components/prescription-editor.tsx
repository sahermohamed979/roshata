'use client';

import React, { useEffect, useState } from 'react';
import { PatientInfoForm } from './patient-info-form';
import { MedicineSearchCombobox } from './medicine-search-combobox';
import { PrescriptionMedicineList } from './prescription-medicine-list';
import { PrescriptionInstructionsForm } from './prescription-instructions-form';
import { PrescriptionActionBar } from './prescription-action-bar';
import { FileEdit, Sparkles, ShieldCheck, History, ArrowRight } from 'lucide-react';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { PrescriptionRepository } from '../repositories/prescription.repository';
import { useDebouncedCallback } from 'use-debounce';
import type { Prescription } from '@/types/prescription.types';
import { Button } from '@/shared/components/ui/button';

export function PrescriptionEditor() {
  const {
    hasUnsavedChanges,
    patient,
    items,
    autoSaveDraft,
    loadPrescription,
  } = usePrescriptionStore();

  const [pendingDraft, setPendingDraft] = useState<Prescription | null>(null);

  // Debounced Auto-save to Dexie IndexedDB (every 2 seconds after doctor stops typing)
  const debouncedAutoSave = useDebouncedCallback(() => {
    if (hasUnsavedChanges && (patient.name.trim().length > 0 || items.length > 0)) {
      autoSaveDraft();
    }
  }, 2000);

  useEffect(() => {
    if (hasUnsavedChanges) {
      debouncedAutoSave();
    }
  }, [hasUnsavedChanges, patient, items, debouncedAutoSave]);

  // Check for any uncompleted draft on initial load
  useEffect(() => {
    async function checkForDraft() {
      if (items.length === 0 && !patient.name) {
        try {
          const draft = await PrescriptionRepository.getLatestDraft();
          if (draft && (draft.patient.name || draft.items.length > 0)) {
            setPendingDraft(draft);
          }
        } catch {}
      }
    }
    checkForDraft();
  }, []);

  const handleResumeDraft = () => {
    if (pendingDraft) {
      loadPrescription(pendingDraft);
      setPendingDraft(null);
    }
  };

  const handleDismissDraft = () => {
    setPendingDraft(null);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Resume Pending Draft Banner if exists */}
      {pendingDraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-900 block">
                توجد مسودة غير مكتملة محفوظة محلياً: &quot;{pendingDraft.patient.name || 'مريض بدون اسم'}&quot; ({pendingDraft.items.length} أدوية)
              </span>
              <span className="text-[11px] text-amber-700 font-medium">
                تم حفظها تلقائياً {new Date(pendingDraft.updatedAt).toLocaleTimeString('ar-EG')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismissDraft}
              className="text-xs font-bold text-slate-600 border-amber-300"
            >
              تجاهل
            </Button>
            <Button
              size="sm"
              onClick={handleResumeDraft}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-black gap-1 rounded-xl shadow-xs"
            >
              <span>استئناف المسودة</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

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
            حفظ تلقائي وفوري (IndexedDB)
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

      {/* 4. Clinical Instructions Form (يُضاف بها إرشادات مثل الأدوية فقط لو رغب الطبيب) */}
      <PrescriptionInstructionsForm />

      {/* 5. Action & Print Bar */}
      <PrescriptionActionBar />
    </div>
  );
}
