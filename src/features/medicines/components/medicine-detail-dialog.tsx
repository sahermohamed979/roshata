'use client';

import React from 'react';
import {
  Pill,
  Building2,
  Barcode,
  DollarSign,
  Tag,
  Activity,
  Plus,
  Compass,
  FileText,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { UnifiedMedicineResult } from '../repositories/medicine.repository';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { toast } from 'sonner';

interface MedicineDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: UnifiedMedicineResult | null;
  onEditCustom?: (med: UnifiedMedicineResult) => void;
}

export function MedicineDetailDialog({
  open,
  onOpenChange,
  medicine,
  onEditCustom,
}: MedicineDetailDialogProps) {
  const { addMedicine } = usePrescriptionStore();

  if (!medicine) return null;

  const handleAddToRx = () => {
    addMedicine(medicine);
    toast.success(`تمت إضافة ${medicine.nameEn || medicine.nameAr} إلى الروشتة الحالية`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E3F5EE] border border-[#0B7B5E]/30 flex items-center justify-center text-[#0B7B5E] shrink-0">
                <Pill className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-black text-slate-900 leading-snug" dir="ltr">
                  {medicine.nameEn}
                </DialogTitle>
                {medicine.nameAr && medicine.nameAr !== medicine.nameEn && (
                  <DialogDescription className="text-xs font-bold text-slate-600 mt-0.5">
                    {medicine.nameAr}
                  </DialogDescription>
                )}
              </div>
            </div>

            {medicine.isCustom ? (
              <Badge variant="warning" className="text-[10px] font-black shrink-0">
                مخصص لك
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 shrink-0">
                الدليل العام
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Detailed Fields List */}
        <div className="space-y-3 py-2 text-xs divide-y divide-slate-100">
          {/* Active Ingredient */}
          {medicine.activeIngredient && (
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#0B7B5E]" />
                المادة الفعالة
              </span>
              <span className="font-bold text-slate-800 text-left" dir="ltr">
                {medicine.activeIngredient}
              </span>
            </div>
          )}

          {/* Form & Strength */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              الشكل والتركيز
            </span>
            <div className="flex items-center gap-1.5">
              {medicine.dosageForm && (
                <span className="bg-[#E3F5EE] text-[#074C3A] font-bold px-2 py-0.5 rounded-md">
                  {medicine.dosageForm}
                </span>
              )}
              {medicine.strength && (
                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md" dir="ltr">
                  {medicine.strength}
                </span>
              )}
            </div>
          </div>

          {/* Category */}
          {medicine.category && (
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                التصنيف الدوائي
              </span>
              <span className="font-semibold text-slate-700">{medicine.category}</span>
            </div>
          )}

          {/* Route of Administration */}
          {medicine.routeOfAdministration && (
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                طريقة الاستخدام
              </span>
              <span className="font-semibold text-slate-700">{medicine.routeOfAdministration}</span>
            </div>
          )}

          {/* Manufacturer */}
          {medicine.manufacturer && (
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                الشركة المصنعة
              </span>
              <span className="font-semibold text-slate-700" dir="ltr">
                {medicine.manufacturer}
              </span>
            </div>
          )}

          {/* Barcode */}
          {medicine.barcode && (
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-slate-400" />
                الباركود الدولي (EAN-13)
              </span>
              <span className="font-mono font-bold text-slate-800" dir="ltr">
                {medicine.barcode}
              </span>
            </div>
          )}

          {/* Price */}
          {medicine.price !== undefined && (
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                السعر الرسمي للجمهور
              </span>
              <span className="font-black text-emerald-700 text-sm">
                {medicine.price.toFixed(2)} ج.م
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 flex items-center justify-between gap-2">
          {medicine.isCustom && onEditCustom && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onEditCustom(medicine);
              }}
              className="text-xs font-bold border-slate-200"
            >
              تعديل الدواء
            </Button>
          )}

          <Button
            type="button"
            onClick={handleAddToRx}
            className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة للروشتة الحالية</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
