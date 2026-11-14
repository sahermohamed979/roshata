'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, Pill, Sparkles, Check, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { MedicineRepository, type UnifiedMedicineResult } from '../repositories/medicine.repository';
import { useMedicineStore } from '@/stores/medicine.store';
import { toast } from 'sonner';

interface EditCustomMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: UnifiedMedicineResult | null;
  onUpdated?: () => void;
}

const COMMON_DOSAGE_FORMS = [
  'أقراص (Tablets)',
  'كبسولات (Capsules)',
  'شراب (Syrup)',
  'معلق (Suspension)',
  'حقن (Injections)',
  'نقط للأنف (Nasal Drops)',
  'بخاخ للأنف (Nasal Spray)',
  'نقط للأذن (Ear Drops)',
  'نقط للعين (Eye Drops)',
  'مرهم / كريم (Ointment)',
  'لبوس (Suppository)',
  'مضمضة / غرغرة (Gargle)',
];

export function EditCustomMedicineDialog({
  open,
  onOpenChange,
  medicine,
  onUpdated,
}: EditCustomMedicineDialogProps) {
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState(COMMON_DOSAGE_FORMS[0]);
  const [activeIngredient, setActiveIngredient] = useState('');
  const [category, setCategory] = useState('أدوية مخصصة');
  const [barcode, setBarcode] = useState('');
  const [defaultDosage, setDefaultDosage] = useState('قرص واحد');
  const [defaultFrequency, setDefaultFrequency] = useState('كل 8 ساعات');
  const [defaultDuration, setDefaultDuration] = useState('لمدة 5 أيام');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { refreshCounts } = useMedicineStore();

  useEffect(() => {
    if (medicine) {
      setNameAr(medicine.nameAr || '');
      setNameEn(medicine.nameEn || '');
      setStrength(medicine.strength || '');
      setDosageForm(medicine.dosageForm || COMMON_DOSAGE_FORMS[0]);
      setActiveIngredient(medicine.activeIngredient || '');
      setCategory(medicine.category || 'أدوية مخصصة');
      setBarcode(medicine.barcode || '');
      setDefaultDosage(medicine.defaultDosage || 'قرص واحد');
      setDefaultFrequency(medicine.defaultFrequency || 'كل 8 ساعات');
      setDefaultDuration(medicine.defaultDuration || 'لمدة 5 أيام');
    }
  }, [medicine, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine) return;

    if (!nameAr.trim() && !nameEn.trim()) {
      toast.error('يرجى كتابة اسم الدواء بالعربية أو بالإنجليزية على الأقل');
      return;
    }

    setIsSubmitting(true);
    try {
      await MedicineRepository.updateCustomMedicine(medicine.id, {
        nameAr: nameAr.trim() || nameEn.trim(),
        nameEn: nameEn.trim() || nameAr.trim(),
        strength: strength.trim() || undefined,
        dosageForm,
        activeIngredient: activeIngredient.trim() || undefined,
        category,
        barcode: barcode.trim() || undefined,
        defaultDosage,
        defaultFrequency,
        defaultDuration,
      });

      await refreshCounts();
      toast.success('تم تحديث بيانات الدواء المخصص بنجاح');
      onOpenChange(false);
      onUpdated?.();
    } catch (err) {
      console.error('Failed to update custom medicine:', err);
      toast.error('حدث خطأ أثناء تعديل الدواء');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!medicine) return;
    if (!window.confirm(`هل أنت متأكد من حذف الدواء "${medicine.nameEn || medicine.nameAr}" نهائياً من قائمتك؟`)) {
      return;
    }

    try {
      await MedicineRepository.deleteCustomMedicine(medicine.id);
      await refreshCounts();
      toast.success('تم حذف الدواء المخصص بنجاح');
      onOpenChange(false);
      onUpdated?.();
    } catch (err) {
      toast.error('تعذر حذف الدواء');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 sm:p-7 bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#0B7B5E]">
              <div className="p-2 rounded-xl bg-[#E3F5EE]">
                <Edit3 className="w-5 h-5 text-[#0B7B5E]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-800">
                  تعديل بيانات الدواء المخصص
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  تعديل المواصفات والجرعات الافتراضية المحفوظة محلياً
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
              title="حذف الدواء"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Drug Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">الاسم التجاري (إنجليزي)</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="text-sm font-semibold"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">الاسم التجاري (عربي)</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="text-sm font-semibold"
              />
            </div>
          </div>

          {/* Strength and Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">التركيز (Strength)</Label>
              <Input
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="text-sm"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">الشكل الدوائي (Dosage Form)</Label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value)}
                className="w-full h-9 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B7B5E]"
              >
                {COMMON_DOSAGE_FORMS.map((form) => (
                  <option key={form} value={form}>
                    {form}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Ingredient & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">المادة الفعالة (اختياري)</Label>
              <Input
                value={activeIngredient}
                onChange={(e) => setActiveIngredient(e.target.value)}
                className="text-sm"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">الباركود (Barcode EAN-13)</Label>
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="622XXXXXXXXXX"
                className="text-sm"
                dir="ltr"
              />
            </div>
          </div>

          {/* Defaults */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-black uppercase text-slate-400 block mb-2">
              الإعدادات السريرية الافتراضية
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600 font-bold">الجرعة</Label>
                <Input
                  value={defaultDosage}
                  onChange={(e) => setDefaultDosage(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600 font-bold">التكرار</Label>
                <Input
                  value={defaultFrequency}
                  onChange={(e) => setDefaultFrequency(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600 font-bold">المدة</Label>
                <Input
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
