'use client';

import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  Plus,
  Filter,
  Sparkles,
  Database,
  Building2,
  FileSpreadsheet,
  Check,
  ChevronLeft,
  Tag,
  Barcode,
  Edit,
  Trash2,
  Eye,
  Upload,
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { AddCustomMedicineDialog } from './add-custom-medicine-dialog';
import { EditCustomMedicineDialog } from './edit-custom-medicine-dialog';
import { MedicineDetailDialog } from './medicine-detail-dialog';
import { MedicineImportDialog } from './medicine-import-dialog';
import { MedicineRepository, type UnifiedMedicineResult } from '../repositories/medicine.repository';
import { useMedicineStore } from '@/stores/medicine.store';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { toast } from 'sonner';

const CATEGORIES = [
  'الكل',
  'أدويتي المخصصة',
  'مضادات حيوية (Antibiotics)',
  'مسكنات ومضادات التهاب (Analgesics)',
  'مضادات حساسية ومضادات هيستامين (Antihistamines)',
  'بخاخات ونقط الأنف (Nasal Care)',
  'قطرات ومستحضرات الأذن (Ear Care)',
  'مضادات حموضة ومعدية (GI & Antacids)',
  'موسعات شعب وطارد للبلغم (Respiratory)',
  'فيتامينات ومقويات (Vitamins)',
];

export function MedicineCatalogView() {
  const { totalGlobalCount, totalCustomCount, refreshCounts } = useMedicineStore();
  const { addMedicine } = usePrescriptionStore();

  // Local State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [medicines, setMedicines] = useState<UnifiedMedicineResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog States
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<UnifiedMedicineResult | null>(null);
  const [inspectingMedicine, setInspectingMedicine] = useState<UnifiedMedicineResult | null>(null);

  // Load initial medicines
  useEffect(() => {
    refreshCounts();
    loadCatalog('', selectedCategory);
  }, []);

  const loadCatalog = async (term: string, cat: string) => {
    setIsLoading(true);
    try {
      const isCustomOnly = cat === 'أدويتي المخصصة';
      const results = await MedicineRepository.search({
        term: term || (isCustomOnly ? '' : 'ا'),
        category: isCustomOnly ? undefined : cat,
        onlyCustom: isCustomOnly,
        limit: 80,
      });

      setMedicines(results);
    } catch (err) {
      console.error('Error loading medicine catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    loadCatalog(val, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    loadCatalog(searchTerm, cat);
  };

  const handleAddToPrescription = (med: UnifiedMedicineResult, e: React.MouseEvent) => {
    e.stopPropagation();
    addMedicine(med);
    toast.success(`تمت إضافة ${med.nameEn || med.nameAr} إلى الروشتة الحالية`);
  };

  const handleEditClick = (med: UnifiedMedicineResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMedicine(med);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Stats */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D0E5DC] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] border border-[#0B7B5E]/30 flex items-center justify-center text-[#0B7B5E]">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                دليل الأدوية المحلي (Local Medicine Index)
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                بحث فوري عن الأدوية المصرية والعالمية بالاسم، المادة الفعالة، أو الباركود بدون إنترنت
              </p>
            </div>
          </div>
        </div>

        {/* Action & Stats Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <Database className="w-4 h-4 text-[#0B7B5E]" />
            <span>{totalGlobalCount} دواء عام</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#0B7B5E]">{totalCustomCount} مخصص لك</span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold h-10 px-3.5 rounded-xl gap-1.5"
            title="استيراد قائمة أدوية من ملف CSV أو JSON"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد أدوية</span>
          </Button>

          <Button
            type="button"
            onClick={() => setAddDialogOpen(true)}
            className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs sm:text-sm h-10 px-4 rounded-xl shadow-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة دواء مخصص</span>
          </Button>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-5 h-5 text-[#0B7B5E]" />
          </div>
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="ابحث بالاسم التجاري (Augmentin, Congestal...) أو الاسم العربي أو المادة الفعالة أو الباركود الدولي..."
            className="h-12 pr-11 text-sm font-semibold bg-white border-2 border-[#D0E5DC] focus-visible:border-[#0B7B5E] rounded-2xl shadow-xs"
          />
        </div>

        {/* Horizontal Category Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-[#0B7B5E] text-white border-[#0B7B5E] shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {medicines.map((med) => (
          <Card
            key={med.id}
            onClick={(e) => handleAddToPrescription(med, e)}
            className="border border-[#D0E5DC] bg-white hover:border-[#0B7B5E] hover:shadow-md transition-all rounded-2xl group flex flex-col justify-between cursor-pointer"
          >
            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#0B7B5E] transition-colors truncate" dir="ltr">
                      {med.nameEn}
                    </h3>
                    {med.nameAr && med.nameAr !== med.nameEn && (
                      <p className="text-xs font-bold text-slate-600 truncate mt-0.5">
                        {med.nameAr}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {med.isCustom ? (
                      <Badge variant="warning" className="text-[10px] font-black">
                        مخصص
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200">
                        دليل عام
                      </Badge>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingMedicine(med);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="عرض التفاصيل الكاملة"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {med.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleEditClick(med, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="تعديل الدواء"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Form & Strength Tags */}
                <div className="flex items-center gap-1.5 flex-wrap my-2">
                  {med.dosageForm && (
                    <span className="text-[11px] font-bold bg-[#E3F5EE] text-[#074C3A] px-2 py-0.5 rounded-md">
                      {med.dosageForm}
                    </span>
                  )}
                  {med.strength && (
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md" dir="ltr">
                      {med.strength}
                    </span>
                  )}
                  {med.barcode && (
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded" dir="ltr">
                      {med.barcode}
                    </span>
                  )}
                </div>

                {/* Active Ingredient */}
                {med.activeIngredient && (
                  <p className="text-xs text-slate-500 font-medium truncate" dir="ltr">
                    Active: {med.activeIngredient}
                  </p>
                )}
              </div>

              {/* Card Footer: Add to Rx */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                  {med.category || 'أدوية عامة'}
                </span>
                <Button
                  size="sm"
                  type="button"
                  onClick={(e) => handleAddToPrescription(med, e)}
                  className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white text-xs font-bold h-8 px-3 rounded-xl gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة للروشتة</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && medicines.length === 0 && (
        <Card className="border-2 border-dashed border-[#D0E5DC] bg-white p-12 text-center rounded-2xl">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-800">
            لم يتم العثور على أدوية مطابقة
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            يمكنك إضافة الدواء فوراً إلى قائمتك المخصصة بنقرة واحدة
          </p>
          <Button
            type="button"
            onClick={() => setAddDialogOpen(true)}
            className="mt-4 bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs rounded-xl"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            إضافة دواء مخصص جديد
          </Button>
        </Card>
      )}

      {/* Add Custom Medicine Dialog */}
      <AddCustomMedicineDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        autoAddToPrescription={false}
      />

      {/* Edit Custom Medicine Dialog */}
      <EditCustomMedicineDialog
        open={!!editingMedicine}
        onOpenChange={(open) => {
          if (!open) setEditingMedicine(null);
        }}
        medicine={editingMedicine}
        onUpdated={() => loadCatalog(searchTerm, selectedCategory)}
      />

      {/* Medicine Monograph Details Dialog */}
      <MedicineDetailDialog
        open={!!inspectingMedicine}
        onOpenChange={(open) => {
          if (!open) setInspectingMedicine(null);
        }}
        medicine={inspectingMedicine}
        onEditCustom={(med) => setEditingMedicine(med)}
      />

      {/* Import Medicines CSV / JSON Dialog */}
      <MedicineImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={() => loadCatalog(searchTerm, selectedCategory)}
      />
    </div>
  );
}
