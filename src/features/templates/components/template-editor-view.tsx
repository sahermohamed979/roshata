'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutTemplate,
  Save,
  CheckCircle2,
  Stethoscope,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Palette,
  Sparkles,
  Eye,
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { TemplateRepository } from '../repositories/template.repository';
import type { PrescriptionTemplate } from '@/types/template.types';
import { toast } from 'sonner';

export function TemplateEditorView() {
  const [template, setTemplate] = useState<PrescriptionTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      const current = await TemplateRepository.getDefault();
      setTemplate(current || null);
    } catch (err) {
      console.error('Failed to load default template:', err);
    }
  };

  const handleChange = (field: keyof PrescriptionTemplate, value: any) => {
    if (!template) return;
    setTemplate({
      ...template,
      [field]: value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    setIsSaving(true);
    try {
      await TemplateRepository.save(template);
      toast.success('تم حفظ إعدادات قالب الروشتة بنجاح في قاعدة البيانات المحلية');
    } catch (err) {
      console.error('Failed to save template:', err);
      toast.error('تعذر حفظ القالب محلياً');
    } finally {
      setIsSaving(false);
    }
  };

  if (!template) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold">
        جاري تحميل إعدادات القالب الطبي...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D0E5DC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] border border-[#0B7B5E]/30 flex items-center justify-center text-[#0B7B5E]">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">تخصيص قالب الروشتة والطباعة</h1>
            <p className="text-xs text-slate-500 font-medium">
              تحديد ترويسة الطبيب، بيانات العيادة، مقاس الورق الافتراضي، وإرشادات ظهر الروشتة
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs sm:text-sm h-10 px-5 rounded-xl shadow-xs gap-2 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Settings Form */}
        <div className="lg:col-span-8 space-y-5">
          {/* Doctor Header Section */}
          <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <Stethoscope className="w-4 h-4 text-[#0B7B5E]" />
                <span>بيانات الطبيب وترويسة الروشتة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">اسم الطبيب (عربي)</Label>
                  <Input
                    value={template.doctorNameAr}
                    onChange={(e) => handleChange('doctorNameAr', e.target.value)}
                    className="text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">اسم الطبيب (إنجليزي)</Label>
                  <Input
                    value={template.doctorNameEn}
                    onChange={(e) => handleChange('doctorNameEn', e.target.value)}
                    className="text-sm font-semibold"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">اللقب الطبي والمؤهلات (عربي)</Label>
                  <Input
                    value={template.medicalTitleAr}
                    onChange={(e) => handleChange('medicalTitleAr', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">اللقب والمؤهلات (إنجليزي)</Label>
                  <Input
                    value={template.medicalTitleEn}
                    onChange={(e) => handleChange('medicalTitleEn', e.target.value)}
                    className="text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinic & Footer Details */}
          <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <MapPin className="w-4 h-4 text-[#0B7B5E]" />
                <span>بيانات العيادة وتذييل الروشتة (Footer)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">اسم العيادة / المركز الطبي</Label>
                  <Input
                    value={template.clinicNameAr}
                    onChange={(e) => handleChange('clinicNameAr', e.target.value)}
                    className="text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">هواتف العيادة والواتساب</Label>
                  <Input
                    value={template.clinicPhones?.[0] || ''}
                    onChange={(e) => handleChange('clinicPhones', [e.target.value])}
                    className="text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">عنوان العيادة التفصيلي</Label>
                <Input
                  value={template.clinicAddress}
                  onChange={(e) => handleChange('clinicAddress', e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">فترة الاستشارة المجانية (ميعاد الإعادة)</Label>
                <Input
                  value={template.returnNotice || 'الإعادة خلال أسبوع من تاريخ الكشف'}
                  onChange={(e) => handleChange('returnNotice', e.target.value)}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Paper & Back Page Layout */}
          <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <Layers className="w-4 h-4 text-[#0B7B5E]" />
                <span>مقاس الورق وخيارات الوجه والخلف</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">مقاس الورق الافتراضي</Label>
                  <select
                    value={template.paperSize}
                    onChange={(e) => handleChange('paperSize', e.target.value)}
                    className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-bold text-slate-700"
                  >
                    <option value="A5">A5 (148mm × 210mm) - المقاس الطبي الأكثر شيوعاً</option>
                    <option value="A4">A4 (210mm × 297mm) - الورق المكتبي القياسي</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">طباعة الوجه والخلف (Front & Back)</Label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={template.hasBackPage}
                        onChange={(e) => handleChange('hasBackPage', e.target.checked)}
                        className="rounded text-[#0B7B5E] focus:ring-[#0B7B5E] w-4 h-4"
                      />
                      <span>تفعيل طباعة صفحة التعليمات في الظهر</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  إرشادات ظهر الروشتة المخصصة (Back Page Notes)
                </Label>
                <Textarea
                  value={template.backPageNotes || ''}
                  onChange={(e) => handleChange('backPageNotes', e.target.value)}
                  placeholder="اكتب الإرشادات العامة المطبوعة على ظهر الروشتة للمريض..."
                  rows={3}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Header Preview */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 space-y-4">
            <Card className="border-2 border-[#0B7B5E]/30 bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-[#0B7B5E] p-3 text-white flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  معاينة مباشرة للترويسة
                </span>
                <Badge variant="outline" className="text-white border-white/40 text-[10px]">
                  {template.paperSize}
                </Badge>
              </div>

              <div className="p-4 space-y-3 bg-[#FAFDFB]">
                <div className="border-b-2 border-[#0B7B5E] pb-2">
                  <h3 className="text-base font-black text-[#074C3A]">
                    {template.doctorNameAr || 'د. إسلام عبدالله كريمة'}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-700">
                    {template.medicalTitleAr || 'أخصائي الأنف والأذن والحنجرة'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold" dir="ltr">
                    {template.doctorNameEn || 'Dr. Eslam Kareema'}
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>اسم المريض: ....................</span>
                    <span>التاريخ: ..... / ..... / 2026</span>
                  </div>
                </div>

                <div className="p-3 bg-white border border-dashed border-slate-200 rounded-lg text-center text-xs font-serif italic text-slate-300">
                  ℞ [مساحة قائمة الأدوية المطبوعة]
                </div>

                <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-500 space-y-0.5">
                  <div className="font-bold text-[#074C3A]">
                    {template.clinicNameAr} · {template.returnNotice}
                  </div>
                  <div className="truncate">{template.clinicAddress}</div>
                  <div className="font-mono" dir="ltr">
                    {template.clinicPhones?.[0]}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}
