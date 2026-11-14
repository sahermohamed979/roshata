'use client';

import React from 'react';
import { useClinicRealtime } from '../hooks/use-clinic-realtime';

export function RealtimeStatusBadge() {
  const { status } = useClinicRealtime();

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 select-none">
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          status === 'connected'
            ? 'bg-emerald-500 animate-pulse'
            : status === 'connecting'
            ? 'bg-amber-500 animate-bounce'
            : 'bg-rose-500'
        }`}
      />
      <span className="text-slate-600 dark:text-slate-300">
        {status === 'connected'
          ? 'متصل لحظياً'
          : status === 'connecting'
          ? 'جارٍ الاتصال...'
          : 'غير متصل بالخادم'}
      </span>
    </div>
  );
}

