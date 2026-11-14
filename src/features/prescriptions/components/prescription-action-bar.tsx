'use client';

import React, { useState } from 'react';
import {
  Save,
  Printer,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FilePlus2,
  Eye,
  Clock,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { PrescriptionRepository } from '../repositories/prescription.repository';
import { PrescriptionPrintModal } from './prescription-print-modal';
import { PrescriptionLivePreviewSheet } from './prescription-live-preview-sheet';
import { toast } from 'sonner';

export function PrescriptionActionBar() {
  // State from store
  const {
    id,
    patient,
    items,
    paperSize,
    setPaperSize,
    resetPrescription,
    exportToRecord,
    hasUnsavedChanges,
    lastSavedAt,
    autoSaveDraft,
    isSaving,
  } = usePrescriptionStore();

  // Local state
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [livePreviewOpen, setLivePreviewOpen] = useState(false);

  // Functions
  const handleSaveDraft = async () => {
    if (!patient.name.trim() && items.length === 0) {
      toast.error('يرجى إدخال اسم المريض أو إضافة دواء واحد على الأقل لحفظ المسودة');
      return;
    }

    await autoSaveDraft();
    toast.success('تم حفظ مسودة الروشتة في قاعدة البيانات المحلية (IndexedDB)');
  };

  const handlePrintClick = async () => {
    if (items.length === 0) {
      toast.warning('يرجى إضافة دواء واحد على الأقل لمعاينة الطباعة');
      return;
    }

    try {
      const record = exportToRecord();
      record.status = 'completed';
      await PrescriptionRepository.save(record);
    } catch (err) {
      console.error('Error saving before print:', err);
    }

    setPrintModalOpen(true);
  };

  const handleReset = () => {
    if (items.length > 0 || patient.name) {
      const confirmed = window.confirm('هل أنت متأكد من تفريغ الروشتة والبدء بروشتة جديدة فارغة؟');
      if (!confirmed) return;
    }
    resetPrescription();
    toast.info('تم تفريغ الروشتة وبدء جلسة جديدة');
  };

  const activeRecord = exportToRecord();

  return (
    <>
      <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md border border-[#D0E5DC] p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 flex-wrap">
        {/* Left Side: Paper Size & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPaperSize('A5')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                paperSize === 'A5' ? 'bg-[#0B7B5E] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مقاس A5
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('A4')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                paperSize === 'A4' ? 'bg-[#0B7B5E] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مقاس A4
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-semibold">
            {hasUnsavedChanges ? (
              <span className="text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                تغييرات غير محفوظة
              </span>
            ) : lastSavedAt ? (
              <span className="text-[#0B7B5E] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                تم الحفظ {lastSavedAt}
              </span>
            ) : (
              <span className="text-[#0B7B5E] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                الروشتة محفوظة محلياً
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Live Preview Button (FR-03 requirement) */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setLivePreviewOpen(true)}
            className="border-[#D0E5DC] text-[#074C3A] hover:bg-[#E3F5EE] text-xs sm:text-sm font-bold h-10 px-3.5 rounded-xl gap-1.5"
            title="معاينة حية لشكل الروشتة أثناء الكتابة"
          >
            <Eye className="w-4 h-4 text-[#0B7B5E]" />
            <span className="hidden sm:inline">معاينة حية</span>
          </Button>

          {/* Reset / New */}
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 text-xs sm:text-sm font-bold h-10 px-3.5 rounded-xl"
            title="تفريغ الحقول وبدء روشتة جديدة"
          >
            <Trash2 className="w-4 h-4 ml-1.5" />
            <span>روشتة جديدة</span>
          </Button>

          {/* Save Draft */}
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="border-[#D0E5DC] text-[#074C3A] hover:bg-[#E3F5EE] text-xs sm:text-sm font-bold h-10 px-3.5 rounded-xl"
          >
            <Save className="w-4 h-4 ml-1.5 text-[#0B7B5E]" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ كمسودة'}</span>
          </Button>

          {/* Print & Preview */}
          <Button
            type="button"
            onClick={handlePrintClick}
            className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-black text-xs sm:text-sm h-10 px-5 rounded-xl shadow-md gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>معاينة وطباعة ({items.length})</span>
          </Button>
        </div>
      </div>

      {/* Live Preview Sheet */}
      <PrescriptionLivePreviewSheet
        open={livePreviewOpen}
        onOpenChange={setLivePreviewOpen}
        onTriggerPrint={() => setPrintModalOpen(true)}
      />

      {/* Print Modal */}
      <PrescriptionPrintModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        prescription={activeRecord}
      />
    </>
  );
}
