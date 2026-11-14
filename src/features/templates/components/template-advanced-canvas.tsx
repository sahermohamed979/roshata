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
  Sliders,
  MoveVertical,
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function TemplateAdvancedCanvas() {
  const {
    activeTemplate,
    reorderElements,
    toggleElementVisibility,
    updateElement,
    addCustomElement,
    removeElement,
    updateField,
  } = useTemplateStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newElementType, setNewElementType] = useState<TemplateElementType>('custom_text');
  const [newElementTitle, setNewElementTitle] = useState('');
  const [newElementText, setNewElementText] = useState('');

  // Drag-and-Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

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

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'top' : 'bottom';

    setDragOverIndex(index);
    setDropPosition(pos);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    let calculatedTarget = targetIndex;
    if (dropPosition === 'bottom' && draggedIndex < targetIndex) {
      calculatedTarget = targetIndex;
    } else if (dropPosition === 'bottom' && draggedIndex > targetIndex) {
      calculatedTarget = targetIndex + 1;
    } else if (dropPosition === 'top' && draggedIndex < targetIndex) {
      calculatedTarget = targetIndex - 1;
    } else if (dropPosition === 'top' && draggedIndex > targetIndex) {
      calculatedTarget = targetIndex;
    }

    calculatedTarget = Math.max(0, Math.min(elements.length - 1, calculatedTarget));
    const movedTitle = elements[draggedIndex]?.title || 'العنصر';

    reorderElements(draggedIndex, calculatedTarget);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
    toast.success(`تم تغيير موضع "${movedTitle}" بنجاح`);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
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
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            امسك أي قسم واسحبه بالماوس لتحريكه لأعلى أو لأسفل، أو استخدم الأسهم للتحريك الدقيق
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة عنصر مخصص</span>
        </Button>
      </div>

      {/* Vertical Positioning & Offset Bar (تحريك القالب رأسياً على الورقة لأعلى أو لأسفل) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#D0E5DC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0B7B5E] flex items-center justify-center shrink-0">
            <MoveVertical className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 block">
              موضع القالب رأسياً على الورقة (الهامش العلوي)
            </span>
            <span className="text-[11px] text-slate-500">
              إزاحة محتوى الروشتة كاملاً لأعلى أو لأسفل ({activeTemplate.marginTopMm ?? 15} مم)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Shift Up */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updateField('marginTopMm', Math.max(0, (activeTemplate.marginTopMm ?? 15) - 3))}
            className="h-8 text-xs font-bold gap-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="رفع القالب لأعلى (تقليل الهامش العلوي)"
          >
            <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
            <span>إزاحة لأعلى (-3 مم)</span>
          </Button>

          {/* Current Millimeters Badge */}
          <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-black text-slate-800">
            {activeTemplate.marginTopMm ?? 15} مم
          </div>

          {/* Shift Down */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updateField('marginTopMm', Math.min(80, (activeTemplate.marginTopMm ?? 15) + 3))}
            className="h-8 text-xs font-bold gap-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="إنزال القالب لأسفل (زيادة الهامش العلوي)"
          >
            <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
            <span>إزاحة لأسفل (+3 مم)</span>
          </Button>

          {/* Reset */}
          <button
            type="button"
            onClick={() => updateField('marginTopMm', 15)}
            className="text-[11px] text-slate-400 hover:text-slate-700 underline font-semibold mr-1 cursor-pointer"
            title="إعادة ضبط للموضع القياسي (15 مم)"
          >
            الافتراضي
          </button>
        </div>
      </div>

      {/* Elements Ordering Stack with Native Drag and Drop */}
      <div className="space-y-2.5">
        {elements.map((el, idx) => {
          const isCustom = el.id.startsWith('elem_custom_');
          const isFirst = idx === 0;
          const isLast = idx === elements.length - 1;
          const isBeingDragged = draggedIndex === idx;
          const isDragOver = dragOverIndex === idx;

          return (
            <div
              key={el.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={cn(
                'transition-all duration-150 relative select-none rounded-2xl',
                isBeingDragged && 'opacity-40 scale-[0.99]',
                isDragOver && dropPosition === 'top' && 'pt-2 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-[#0B7B5E] before:rounded-full before:shadow-md',
                isDragOver && dropPosition === 'bottom' && 'pb-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1.5 after:bg-[#0B7B5E] after:rounded-full after:shadow-md'
              )}
            >
              <Card
                className={cn(
                  'border transition-all rounded-2xl',
                  el.visible
                    ? 'border-slate-200 bg-white shadow-2xs hover:border-[#0B7B5E]/40 hover:shadow-xs'
                    : 'border-slate-200/60 bg-slate-50/60 opacity-60'
                )}
              >
                <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Right: Drag Handle, Number, Icon, Title */}
                  <div className="flex items-center gap-2.5">
                    {/* Draggable Grip Handle */}
                    <div
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-grab active:cursor-grabbing transition-colors"
                      title="اضغط واسحب بالماوس لتحريك هذا القسم لأعلى أو لأسفل"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Order Number Badge */}
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
                      {idx + 1}
                    </div>

                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getElementIcon(el.type)}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-slate-900">{el.title}</span>
                        {isCustom && (
                          <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.2 rounded font-bold">
                            مخصص
                          </span>
                        )}
                      </div>
                      {el.customText && (
                        <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-sm mt-0.5">
                          &quot;{el.customText}&quot;
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
                        className={cn(
                          'p-1.5 rounded transition-all cursor-pointer',
                          el.alignment === 'right' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                        )}
                        title="محاذاة لليمين"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateElement(el.id, { alignment: 'center' })}
                        className={cn(
                          'p-1.5 rounded transition-all cursor-pointer',
                          el.alignment === 'center' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                        )}
                        title="توسيط"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateElement(el.id, { alignment: 'left' })}
                        className={cn(
                          'p-1.5 rounded transition-all cursor-pointer',
                          el.alignment === 'left' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                        )}
                        title="محاذاة لليسار"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isFirst}
                        onClick={() => reorderElements(idx, idx - 1)}
                        className="h-7 w-7 p-0 text-slate-600 hover:bg-slate-200 rounded-md disabled:opacity-20 cursor-pointer"
                        title="تحريك لأعلى"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isLast}
                        onClick={() => reorderElements(idx, idx + 1)}
                        className="h-7 w-7 p-0 text-slate-600 hover:bg-slate-200 rounded-md disabled:opacity-20 cursor-pointer"
                        title="تحريك لأسفل"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                      </Button>
                    </div>

                    {/* Toggle Visibility */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleElementVisibility(el.id)}
                      className={cn(
                        'h-8 w-8 p-0 rounded-lg cursor-pointer',
                        el.visible
                          ? 'text-[#0B7B5E] hover:bg-[#E3F5EE]'
                          : 'text-slate-400 hover:bg-slate-200'
                      )}
                      title={el.visible ? 'إخفاء القسم من الروشتة' : 'إظهار القسم في الروشتة'}
                    >
                      {el.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>

                    {/* Delete custom element */}
                    {isCustom && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeElement(el.id)}
                        className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg cursor-pointer"
                        title="حذف العنصر المخصص"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 rounded-xl cursor-pointer"
              >
                إضافة للمخطط
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs font-bold rounded-xl border-slate-200 cursor-pointer"
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
