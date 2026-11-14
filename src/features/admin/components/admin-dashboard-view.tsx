'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Database,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Layers,
  Sparkles,
  GitBranch,
  Pill,
  Building2,
  Stethoscope,
  RefreshCw,
  Edit,
  Trash2,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import type {
  CentralMedicine,
  CentralMedicineInput,
  DoctorMedicineSuggestion,
  SyncManifest,
} from '@/types/central-backend.types';
import { toast } from 'sonner';

export function AdminDashboardView() {
  const [activeTab, setActiveTab] = useState<'medicines' | 'versions' | 'suggestions' | 'sources'>('medicines');
  const [medicines, setMedicines] = useState<CentralMedicine[]>([]);
  const [manifest, setManifest] = useState<SyncManifest | null>(null);
  const [suggestions, setSuggestions] = useState<DoctorMedicineSuggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishNotes, setPublishNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // New Medicine Form State
  const [newMed, setNewMed] = useState<CentralMedicineInput>({
    tradeNameAr: '',
    tradeNameEn: '',
    activeIngredient: '',
    dosageForm: 'أقراص',
    strength: '',
    category: 'عام',
    barcode: '',
    price: 50,
    manufacturer: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch manifest
      const manRes = await fetch('/api/v1/medicines/manifest');
      if (manRes.ok) {
        const manData = await manRes.json();
        setManifest(manData);
      }

      // 2. Fetch medicines
      const medRes = await fetch('/api/v1/admin/medicines?limit=50');
      if (medRes.ok) {
        const medData = await medRes.json();
        setMedicines(medData.medicines || []);
      }

      // 3. Fetch suggestions
      const sugRes = await fetch('/api/v1/medicines/suggestions');
      if (sugRes.ok) {
        const sugData = await sugRes.json();
        setSuggestions(sugData.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.tradeNameAr || !newMed.tradeNameEn || !newMed.activeIngredient) {
      toast.error('يرجى ملء جميع الحقول الإلزامية');
      return;
    }

    try {
      const res = await fetch('/api/v1/admin/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed),
      });

      if (res.ok) {
        toast.success(`تمت إضافة الدواء بنجاح للقاعدة المركزية: ${newMed.tradeNameEn}`);
        setIsAddMedOpen(false);
        setNewMed({
          tradeNameAr: '',
          tradeNameEn: '',
          activeIngredient: '',
          dosageForm: 'أقراص',
          strength: '',
          category: 'عام',
          barcode: '',
          price: 50,
          manufacturer: '',
        });
        loadData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'تعذر إضافة الدواء');
      }
    } catch (err) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من إلغاء تنشيط الدواء: ${name}؟`)) return;

    try {
      const res = await fetch(`/api/v1/admin/medicines/${id}?reason=إلغاء_بأمر_المسؤول`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`تم إلغاء تنشيط الدواء: ${name}`);
        loadData();
      }
    } catch (err) {
      toast.error('فشل إلغاء التنشيط');
    }
  };

  const handlePublishVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      const res = await fetch('/api/v1/admin/versions/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseNotes: publishNotes || 'تحديث دوري للأدوية' }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`تم نشر الإصدار الجديد v${data.version.versionNumber} بنجاح للعيادات!`);
        setIsPublishOpen(false);
        setPublishNotes('');
        loadData();
      } else {
        toast.error('فشل نشر الإصدار الجديد');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء النشر');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReviewSuggestion = async (
    id: string,
    decision: 'approved' | 'rejected',
    tradeNameEn: string
  ) => {
    try {
      const res = await fetch(`/api/v1/admin/suggestions/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reviewerNotes: decision === 'approved' ? 'معتمد ومضاف للقاعدة' : 'غير متوافق مع الدليل الدوائي',
        }),
      });

      if (res.ok) {
        toast.success(
          decision === 'approved'
            ? `تم اعتماد المقترح وإضافته للقاعدة المركزية: ${tradeNameEn}`
            : `تم رفض المقترح: ${tradeNameEn}`
        );
        loadData();
      }
    } catch (err) {
      toast.error('فشل معالجة المقترح');
    }
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      m.tradeNameAr.includes(searchTerm) ||
      m.tradeNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* 1. Header & Quick Actions */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0B7B5E] flex items-center justify-center text-white shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">لوحة الإدارة المركزية (Central Admin Portal)</h1>
              <Badge className="bg-[#0B7B5E] text-white border-0 text-[10px] font-bold">
                Phase 6
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              إدارة الدليل الدوائي المركزي، نشر الإصدارات للعيادات، ومراجعة مقترحات الأطباء
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            onClick={loadData}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold h-9 rounded-xl gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsPublishOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>نشر إصدار جديد (v{(manifest?.version || 1) + 1})</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsAddMedOpen(true)}
            className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة دواء مركزي</span>
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block">إجمالي الأدوية المركزية</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                {manifest?.totalMedicines || medicines.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0B7B5E] flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block">الإصدار المنشور للعيادات</span>
              <span className="text-2xl font-black text-blue-600 font-mono mt-0.5 block">
                v{manifest?.version || 1}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block">تعديلات جاهزة للإصدار</span>
              <span className="text-2xl font-black text-amber-600 font-mono mt-0.5 block">
                {manifest?.changesCount || 0}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block">مقترحات الأطباء الجديدة</span>
              <span className="text-2xl font-black text-purple-600 font-mono mt-0.5 block">
                {suggestions.filter((s) => s.status === 'pending').length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('medicines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === 'medicines'
              ? 'bg-[#0B7B5E] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>الدليل الدوائي المركزي ({medicines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('versions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === 'versions'
              ? 'bg-[#0B7B5E] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>إصدارات وتحديثات العيادات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === 'suggestions'
              ? 'bg-[#0B7B5E] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>مراجعة مقترحات الأطباء ({suggestions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === 'sources'
              ? 'bg-[#0B7B5E] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>مصادر البيانات والتسعيرة الجبرية</span>
        </button>
      </div>

      {/* ════════════════════ TAB 1: MEDICINES CATALOG ════════════════════ */}
      {activeTab === 'medicines' && (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-2xs">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="بحث باسم الدواء، المادة الفعالة، أو الباركود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 text-xs"
                />
              </div>

              <div className="text-xs text-slate-500 font-bold">
                عرض {filteredMedicines.length} من أصل {medicines.length} دواء
              </div>
            </div>

            {/* Medicines Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                  <tr>
                    <th className="p-3">الاسم التجاري (En / Ar)</th>
                    <th className="p-3">المادة الفعالة</th>
                    <th className="p-3">الشكل والتركيز</th>
                    <th className="p-3">التصنيف</th>
                    <th className="p-3">الباركود</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredMedicines.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="font-black text-slate-900" dir="ltr">
                          {m.tradeNameEn}
                        </div>
                        <div className="text-[11px] text-slate-500">{m.tradeNameAr}</div>
                      </td>
                      <td className="p-3 text-slate-700" dir="ltr">
                        {m.activeIngredient}
                      </td>
                      <td className="p-3 text-slate-700">
                        {m.dosageForm} • {m.strength}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {m.category || 'عام'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500" dir="ltr">
                        {m.barcode || '—'}
                      </td>
                      <td className="p-3">
                        {m.isActive ? (
                          <Badge className="bg-emerald-50 text-[#0B7B5E] border-emerald-200 text-[10px] font-bold">
                            نشط
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
                            ملغى
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-left">
                        {m.isActive && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(m.id, m.tradeNameEn)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2 text-xs rounded-lg"
                            title="إلغاء التنشيط"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ════════════════════ TAB 2: VERSION PUBLISHER ════════════════════ */}
      {activeTab === 'versions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span>حالة قاعدة البيانات والإصدار الحالي المنشور</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600">رقم الإصدار النشط:</span>
                  <span className="font-mono text-sm font-black text-blue-600">
                    v{manifest?.version || 1}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600">تاريخ آخر نشر:</span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {manifest?.updatedAt ? new Date(manifest.updatedAt).toLocaleString('ar-EG') : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600">التعديلات المعلقة للنشر:</span>
                  <span className="font-mono text-sm font-black text-amber-600">
                    {manifest?.changesCount || 0} تعديل
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600">بصمة الإصدار (Checksum):</span>
                  <span className="font-mono text-[11px] text-slate-500 truncate max-w-[200px]" dir="ltr">
                    {manifest?.checksum || 'chk_default'}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setIsPublishOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl gap-2 shadow-xs"
              >
                <GitBranch className="w-4 h-4" />
                <span>نشر الإصدار v{(manifest?.version || 1) + 1} الآن</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white rounded-2xl shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
                <Layers className="w-4 h-4 text-[#0B7B5E]" />
                <span>آلية التزامن التراكمي (Incremental Sync)</span>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-medium">
                <p>
                  عند نشر إصدار جديد، تقوم جميع أجهزة الأطباء والعيادات بتحميل{' '}
                  <strong className="text-slate-900">التغييرات الجديدة فقط (Delta Changes)</strong>{' '}
                  بدلاً من تنزيل قاعدة البيانات بالكامل.
                </p>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-emerald-900 space-y-1">
                  <div className="font-bold text-xs">مزايا المعمارية المركزية:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>توفير استهلاك باقة الإنترنت لأجهزة العيادات</li>
                    <li>تطبيق التعديلات في معاملات متسقة (Atomic Transactions)</li>
                    <li>عدم التأثير إطلاقاً على الروشتات التاريخية المحفوظة</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════ TAB 3: DOCTOR SUGGESTIONS ════════════════════ */}
      {activeTab === 'suggestions' && (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-2xs">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h2 className="text-sm font-black text-slate-900">
                  مقترحات الأدوية الواردة من عيادات الأطباء
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  عند إضافة طبيب لدواء مخصص محلياً، يمكنه اقتراحه مركزياً ليتم اعتماده للجميع
                </p>
              </div>
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-bold">
                {suggestions.length} مقترح
              </Badge>
            </div>

            {suggestions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold text-xs">
                لا توجد مقترحات أدوية جديدة حالياً من الأطباء
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm" dir="ltr">
                          {sug.tradeNameEn}
                        </span>
                        <span className="text-xs text-slate-600">({sug.tradeNameAr})</span>
                        <Badge
                          className={`text-[10px] font-bold ${
                            sug.status === 'approved'
                              ? 'bg-emerald-50 text-[#0B7B5E] border-emerald-200'
                              : sug.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {sug.status === 'approved'
                            ? 'معتمد ومضاف'
                            : sug.status === 'rejected'
                            ? 'مرفوض'
                            : 'قيد المراجعة'}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>المادة الفعالة: {sug.activeIngredient || '—'}</span>
                        <span>•</span>
                        <span>الشكل: {sug.dosageForm || '—'}</span>
                        <span>•</span>
                        <span>بواسطة: {sug.doctorName || 'طبيب عيادة'}</span>
                      </div>

                      {sug.clinicalNotes && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 mt-1.5">
                          ملاحظات الطبيب: {sug.clinicalNotes}
                        </p>
                      )}
                    </div>

                    {sug.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleReviewSuggestion(sug.id, 'approved', sug.tradeNameEn)}
                          className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs h-8 px-3 rounded-lg gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد وإضافة</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewSuggestion(sug.id, 'rejected', sug.tradeNameEn)}
                          className="border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold h-8 px-3 rounded-lg gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>رفض</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ════════════════════ TAB 4: DATA SOURCES ════════════════════ */}
      {activeTab === 'sources' && (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-2xs">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
              <Building2 className="w-4 h-4 text-[#0B7B5E]" />
              <span>الهيئات التنظيمية ومصادر البيانات الرسمية المعتمدة</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-950 text-sm">
                    هيئة الدواء المصرية (EDA)
                  </span>
                  <Badge className="bg-emerald-600 text-white text-[10px]">المصدر الرئيسي</Badge>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  الدليل الدوائي والتسعيرة الجبرية الرسمية للأدوية المرخصة بجمهورية مصر العربية، مع أرقام التسجيل والباركود الدولي.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">
                    منظمة الصحة العالمية (WHO INN)
                  </span>
                  <Badge className="bg-slate-200 text-slate-800 text-[10px]">دولي</Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  التسمية الدولية الموحدة للمواد الفعالة ومجموعات الأدوية العلاجية (Anatomical Therapeutic Chemical).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Add Central Medicine */}
      <Dialog open={isAddMedOpen} onOpenChange={setIsAddMedOpen}>
        <DialogContent className="max-w-lg bg-white rounded-2xl p-6" dir="rtl">
          <form onSubmit={handleCreateMedicine}>
            <DialogHeader className="text-right pb-3 border-b border-slate-100">
              <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0B7B5E]" />
                <span>إضافة دواء جديد للدليل المركزي</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3.5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">الاسم التجاري (En)</Label>
                  <Input
                    required
                    dir="ltr"
                    placeholder="e.g. Augmentin 1g"
                    value={newMed.tradeNameEn}
                    onChange={(e) => setNewMed({ ...newMed, tradeNameEn: e.target.value })}
                    className="text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">الاسم التجاري (عربي)</Label>
                  <Input
                    required
                    placeholder="أوجمنتين 1 جم"
                    value={newMed.tradeNameAr}
                    onChange={(e) => setNewMed({ ...newMed, tradeNameAr: e.target.value })}
                    className="text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">المادة الفعالة (Active Ingredient)</Label>
                <Input
                  required
                  dir="ltr"
                  placeholder="Amoxicillin + Clavulanic Acid"
                  value={newMed.activeIngredient}
                  onChange={(e) => setNewMed({ ...newMed, activeIngredient: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">الشكل الصيدلي</Label>
                  <select
                    value={newMed.dosageForm}
                    onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="أقراص">أقراص (Tablets)</option>
                    <option value="كبسولات">كبسولات (Capsules)</option>
                    <option value="شراب">شراب (Syrup)</option>
                    <option value="حقن">حقن (Injection)</option>
                    <option value="قطرة">قطرة (Drops)</option>
                    <option value="دهان">دهان أو مرهم (Ointment)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">التركيز</Label>
                  <Input
                    placeholder="1000 mg / 5ml"
                    value={newMed.strength}
                    onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">الباركود الدولي</Label>
                  <Input
                    dir="ltr"
                    placeholder="6221000111222"
                    value={newMed.barcode}
                    onChange={(e) => setNewMed({ ...newMed, barcode: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">السعر الجبري (ج.م)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={newMed.price || ''}
                    onChange={(e) => setNewMed({ ...newMed, price: parseFloat(e.target.value) || 0 })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start pt-3 border-t border-slate-100">
              <Button
                type="submit"
                className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs px-5 rounded-xl"
              >
                إضافة للدليل المركزي
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMedOpen(false)}
                className="text-xs font-bold rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Publish New Version */}
      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6" dir="rtl">
          <form onSubmit={handlePublishVersion}>
            <DialogHeader className="text-right pb-3 border-b border-slate-100">
              <DialogTitle className="text-base font-black text-blue-600 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                <span>نشر إصدار رسمي جديد (v{(manifest?.version || 1) + 1})</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <p className="text-slate-600 leading-relaxed font-medium">
                سيتم تضمين جميع التعديلات والإضافات المعلقة في الإصدار رقم{' '}
                <strong className="text-slate-900 font-bold">
                  v{(manifest?.version || 1) + 1}
                </strong>
                ، وستتلقى جميع عيادات وأجهزة الأطباء إشعاراً بالتحديث التراكمي.
              </p>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-bold text-slate-700">ملاحظات الإصدار (Release Notes)</Label>
                <Input
                  required
                  placeholder="مثال: إضافة تحديثات هيئة الدواء لشهر نوفمبر والتسعيرة الجديدة"
                  value={publishNotes}
                  onChange={(e) => setPublishNotes(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start pt-3 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isPublishing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 rounded-xl"
              >
                {isPublishing ? 'جاري النشر...' : 'تأكيد النشر الرسمي'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPublishOpen(false)}
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
