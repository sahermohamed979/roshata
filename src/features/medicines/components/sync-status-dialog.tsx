'use client';

import React, { useEffect } from 'react';
import {
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Layers,
  Sparkles,
  Download,
  Calendar,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useSyncStore } from '@/stores/sync.store';

interface SyncStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SyncStatusDialog({ open, onOpenChange }: SyncStatusDialogProps) {
  const {
    status,
    localVersion,
    serverVersion,
    changesCount,
    hasUpdate,
    isMonthlyDue,
    lastSyncAt,
    progressMessage,
    errorMessage,
    checkForUpdates,
    triggerSync,
    triggerRecoverySnapshot,
  } = useSyncStore();

  useEffect(() => {
    if (open) {
      checkForUpdates();
    }
  }, [open, checkForUpdates]);

  const isSyncing = status === 'syncing';
  const isChecking = status === 'checking';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-6" dir="rtl">
        <DialogHeader className="text-right pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] border border-[#0B7B5E]/30 flex items-center justify-center text-[#0B7B5E] shrink-0">
              <RefreshCw className={`w-5 h-5 ${isSyncing || isChecking ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                تحديث وتزامن قاعدة الأدوية (Database Sync)
              </DialogTitle>
              <p className="text-[11px] text-slate-500 font-medium">
                تحديث الدليل الدوائي محلياً عبر تقنية التزامن التراكمي (Incremental Delta)
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Version Comparison Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-center">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">الإصدار المحلي (العيادة)</span>
              <span className="font-mono text-xl font-black text-slate-900 block">
                v{localVersion}
              </span>
              <span className="text-[10px] text-slate-400 block">مثبت على جهازك</span>
            </div>

            <div className="space-y-1 border-r border-slate-200 pr-3">
              <span className="text-[11px] text-slate-500 font-bold block">إصدار السيرفر المركزي</span>
              <span className="font-mono text-xl font-black text-[#0B7B5E] block">
                v{serverVersion}
              </span>
              <span className="text-[10px] text-slate-400 block">أحدث إصدار رسمي</span>
            </div>
          </div>

          {/* Status Message / Notification */}
          <div className="space-y-2">
            {hasUpdate ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#0B7B5E] shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 font-medium leading-relaxed">
                  <strong className="font-bold text-emerald-900 block">
                    يوجد تحديث متاح: الإصدار v{serverVersion}
                  </strong>
                  يتضمن هذا التحديث {changesCount} تعديلاً تشمل أحدث تسعيرات هيئة الدواء والأدوية الجديدة.
                </div>
              </div>
            ) : status === 'up-to-date' ? (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#0B7B5E] shrink-0" />
                <span>دليل الأدوية لديك محدث بالكامل ومطابق لآخر إصدار مركزي.</span>
              </div>
            ) : null}

            {isMonthlyDue && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-[11px] text-amber-900 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>تنبيه: مر أكثر من 30 يوماً على آخر تحديث لقاعدة الأدوية. يُنصح بالمزامنة الآن.</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {progressMessage && (
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B7B5E] animate-pulse" />
                <span>{progressMessage}</span>
              </div>
            )}
          </div>

          {/* Sync Metadata Details */}
          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">تاريخ آخر تزامن:</span>
              <span className="font-mono text-slate-800 font-bold text-[11px]">
                {lastSyncAt ? new Date(lastSyncAt).toLocaleString('ar-EG') : 'غير متوفر'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">حماية الأدوية المخصصة:</span>
              <span className="text-[#0B7B5E] font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>محمية 100% ومفصولة</span>
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-start pt-3 border-t border-slate-100 flex-wrap">
          {hasUpdate ? (
            <Button
              type="button"
              disabled={isSyncing}
              onClick={triggerSync}
              className="bg-[#0B7B5E] hover:bg-[#074C3A] text-white font-bold text-xs px-5 h-9 rounded-xl gap-2 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري التحديث...' : 'تحديث القاعدة الآن'}</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isChecking}
              onClick={checkForUpdates}
              className="border-slate-200 text-xs font-bold h-9 rounded-xl gap-1.5 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>فحص التحديثات الآن</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={triggerRecoverySnapshot}
            disabled={isSyncing}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 h-9 rounded-xl gap-1"
            title="في حال حدوث خطأ أو رغبة في استعادة النسخة الكاملة"
          >
            <RotateCcw className="w-3 h-3" />
            <span>استعادة النسخة الكاملة</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold rounded-xl border-slate-200 mr-auto"
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
