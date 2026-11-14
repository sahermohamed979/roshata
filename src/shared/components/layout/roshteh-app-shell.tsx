'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  PlusCircle,
  Pill,
  LayoutTemplate,
  Settings,
  History,
  Wifi,
  WifiOff,
  Database,
  Menu,
  X,
  Stethoscope,
  Printer,
  ChevronLeft,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoshtehLogo } from '../roshteh-logo';
import { useNetworkStatus } from '@/shared/providers/roshteh-db-provider';
import { useMedicineStore } from '@/stores/medicine.store';
import { useSyncStore } from '@/stores/sync.store';
import { SyncStatusDialog } from '@/features/medicines/components/sync-status-dialog';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    title: 'تحرير روشتة جديدة',
    href: '/prescriptions/new',
    icon: PlusCircle,
  },
  {
    title: 'أرشيف الروشتات',
    href: '/prescriptions',
    icon: History,
    exact: true,
  },
  {
    title: 'دليل الأدوية المحلي',
    href: '/medicines',
    icon: Pill,
  },
  {
    title: 'قوالب الروشتات',
    href: '/templates',
    icon: LayoutTemplate,
  },
  {
    title: 'إعدادات العيادة والطباعة',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'الإدارة المركزية',
    href: '/admin',
    icon: ShieldAlert,
  },
];

export const RoshtehAppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { isOnline, isDbReady } = useNetworkStatus();
  const { totalGlobalCount, totalCustomCount } = useMedicineStore();
  const { localVersion, hasUpdate, isMonthlyDue, checkForUpdates } = useSyncStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  // Check for updates on mount if online (SYN-009)
  React.useEffect(() => {
    if (isOnline) {
      checkForUpdates();
    }
  }, [isOnline, checkForUpdates]);

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF8] text-[#0B241D] flex flex-col font-sans" dir="rtl">
      {/* ─── Topbar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-md border-b border-[#D0E5DC] px-4 sm:px-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <RoshtehLogo size="sm" showSubtitle={false} />
        </div>

        {/* Center / Right Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Synchronization Status Button (SYN-008, SYN-009) */}
          <button
            type="button"
            onClick={() => setSyncDialogOpen(true)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-2xs select-none',
              hasUpdate
                ? 'bg-emerald-50 text-[#074C3A] border-emerald-300 ring-2 ring-emerald-400/30'
                : isMonthlyDue
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
            title="حالة تزامن قاعدة الأدوية مع السيرفر المركزي"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', hasUpdate ? 'text-[#0B7B5E]' : 'text-slate-500')} />
            <span className="hidden xs:inline">قاعدة الأدوية:</span>
            <span className="font-mono font-black">v{localVersion}</span>
            {hasUpdate && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Offline / Online Status Badge */}
          <div
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors select-none',
              isOnline
                ? 'bg-[#E3F5EE] text-[#0B7B5E] border-[#45DBA5]/40'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            )}
            title={isOnline ? 'متصل بالإنترنت وقاعدة البيانات المحلية جاهزة' : 'وضع الأوفلاين: البيانات تُحفظ محلياً'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'أونلاين · Local-First' : 'أوفلاين (IndexedDB جاهز)'}</span>
          </div>

          {/* Database Counter Badge */}
          <div
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 select-none"
            title="الأدوية المحملة محلياً في المتصفح"
          >
            <Database className="w-3.5 h-3.5 text-[#0B7B5E]" />
            <span>{totalGlobalCount + totalCustomCount} دواء محلي</span>
          </div>

          {/* Quick Action: New Prescription */}
          <Link
            href="/prescriptions/new"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#0B7B5E] hover:bg-[#074C3A] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">روشتة جديدة</span>
          </Link>
        </div>
      </header>

      {/* Sync Status Dialog Modal */}
      <SyncStatusDialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen} />

      <div className="flex-1 flex overflow-hidden">
        {/* ─── Desktop Sidebar ─────────────────────────────────────────────── */}
        <aside className="hidden lg:flex w-64 bg-white border-l border-[#D0E5DC] flex-col shrink-0">
          <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            <div className="px-3 py-2 text-[11px] font-black uppercase text-slate-400 tracking-wider">
              القائمة الرئيسية
            </div>

            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all',
                    active
                      ? 'bg-[#E3F5EE] text-[#074C3A] shadow-2xs font-black'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors',
                        active ? 'text-[#0B7B5E]' : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {active && <ChevronLeft className="w-4 h-4 text-[#0B7B5E]" />}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer: Doctor & Clinic Card */}
          <div className="p-4 border-t border-[#D0E5DC] bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B7B5E]/10 border border-[#0B7B5E]/20 flex items-center justify-center text-[#0B7B5E] shrink-0 font-black">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-slate-800 truncate">
                  د. إسلام عبدالله كريمة
                </span>
                <span className="text-[11px] font-medium text-slate-500 truncate">
                  عيادة نَفَس التخصصية
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Mobile Sidebar Drawer ───────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-white h-full shadow-2xl flex flex-col p-4 space-y-2 animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <RoshtehLogo size="sm" showSubtitle={false} />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 py-2">
                {navItems.map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all',
                        active
                          ? 'bg-[#E3F5EE] text-[#074C3A] font-black'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', active ? 'text-[#0B7B5E]' : 'text-slate-400')} />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── Main Content Canvas ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
