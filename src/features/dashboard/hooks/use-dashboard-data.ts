'use client';

import { useQuery } from '@tanstack/react-query';
import { PrescriptionRepository } from '@/features/prescriptions/repositories/prescription.repository';
import { MedicineRepository } from '@/features/medicines/repositories/medicine.repository';
import type { Prescription } from '@/types/prescription.types';

export interface DashboardSummaryData {
  recentPrescriptions: Prescription[];
  totalRxCount: number;
  medicineCounts: {
    global: number;
    custom: number;
  };
}

export function useDashboardData() {
  return useQuery<DashboardSummaryData>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const [recentPrescriptions, totalRxCount, counts] = await Promise.all([
        PrescriptionRepository.listRecent(5),
        PrescriptionRepository.count(),
        MedicineRepository.getCounts(),
      ]);

      return {
        recentPrescriptions,
        totalRxCount,
        medicineCounts: counts,
      };
    },
    staleTime: 1000 * 30,
  });
}
