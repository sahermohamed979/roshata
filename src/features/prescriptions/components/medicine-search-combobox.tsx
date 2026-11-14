'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Pill, Sparkles, Check, X, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { useMedicineStore } from '@/stores/medicine.store';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { AddCustomMedicineDialog } from '@/features/medicines/components/add-custom-medicine-dialog';
import type { UnifiedMedicineResult } from '@/features/medicines/repositories/medicine.repository';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function MedicineSearchCombobox() {
  // Store Hooks
  const { searchTerm, results, isSearching, setSearchTerm, clearSearch } = useMedicineStore();
  const { addMedicine } = usePrescriptionStore();

  // Local State
  const [isOpen, setIsOpen] = useState(false);
  const [addCustomDialogOpen, setAddCustomDialogOpen] = useState(false);
  const [customNamePrefill, setCustomNamePrefill] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (!isOpen && val.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleSelectMedicine = (med: UnifiedMedicineResult) => {
    addMedicine(med);
    toast.success(`تمت إضافة ${med.nameEn || med.nameAr} إلى الروشتة`);
    clearSearch();
    setIsOpen(false);
  };

  const handleOpenCustomDialog = (prefill = '') => {
    setCustomNamePrefill(prefill || searchTerm);
    setAddCustomDialogOpen(true);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5 text-[#0B7B5E]" />
          </div>

          <Input
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchTerm.trim().length > 0) setIsOpen(true);
            }}
            placeholder="ابحث عن دواء بالاسم التجاري (عربي / English) أو المادة الفعالة..."
            className="h-12 pr-11 pl-10 text-sm font-semibold bg-white border-2 border-[#D0E5DC] focus-visible:border-[#0B7B5E] focus-visible:ring-3 focus-visible:ring-[#0B7B5E]/20 rounded-2xl shadow-xs transition-all"
            autoComplete="off"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                clearSearch();
                setIsOpen(false);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Add Custom Medicine Button */}
        <Button
          type="button"
          onClick={() => handleOpenCustomDialog(searchTerm)}
          className="h-12 px-4 rounded-2xl bg-[#E3F5EE] hover:bg-[#D0E5DC] text-[#074C3A] font-bold border border-[#45DBA5]/30 shrink-0 shadow-2xs gap-1.5"
          title="إضافة دواء غير موجود في القاعدة"
        >
          <Plus className="w-4 h-4 text-[#0B7B5E]" />
          <span className="hidden sm:inline">دواء مخصص</span>
        </Button>
      </div>

      {/* Floating Results Panel */}
      {isOpen && searchTerm.trim().length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 bg-white border border-[#D0E5DC] rounded-2xl shadow-xl max-h-[380px] overflow-hidden flex flex-col animate-in fade-in-50 duration-150">
          {/* Header Indicator */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              {isSearching
                ? 'جاري البحث في قاعدة البيانات المحلية...'
                : `تم العثور على ${results.length} دواء مطابق`}
            </span>
            <span className="text-[11px] font-bold text-[#0B7B5E]">بحث فوري بدون إنترنت</span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
            {results.map((med) => (
              <div
                key={med.id}
                onClick={() => handleSelectMedicine(med)}
                className="group p-3 rounded-xl hover:bg-[#E3F5EE]/60 cursor-pointer transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-white border border-slate-200 group-hover:border-[#45DBA5]/40 flex items-center justify-center shrink-0 text-[#0B7B5E]">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900 group-hover:text-[#074C3A] truncate" dir="ltr">
                        {med.nameEn}
                      </span>
                      {med.nameAr && med.nameAr !== med.nameEn && (
                        <span className="text-xs font-bold text-slate-600 truncate">
                          ({med.nameAr})
                        </span>
                      )}
                      {med.isCustom && (
                        <Badge variant="warning" className="text-[10px] py-0 px-1.5 h-4 font-black">
                          مخصص
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
                      {med.dosageForm && (
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {med.dosageForm}
                        </span>
                      )}
                      {med.strength && (
                        <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]" dir="ltr">
                          {med.strength}
                        </span>
                      )}
                      {med.activeIngredient && (
                        <span className="truncate text-slate-400 text-[11px]" dir="ltr">
                          • {med.activeIngredient}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMedicine(med);
                  }}
                  className="shrink-0 bg-[#0B7B5E] text-white hover:bg-[#074C3A] text-xs font-bold rounded-xl h-8 px-3 opacity-90 group-hover:opacity-100"
                >
                  <Plus className="w-3.5 h-3.5 ml-1" />
                  إضافة
                </Button>
              </div>
            ))}

            {/* Empty State / Not Found */}
            {!isSearching && results.length === 0 && (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">
                    لم يتم العثور على دواء باسم &quot;{searchTerm}&quot;
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    يمكنك إضافته فوراً إلى قائمتك المخصصة وسيظل متاحاً في كل الروشتات القادمة.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => handleOpenCustomDialog(searchTerm)}
                  className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4 ml-1.5" />
                  إضافة &quot;{searchTerm}&quot; كدواء مخصص
                </Button>
              </div>
            )}
          </div>

          {/* Quick Add Footer when results are shown */}
          {results.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">غير موجود في النتائج؟</span>
              <button
                type="button"
                onClick={() => handleOpenCustomDialog(searchTerm)}
                className="text-[#0B7B5E] hover:text-[#074C3A] font-black flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة دواء جديد بالاسم &quot;{searchTerm}&quot;</span>
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Add Custom Medicine Modal */}
      <AddCustomMedicineDialog
        open={addCustomDialogOpen}
        onOpenChange={setAddCustomDialogOpen}
        initialName={customNamePrefill}
        autoAddToPrescription={true}
      />
    </div>
  );
}
