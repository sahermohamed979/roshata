'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeLocalDatabase } from '@/lib/database/init-db';
import { useMedicineStore } from '@/stores/medicine.store';
import { toast } from 'sonner';

interface NetworkContextType {
  isOnline: boolean;
  isDbReady: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isDbReady: false,
});

export const RoshtehDatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDbReady, setIsDbReady] = useState(false);
  const refreshCounts = useMedicineStore((s) => s.refreshCounts);

  useEffect(() => {
    // 1. Initial network state
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        toast.success('تم الاتصال بالإنترنت', { duration: 2500 });
      };

      const handleOffline = () => {
        setIsOnline(false);
        toast.info('أنت الآن في وضع الأوفلاين (تعمل قاعدة البيانات المحلية بكامل طاقتها)', {
          duration: 3500,
        });
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // 2. Initialize Dexie DB
      initializeLocalDatabase()
        .then((res) => {
          setIsDbReady(true);
          refreshCounts();
          if (res.initialized) {
            toast.success(`تم تهيئة دليل الأدوية المحلي بنجاح (${res.count} دواء متاح بدون إنترنت)`, {
              duration: 3000,
            });
          }
        })
        .catch((err) => {
          console.error('Failed to init IndexedDB:', err);
          setIsDbReady(true);
        });

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [refreshCounts]);

  return (
    <NetworkContext.Provider value={{ isOnline, isDbReady }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkStatus = () => useContext(NetworkContext);
