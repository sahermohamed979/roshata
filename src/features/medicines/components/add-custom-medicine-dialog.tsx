'use client';

import React, { useState } from 'react';
import { PlusCircle, Pill, Sparkles, Check, AlertCircle } from 'lucide-react';
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
import { MedicineRepository } from '../repositories/medicine.repository';
import { useMedicineStore } from '@/stores/medicine.store';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { toast } from 'sonner';

interface AddCustomMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  autoAddToPrescription?: boolean;
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

export function AddCustomMedicineDialog({
  open,
  onOpenChange,
  initialName = '',
  autoAddToPrescription = true,
}: AddCustomMedicineDialogProps) {
  // State
  const [nameAr, setNameAr] = useState(initialName);
  const [nameEn, setNameEn] = useState(initialName);
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState(COMMON_DOSAGE_FORMS[0]);
  const [activeIngredient, setActiveIngredient] = useState('');
  const [barcode, setBarcode] = useState('');
  const [defaultDosage, setDefaultDosage] = useState('قرص واحد');
  const [defaultFrequency, setDefaultFrequency] = useState('كل 8 ساعات');
  const [defaultDuration, setDefaultDuration] = useState('لمدة 5 أيام');
  const [category, setCategory] = useState('أدوية مخصصة');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store Hooks
  const { refreshCounts, executeSearch, searchTerm } = useMedicineStore();
  const { addMedicine } = usePrescriptionStore();

  // Reset form when dialog opens with initialName
  React.useEffect(() => {
    if (initialName) {
      // If mostly English characters
      const isEnglish = /^[A-Za-z0-9\s]+$/.test(initialName);
      if (isEnglish) {
        setNameEn(initialName);
        setNameAr('');
      } else {
        setNameAr(initialName);
        setNameEn('');
      }
    }
  }, [initialName, open]);

  // Functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameAr.trim() && !nameEn.trim()) {
      toast.error('يرجى كتابة اسم الدواء بالعربية أو بالإنجليزية على الأقل');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAr = nameAr.trim() || nameEn.trim();
      const finalEn = nameEn.trim() || nameAr.trim();

      const created = await MedicineRepository.addCustomMedicine({
        doctorId: 'default-doctor',
        nameAr: finalAr,
        nameEn: finalEn,
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
      if (searchTerm) {
        await executeSearch(searchTerm);
      }

      if (autoAddToPrescription) {
        addMedicine(
          {
            id: created.id,
            nameAr: created.nameAr,
            nameEn: created.nameEn,
            strength: created.strength,
            dosageForm: created.dosageForm,
            activeIngredient: created.activeIngredient,
            isCustom: true,
          },
          {
            dosage: defaultDosage,
            frequency: defaultFrequency,
            duration: defaultDuration,
          }
        );
        toast.success(`تم حفظ الدواء وإضافته للروشتة: ${finalEn || finalAr}`);
      } else {
        toast.success(`تم حفظ الدواء بنجاح في قاعدة البيانات المحلية: ${finalEn || finalAr}`);
      }

      onOpenChange(false);
      // Reset form
      setNameAr('');
      setNameEn('');
      setStrength('');
      setActiveIngredient('');
      setBarcode('');
    } catch (err) {
      console.error('Failed to add custom medicine:', err);
      toast.error('حدث خطأ أثناء حفظ الدواء محلياً');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 sm:p-7 bg-white">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-[#0B7B5E] mb-1">
            <div className="p-2 rounded-xl bg-[#E3F5EE]">
              <Sparkles className="w-5 h-5 text-[#0B7B5E]" />
            </div>
            <DialogTitle className="text-lg font-black text-slate-800">
              إضافة دواء جديد للقاعدة المحلية
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            يُحفظ الدواء في ذاكرة متصفحك (IndexedDB) للاستخدام الفوري بدون إنترنت في أي وقت.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Drug Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">الاسم التجاري (إنجليزي)</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Augmentin 1g"
                className="text-sm font-semibold"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">الاسم التجاري (عربي)</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: أوجمنتين ١ جم"
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
                placeholder="e.g. 500mg, 1g, 100ml"
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
                placeholder="e.g. Amoxicillin / Clavulanic Acid"
                className="text-sm"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">الباركود الدولي (EAN-13)</Label>
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="622XXXXXXXXXX"
                className="text-sm"
                dir="ltr"
              />
            </div>
          </div>

          {/* Default Prescription Directions */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-black uppercase text-slate-400 block mb-2">
              الإعدادات الافتراضية عند الإضافة
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600 font-bold">الجرعة</Label>
                <Input
                  value={defaultDosage}
                  onChange={(e) => setDefaultDosage(e.target.value)}
                  placeholder="قرص واحد"
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600 font-bold">التكرار</Label>
                <Input
                  value={defaultFrequency}
                  onChange={(e) => setDefaultFrequency(e.target.value)}
                  placeholder="كل 8 ساعات"
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600 font-bold">المدة</Label>
                <Input
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(e.target.value)}
                  placeholder="لمدة 5 أيام"
                  className="text-xs h-8"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
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
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإضافة للروشتة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
