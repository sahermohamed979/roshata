'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Printer,
  Edit,
  Trash2,
  Calendar,
  User,
  PlusCircle,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { PrescriptionRepository } from '../repositories/prescription.repository';
import { PrescriptionPrintModal } from './prescription-print-modal';
import { usePrescriptionStore } from '@/stores/prescription.store';
import type { Prescription } from '@/types/prescription.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function PrescriptionsArchiveView() {
  const router = useRouter();
  const { loadPrescription } = usePrescriptionStore();

  // Local State
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForPrint, setSelectedForPrint] = useState<Prescription | null>(null);

  // Load Prescriptions
  useEffect(() => {
    loadList();
  }, []);

  const loadList = async (query = '') => {
    setIsLoading(true);
    try {
      const list = await PrescriptionRepository.searchByPatient(query);
      setPrescriptions(list);
    } catch (err) {
      console.error('Failed to load prescriptions archive:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    loadList(val);
  };

  const handleEdit = (rx: Prescription) => {
    loadPrescription(rx);
    router.push('/prescriptions/new');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من حذف هذه الروشتة من الأرشيف؟')) return;

    try {
      await PrescriptionRepository.delete(id);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      toast.success('تم حذف الروشتة بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handlePrint = (rx: Prescription, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForPrint(rx);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Quick Stats */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D0E5DC] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] border border-[#0B7B5E]/30 flex items-center justify-center text-[#0B7B5E]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">أرشيف الروشتات والوصفات الطبية</h1>
            <p className="text-xs text-slate-500 font-medium">
              سجل الروشتات المحفوظة محلياً في عيادتك — بحث وإعادة طباعة وتعديل فوري
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 font-bold px-3 py-1.5 text-xs">
            إجمالي المحفوظ: {prescriptions.length} روشتة
          </Badge>

          <Button
            type="button"
            onClick={() => router.push('/prescriptions/new')}
            className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs sm:text-sm h-10 px-4 rounded-xl gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>روشتة جديدة</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-5 h-5 text-[#0B7B5E]" />
        </div>
        <Input
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="ابحث باسم المريض أو التشخيص الطبي..."
          className="h-12 pr-11 text-sm font-semibold bg-white border-2 border-[#D0E5DC] focus-visible:border-[#0B7B5E] rounded-2xl shadow-xs"
        />
      </div>

      {/* Prescriptions List */}
      <div className="space-y-3">
        {prescriptions.map((rx) => {
          const dateStr = new Date(rx.createdAt).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <Card
              key={rx.id}
              onClick={() => handleEdit(rx)}
              className="border border-[#D0E5DC] bg-white hover:border-[#0B7B5E]/50 hover:shadow-xs transition-all rounded-2xl cursor-pointer group"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Patient & Meds Overview */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] group-hover:bg-[#0B7B5E] group-hover:text-white text-[#0B7B5E] flex items-center justify-center shrink-0 transition-colors">
                    <User className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#0B7B5E] transition-colors truncate">
                        {rx.patient.name || 'مريض غير مسمى'}
                      </h3>
                      {rx.patient.age && (
                        <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                          {rx.patient.age}
                        </span>
                      )}
                      <Badge
                        variant={rx.status === 'completed' ? 'success' : 'warning'}
                        className="text-[10px] font-black"
                      >
                        {rx.status === 'completed' ? 'مكتملة ومطبوعة' : 'مسودة قيد التحرير'}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-slate-500 font-mono">
                        {rx.paperSize}
                      </Badge>
                    </div>

                    {/* Diagnosis & Medicine Summary */}
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                      {rx.diagnosis && (
                        <span className="font-bold text-[#0B7B5E]">
                          التشخيص: {rx.diagnosis}
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-700">
                        {rx.items.length} {rx.items.length === 1 ? 'دواء مقرر' : 'أدوية مقررة'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 font-medium" dir="ltr">
                        {rx.items.slice(0, 3).map((it) => it.nameSnapshotEn).join(', ')}
                        {rx.items.length > 3 ? '...' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => handlePrint(rx, e)}
                    className="border-slate-200 text-slate-700 hover:bg-[#E3F5EE] hover:text-[#074C3A] text-xs font-bold rounded-xl h-8 px-3 gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleEdit(rx)}
                    className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white text-xs font-bold rounded-xl h-8 px-3 gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </Button>

                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={(e) => handleDelete(rx.id, e)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="حذف الروشتة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {!isLoading && prescriptions.length === 0 && (
        <Card className="border-2 border-dashed border-[#D0E5DC] bg-white p-12 text-center rounded-2xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-800">لا توجد روشتات محفوظة بعد</h3>
          <p className="text-xs text-slate-500 mt-1">
            ابدأ بتحرير أول روشتة طبية لمريضك وستظهر هنا في الأرشيف المحلي فوراً
          </p>
          <Button
            type="button"
            onClick={() => router.push('/prescriptions/new')}
            className="mt-4 bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs rounded-xl"
          >
            <PlusCircle className="w-4 h-4 ml-1.5" />
            تحرير روشتة جديدة
          </Button>
        </Card>
      )}

      {/* Print Preview Modal */}
      {selectedForPrint && (
        <PrescriptionPrintModal
          open={!!selectedForPrint}
          onOpenChange={(open) => {
            if (!open) setSelectedForPrint(null);
          }}
          prescription={selectedForPrint}
        />
      )}
    </div>
  );
}
