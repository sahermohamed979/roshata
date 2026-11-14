'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  FileText,
  User,
  Calendar,
  Pill,
  ExternalLink,
  Sparkles,
  Stethoscope,
  X,
  RefreshCw,
  FolderOpen,
  Filter,
} from 'lucide-react';

interface ClinicalMatch {
  category: string;
  field: string;
  text: string;
}

interface ClinicalSearchResult {
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  fileNumber?: string;
  appointmentId?: string;
  visitId?: string;
  visitDate?: string;
  matches: ClinicalMatch[];
}

const QUICK_SEARCH_CHIPS = [
  'x-ray',
  'Augmentin',
  'انحراف حاجز',
  'حساسية',
  'لحمية',
  'أشعة مقطعية CT',
  'منظار',
  'Otrivin',
  'التهاب الجيوب الأنفية',
  'عملية',
];

export function ClinicalSearchView() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DRUG' | 'DIAGNOSIS' | 'INVESTIGATIONS' | 'HISTORY'>('ALL');
  const [results, setResults] = useState<ClinicalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (termToSearch?: string) => {
    const q = (termToSearch !== undefined ? termToSearch : query).trim();
    if (!q) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/clinical-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data && data.status && Array.isArray(data.payload)) {
        setResults(data.payload);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Failed to search clinical records:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    handleSearch(chip);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-amber-950 px-1 py-0.5 rounded font-black">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const filteredResults = results.filter((item) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DRUG') {
      return item.matches.some((m) => m.category === 'DRUG' || m.category === 'DRUG_INSTRUCTIONS' || m.category === 'RX_NOTES');
    }
    if (activeFilter === 'DIAGNOSIS') {
      return item.matches.some((m) => m.category === 'DIAGNOSIS');
    }
    if (activeFilter === 'INVESTIGATIONS') {
      return item.matches.some((m) => m.category === 'INVESTIGATIONS');
    }
    if (activeFilter === 'HISTORY') {
      return item.matches.some((m) => m.category === 'HISTORY' || m.category === 'COMPLAINT');
    }
    return true;
  });

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* 1. ترويسة الصفحة */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center font-black text-xl shadow-xs">
            <Search className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#074C3A] tracking-tight">
              البحث الطبي السريري الشامل
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              ابحث في كافة استمارات الكشف، التشخيصات، الروشتات، الأدوية، الفحوصات والشكاوى لكافة المرضى
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl self-start md:self-auto">
          البحث يبحث في كل كلمة أو اسم دواء أو تشخيص مدون بالعيادة
        </div>
      </div>

      {/* 2. شريط البحث والكلمات السريعة */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب أي كلمة، اسم دواء، فحص (مثل: x-ray, Augmentin, انحراف حاجز, حساسية)..."
            className="w-full h-14 pr-12 pl-36 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#0B7B5E] focus:bg-white shadow-inner transition-all"
          />
          <Search className="absolute right-4 w-5 h-5 text-slate-400" />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setHasSearched(false);
              }}
              className="absolute left-32 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute left-2.5 h-10 px-5 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 disabled:opacity-50 text-white font-black text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>بحث فوري</span>
          </button>
        </form>

        {/* الكلمات والوسوم المقترحة السريعة */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>اقتراحات سريعة:</span>
          </span>
          {QUICK_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#E3F5EE] hover:text-[#0B7B5E] text-slate-700 border border-slate-200/80 transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 3. تصنيف النتائج (Filter Tabs) عند وجود نتائج */}
      {hasSearched && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-[#0B7B5E] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              كافة النتائج ({results.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('DRUG')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'DRUG'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              روشتات وأدوية
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('DIAGNOSIS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'DIAGNOSIS'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              تشخيص طبي
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('INVESTIGATIONS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'INVESTIGATIONS'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              فحوصات وأشعة
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('HISTORY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'HISTORY'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              فحص وشكوى
            </button>
          </div>

          <div className="text-xs font-bold text-slate-500">
            تم العثور على <strong>{filteredResults.length}</strong> نتيجة تطابق البحث
          </div>
        </div>
      )}

      {/* 4. قائمة النتائج */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-100 text-center shadow-xs flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[#0B7B5E] animate-spin mb-3" />
          <p className="text-sm font-black text-slate-700">جاري البحث الطبي السريري في السجلات...</p>
          <p className="text-xs text-slate-400 mt-1">يتم البحث في جميع الفحوصات والروشتات والملاحظات</p>
        </div>
      ) : hasSearched && filteredResults.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-100 text-center shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black">
            🔍
          </div>
          <h3 className="text-lg font-black text-slate-800">لم يتم العثور على نتائج</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            لم نجد أي مريض مسجل يحتوي ملفه أو روشتاته على الكلمة: &quot;{query}&quot;. جرب كتابة جزء من الكلمة أو كلمة أخرى باللغة العربية أو الإنجليزية.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((item, idx) => (
            <div
              key={`${item.patientId}_${item.visitId || idx}`}
              className="bg-white rounded-3xl p-5 border-2 border-slate-100 hover:border-[#D0E5DC] shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* شريط المريض العلوي مع الأزرار والإجراءات */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E3F5EE] text-[#0B7B5E] flex items-center justify-center font-black text-base">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-[#074C3A]">
                        {item.patientName}
                      </h3>
                      {item.patientAge && (
                        <span className="text-xs font-bold text-slate-500">
                          ({item.patientAge} سنة)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mt-0.5">
                      <span>الهاتف: <strong className="font-mono text-slate-700">{item.patientPhone || '—'}</strong></span>
                      <span>رقم الملف: <strong className="font-mono text-slate-700">{item.fileNumber || '—'}</strong></span>
                      {item.visitDate && (
                        <span>تاريخ الزيارة: <strong className="font-mono text-slate-700">{item.visitDate}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات السريعة لفتح الملف والكشف والروشتة */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* 1. فتح ملف المريض الكامل */}
                  <Link
                    href={`/dashboard/view-patients/${item.patientId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title="فتح ملف المريض الكامل"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
                    <span>ملف المريض</span>
                  </Link>

                  {/* 2. فتح استمارة الكشف */}
                  {item.appointmentId && (
                    <Link
                      href={`/dashboard/examination/${item.appointmentId}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E3F5EE] hover:bg-[#D0E5DC] text-[#0B7B5E] text-xs font-black transition-all shadow-2xs cursor-pointer"
                      title="فتح استمارة فحص الكشف"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>استمارة الكشف</span>
                    </Link>
                  )}

                  {/* 3. فتح الروشتة */}
                  {item.appointmentId && (
                    <Link
                      href={`/dashboard/examination/${item.appointmentId}?tab=prescription`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] text-white text-xs font-black transition-all shadow-xs cursor-pointer"
                      title="فتح الروشتة الطبية"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>الروشتة (Rx)</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* المقتطفات الطبية المكتشفة التي تطابق كلمة البحث */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-500 mb-1">
                  المواضع التي وردت بها الكلمة في سجل هذا المريض:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {item.matches.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#0B7B5E] bg-[#E3F5EE] px-2 py-0.5 rounded-lg text-[11px]">
                          {m.field}
                        </span>
                      </div>
                      <p className="text-slate-800 font-bold leading-relaxed pt-0.5">
                        {highlightText(m.text, query)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

