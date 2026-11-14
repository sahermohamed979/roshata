'use client';

import React from 'react';
import { Eye, Printer, X, Sparkles, Layers } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { PrescriptionDocument } from './prescription-document';
import { usePrescriptionStore } from '@/stores/prescription.store';

interface PrescriptionLivePreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTriggerPrint: () => void;
}

export function PrescriptionLivePreviewSheet({
  open,
  onOpenChange,
  onTriggerPrint,
}: PrescriptionLivePreviewSheetProps) {
  const { exportToRecord, paperSize, setPaperSize } = usePrescriptionStore();
  const currentRecord = exportToRecord();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-2xl lg:max-w-3xl p-0 bg-slate-900 border-slate-800 text-white flex flex-col h-full overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B7B5E] text-white flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-black text-white leading-none">
                معاينة حية للروشتة (Live Preview)
              </SheetTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تحديث فوري مع كل تعديل بالروشتة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Size Switch */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPaperSize('A5')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                  paperSize === 'A5' ? 'bg-[#0B7B5E] text-white' : 'text-slate-400'
                }`}
              >
                A5
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('A4')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                  paperSize === 'A4' ? 'bg-[#0B7B5E] text-white' : 'text-slate-400'
                }`}
              >
                A4
              </button>
            </div>

            <Button
              size="sm"
              type="button"
              onClick={() => {
                onOpenChange(false);
                onTriggerPrint();
              }}
              className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white text-xs font-bold h-8 px-3 rounded-xl gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </Button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center">
          <div className="shadow-2xl rounded-sm overflow-hidden bg-white max-w-full">
            <PrescriptionDocument prescription={currentRecord} includeBackPage={true} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
