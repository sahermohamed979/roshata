'use client';

import React, { useState } from 'react';
import { Printer, X, FileText, Layers, Check, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { PrescriptionDocument } from './prescription-document';
import type { Prescription } from '@/types/prescription.types';
import { cn } from '@/lib/utils';

interface PrescriptionPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription;
}

export function PrescriptionPrintModal({
  open,
  onOpenChange,
  prescription,
}: PrescriptionPrintModalProps) {
  // State
  const [paperSize, setPaperSize] = useState<'A4' | 'A5'>(
    prescription.paperSize === 'A4' ? 'A4' : 'A5'
  );
  const [includeBackPage, setIncludeBackPage] = useState(true);

  // Functions
  const handlePrint = () => {
    window.print();
  };

  const previewPrescription: Prescription = {
    ...prescription,
    paperSize,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-slate-900 border-slate-800 text-white overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header & Controls */}
        <div className="p-4 sm:p-5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B7B5E] text-white flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-white">
                معاينة وطباعة الروشتة الطبية
              </DialogTitle>
              <p className="text-xs text-slate-400">
                المريض: {prescription.patient.name || 'بدون اسم'} · {prescription.items.length} أدوية
              </p>
            </div>
          </div>

          {/* Print Options & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Paper Size Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setPaperSize('A5')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-black transition-colors',
                  paperSize === 'A5' ? 'bg-[#0B7B5E] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                )}
              >
                A5 (المعياري)
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('A4')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-black transition-colors',
                  paperSize === 'A4' ? 'bg-[#0B7B5E] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                )}
              >
                A4 (كبير)
              </button>
            </div>

            {/* Back Page Toggle */}
            <button
              type="button"
              onClick={() => setIncludeBackPage(!includeBackPage)}
              className={cn(
                'px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5',
                includeBackPage
                  ? 'bg-slate-800 border-[#0B7B5E] text-[#45DBA5]'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>طباعة الظهر (الإرشادات)</span>
            </button>

            {/* Print Trigger Button */}
            <Button
              type="button"
              onClick={handlePrint}
              className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-black text-xs sm:text-sm px-4 h-9 rounded-xl shadow-md gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الآن</span>
            </Button>
          </div>
        </div>

        {/* Scrollable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex flex-col items-center gap-6">
          <div className="shadow-2xl rounded-sm overflow-hidden bg-white max-w-full">
            <PrescriptionDocument
              prescription={previewPrescription}
              includeBackPage={includeBackPage}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
