'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  Printer,
  Sparkles,
  Download,
  LayoutTemplate,
  Layers,
  FileText,
  RotateCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { PrescriptionDocument } from './prescription-document';
import { usePrescriptionStore } from '@/stores/prescription.store';
import { paginatePrescriptionItems } from '../utils/prescription-pagination';
import { directPrintPrescription } from '../utils/direct-print';
import { TemplateRepository } from '@/features/templates/repositories/template.repository';
import type { Prescription } from '@/types/prescription.types';
import type { PrescriptionTemplate } from '@/types/template.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PrescriptionLivePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTriggerPrint?: () => void;
}

export function PrescriptionLivePreviewModal({
  open,
  onOpenChange,
  onTriggerPrint,
}: PrescriptionLivePreviewModalProps) {
  // Store subscription (ensuring total real-time reactivity)
  const {
    id,
    doctorId,
    templateId,
    patient,
    diagnosis,
    notes,
    instructionsList,
    items,
    paperSize,
    status,
    setPaperSize,
  } = usePrescriptionStore();

  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'front' | 'back'>('all');

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      const all = await TemplateRepository.listAll();
      setTemplates(all);
      const defaultTpl = all.find((t) => t.isDefault) || all[0] || null;
      setSelectedTemplate(defaultTpl);
      setPaperSize('A5');
    } catch (err) {
      console.error('Failed to load templates for live preview modal:', err);
    }
  };

  // Reconstruct live prescription record with real-time items
  const currentRecord: Prescription = {
    id,
    doctorId,
    templateId: selectedTemplate?.id || templateId,
    patient,
    diagnosis,
    notes,
    instructionsList,
    items,
    paperSize,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Calculate pages dynamically
  const pages = paginatePrescriptionItems(items, paperSize);
  const totalPages = pages.length;
  const page1ItemsCount = pages[0]?.items?.length || 0;
  const page2ItemsCount = pages[1]?.items?.length || 0;

  const handlePrint = () => {
    const patientName = patient.name || 'مريض';
    const dateStr = new Date().toISOString().split('T')[0];
    const title = `روشتة_${patientName}_${dateStr}`;
    directPrintPrescription('live-preview-prescription-document', title);
  };

  const handleExportPdf = () => {
    toast.info('في شاشة الطباعة، اختر حفظ بتنسيق PDF من قائمة الطابعات');
    handlePrint();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-slate-900 border-slate-800 text-white overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Header & Controls */}
        <div className="p-4 sm:p-5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B7B5E] text-white flex items-center justify-center shrink-0 shadow-md">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-white flex items-center gap-2">
                <span>معاينة حية للروشتة (Live Preview)</span>
                {totalPages > 1 ? (
                  <Badge variant="warning" className="text-[10px] font-black bg-amber-500/20 text-amber-300 border-amber-500/40">
                    ورقتان (وجه وظهر)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/40 bg-emerald-500/10">
                    ورقة واحدة (الوجه)
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {totalPages > 1
                  ? `تم نقل ${page2ItemsCount} أدوية تلقائياً لظهر الروشتة لضمان وضوح الخط`
                  : `الوجه يتسع لـ 5 أدوية — الأدوية الزائدة تُنقل تلقائياً لظهر الورقة`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Template Selector */}
            {templates.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const found = templates.find((t) => t.id === e.target.value);
                    if (found) {
                      setSelectedTemplate(found);
                      setPaperSize('A5');
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Standard A5 Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-black text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>مقاس A5 القياسي (148 × 210 مم)</span>
            </div>

            {/* Save as PDF Button */}
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={handleExportPdf}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white text-xs font-bold px-3 h-9 rounded-xl gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">حفظ كـ PDF</span>
            </Button>

            {/* Direct Print to Physical Printer */}
            <Button
              size="sm"
              type="button"
              onClick={handlePrint}
              className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-black text-xs sm:text-sm px-4 h-9 rounded-xl shadow-md gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة إلى الطابعة</span>
            </Button>
          </div>
        </div>

        {/* Subheader: Page View Navigation Tabs (وجه الروشتة / ظهر الروشتة) */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'all'
                  ? 'bg-[#0B7B5E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>عرض الوجه والظهر معاً</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('front')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'front'
                  ? 'bg-[#0B7B5E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>وجه الروشتة (الصفحة 1 - {page1ItemsCount} أدوية)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('back')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'back'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>
                ظهر الروشتة ({totalPages > 1 ? `الصفحة 2 - ${page2ItemsCount} أدوية` : 'الصفحة 2 - فارغ'})
              </span>
            </button>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 hidden md:block">
            إجمالي الأدوية: <span className="text-white font-bold">{items.length}</span> | سعة وجه الورقة: 5 أدوية
          </div>
        </div>

        {/* Scrollable Document Area (Centered Paper on Desk Canvas) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex flex-col items-center">
          <PrescriptionDocument
            documentId="live-preview-prescription-document"
            prescription={currentRecord}
            template={selectedTemplate}
            targetPage={viewMode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
