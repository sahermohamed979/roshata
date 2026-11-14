import { create } from 'zustand';
import { MedicineSyncService, type SyncCheckResult, type SyncExecutionResult } from '@/features/medicines/services/medicine-sync.service';
import { useMedicineStore } from './medicine.store';
import type { CustomMedicine } from '@/types/medicine.types';
import { toast } from 'sonner';

export type SyncStatus = 'idle' | 'checking' | 'syncing' | 'up-to-date' | 'completed' | 'error';

interface SyncState {
  status: SyncStatus;
  localVersion: number;
  serverVersion: number;
  changesCount: number;
  hasUpdate: boolean;
  isMonthlyDue: boolean;
  lastSyncAt: string | null;
  progressMessage: string;
  errorMessage: string | null;

  // Actions
  checkForUpdates: () => Promise<SyncCheckResult>;
  triggerSync: () => Promise<SyncExecutionResult | null>;
  triggerRecoverySnapshot: () => Promise<SyncExecutionResult | null>;
  submitCustomMedicine: (customMed: CustomMedicine, doctorName?: string, clinicName?: string) => Promise<boolean>;
  resetStatus: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'idle',
  localVersion: 1,
  serverVersion: 1,
  changesCount: 0,
  hasUpdate: false,
  isMonthlyDue: false,
  lastSyncAt: null,
  progressMessage: '',
  errorMessage: null,

  checkForUpdates: async () => {
    set({ status: 'checking', progressMessage: 'جاري التحقق من تحديثات قاعدة الأدوية...' });
    try {
      const result = await MedicineSyncService.checkForUpdates();
      set({
        status: result.hasUpdate ? 'idle' : 'up-to-date',
        localVersion: result.localVersion,
        serverVersion: result.serverVersion,
        changesCount: result.changesCount,
        hasUpdate: result.hasUpdate,
        isMonthlyDue: result.isMonthlyDue,
        lastSyncAt: result.lastSyncAt,
        progressMessage: result.hasUpdate
          ? `يوجد إصدار جديد v${result.serverVersion} يتضمن ${result.changesCount} تعديل`
          : 'قاعدة الأدوية المحلية محدثة بالكامل',
      });
      return result;
    } catch (err: any) {
      set({
        status: 'error',
        errorMessage: err.message || 'تعذر الاتصال بخادم التحديثات',
        progressMessage: 'أنت تعمل حالياً بالكامل دون اتصال بالإنترنت',
      });
      return {
        hasUpdate: false,
        localVersion: get().localVersion,
        serverVersion: get().localVersion,
        changesCount: 0,
        isMonthlyDue: false,
        lastSyncAt: get().lastSyncAt,
      };
    }
  },

  triggerSync: async () => {
    set({ status: 'syncing', progressMessage: 'جاري تنزيل التحديثات التراكمية وتطبيقها محلياً...' });
    try {
      const result = await MedicineSyncService.syncIncremental();

      if (result.success) {
        set({
          status: 'completed',
          localVersion: result.newVersion,
          serverVersion: result.newVersion,
          hasUpdate: false,
          changesCount: 0,
          progressMessage:
            result.mode === 'none'
              ? 'القاعدة محدثة بالفعل'
              : `تم بنجاح تطبيق ${result.appliedChanges} تعديل وتحديث القاعدة إلى v${result.newVersion}`,
          lastSyncAt: new Date().toISOString(),
        });

        // Refresh global counts in medicine search store
        await useMedicineStore.getState().refreshCounts();
        toast.success(`تم تحديث دليل الأدوية بنجاح إلى الإصدار v${result.newVersion}`);
      }

      return result;
    } catch (err: any) {
      console.error('Sync failed:', err);
      set({
        status: 'error',
        errorMessage: err.message || 'فشل التزامن التراكمي',
        progressMessage: 'حدث خطأ أثناء تطبيق التحديثات. تم الحفاظ على بياناتك دون أي تغيير.',
      });
      toast.error('تعذر إكمال التزامن. لم يتم تغيير أي بيانات محلية.');
      return null;
    }
  },

  triggerRecoverySnapshot: async () => {
    set({ status: 'syncing', progressMessage: 'جاري تنزيل النسخة الكاملة واستعادتها محلياً...' });
    try {
      const result = await MedicineSyncService.syncFullSnapshot();
      if (result.success) {
        set({
          status: 'completed',
          localVersion: result.newVersion,
          serverVersion: result.newVersion,
          hasUpdate: false,
          progressMessage: `تمت استعادة الدليل الدوائي بالكامل (${result.appliedChanges} دواء)`,
          lastSyncAt: new Date().toISOString(),
        });
        await useMedicineStore.getState().refreshCounts();
        toast.success('تمت استعادة وتحديث قاعدة الأدوية بنجاح');
      }
      return result;
    } catch (err: any) {
      set({
        status: 'error',
        errorMessage: err.message || 'فشلت الاستعادة',
        progressMessage: 'تعذر تنزيل النسخة الكاملة',
      });
      toast.error('فشلت استعادة النسخة الكاملة');
      return null;
    }
  },

  submitCustomMedicine: async (customMed, doctorName, clinicName) => {
    const success = await MedicineSyncService.submitCustomMedicineSuggestion(
      customMed,
      doctorName,
      clinicName
    );
    if (success) {
      toast.success('تم إرسال اقتراح الدواء بنجاح للمراجعة المركزية');
    } else {
      toast.error('تعذر إرسال الاقتراح، سيتم المحاولة لاحقاً');
    }
    return success;
  },

  resetStatus: () => set({ status: 'idle', progressMessage: '', errorMessage: null }),
}));
