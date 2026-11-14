'use client';

import React from 'react';
import {
  Pill,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Clock,
  Calendar,
  AlertCircle,
  FileEdit,
  Sparkles,
  Info,
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { usePrescriptionStore } from '@/stores/prescription.store';
import type { PrescriptionMedicineItem } from '@/types/prescription.types';
import { cn } from '@/lib/utils';

const DOSAGE_PRESETS = ['قرص واحد', 'قرصين', 'ملعقة كبيرة (15 مل)', 'ملعقة صغيرة (5 مل)', 'بختين', '5 نقط'];
const FREQUENCY_PRESETS = [
  'كل 8 ساعات (3 مرات يومياً)',
  'كل 12 ساعة (مرتين يومياً)',
  'مرة واحدة يومياً صباحاً',
  'مرة واحدة قبل النوم',
  'عند اللزوم',
  'قبل الأكل بنصف ساعة',
];
const DURATION_PRESETS = ['لمدة 3 أيام', 'لمدة 5 أيام', 'لمدة أسبوع', 'لمدة أسبوعين', 'حتى انتهاء العبوة'];

interface PrescriptionItemRowProps {
  item: PrescriptionMedicineItem;
  index: number;
  totalItems: number;
}

function PrescriptionItemRow({ item, index, totalItems }: PrescriptionItemRowProps) {
  const { updateItem, removeItem, moveItem, duplicateItem } = usePrescriptionStore();

  return (
    <Card className="border border-[#D0E5DC] bg-white hover:border-[#0B7B5E]/40 transition-all shadow-2xs rounded-2xl overflow-hidden group">
      <CardContent className="p-4 sm:p-5">
        {/* Item Top Bar */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* Index Counter */}
            <div className="w-8 h-8 rounded-xl bg-[#0B7B5E] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
              {index + 1}
            </div>

            {/* Drug Names and Badges */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-slate-900 group-hover:text-[#0B7B5E] transition-colors" dir="ltr">
                  {item.nameSnapshotEn}
                </span>
                {item.nameSnapshotAr && item.nameSnapshotAr !== item.nameSnapshotEn && (
                  <span className="text-xs font-bold text-slate-600">
                    ({item.nameSnapshotAr})
                  </span>
                )}
                {item.isCustom && (
                  <Badge variant="warning" className="text-[10px] font-black h-4 px-1.5">
                    مخصص
                  </Badge>
                )}
              </div>

              {/* Form & Strength */}
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                {item.dosageFormSnapshot && (
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                    {item.dosageFormSnapshot}
                  </span>
                )}
                {item.strengthSnapshot && (
                  <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]" dir="ltr">
                    {item.strengthSnapshot}
                  </span>
                )}
                {item.activeIngredientSnapshot && (
                  <span className="text-slate-400 text-[11px]" dir="ltr">
                    • {item.activeIngredientSnapshot}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Move, Duplicate, Delete */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Move Up */}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => moveItem(index, index - 1)}
              disabled={index === 0}
              className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
              title="تحريك لأعلى"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>

            {/* Move Down */}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => moveItem(index, index + 1)}
              disabled={index === totalItems - 1}
              className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
              title="تحريك لأسفل"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* Duplicate */}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => duplicateItem(item.id)}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="تكرار الدواء"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>

            {/* Delete */}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => removeItem(item.id)}
              className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"
              title="حذف من الروشتة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Prescription Fields: Dosage, Frequency, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          {/* Dosage */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
              <span>الجرعة (Dosage)</span>
            </label>
            <Input
              value={item.dosage}
              onChange={(e) => updateItem(item.id, { dosage: e.target.value })}
              placeholder="قرص واحد"
              className="h-8 text-xs bg-slate-50/70 border-slate-200 focus:bg-white font-semibold"
            />
            {/* Quick chips */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
              {DOSAGE_PRESETS.slice(0, 3).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateItem(item.id, { dosage: p })}
                  className="text-[10px] bg-slate-100 hover:bg-[#E3F5EE] hover:text-[#074C3A] text-slate-600 px-1.5 py-0.5 rounded-md whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
              <span>التكرار (Frequency)</span>
            </label>
            <Input
              value={item.frequency}
              onChange={(e) => updateItem(item.id, { frequency: e.target.value })}
              placeholder="كل 8 ساعات"
              className="h-8 text-xs bg-slate-50/70 border-slate-200 focus:bg-white font-semibold"
            />
            {/* Quick chips */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
              {FREQUENCY_PRESETS.slice(0, 3).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateItem(item.id, { frequency: p })}
                  className="text-[10px] bg-slate-100 hover:bg-[#E3F5EE] hover:text-[#074C3A] text-slate-600 px-1.5 py-0.5 rounded-md whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
              <span>المدة (Duration)</span>
            </label>
            <Input
              value={item.duration}
              onChange={(e) => updateItem(item.id, { duration: e.target.value })}
              placeholder="لمدة 5 أيام"
              className="h-8 text-xs bg-slate-50/70 border-slate-200 focus:bg-white font-semibold"
            />
            {/* Quick chips */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
              {DURATION_PRESETS.slice(0, 3).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateItem(item.id, { duration: p })}
                  className="text-[10px] bg-slate-100 hover:bg-[#E3F5EE] hover:text-[#074C3A] text-slate-600 px-1.5 py-0.5 rounded-md whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Medicine Specific Instructions */}
        <div className="pt-2.5 mt-1 border-t border-slate-100 space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <span>إرشادات خاصة بهذا الدواء (اختياري):</span>
            </label>
            {item.instructions && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                تظهر تحت الدواء في الروشتة المطبوعة
              </span>
            )}
          </div>
          <Input
            value={item.instructions || ''}
            onChange={(e) => updateItem(item.id, { instructions: e.target.value })}
            placeholder="مثال: بعد الأكل بنصف ساعة، يُشرب مع كوب ماء كبير، قبل النوم..."
            className="h-8 text-xs bg-slate-50/70 border-dashed border-slate-300 focus:bg-white placeholder:text-slate-400 font-medium"
          />
          {/* Quick chips for medicine instructions */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
            {['بعد الأكل بنصف ساعة', 'قبل الأكل بنصف ساعة', 'مع كوب ماء وفير', 'قبل النوم', 'عند اللزوم'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => updateItem(item.id, { instructions: chip })}
                className="text-[10px] bg-slate-100 hover:bg-[#E3F5EE] hover:text-[#074C3A] text-slate-600 px-2 py-0.5 rounded-md whitespace-nowrap transition-colors"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PrescriptionMedicineList() {
  const { items } = usePrescriptionStore();

  if (items.length === 0) {
    return (
      <Card className="border-2 border-dashed border-[#D0E5DC] bg-white/60 p-8 sm:p-12 text-center rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center mx-auto mb-3">
          <Pill className="w-7 h-7" />
        </div>
        <h3 className="text-base font-black text-slate-800">
          لم يتم إضافة أي أدوية للروشتة بعد
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          استخدم شريط البحث أعلاه للبحث عن الأدوية المصرية أو العالمية، أو أضف دواءك المخصص فوراً بنقرة واحدة.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-800">
            قائمة الأدوية المقررة
          </span>
          <Badge variant="outline" className="bg-white border-[#D0E5DC] font-black text-[#0B7B5E]">
            {items.length} {items.length === 1 ? 'دواء' : 'أدوية'}
          </Badge>
        </div>
        <span className="text-xs text-slate-400">يمكنك إعادة الترتيب بسهولة بالأسهم</span>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <PrescriptionItemRow
            key={item.id}
            item={item}
            index={idx}
            totalItems={items.length}
          />
        ))}
      </div>
    </div>
  );
}
