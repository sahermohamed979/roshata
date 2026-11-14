'use client';

import React, { useState } from 'react';
import {
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Type,
  FileText,
  User,
  Sparkles,
  Stethoscope,
  Pill,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { useTemplateStore } from '@/stores/template.store';
import type {
  TemplateBlockElement,
  TemplateElementType,
} from '@/types/template.types';

export function TemplateAdvancedCanvas() {
  const {
    activeTemplate,
    reorderElements,
    toggleElementVisibility,
    updateElement,
    addCustomElement,
    removeElement,
  } = useTemplateStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newElementType, setNewElementType] = useState<TemplateElementType>('custom_text');
  const [newElementTitle, setNewElementTitle] = useState('');
  const [newElementText, setNewElementText] = useState('');

  if (!activeTemplate) return null;

  const elements = activeTemplate.elements || [];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElementTitle.trim()) return;

    addCustomElement(newElementType, newElementTitle.trim(), newElementText.trim());
    setNewElementTitle('');
    setNewElementText('');
    setIsAddDialogOpen(false);
  };

  const getElementIcon = (type: TemplateElementType) => {
    switch (type) {
      case 'header':
        return <Stethoscope className="w-4 h-4 text-[#0B7B5E]" />;
      case 'patient_box':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'rx_watermark':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'medications':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'instructions':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'doctor_signature':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'footer':
        return <Calendar className="w-4 h-4 text-slate-600" />;
      case 'custom_text':
        return <Type className="w-4 h-4 text-teal-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Canvas Header & Description */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D0E5DC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">المصمم المرئي لمخطط الروشتة (Visual Layout)</h2>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
              Stage B
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            ترتيب العناصر رأسياً، التحكم في ظهور كل قسم، وإضافة نصوص وتنبيهات مخصصة
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة عنصر مخصص</span>
        </Button>
      </div>

      {/* Elements Ordering Stack */}
      <div className="space-y-2.5">
        {elements.map((el, idx) => {
          const isCustom = el.id.startsWith('elem_custom_');
          const isFirst = idx === 0;
          const isLast = idx === elements.length - 1;

          return (
            <Card
              key={el.id}
              className={`border transition-all rounded-2xl ${
                el.visible
                  ? 'border-slate-200 bg-white shadow-2xs'
                  : 'border-slate-200/60 bg-slate-50/60 opacity-60'
              }`}
            >
              <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Right: Drag Handle, Number, Icon, Title */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                    {idx + 1}
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    {getElementIcon(el.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-slate-900">{el.title}</span>
                      {isCustom && (
                        <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.2 rounded font-bold">
                          مخصص
                        </span>
                      )}
                    </div>
                    {el.customText && (
                      <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-sm mt-0.5">
                        "{el.customText}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Left: Controls (Move Up/Down, Alignment, Visibility, Delete) */}
                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  {/* Alignment Controls */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => updateElement(el.id, { alignment: 'right' })}
                      className={`p-1.5 rounded ${
                        el.alignment === 'right' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                      title="محاذاة لليمين"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateElement(el.id, { alignment: 'center' })}
                      className={`p-1.5 rounded ${
                        el.alignment === 'center' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                      title="توسيط"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateElement(el.id, { alignment: 'left' })}
                      className={`p-1.5 rounded ${
                        el.alignment === 'left' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                      title="محاذاة لليسار"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Move Up / Down Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isFirst}
                      onClick={() => reorderElements(idx, idx - 1)}
                      className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isLast}
                      onClick={() => reorderElements(idx, idx + 1)}
                      className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Toggle Visibility */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleElementVisibility(el.id)}
                    className={`h-8 w-8 p-0 rounded-lg ${
                      el.visible
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-400 hover:bg-slate-200'
                    }`}
                    title={el.visible ? 'إخفاء العنصر' : 'إظهار العنصر'}
                  >
                    {el.visible ? <Eye className="w-4 h-4 text-[#0B7B5E]" /> : <EyeOff className="w-4 h-4" />}
                  </Button>

                  {/* Delete custom element */}
                  {isCustom && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeElement(el.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg"
                      title="حذف العنصر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Custom Element Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6" dir="rtl">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader className="text-right pb-3 border-b border-slate-100">
              <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>إضافة عنصر إكلينيكي مخصص</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">نوع العنصر</Label>
                <select
                  value={newElementType}
                  onChange={(e) => setNewElementType(e.target.value as TemplateElementType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="custom_text">فقرة نصية مخصصة (تنبيه أو إشعار)</option>
                  <option value="divider">خط فاصل زخرفي (Divider)</option>
                  <option value="instructions">صندوق إرشادات عامة</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">عنوان العنصر (للتعريف)</Label>
                <Input
                  required
                  placeholder="مثال: تنبيه الصيدلي بعدم تكرار الصرف"
                  value={newElementTitle}
                  onChange={(e) => setNewElementTitle(e.target.value)}
                  className="text-sm font-semibold"
                />
              </div>

              {newElementType === 'custom_text' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">النص المطبوع في الروشتة</Label>
                  <Input
                    required
                    placeholder="مثال: لا يصرف الدواء إلا بإشراف طبي دقيق"
                    value={newElementText}
                    onChange={(e) => setNewElementText(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:justify-start pt-3 border-t border-slate-100">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 rounded-xl"
              >
                إضافة للمخطط
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs font-bold rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
