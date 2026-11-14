'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { UserRole } from '../types';
import { ROLE_CONFIG } from '../constants';
import { NafsIcon } from '@/shared/components/nafs-logo';

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole;
  onItemClick?: () => void;
}

/**
 * شريط التنقل الجانبي للوحة التحكم مبني على shadcn Sidebar الرسمي
 * يدعم الترجمة التفاعلية عبر next-intl، ويتكيف مع هوية العيادة ولون التبويب النشط
 */
export function DashboardSidebar({
  role,
  className,
  onItemClick,
  ...props
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Dashboard');
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const side = dir === 'rtl' ? 'right' : 'left';

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ADMIN;
  const { isMobile, setOpenMobile } = useSidebar();

  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    onItemClick?.();
  };

  return (
    <Sidebar
      side={side}
      dir={dir}
      collapsible="icon"
      className={cn('border-none bg-[#074C3A] text-white select-none shadow-xl', className)}
      {...props}
    >
      {/* 1. رأس الشريط الجانبي: الشعار واسم العيادة */}
      <SidebarHeader className="border-b border-white/10 px-4 py-4 group-data-[collapsible=icon]:p-2 bg-[#074C3A]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" onClick={handleItemClick} />}
              className="hover:bg-white/5 active:bg-white/10 text-white hover:text-white px-2 group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
                <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
                  <span className="font-heading font-black text-xl text-white tracking-tight">
                    نَفَس
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                    إدارة العيادات
                  </span>
                </div>
                {/* شعار نَفَس */}
                <NafsIcon size={28} />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. محتوى الشريط: قائمة الروابط المترجمة مع الأيقونات وتمييز brand-yellow */}
      <SidebarContent className="px-3 py-4 group-data-[collapsible=icon]:px-1 bg-[#074C3A]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {config.navItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard' || pathname === '/dashboard/'
                    : pathname?.startsWith(item.href);

                const Icon = item.icon;
                const rawTitle = (t as any).has?.(`nav.${item.id}`) ? t(`nav.${item.id}`) : (item.title || item.id);
                const itemTitle = (typeof rawTitle === 'string' && (rawTitle.includes('nav.') || rawTitle.includes('Dashboard.')))
                  ? (item.title || rawTitle)
                  : rawTitle;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={itemTitle}
                      render={
                        <Link
                          href={item.href}
                          onClick={handleItemClick}
                        />
                      }
                      className={cn(
                        'h-11 px-3.5 rounded-xl font-bold transition-all text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0',
                        isActive
                          ? 'bg-[#0B7B5E] text-white hover:bg-[#09634C] hover:text-white font-black shadow-md'
                          : 'text-slate-200 hover:text-white hover:bg-white/10 font-medium'
                      )}
                    >
                      {/* أيقونة العنصر من lucide-react */}
                      {Icon && (
                        <Icon
                          className={cn(
                            'w-5 h-5 shrink-0 transition-transform duration-150',
                            isActive
                              ? 'text-white'
                              : 'text-emerald-300/80 group-hover:text-white'
                          )}
                        />
                      )}

                      {/* نص الرابط المترجم */}
                      <span className="truncate flex-1 group-data-[collapsible=icon]:hidden">
                        {itemTitle}
                      </span>

                      {/* مؤشر التبويب النشط */}
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0 transition-all group-data-[collapsible=icon]:hidden',
                          isActive
                            ? 'bg-[#45DBA5]'
                            : 'bg-transparent'
                        )}
                        aria-hidden="true"
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. أسفل الشريط الجانبي: رقم الإصدار ونوع اللوحة المترجمة */}
      <SidebarFooter className="border-t border-white/10 p-0 bg-[#071510]">
        <div className="py-4 px-5 flex items-center justify-between text-xs text-slate-300 font-semibold group-data-[collapsible=icon]:justify-center">
          <span className="group-data-[collapsible=icon]:hidden font-mono">نَفَس v1.0</span>
          <span className="text-emerald-400 font-bold">{t(config.roleKey)}</span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
