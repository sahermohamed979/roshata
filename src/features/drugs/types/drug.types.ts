export interface DrugItem {
  id: string;
  name: string;
  form?: string;
  concentration?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DrugAnalyticsItem {
  name: string;
  form: string;
  concentration: string;
  count: number;
  lastPrescribed: string;
}

export interface DrugAnalyticsData {
  period: 'month' | '6months' | '1year' | 'custom';
  from?: string;
  to?: string;
  totalPrescriptions: number;
  totalItemsPrescribed: number;
  items: DrugAnalyticsItem[];
}

