'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, FileText, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { MedicineImportService, type ImportResult } from '../services/medicine-import.service';
import { useMedicineStore } from '@/stores/medicine.store';
import { toast } from 'sonner';

interface MedicineImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

export function MedicineImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: MedicineImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { refreshCounts } = useMedicineStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const text = await file.text();
      let res: ImportResult;

      if (file.name.endsWith('.csv')) {
        res = await MedicineImportService.importFromCsv(text);
      } else {
        res = await MedicineImportService.importFromJson(text);
      }

      setResult(res);
      await refreshCounts();

      if (res.importedCount > 0) {
        toast.success(`تم بنجاح استيراد ${res.importedCount} دواء إلى قاعدة البيانات المحلية`);
        onImportComplete?.();
      } else {
        toast.error('لم يتم استيراد أي أدوية، يرجى فحص ملف البيانات');
      }
    } catch (err: unknown) {
      console.error('Import failed:', err);
      const message = err instanceof Error ? err.message : 'تعذر قراءة الملف';
      toast.error(`فشل استيراد الملف: ${message}`);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-[#0B7B5E] mb-1">
            <div className="p-2 rounded-xl bg-[#E3F5EE]">
              <FileSpreadsheet className="w-5 h-5 text-[#0B7B5E]" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-800">
                استيراد أدوية (CSV / JSON Pipeline)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                إضافة أو تحديث جماعي للأدوية في قاعدة بيانات المتصفح
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File Picker Box */}
          <label className="border-2 border-dashed border-[#D0E5DC] hover:border-[#0B7B5E] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-[#E3F5EE]/30">
            <input
              type="file"
              accept=".csv,.json,application/json,text/csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-800">
              {isProcessing ? 'جاري التحقق والاستيراد...' : 'اختر ملف CSV أو JSON للأدوية'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              يجب أن يحتوي الملف على أعمدة (nameAr, nameEn, dosageForm, category...)
            </span>
          </label>

          {/* Import Results Summary */}
          {result && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-600">نتيجة الاستيراد:</span>
                <span className="text-[#0B7B5E]">
                  تم استيراد {result.importedCount} من إجمالي {result.totalParsed}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                استغرق الاستيراد: {result.durationMs} مللي ثانية
              </div>

              {result.errors.length > 0 && (
                <div className="pt-2 border-t border-slate-200 text-rose-600 text-[11px] space-y-1">
                  <span className="font-bold block">ملاحظات التحقق ({result.errors.length}):</span>
                  <div className="max-h-24 overflow-y-auto space-y-0.5 font-mono">
                    {result.errors.slice(0, 5).map((e, idx) => (
                      <div key={idx}>
                        سطر {e.row}: {e.reason}
                      </div>
                    ))}
                    {result.errors.length > 5 && (
                      <div>... والمزيد ({result.errors.length - 5} أخطاء أخرى)</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs font-bold"
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
