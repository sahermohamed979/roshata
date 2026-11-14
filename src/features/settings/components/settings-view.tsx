'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { db } from '@/lib/database/dexie';
import { seedInitialData } from '@/lib/database/init-db';
import { useNetworkStatus } from '@/shared/providers/roshteh-db-provider';
import { useMedicineStore } from '@/stores/medicine.store';
import { useSyncStore } from '@/stores/sync.store';
import { GitBranch, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsView() {
  const { isOnline } = useNetworkStatus();
  const { totalGlobalCount, totalCustomCount, refreshCounts } = useMedicineStore();
  const {
    localVersion,
    serverVersion,
    hasUpdate,
    changesCount,
    status: syncStatus,
    progressMessage,
    triggerSync,
    checkForUpdates,
    triggerRecoverySnapshot,
  } = useSyncStore();

  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [rxCount, tCount] = await Promise.all([
        db.prescriptions.count(),
        db.templates.count(),
      ]);
      setPrescriptionCount(rxCount);
      setTemplateCount(tCount);
      await refreshCounts();
    } catch (err) {
      console.error('Error loading DB stats:', err);
    }
  };

  // Export full IndexedDB to JSON
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const [prescriptions, customMedicines, templates] = await Promise.all([
        db.prescriptions.toArray(),
        db.customMedicines.toArray(),
        db.templates.toArray(),
      ]);

      const backupData = {
        app: 'Roshteh Medical Platform',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        stats: {
          prescriptionsCount: prescriptions.length,
          customMedicinesCount: customMedicines.length,
          templatesCount: templates.length,
        },
        data: {
          prescriptions,
          customMedicines,
          templates,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roshteh-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('تم تصدير النسخة الاحتياطية بنجاح إلى ملف JSON');
    } catch (err) {
      console.error('Failed to export backup:', err);
      toast.error('تعذر تصدير النسخة الاحتياطية');
    } finally {
      setIsExporting(false);
    }
  };

  // Import JSON into IndexedDB
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.data) {
        throw new Error('ملف النسخة الاحتياطية غير صالح');
      }

      if (parsed.data.prescriptions?.length) {
        await db.prescriptions.bulkPut(parsed.data.prescriptions);
      }
      if (parsed.data.customMedicines?.length) {
        await db.customMedicines.bulkPut(parsed.data.customMedicines);
      }
      if (parsed.data.templates?.length) {
        await db.templates.bulkPut(parsed.data.templates);
      }

      await loadCounts();
      toast.success('تمت استعادة النسخة الاحتياطية ودمج السجلات بنجاح في متصفحك');
    } catch (err) {
      console.error('Failed to import backup:', err);
      toast.error('فشل استيراد الملف: تأكد من صحة تنسيق ملف JSON');
    } finally {
      setIsImporting(false);
      // Reset input value
      e.target.value = '';
    }
  };

  // Reseed default catalog
  const handleReseed = async () => {
    const confirmed = window.confirm(
      'سيتم تحديث قاعدة الأدوية العامة بالقائمة الافتراضية مع الحفاظ على أدويتك وروشتاتك المخصصة. هل تود المتابعة؟'
    );
    if (!confirmed) return;

    try {
      await seedInitialData();
      await loadCounts();
      toast.success('تم تحديث وتفعيل قائمة الأدوية المصرية الافتراضية بنجاح');
    } catch (err) {
      console.error('Failed to reseed:', err);
      toast.error('تعذر إعادة تحديث الأدوية');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D0E5DC] shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] border border-[#0B7B5E]/30 flex items-center justify-center text-[#0B7B5E]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">إعدادات النظام والنسخ الاحتياطي</h1>
            <p className="text-xs text-slate-500 font-medium">
              إدارة قاعدة البيانات المحلية (IndexedDB)، تصدير واسترجاع السجلات، وحالة الاتصال
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="success" className="gap-1 font-bold">
              <Wifi className="w-3.5 h-3.5" />
              <span>متصل بالإنترنت</span>
            </Badge>
          ) : (
            <Badge variant="warning" className="gap-1 font-bold">
              <WifiOff className="w-3.5 h-3.5" />
              <span>أوفلاين (مستقل تماماً)</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Database Storage Stats */}
      <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
            <Database className="w-4 h-4 text-[#0B7B5E]" />
            <span>حالة التخزين المحلي (IndexedDB - RoshtehMedicalDB)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-2xl font-black text-[#0B7B5E]">{prescriptionCount}</span>
              <span className="text-xs font-bold text-slate-600 mt-1 block">روشتة محفوظة</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-2xl font-black text-slate-800">{totalGlobalCount}</span>
              <span className="text-xs font-bold text-slate-600 mt-1 block">دواء بالدليل العام</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-2xl font-black text-amber-600">{totalCustomCount}</span>
              <span className="text-xs font-bold text-slate-600 mt-1 block">دواء مخصص لك</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-2xl font-black text-[#074C3A]">{templateCount}</span>
              <span className="text-xs font-bold text-slate-600 mt-1 block">قالب طباعة</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incremental Synchronization (Phase 7) */}
      <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900">
              <RefreshCw className={`w-4 h-4 text-[#0B7B5E] ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>تزامن وتحديث قاعدة الأدوية (Incremental Synchronization)</span>
            </div>
            <Badge className="bg-[#E3F5EE] text-[#074C3A] border-0 text-[10px] font-bold">
              v{localVersion} محلياً
            </Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  الإصدار المثبت: v{localVersion}
                </span>
                <span>•</span>
                <span className="text-xs font-bold text-[#0B7B5E]">
                  إصدار السيرفر المركزي: v{serverVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {hasUpdate
                  ? `يوجد إصدار رسمي جديد يتضمن ${changesCount} تعديل. يمكنك التحديث التراكمي الآن دون المساس بأدويتك المخصصة.`
                  : 'دليل الأدوية لديك محدث ومتوافق بالكامل مع آخر إصدار رسمي لهيئة الدواء.'}
              </p>
              {progressMessage && (
                <div className="text-[11px] text-slate-600 font-bold pt-1">
                  {progressMessage}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {hasUpdate ? (
                <Button
                  type="button"
                  disabled={syncStatus === 'syncing'}
                  onClick={triggerSync}
                  className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>تحديث القاعدة الآن</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={syncStatus === 'checking'}
                  onClick={checkForUpdates}
                  className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold h-9 rounded-xl gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'checking' ? 'animate-spin' : ''}`} />
                  <span>فحص التحديثات</span>
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={syncStatus === 'syncing'}
                onClick={triggerRecoverySnapshot}
                className="text-[11px] text-slate-500 hover:text-slate-900 h-9 rounded-xl gap-1"
                title="استعادة الدليل الدوائي كاملاً من السيرفر"
              >
                <RotateCcw className="w-3 h-3" />
                <span>استعادة كاملة</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup and Restore Actions */}
      <Card className="border border-[#D0E5DC] bg-white rounded-2xl shadow-2xs">
        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-black text-sm text-slate-900">
            <HardDrive className="w-4 h-4 text-[#0B7B5E]" />
            <span>النسخ الاحتياطي والاستعادة (Backup & Restore)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#0B7B5E]" />
                  <span>تصدير نسخة احتياطية كاملة</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  احفظ نسخة من جميع روشتاتك وقوالبك وأدويتك المخصصة كملف JSON على جهازك للرجوع إليها في أي وقت أو نقلها لجهاز آخر.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleExportBackup}
                disabled={isExporting}
                className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs rounded-xl h-10 gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'جاري التصدير...' : 'تحميل ملف النسخة الاحتياطية (JSON)'}</span>
              </Button>
            </div>

            {/* Import */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>استعادة نسخة احتياطية</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  اختر ملف نسخة احتياطية سابق (JSON) لدمج الروشتات والأدوية المسجلة به تلقائياً داخل قاعدة بيانات المتصفح الحالية.
                </p>
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  disabled={isImporting}
                  className="hidden"
                />
                <span className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-white border-2 border-dashed border-[#0B7B5E]/50 text-[#074C3A] hover:bg-[#E3F5EE] text-xs font-black transition-colors">
                  <Upload className="w-4 h-4 text-[#0B7B5E]" />
                  <span>{isImporting ? 'جاري الاستيراد...' : 'اختيار ملف الاستعادة (.json)'}</span>
                </span>
              </label>
            </div>
          </div>

          {/* Reseed Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">إعادة تهيئة الأدوية الافتراضية</span>
              <span className="text-[11px] text-slate-500">
                تحديث قائمة الأدوية المصرية دون المساس بأدويتك المخصصة أو الروشتات السابقة
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleReseed}
              className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100 h-9 rounded-xl gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة التهيئة</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
