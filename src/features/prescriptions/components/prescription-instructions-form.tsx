'use client';

import React, { useState } from 'react';
import { Plus, Trash2, HeartPulse, Sparkles, Check, ListChecks } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { toast } from 'sonner';

const QUICK_INSTRUCTION_PRESETS = [
  'راحة تامة لمدة يومين',
  'الإكثار من شرب السوائل الدافئة',
  'تجنب الأطعمة الحارة والمقليات',
  'مراجعة العيادة بعد أسبوع',
  'الالتزام بمواعيد الجرعات المحددة',
  'تجنب المجهود البدني الشاق',
];

export function PrescriptionInstructionsForm() {
  const { instructionsList, addInstruction, removeInstruction, clearInstructions } =
    usePrescriptionStore();

  const [inputVal, setInputVal] = useState('');

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      toast.warning('يرجى كتابة نص الإرشاد أو اختياره من القائمة');
      return;
    }
    addInstruction(trimmed);
    setInputVal('');
    toast.success('تمت إضافة الإرشاد إلى الروشتة');
  };

  const handleAddPreset = (preset: string) => {
    if (instructionsList.includes(preset)) {
      toast.info('هذا الإرشاد مضاف بالفعل');
      return;
    }
    addInstruction(preset);
    toast.success(`تمت إضافة: "${preset}"`);
  };

  return (
    <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center shrink-0 shadow-2xs">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  إضافة تعليمات وإرشادات للمريض
                </span>
                <Badge
                  variant={instructionsList.length > 0 ? 'success' : 'outline'}
                  className="text-[10px] font-bold"
                >
                  {instructionsList.length > 0
                    ? `${instructionsList.length} إرشادات مضافة`
                    : 'اختياري'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                تُضاف الإرشادات هنا مثل الأدوية تماماً — لن تظهر في الروشتة والطباعة إلا إذا قمت بإضافتها.
              </p>
            </div>
          </div>

          {instructionsList.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInstructions}
              className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-7 px-2.5 gap-1 rounded-xl"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف كل الإرشادات</span>
            </Button>
          )}
        </div>

        {/* The Instruction Form */}
        <form onSubmit={handleAddCustom} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="اكتب الإرشاد الطبي هنا (مثال: راحة تامة، تجنب الأطعمة الدسمة)..."
              className="h-10 text-xs bg-slate-50/70 border-slate-200 focus:bg-white placeholder:text-slate-400 rounded-xl pr-3"
            />
          </div>
          <Button
            type="submit"
            className="h-10 px-4 bg-[#0B7B5E] hover:bg-[#074C3A] text-white text-xs font-black rounded-xl gap-1 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة إرشاد</span>
          </Button>
        </form>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 ml-1">
            <Sparkles className="w-3 h-3 text-[#0B7B5E]" />
            <span>إرشادات جاهزة بنقرة واحدة:</span>
          </span>
          {QUICK_INSTRUCTION_PRESETS.map((preset) => {
            const isAdded = instructionsList.includes(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all border ${
                  isAdded
                    ? 'bg-emerald-100/70 text-[#074C3A] border-emerald-300 font-bold'
                    : 'bg-slate-100 hover:bg-[#E3F5EE] hover:text-[#074C3A] text-slate-700 border-transparent'
                }`}
              >
                {isAdded ? '✓ ' : '+ '}
                {preset}
              </button>
            );
          })}
        </div>

        {/* Added Instructions List */}
        {instructionsList.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] font-black text-slate-700 block mb-1">
              الإرشادات المدرجة في الروشتة حالياً:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {instructionsList.map((instruction, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 group hover:border-[#0B7B5E]/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#0B7B5E] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-semibold truncate">
                      {instruction}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeInstruction(idx)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                    title="حذف هذا الإرشاد"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
