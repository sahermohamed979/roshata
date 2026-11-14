'use client';

import React, { useState } from 'react';
import {
  LayoutTemplate,
  Plus,
  Copy,
  Trash2,
  Star,
  Undo2,
  Redo2,
  Save,
  SlidersHorizontal,
  Layers,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useTemplateStore } from '@/stores/template.store';
import type { PaperSize } from '@/types/template.types';

export function TemplateManagementBar() {
  const {
    templates,
    activeTemplate,
    activeTemplateId,
    mode,
    isSaving,
    canUndo,
    canRedo,
    selectTemplate,
    createNewTemplate,
    duplicateCurrentTemplate,
    deleteCurrentTemplate,
    setAsDefault,
    setMode,
    undo,
    redo,
    saveActiveTemplate,
  } = useTemplateStore();

  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSize, setNewTemplateSize] = useState<PaperSize>('A5');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    await createNewTemplate(newTemplateName.trim(), newTemplateSize);
    setNewTemplateName('');
    setIsNewDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await deleteCurrentTemplate();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D0E5DC] shadow-2xs space-y-4">
        {/* Top Row: Template Info & Primary Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#E3F5EE] border border-[#0B7B5E]/30 flex items-center justify-center text-[#0B7B5E] shrink-0">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">مصمم قوالب الروشتات (Template Builder)</h1>
                {activeTemplate?.isDefault && (
                  <Badge className="bg-[#E3F5EE] text-[#074C3A] border-[#0B7B5E]/30 text-[11px] font-black gap-1">
                    <Star className="w-3 h-3 fill-[#0B7B5E]" />
                    <span>القالب الافتراضي</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                تخصيص كامل للهوية البصرية، ترويسة الطبيب، العلامة المائية، وتخطيط الطباعة A4 / A5
              </p>
            </div>
          </div>

          {/* Action Buttons: Undo/Redo & Save */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Undo / Redo */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="h-8 px-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg gap-1 disabled:opacity-30"
                title="تراجع (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تراجع</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="h-8 px-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg gap-1 disabled:opacity-30"
                title="إعادة (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إعادة</span>
              </Button>
            </div>

            {/* Save Button */}
            <Button
              type="button"
              onClick={saveActiveTemplate}
              disabled={isSaving}
              className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-black text-xs sm:text-sm h-10 px-5 rounded-xl shadow-xs gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ القالب محلياً'}</span>
            </Button>
          </div>
        </div>

        {/* Bottom Row: Template Selector, Duplication, Defaults & Mode Switcher */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Templates Dropdown & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">القالب النشط:</span>
            <select
              value={activeTemplateId || ''}
              onChange={(e) => selectTemplate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B7B5E]"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} {tpl.isDefault ? '★ (افتراضي)' : ''} ({tpl.paperSize})
                </option>
              ))}
            </select>

            {/* New Template */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewDialogOpen(true)}
              className="h-8 text-xs font-bold gap-1 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <Plus className="w-3.5 h-3.5 text-[#0B7B5E]" />
              <span>قالب جديد</span>
            </Button>

            {/* Duplicate */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={duplicateCurrentTemplate}
              className="h-8 text-xs font-bold gap-1 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" />
              <span>نسخ</span>
            </Button>

            {/* Set as Default */}
            {!activeTemplate?.isDefault && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => activeTemplate && setAsDefault(activeTemplate.id)}
                className="h-8 text-xs font-bold gap-1 rounded-xl border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 text-amber-800"
              >
                <Star className="w-3.5 h-3.5" />
                <span>تعيين كافتراضي</span>
              </Button>
            )}

            {/* Delete */}
            {templates.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl px-2"
                title="حذف القالب"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Mode Switcher: Simple (Stage A) vs Advanced (Stage B) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setMode('simple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                mode === 'simple'
                  ? 'bg-white text-[#074C3A] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0B7B5E]" />
              <span>الوضع البسيط (إعدادات)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('advanced')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                mode === 'advanced'
                  ? 'bg-white text-[#074C3A] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>الوضع المتقدم (المصمم المرئي)</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Template Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6" dir="rtl">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader className="text-right pb-3 border-b border-slate-100">
              <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0B7B5E]" />
                <span>إنشاء قالب روشتة جديد</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">اسم القالب</Label>
                <Input
                  required
                  placeholder="مثال: روشتة عيادة المعادي (A5)"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">مقاس الورق الافتراضي</Label>
                <div className="p-3 rounded-xl border border-[#0B7B5E] bg-[#E3F5EE]/40 text-[#074C3A] flex items-center justify-between">
                  <div>
                    <div className="font-black text-xs">مقاس A5 (المعياري المعتمد للروشتة)</div>
                    <div className="text-[10px] text-slate-500">148mm × 210mm (المقاس الطبي القياسي)</div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B7B5E]"></span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start pt-3 border-t border-slate-100">
              <Button
                type="submit"
                className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs px-5 rounded-xl"
              >
                إنشاء القالب
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewDialogOpen(false)}
                className="text-xs font-bold rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm bg-white rounded-2xl p-6" dir="rtl">
          <DialogHeader className="text-right pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-black text-red-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>تأكيد حذف القالب</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 text-xs text-slate-600 font-medium leading-relaxed">
            هل أنت متأكد من رغبتك في حذف قالب{' '}
            <strong className="text-slate-900 font-bold font-sans">
              "{activeTemplate?.name}"
            </strong>
            ؟ لا يمكن التراجع عن هذا الإجراء وسيتم ترقية قالب آخر ليكون افتراضياً.
          </div>

          <DialogFooter className="gap-2 sm:justify-start pt-3 border-t border-slate-100">
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 rounded-xl"
            >
              نعم، حذف القالب
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-xs font-bold rounded-xl border-slate-200"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
