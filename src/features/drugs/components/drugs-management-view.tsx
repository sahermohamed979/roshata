'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Pill,
  Search,
  Plus,
  Trash2,
  Pencil,
  BarChart3,
  Calendar,
  Sparkles,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { DrugItem, DrugAnalyticsData } from '../types/drug.types';
import { parseDoseShortcut } from '@/features/examination/utils/prescription-formatter';

const FORM_OPTIONS = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Ampoule',
  'Vial',
  'Nasal Spray',
  'Nasal Drops',
  'Ear Drops',
  'Eye Drops',
  'Oral Drops',
  'Lozenges',
  'Sachet',
  'Suppository',
  'Cream',
  'Ointment',
  'Inhaler',
  'Gargle',
  'Mouthwash',
];

export function DrugsManagementView() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'analytics'>('catalog');
  const [drugs, setDrugs] = useState<DrugItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Analytics State
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'month' | '6months' | '1year' | 'month-select' | 'range'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [analyticsData, setAnalyticsData] = useState<DrugAnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<DrugItem | null>(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    form: 'Tablet',
    concentration: '',
    dose: '',
    frequency: '',
    duration: '',
    instructions: '',
    shortcutInput: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Drugs Catalog
  const fetchDrugs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/drugs?limit=300');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.payload)
          ? data.payload
          : Array.isArray(data)
          ? data
          : [];
        setDrugs(list);
      } else {
        toast.error('تعذر تحميل قائمة الأدوية');
      }
    } catch {
      toast.error('حدث خطأ أثناء تحميل الأدوية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  // 2. Fetch Drug Analytics
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      let url = `/api/drugs/analytics?period=${analyticsPeriod}`;
      if (analyticsPeriod === 'month-select') {
        const m = selectedMonth.toString().padStart(2, '0');
        const startDate = `${selectedYear}-${m}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const endDate = `${selectedYear}-${m}-${lastDay.toString().padStart(2, '0')}`;
        url = `/api/drugs/analytics?period=custom&startDate=${startDate}&endDate=${endDate}`;
      } else if (analyticsPeriod === 'range') {
        url = `/api/drugs/analytics?period=custom&startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data.payload || data);
      }
    } catch {
      toast.error('تعذر تحميل تقرير الأدوية الأكثر استخداماً');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, analyticsPeriod, selectedMonth, selectedYear, customStartDate, customEndDate]);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingDrug(null);
    setModalForm({
      name: '',
      form: 'Tablet',
      concentration: '',
      dose: '',
      frequency: '',
      duration: '',
      instructions: '',
      shortcutInput: '',
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (drug: DrugItem) => {
    setEditingDrug(drug);
    setModalForm({
      name: drug.name,
      form: drug.form || 'Tablet',
      concentration: drug.concentration || '',
      dose: drug.dose || '',
      frequency: drug.frequency || '',
      duration: drug.duration || '',
      instructions: drug.instructions || '',
      shortcutInput: '',
    });
    setIsModalOpen(true);
  };

  // Save (Add or Update)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.name.trim()) {
      toast.error('يرجى كتابة اسم الدواء');
      return;
    }

    setIsSaving(true);
    try {
      if (editingDrug?.id) {
        // Update
        const res = await fetch(`/api/drugs/${editingDrug.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: modalForm.name.trim(),
            form: modalForm.form,
            concentration: modalForm.concentration.trim(),
            dose: modalForm.dose.trim(),
            frequency: modalForm.frequency.trim(),
            duration: modalForm.duration.trim(),
            instructions: modalForm.instructions.trim(),
          }),
        });

        if (res.ok) {
          toast.success('✓ تم تحديث بيانات الدواء بنجاح');
          setIsModalOpen(false);
          fetchDrugs();
        } else {
          toast.error('تعذر تحديث الدواء');
        }
      } else {
        // Create
        const res = await fetch('/api/drugs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: modalForm.name.trim(),
            form: modalForm.form,
            concentration: modalForm.concentration.trim(),
            dose: modalForm.dose.trim(),
            frequency: modalForm.frequency.trim(),
            duration: modalForm.duration.trim(),
            instructions: modalForm.instructions.trim(),
            incrementUsage: false,
          }),
        });

        if (res.ok) {
          toast.success('✓ تمت إضافة الدواء الجديد بنجاح');
          setIsModalOpen(false);
          fetchDrugs();
        } else {
          toast.error('تعذر حفظ الدواء (تأكد من عدم تكرار الاسم)');
        }
      }
    } catch {
      toast.error('حدث خطأ أثناء حفظ الدواء');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Drug
  const handleDeleteDrug = async (drug: DrugItem) => {
    if (!confirm(`هل أنت متأكد من حذف دواء "${drug.name}" من قاعدة البيانات؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/drugs/${drug.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`تم حذف "${drug.name}" بنجاح`);
        setDrugs((prev) => prev.filter((d) => d.id !== drug.id));
      } else {
        toast.error('تعذر حذف الدواء');
      }
    } catch {
      toast.error('حدث خطأ أثناء حذف الدواء');
    }
  };

  // Shortcut parsing inside modal
  const handleShortcutEnter = () => {
    if (!modalForm.shortcutInput.trim()) return;
    const parsed = parseDoseShortcut(modalForm.shortcutInput, modalForm.form);
    if (parsed) {
      setModalForm((prev) => ({
        ...prev,
        dose: parsed.dose,
        frequency: parsed.frequency,
        duration: parsed.duration || prev.duration,
        instructions: parsed.instructions || prev.instructions,
      }));
      toast.success(`✓ تمت ترجمة الاختصار: ${parsed.summary}`);
    } else {
      toast.info('اكتب الاختصار بالشكل: 1/3/5/-30 (جرعة / تكرار / مدة / توقيت الأكل)');
    }
  };

  // Filtered Drugs in Catalog
  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) return drugs;
    const q = searchQuery.toLowerCase().trim();
    return drugs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.form && d.form.toLowerCase().includes(q)) ||
        (d.concentration && d.concentration.toLowerCase().includes(q)) ||
        (d.instructions && d.instructions.toLowerCase().includes(q))
    );
  }, [drugs, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* 1. ترويسة الصفحة العامة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#074C3A] flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            <Pill className="w-6 h-6 text-[#0B7B5E]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#074C3A]">
              دليل وصيدلية أدوية العيادة
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              إدارة قاموس الأدوية، الجرعات الافتراضية، ومتابعة تقرير الأدوية الأكثر استخداماً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* تبديل التبويبات */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#074C3A] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>دليل الأدوية ({drugs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#074C3A] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>الأدوية الأكثر استخداماً</span>
            </button>
          </div>

          {/* زر إضافة دواء جديد */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="h-11 px-4 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة دواء جديد</span>
          </button>
        </div>
      </div>

      {/* 2. محتوى تبويب: دليل الأدوية (Catalog) */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* شريط البحث والتصفية */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الدواء، التركيز، أو الشكل..."
                className="w-full h-10 pr-9 pl-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#074C3A] placeholder:text-slate-400 focus:outline-none focus:border-[#0B7B5E] focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <button
                type="button"
                onClick={fetchDrugs}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="تحديث القائمة"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0B7B5E]' : ''}`} />
              </button>
              <span>عرض {filteredDrugs.length} من إجمالي {drugs.length} صنف</span>
            </div>
          </div>

          {/* جدول الأدوية */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#0B7B5E] animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">جاري تحميل أدوية العيادة...</p>
              </div>
            ) : filteredDrugs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Pill className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">لا توجد أدوية مطابقة للبحث</p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-[#0B7B5E] text-white text-xs font-bold shadow-xs hover:bg-[#09634C] cursor-pointer"
                >
                  + إضافة هذا الدواء الآن
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-black">
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4">اسم الدواء (Drug Name)</th>
                      <th className="py-3.5 px-3">الشكل (Form)</th>
                      <th className="py-3.5 px-3">التركيز</th>
                      <th className="py-3.5 px-3">الجرعة الافتراضية</th>
                      <th className="py-3.5 px-3">التكرار</th>
                      <th className="py-3.5 px-3">المدة</th>
                      <th className="py-3.5 px-3">التعليمات</th>
                      <th className="py-3.5 px-3 text-center">مرات الصرف</th>
                      <th className="py-3.5 px-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDrugs.map((drug, idx) => (
                      <tr key={drug.id} className="hover:bg-[#E3F5EE]/30 transition-colors group">
                        <td className="py-3 px-4 text-center text-slate-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-black text-sm text-[#074C3A] block">
                            {drug.name}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold text-[11px]">
                            {drug.form || 'Tablet'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {drug.concentration || '—'}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {drug.dose || '—'}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {drug.frequency || '—'}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {drug.duration || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                          {drug.instructions || '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-[#074C3A] font-black text-xs font-mono">
                            {drug.usageCount || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(drug)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B7B5E] hover:bg-[#E3F5EE] transition-colors cursor-pointer"
                              title="تعديل بيانات الدواء"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDrug(drug)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="حذف من القاموس"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. محتوى تبويب: تحليلات الأدوية الأكثر استخداماً (Analytics) */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          {/* شريط الفلاتر الزمنية */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0B7B5E]" />
                <span>الفترة الزمنية للتقرير:</span>
              </span>

              <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs font-bold flex-wrap">
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod('month')}
                  className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                    analyticsPeriod === 'month'
                      ? 'bg-[#074C3A] text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  آخر شهر
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod('6months')}
                  className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                    analyticsPeriod === '6months'
                      ? 'bg-[#074C3A] text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  آخر 6 شهور
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod('1year')}
                  className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                    analyticsPeriod === '1year'
                      ? 'bg-[#074C3A] text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  آخر سنة
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod('month-select')}
                  className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                    analyticsPeriod === 'month-select'
                      ? 'bg-[#074C3A] text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  شهر محدد 📅
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod('range')}
                  className={`h-8 px-3 rounded-lg transition-all cursor-pointer ${
                    analyticsPeriod === 'range'
                      ? 'bg-[#074C3A] text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  فترة مخصصة (من - إلى) 🗓️
                </button>
              </div>
            </div>

            {/* محدد الشهر والسنة عند اختيار "شهر محدد" */}
            {analyticsPeriod === 'month-select' && (
              <div className="flex items-center gap-2 animate-in fade-in-50 flex-wrap">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#074C3A] focus:outline-none focus:border-[#0B7B5E] cursor-pointer"
                >
                  {[
                    { m: 1, name: 'يناير' },
                    { m: 2, name: 'فبراير' },
                    { m: 3, name: 'مارس' },
                    { m: 4, name: 'أبريل' },
                    { m: 5, name: 'مايو' },
                    { m: 6, name: 'يونيو' },
                    { m: 7, name: 'يوليو' },
                    { m: 8, name: 'أغسطس' },
                    { m: 9, name: 'سبتمبر' },
                    { m: 10, name: 'أكتوبر' },
                    { m: 11, name: 'نوفمبر' },
                    { m: 12, name: 'ديسمبر' },
                  ].map((mo) => (
                    <option key={mo.m} value={mo.m}>
                      شهر {mo.m} ({mo.name})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#074C3A] focus:outline-none focus:border-[#0B7B5E] cursor-pointer"
                >
                  {[2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* محدد الفترة المخصصة (من تاريخ - إلى تاريخ) */}
            {analyticsPeriod === 'range' && (
              <div className="flex items-center gap-2 animate-in fade-in-50 flex-wrap text-xs">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                  <span className="font-bold text-slate-500">من:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                  <span className="font-bold text-slate-500">إلى:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchAnalytics}
                  className="h-8 px-3 rounded-xl bg-[#0B7B5E] text-white font-bold text-xs hover:bg-[#09634C] transition-all cursor-pointer shadow-2xs"
                >
                  تحديث التقرير
                </button>
              </div>
            )}
          </div>

          {/* بطاقات الإحصائيات العامة */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">أكثر دواء تم وصفه</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#074C3A] truncate">
                {analyticsData?.items?.[0]?.name || '—'}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {analyticsData?.items?.[0]
                  ? `تم وصفه ${analyticsData.items[0].count} مرة في هذه الفترة`
                  : 'لا توجد بيانات متاحة'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي الأصناف الموصوفة</span>
                <TrendingUp className="w-4 h-4 text-[#0B7B5E]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#074C3A] font-mono">
                {analyticsData?.totalItemsPrescribed || 0}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                إجمالي عناصر الأدوية الصادرة بالروشتات
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">عدد الأدوية الفريدة</span>
                <Pill className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#074C3A] font-mono">
                {analyticsData?.items?.length || 0}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                أصناف دوائية مختلفة تم صرفها
              </p>
            </div>
          </div>

          {/* قائمة ترتيب الأدوية مع أشرطة التقدم البيانية */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-black text-[#074C3A] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0B7B5E]" />
              <span>ترتيب الأدوية الأكثر وصفاً واستخداماً</span>
            </h3>

            {isLoadingAnalytics ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#0B7B5E] animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">جاري تجميع إحصائيات الأدوية...</p>
              </div>
            ) : !analyticsData?.items || analyticsData.items.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-bold">
                لا توجد أدوية موصوفة في هذه الفترة الزمنية.
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsData.items.map((item, idx) => {
                  const maxCount = analyticsData.items[0]?.count || 1;
                  const percent = Math.round((item.count / maxCount) * 100);

                  return (
                    <div
                      key={`${item.name}-${idx}`}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#E3F5EE]/40 border border-slate-200/70 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                              idx === 0
                                ? 'bg-amber-500 text-white'
                                : idx === 1
                                ? 'bg-slate-400 text-white'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-[#074C3A] text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-black text-sm text-[#074C3A]">{item.name}</span>
                          {item.concentration && (
                            <span className="text-[11px] font-mono text-slate-500 font-bold">
                              ({item.concentration})
                            </span>
                          )}
                          {item.form && (
                            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-bold">
                              {item.form}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 font-mono font-black text-xs text-[#074C3A]">
                          <span>{item.count} مرة</span>
                          {item.lastPrescribed && (
                            <span className="text-[11px] font-sans font-medium text-slate-400">
                              آخر وصف: {new Date(item.lastPrescribed).toLocaleDateString('ar-EG')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* شريط التقدم المرئي */}
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-[#074C3A] to-[#0B7B5E] transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. نافذة منبثقة لإضافة أو تعديل دواء (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#0B7B5E]" />
                <h3 className="font-black text-base text-[#074C3A]">
                  {editingDrug ? `تعديل بيانات الدواء: ${editingDrug.name}` : 'إضافة دواء جديد لقاعدة البيانات'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              {/* اسم الدواء */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الدواء (Drug Name) *
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.name}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: Augmentin, Cataflam, Otrivin..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-[#074C3A] focus:outline-none focus:border-[#0B7B5E] focus:bg-white"
                />
              </div>

              {/* نوع وشكل الدواء + التركيز */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الشكل الدوائي (Form)
                  </label>
                  <select
                    value={modalForm.form}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, form: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:border-[#0B7B5E] cursor-pointer"
                  >
                    {FORM_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    التركيز (Concentration)
                  </label>
                  <input
                    type="text"
                    value={modalForm.concentration}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, concentration: e.target.value }))}
                    placeholder="مثال: 500mg, 1gm, 0.1%"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold focus:outline-none focus:border-[#0B7B5E]"
                  />
                </div>
              </div>

              {/* حقل اختصار سريع للتعبئة الفورية */}
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1.5">
                <span className="text-[11px] font-black text-[#074C3A] block">
                  ⚡ تعبئة سريعة عبر الاختصار (مثال: 1/3/5/-30 أو 1/1/7/* أو 1/1/10/~ ثم اضغط تطبيق):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={modalForm.shortcutInput}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, shortcutInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleShortcutEnter();
                      }
                    }}
                    placeholder="1/3/5/-30 أو 1/1/7/*"
                    className="flex-1 h-8 px-2.5 rounded-lg border border-emerald-300 bg-white font-mono text-xs font-bold text-[#074C3A] focus:outline-none focus:ring-1 focus:ring-[#0B7B5E]"
                  />
                  <button
                    type="button"
                    onClick={handleShortcutEnter}
                    className="px-3 h-8 rounded-lg bg-[#0B7B5E] text-white font-bold text-xs hover:bg-[#09634C] transition-colors cursor-pointer shrink-0"
                  >
                    تطبيق الاختصار
                  </button>
                </div>
              </div>

              {/* الجرعة والتكرار والمدة */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    الجرعة الافتراضية
                  </label>
                  <input
                    type="text"
                    value={modalForm.dose}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, dose: e.target.value }))}
                    placeholder="قرص واحد، 5 سم..."
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-[#0B7B5E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    التكرار الافتراضي
                  </label>
                  <input
                    type="text"
                    value={modalForm.frequency}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, frequency: e.target.value }))}
                    placeholder="مرتين في اليوم..."
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-[#0B7B5E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    المدة الافتراضية
                  </label>
                  <input
                    type="text"
                    value={modalForm.duration}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="لمدة 5 أيام..."
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-[#0B7B5E]"
                  />
                </div>
              </div>

              {/* التعليمات والإرشادات */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  إرشادات الاستخدام الافتراضية (Instructions)
                </label>
                <input
                  type="text"
                  value={modalForm.instructions}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, instructions: e.target.value }))}
                  placeholder="قبل الأكل بنصف ساعة، بعد الأكل مباشرة..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#0B7B5E]"
                />
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#0B7B5E] hover:bg-[#09634C] transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'جاري الحفظ...' : editingDrug ? 'حفظ التعديلات' : 'إضافة لقاعدة البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

