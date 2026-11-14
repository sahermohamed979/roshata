'use client';

import React, { useRef, useState } from 'react';
import {
  Stethoscope,
  Building2,
  Palette,
  FileText,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Phone,
  Plus,
  Trash2,
  Sliders,
  Type,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useTemplateStore } from '@/stores/template.store';
import type { HeaderLayout, FooterLayout, PaperSize } from '@/types/template.types';
import { toast } from 'sonner';

const COLOR_PRESETS = [
  { name: 'الزمرد الطبي', primary: '#0B7B5E', secondary: '#45DBA5' },
  { name: 'الياقوت الأزرق', primary: '#1D4ED8', secondary: '#93C5FD' },
  { name: 'السماوي السريري', primary: '#0E7490', secondary: '#67E8F9' },
  { name: 'العنابي الراقي', primary: '#9F1239', secondary: '#FDA4AF' },
  { name: 'الرمادي الهادئ', primary: '#334155', secondary: '#94A3B8' },
  { name: 'البنفسجي الجراحي', primary: '#6D28D9', secondary: '#C4B5FD' },
];

const FONT_PRESETS = [
  { id: 'Cairo', name: 'Cairo (القاهرة - رسمي وواضح)' },
  { id: 'Readex Pro', name: 'Readex Pro (عصري ومقروء)' },
  { id: 'Tajawal', name: 'Tajawal (تجوال - ناعم وحديث)' },
  { id: 'IBM Plex Sans Arabic', name: 'IBM Plex Sans (تقني وطبي)' },
];

export function TemplateSimpleForm() {
  const { activeTemplate, updateField } = useTemplateStore();

  const [activeTab, setActiveTab] = useState<'doctor' | 'branding' | 'layout'>('doctor');
  const [newPhoneInput, setNewPhoneInput] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  if (!activeTemplate) return null;

  // File Upload Handlers (converts image to offline-ready Base64 Data URL)
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'signatureUrl' | 'stampUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateField(field, base64);
        toast.success('تم تحميل الصورة بنجاح للقالب');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhone = () => {
    if (!newPhoneInput.trim()) return;
    const current = activeTemplate.clinicPhones || [];
    updateField('clinicPhones', [...current, newPhoneInput.trim()]);
    setNewPhoneInput('');
  };

  const handleRemovePhone = (index: number) => {
    const current = activeTemplate.clinicPhones || [];
    const updated = current.filter((_, idx) => idx !== index);
    updateField('clinicPhones', updated);
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D0E5DC] rounded-2xl shadow-2xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('doctor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === 'doctor'
              ? 'bg-[#0B7B5E] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>بيانات الطبيب والعيادة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === 'branding'
              ? 'bg-[#0B7B5E] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>الهوية البصرية والأصول (الشعار والتوقيع)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === 'layout'
              ? 'bg-[#0B7B5E] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>تخطيط الورق ومقاسات الطباعة</span>
        </button>
      </div>

      {/* ════════════════════ TAB 1: DOCTOR & CLINIC ════════════════════ */}
      {activeTab === 'doctor' && (
        <div className="space-y-4">
          {/* Doctor Info Card */}
          <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <Stethoscope className="w-4 h-4 text-[#0B7B5E]" />
                <span>بيانات الطبيب المعالج والترخيص</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">اسم الطبيب (عربي)</Label>
                  <Input
                    value={activeTemplate.doctorNameAr}
                    onChange={(e) => updateField('doctorNameAr', e.target.value)}
                    className="text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Doctor Name (English)</Label>
                  <Input
                    dir="ltr"
                    value={activeTemplate.doctorNameEn}
                    onChange={(e) => updateField('doctorNameEn', e.target.value)}
                    className="text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">اللقب والدرجة المهنية (عربي)</Label>
                  <Input
                    value={activeTemplate.medicalTitleAr}
                    onChange={(e) => updateField('medicalTitleAr', e.target.value)}
                    placeholder="استشاري جراحة الأنف والأذن والحنجرة"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Medical Title (English)</Label>
                  <Input
                    dir="ltr"
                    value={activeTemplate.medicalTitleEn}
                    onChange={(e) => updateField('medicalTitleEn', e.target.value)}
                    placeholder="Consultant of ENT Surgery"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">التخصص والجامعة (عربي)</Label>
                  <Input
                    value={activeTemplate.specialtyAr}
                    onChange={(e) => updateField('specialtyAr', e.target.value)}
                    placeholder="كلية الطب - جامعة القاهرة"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">رقم ترخيص النقابة / التسجيل</Label>
                  <Input
                    value={activeTemplate.syndicateNumber || ''}
                    onChange={(e) => updateField('syndicateNumber', e.target.value)}
                    placeholder="76542/نقابة أطباء مصر"
                    className="text-sm"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">المؤهلات الإكلينيكية والدكتوراه</Label>
                  <Input
                    value={activeTemplate.qualificationsAr || ''}
                    onChange={(e) => updateField('qualificationsAr', e.target.value)}
                    placeholder="دكتوراه جراحة الرأس والرقبة والمناظير الدقيقة - زميل الكلية الملكية للجراحين"
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinic Info Card */}
          <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <Building2 className="w-4 h-4 text-[#0B7B5E]" />
                <span>بيانات المركز الطبي وأرقام التواصل</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">اسم العيادة أو المركز (عربي)</Label>
                  <Input
                    value={activeTemplate.clinicNameAr}
                    onChange={(e) => updateField('clinicNameAr', e.target.value)}
                    className="text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Clinic Name (English)</Label>
                  <Input
                    dir="ltr"
                    value={activeTemplate.clinicNameEn}
                    onChange={(e) => updateField('clinicNameEn', e.target.value)}
                    className="text-sm font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">العنوان التفصيلي للعيادة</Label>
                  <Input
                    value={activeTemplate.clinicAddress}
                    onChange={(e) => updateField('clinicAddress', e.target.value)}
                    placeholder="القاهرة - المعادي - شارع النصر - برج الصفا الطبي - الدور الثالث"
                    className="text-sm"
                  />
                </div>

                {/* Phones List */}
                <div className="sm:col-span-2 space-y-2">
                  <Label className="text-xs font-bold text-slate-700">أرقام هواتف الحجز والاستفسار</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {(activeTemplate.clinicPhones || []).map((ph, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                        dir="ltr"
                      >
                        <Phone className="w-3 h-3 text-[#0B7B5E]" />
                        <span>{ph}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePhone(idx)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 max-w-sm pt-1">
                    <Input
                      dir="ltr"
                      placeholder="أدخل رقم هاتف جديد..."
                      value={newPhoneInput}
                      onChange={(e) => setNewPhoneInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPhone();
                        }
                      }}
                      className="text-xs h-9"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPhone}
                      className="h-9 text-xs font-bold gap-1 border-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#0B7B5E]" />
                      <span>إضافة</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">البريد الإلكتروني للعيادة</Label>
                  <Input
                    dir="ltr"
                    value={activeTemplate.clinicEmail || ''}
                    onChange={(e) => updateField('clinicEmail', e.target.value)}
                    placeholder="info@roshteh.clinic"
                    className="text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">خط الطوارئ الساخن (اختياري)</Label>
                  <Input
                    dir="ltr"
                    value={activeTemplate.emergencyPhone || ''}
                    onChange={(e) => updateField('emergencyPhone', e.target.value)}
                    placeholder="01099998888"
                    className="text-sm font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">شروط الاستشارة والإعادة المقررة</Label>
                  <Input
                    value={activeTemplate.returnNotice || ''}
                    onChange={(e) => updateField('returnNotice', e.target.value)}
                    placeholder="الكشف ساري لمدة 14 يوماً من تاريخ الزيارة، الإعادة بموجب أصل الروشتة"
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════ TAB 2: BRANDING & ASSETS ════════════════════ */}
      {activeTab === 'branding' && (
        <div className="space-y-4">
          {/* Logo & Signature Assets Card */}
          <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <ImageIcon className="w-4 h-4 text-[#0B7B5E]" />
                <span>شعار العيادة وتوقيع وختم الطبيب (محفوظ محلياً 100%)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Logo Box */}
                <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50 space-y-3">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-800 block">شعار العيادة (Logo)</span>
                    <span className="text-[11px] text-slate-500 block">يظهر في ترويسة الروشتة</span>
                  </div>

                  <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                    {activeTemplate.logoUrl ? (
                      <img
                        src={activeTemplate.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logoUrl')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex-1 text-xs font-bold gap-1 rounded-xl border-slate-200"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0B7B5E]" />
                      <span>{activeTemplate.logoUrl ? 'تغيير' : 'رفع الشعار'}</span>
                    </Button>
                    {activeTemplate.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateField('logoUrl', undefined)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Signature Box */}
                <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50 space-y-3">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-800 block">توقيع الطبيب (Signature)</span>
                    <span className="text-[11px] text-slate-500 block">يظهر أسفل الروشتة فوق الاسم</span>
                  </div>

                  <div className="w-32 h-20 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                    {activeTemplate.signatureUrl ? (
                      <img
                        src={activeTemplate.signatureUrl}
                        alt="Signature"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="font-serif italic text-slate-300 text-xs">توقيع رقمي</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="file"
                      ref={signatureInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'signatureUrl')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => signatureInputRef.current?.click()}
                      className="flex-1 text-xs font-bold gap-1 rounded-xl border-slate-200"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0B7B5E]" />
                      <span>{activeTemplate.signatureUrl ? 'تغيير' : 'رفع التوقيع'}</span>
                    </Button>
                    {activeTemplate.signatureUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateField('signatureUrl', undefined)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stamp Box */}
                <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50 space-y-3">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-800 block">ختم العيادة (Stamp)</span>
                    <span className="text-[11px] text-slate-500 block">ختم دائري أو مستطيل</span>
                  </div>

                  <div className="w-24 h-24 rounded-full border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                    {activeTemplate.stampUrl ? (
                      <img
                        src={activeTemplate.stampUrl}
                        alt="Stamp"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-300 font-bold">ختم العيادة</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="file"
                      ref={stampInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'stampUrl')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => stampInputRef.current?.click()}
                      className="flex-1 text-xs font-bold gap-1 rounded-xl border-slate-200"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0B7B5E]" />
                      <span>{activeTemplate.stampUrl ? 'تغيير' : 'رفع الختم'}</span>
                    </Button>
                    {activeTemplate.stampUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateField('stampUrl', undefined)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Palettes & Typography Card */}
          <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <Palette className="w-4 h-4 text-[#0B7B5E]" />
                <span>ألوان الهوية والخطوط الطبية</span>
              </div>

              {/* Color Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">الألوان الطبية الجاهزة</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COLOR_PRESETS.map((col) => {
                    const isSelected = activeTemplate.primaryColor.toLowerCase() === col.primary.toLowerCase();
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => {
                          updateField('primaryColor', col.primary);
                          updateField('secondaryColor', col.secondary);
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-right transition-all ${
                          isSelected
                            ? 'border-[#0B7B5E] bg-[#E3F5EE]/40 text-[#074C3A] ring-1 ring-[#0B7B5E]'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full shrink-0 shadow-2xs flex items-center justify-center text-white"
                          style={{ backgroundColor: col.primary }}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-bold">{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom HEX Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">اللون الأساسي (Primary Color)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeTemplate.primaryColor}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <Input
                      dir="ltr"
                      value={activeTemplate.primaryColor}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">نوع الخط الطبي (Typography)</Label>
                  <select
                    value={activeTemplate.fontFamily}
                    onChange={(e) => updateField('fontFamily', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B7B5E]"
                  >
                    {FONT_PRESETS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════ TAB 3: LAYOUT & MARGINS ════════════════════ */}
      {activeTab === 'layout' && (
        <div className="space-y-4">
          {/* Header & Footer Layout Styles */}
          <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <FileText className="w-4 h-4 text-[#0B7B5E]" />
                <span>تخطيط الترويسة ومقاس الورق</span>
              </div>

              {/* Header Layout Options */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">شكل ترويسة الروشتة (Header Layout)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'split', name: 'متقابل (Split)', desc: 'الطبيب يميناً والعيادة يساراً' },
                    { id: 'centered', name: 'مركزي (Centered)', desc: 'الطبيب والشعار بالمنتصف' },
                    { id: 'modern', name: 'عصري (Modern Card)', desc: 'خلفية مميزة للشعار والبيانات' },
                    { id: 'minimalist', name: 'هادئ (Minimalist)', desc: 'خط رفيع وبساطة مطلقة' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => updateField('headerLayout', style.id as HeaderLayout)}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        activeTemplate.headerLayout === style.id
                          ? 'border-[#0B7B5E] bg-[#E3F5EE]/40 text-[#074C3A] ring-1 ring-[#0B7B5E]'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-black text-xs">{style.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Dimensions & Margins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">مقاس الورق الافتراضي</Label>
                  <div className="p-2.5 rounded-xl border border-[#0B7B5E] bg-[#E3F5EE]/40 text-[#074C3A] font-black text-xs text-center flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0B7B5E]"></span>
                    <span>مقاس A5 القياسي المعتمد للروشتة (148 × 210 مم)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">حجم الخط الإكلينيكي</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateField('fontSize', sz)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          activeTemplate.fontSize === sz
                            ? 'border-[#0B7B5E] bg-[#E3F5EE]/40 text-[#074C3A] font-black'
                            : 'border-slate-200 bg-white text-slate-700 font-bold'
                        } text-xs`}
                      >
                        {sz === 'small' ? 'مضغوط' : sz === 'medium' ? 'معياري' : 'كبير'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <Label className="text-xs font-black text-slate-800">خيارات عرض العناصر في الروشتة</Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={activeTemplate.showWatermark}
                      onChange={(e) => updateField('showWatermark', e.target.checked)}
                      className="rounded text-[#0B7B5E] focus:ring-[#0B7B5E] w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-800">إظهار علامة Rx المائية في الخلفية</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={activeTemplate.showSignature}
                      onChange={(e) => updateField('showSignature', e.target.checked)}
                      className="rounded text-[#0B7B5E] focus:ring-[#0B7B5E] w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-800">إظهار منطقة توقيع الطبيب</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={activeTemplate.showPatientBox}
                      onChange={(e) => updateField('showPatientBox', e.target.checked)}
                      className="rounded text-[#0B7B5E] focus:ring-[#0B7B5E] w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-800">إظهار شريط بيانات المريض والعمر</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={activeTemplate.showReturnPolicy}
                      onChange={(e) => updateField('showReturnPolicy', e.target.checked)}
                      className="rounded text-[#0B7B5E] focus:ring-[#0B7B5E] w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-800">إظهار شروط وموعد الاستشارة أسفل الصفحة</span>
                  </label>
                </div>
              </div>

              {/* Watermark Opacity Slider */}
              {activeTemplate.showWatermark && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>شفافية العلامة المائية:</span>
                    <span className="font-mono text-[#0B7B5E]">
                      {Math.round(activeTemplate.watermarkOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.03"
                    max="0.25"
                    step="0.01"
                    value={activeTemplate.watermarkOpacity}
                    onChange={(e) => updateField('watermarkOpacity', parseFloat(e.target.value))}
                    className="w-full accent-[#0B7B5E]"
                  />
                </div>
              )}

              {/* Back Page Configuration */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800 block">صفحة ظهر الروشتة (Back Page)</span>
                    <span className="text-[11px] text-slate-500 block">
                      طباعة تعليمات ما بعد الكشف وعلامات التحذير على ظهر الورقة
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeTemplate.hasBackPage}
                    onChange={(e) => updateField('hasBackPage', e.target.checked)}
                    className="rounded text-[#0B7B5E] focus:ring-[#0B7B5E] w-4 h-4"
                  />
                </div>

                {activeTemplate.hasBackPage && (
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs font-bold text-slate-700">تعليمات ظهر الروشتة المخصصة</Label>
                    <Textarea
                      rows={3}
                      value={activeTemplate.backPageNotes || ''}
                      onChange={(e) => updateField('backPageNotes', e.target.value)}
                      placeholder="أدخل التعليمات الطبية العامة التي تطبع على ظهر الروشتة..."
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
