export interface ServicePriceItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: number;
  durationMinutes: number;
  dotColor: string;
}

export const DEFAULT_SERVICE_PRICES: ServicePriceItem[] = [
  {
    id: 'EXAMINATION',
    name: 'كشف جديد',
    nameEn: 'New Examination',
    description: 'كشف أول مرة للعيادة وفحص شامل للأنف والأذن والحنجرة',
    price: 300,
    durationMinutes: 15,
    dotColor: 'bg-[#0B7B5E]',
  },
  {
    id: 'FOLLOW_UP',
    name: 'إعادة كشف',
    nameEn: 'Follow Up',
    description: 'إعادة كشف ومتابعة تطور الحالة خلال فترة الاستشارة',
    price: 50,
    durationMinutes: 10,
    dotColor: 'bg-emerald-500',
  },
  {
    id: 'OPERATION_FOLLOWUP',
    name: 'متابعة بعد عملية',
    nameEn: 'Post-Op Follow Up',
    description: 'متابعة وتغيير على الجروح وفحص ما بعد العمليات الجراحية',
    price: 0,
    durationMinutes: 15,
    dotColor: 'bg-amber-500',
  },
  {
    id: 'ENDOSCOPY',
    name: 'فحص بالمنظار',
    nameEn: 'Endoscopy Examination',
    description: 'منظار تشخيصي متخصص للأذن أو الأنف أو الحنجرة وتوثيق الحالة',
    price: 200,
    durationMinutes: 20,
    dotColor: 'bg-teal-500',
  },
  {
    id: 'SURGERY',
    name: 'تدخل جراحي / عمليات صغرى',
    nameEn: 'Minor Surgery / Procedure',
    description: 'إجراءات جراحية صغرى بالعيادة مثل كي الأنف أو تنظيف الأذن المتقدم',
    price: 500,
    durationMinutes: 30,
    dotColor: 'bg-purple-600',
  },
  {
    id: 'CONSULTATION',
    name: 'استشارة طبية',
    nameEn: 'Consultation',
    description: 'استشارة ومراجعة نتائج الفحوصات والتحاليل الطبية والتقارير',
    price: 150,
    durationMinutes: 10,
    dotColor: 'bg-indigo-500',
  },
];

const PRICING_STORAGE_KEY = 'nafs_clinic_service_pricing_v1';

export function getStoredPricing(): ServicePriceItem[] {
  if (typeof window === 'undefined') return DEFAULT_SERVICE_PRICES;
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (!raw) return DEFAULT_SERVICE_PRICES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return DEFAULT_SERVICE_PRICES.map((def) => {
        const found = parsed.find((p: any) => p.id === def.id);
        return found ? { ...def, ...found } : def;
      });
    }
  } catch (e) {
    console.error('Error loading pricing from localStorage:', e);
  }
  return DEFAULT_SERVICE_PRICES;
}

export function saveStoredPricing(items: ServicePriceItem[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('pricing-updated'));
    return true;
  } catch (e) {
    console.error('Error saving pricing to localStorage:', e);
    return false;
  }
}

export function getPriceForType(typeId: string, fallback = 300): number {
  const list = getStoredPricing();
  const match = list.find((it) => it.id === typeId);
  return match !== undefined ? match.price : fallback;
}

