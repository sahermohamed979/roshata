'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Pill,
  Printer,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Save,
  FileCheck,
  Search,
  ChevronDown,
  Pencil,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PrescriptionMedicine,
  EntExaminationData,
} from '../types/ent-examination.types';
import {
  formatDose,
  formatFrequency,
  formatDuration,
  getDoseSuggestionsForForm,
  getDefaultDoseForForm,
  parseDoseShortcut,
} from '../utils/prescription-formatter';

export interface SavedDrugItem {
  id?: string;
  drugName: string;
  form?: string;
  concentration?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  usageCount?: number;
}

export interface DrugFormOption {
  id: string;
  labelEn: string;
  labelAr: string;
  isCustom?: boolean;
}

export const DRUG_FORMS: DrugFormOption[] = [
  { id: 'Tablet', labelEn: 'Tablet', labelAr: 'أقراص' },
  { id: 'ODT', labelEn: 'ODT (Orally Disintegrating Tablet)', labelAr: 'أقراص تذوب في الفم' },
  { id: 'ODF', labelEn: 'ODF (Oral Dissolving Film)', labelAr: 'شرائط تذوب في الفم' },
  { id: 'Capsule', labelEn: 'Capsule', labelAr: 'كبسولات' },
  { id: 'Syrup', labelEn: 'Syrup', labelAr: 'شراب' },
  { id: 'Suspension', labelEn: 'Suspension', labelAr: 'معلق' },
  { id: 'Oral Drops', labelEn: 'Oral Drops', labelAr: 'نقط بالفم' },
  { id: 'Oral Solution', labelEn: 'Oral Solution', labelAr: 'محلول فموي' },
  { id: 'Effervescent Tablet', labelEn: 'Effervescent Tablet', labelAr: 'أقراص فوارة' },
  { id: 'Chewable Tablet', labelEn: 'Chewable Tablet', labelAr: 'أقراص للمضغ' },
  { id: 'Sublingual Tablet', labelEn: 'Sublingual Tablet', labelAr: 'أقراص تحت اللسان' },
  { id: 'Injection', labelEn: 'Injection', labelAr: 'حقن' },
  { id: 'Ampoule', labelEn: 'Ampoule', labelAr: 'أمبول' },
  { id: 'Vial', labelEn: 'Vial', labelAr: 'فيال' },
  { id: 'Cream', labelEn: 'Cream', labelAr: 'كريم' },
  { id: 'Ointment', labelEn: 'Ointment', labelAr: 'مرهم' },
  { id: 'Gel', labelEn: 'Gel', labelAr: 'جل' },
  { id: 'Lotion', labelEn: 'Lotion', labelAr: 'لوشن' },
  { id: 'Eye Drops', labelEn: 'Eye Drops', labelAr: 'نقط عين' },
  { id: 'Eye Ointment', labelEn: 'Eye Ointment', labelAr: 'مرهم عين' },
  { id: 'Ear Drops', labelEn: 'Ear Drops', labelAr: 'نقط أذن' },
  { id: 'Ear Spray', labelEn: 'Ear Spray', labelAr: 'بخاخ أذن' },
  { id: 'Nasal Drops', labelEn: 'Nasal Drops', labelAr: 'نقط أنف' },
  { id: 'Nasal Spray', labelEn: 'Nasal Spray', labelAr: 'بخاخ أنف' },
  { id: 'Inhaler', labelEn: 'Inhaler', labelAr: 'بخاخ استنشاق' },
  { id: 'Nebulizer Solution', labelEn: 'Nebulizer Solution', labelAr: 'محلول جلسات' },
  { id: 'Suppository', labelEn: 'Suppository', labelAr: 'لبوس' },
  { id: 'Vaginal Suppository', labelEn: 'Vaginal Suppository', labelAr: 'لبوس مهبلي' },
  { id: 'Vaginal Cream', labelEn: 'Vaginal Cream', labelAr: 'كريم مهبلي' },
  { id: 'Powder', labelEn: 'Powder', labelAr: 'مسحوق' },
  { id: 'Sachet', labelEn: 'Sachet', labelAr: 'أكياس' },
  { id: 'Granules', labelEn: 'Granules', labelAr: 'حبيبات' },
  { id: 'Patch', labelEn: 'Patch', labelAr: 'لصقات جلدية' },
  { id: 'Mouthwash', labelEn: 'Mouthwash', labelAr: 'غسول فم' },
  { id: 'Oral Spray', labelEn: 'Oral Spray', labelAr: 'بخاخ فم' },
  { id: 'Lozenges', labelEn: 'Lozenges', labelAr: 'استحلاب' },
  { id: 'Nasal Wash', labelEn: 'Nasal Wash', labelAr: 'غسول أنف' },
  { id: 'Gargle', labelEn: 'Gargle', labelAr: 'غرغرة' },
  { id: 'Inhalation Solution', labelEn: 'Inhalation Solution', labelAr: 'محلول استنشاق' },
];

export const CONCENTRATION_SUGGESTIONS = [
  '100mg',
  '250mg',
  '500mg',
  '1000mg',
  '1gm',
  '0.1%',
  '0.05%',
  '5mg',
  '10mg',
  '20mg',
  '50mg',
];

export const FREQUENCY_SUGGESTIONS = [
  'كل 24 ساعة',
  'مرتين في اليوم',
  '3 مرات في اليوم',
  '4 مرات في اليوم',
  'عند اللزوم',
  'قبل النوم',
  'كل 12 ساعة',
  'كل 8 ساعات',
];

export const DURATION_SUGGESTIONS = [
  'يومياً',
  '3 أيام',
  '5 أيام',
  'أسبوع',
  'أسبوعين',
  'شهر',
  'لحين انتهاء الأعراض',
];

interface PrescriptionViewProps {
  examData: EntExaminationData;
  patient: any;
  doctor?: any;
  onChange: (updater: (prev: EntExaminationData) => EntExaminationData) => void;
  onBackToExam: () => void;
  onSave: () => void;
  onFinish: () => void;
  onPrintRx: (mode?: 'full' | 'plain') => void;
  isSaving: boolean;
  isFinishing: boolean;
}

const QUICK_ENT_DRUGS: Array<Omit<PrescriptionMedicine, 'id'>> = [
  { drugName: 'Augmentin', form: 'Tablet', concentration: '1gm', dose: '1 قرص', frequency: 'كل 12 ساعة', duration: '7 أيام', instructions: 'بعد الأكل مباشرة' },
  { drugName: 'Curam', form: 'Tablet', concentration: '1gm', dose: '1 قرص', frequency: 'كل 12 ساعة', duration: '7 أيام', instructions: 'وسط الأكل' },
  { drugName: 'Otrivin Adult', form: 'Nasal Spray', concentration: '0.1%', dose: 'بخة بكل فتحة أنف', frequency: 'مرتين يومياً', duration: '5 أيام', instructions: 'لا يُستخدم أكثر من 5 أيام لتجنب احتقان ارتدادي' },
  { drugName: 'Zyrtec (Cetirizine)', form: 'Tablet', concentration: '10mg', dose: '1 قرص', frequency: 'مساءً قبل النوم', duration: '10 أيام', instructions: 'قد يسبب بعض النعاس' },
  { drugName: 'Cataflam', form: 'Tablet', concentration: '50mg', dose: '1 قرص', frequency: 'عند اللزوم بعد الأكل', duration: '5 أيام', instructions: 'مسكن ومضاد للالتهاب' },
  { drugName: 'Otocort', form: 'Ear Drops', concentration: '', dose: '3 نقط في الأذن', frequency: '3 مرات يومياً', duration: '7 أيام', instructions: 'تدفئة الزجاجة بوضعها في راحة اليد أولاً' },
  { drugName: 'Bbc', form: 'Oral Spray', concentration: '', dose: 'بختين في الحلق', frequency: '3 مرات يومياً', duration: '5 أيام', instructions: 'مطهر ومسكن موضعي' },
  { drugName: 'Flixonase', form: 'Nasal Spray', concentration: '50mcg', dose: 'بخة بكل فتحة أنف', frequency: 'مرة واحدة صباحاً', duration: 'شهر', instructions: 'رج الزجاجة جيداً قبل الاستخدام' },
  { drugName: 'Alpha Chymotrypsin', form: 'Ampoule', concentration: '', dose: 'حقنة عضل', frequency: 'يومياً', duration: '5 أيام', instructions: 'مضاد للارتشاح والتورم' },
];

export function PrescriptionView({
  examData,
  patient,
  doctor,
  onChange,
  onBackToExam,
  onSave,
  onFinish,
  onPrintRx,
  isSaving,
  isFinishing,
}: PrescriptionViewProps) {
  const items = examData.prescriptionItems || [];
  const [savedDrugs, setSavedDrugs] = useState<SavedDrugItem[]>([]);
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<string | null>(null);
  const [activeFormRowId, setActiveFormRowId] = useState<string | null>(null);
  const [expandedManualEditRows, setExpandedManualEditRows] = useState<Record<string, boolean>>({});
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // 1. أشكال الأدوية المخصصة والمحذوفة
  const [customForms, setCustomForms] = useState<DrugFormOption[]>([]);
  const [deletedFormIds, setDeletedFormIds] = useState<string[]>([]);

  // 2. الاقتراحات المخصصة والمحذوفة (الجرعة، التركيز، التكرار، المدة)
  const [customSuggestions, setCustomSuggestions] = useState<{
    dose: string[];
    concentration: string[];
    frequency: string[];
    duration: string[];
  }>({
    dose: [],
    concentration: [],
    frequency: [],
    duration: [],
  });

  const [deletedSuggestions, setDeletedSuggestions] = useState<{
    dose: string[];
    concentration: string[];
    frequency: string[];
    duration: string[];
  }>({
    dose: [],
    concentration: [],
    frequency: [],
    duration: [],
  });

  // قراءة الاقتراحات والمحذوفات من LocalStorage
  useEffect(() => {
    try {
      const savedCustomForms = localStorage.getItem('clinic_rx_custom_forms');
      if (savedCustomForms) {
        const parsed = JSON.parse(savedCustomForms);
        if (Array.isArray(parsed)) setCustomForms(parsed);
      }

      const savedDeletedForms = localStorage.getItem('clinic_rx_deleted_forms');
      if (savedDeletedForms) {
        const parsed = JSON.parse(savedDeletedForms);
        if (Array.isArray(parsed)) setDeletedFormIds(parsed);
      }

      const savedCustom = localStorage.getItem('clinic_rx_custom_suggestions');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (parsed && typeof parsed === 'object') {
          setCustomSuggestions({
            dose: Array.isArray(parsed.dose) ? parsed.dose : [],
            concentration: Array.isArray(parsed.concentration) ? parsed.concentration : [],
            frequency: Array.isArray(parsed.frequency) ? parsed.frequency : [],
            duration: Array.isArray(parsed.duration) ? parsed.duration : [],
          });
        }
      }

      const savedDeleted = localStorage.getItem('clinic_rx_deleted_suggestions');
      if (savedDeleted) {
        const parsed = JSON.parse(savedDeleted);
        if (parsed && typeof parsed === 'object') {
          setDeletedSuggestions({
            dose: Array.isArray(parsed.dose) ? parsed.dose : [],
            concentration: Array.isArray(parsed.concentration) ? parsed.concentration : [],
            frequency: Array.isArray(parsed.frequency) ? parsed.frequency : [],
            duration: Array.isArray(parsed.duration) ? parsed.duration : [],
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // حالة نافذة إضافة الاقتراحات أو أشكال الأدوية البديلة لـ window.prompt (تعمل بكفاءة 100% في Electron)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'suggestion' | 'form';
    field?: 'dose' | 'concentration' | 'frequency' | 'duration';
    title: string;
    label: string;
    placeholder: string;
    formEnglish: string;
    formArabic: string;
    inputValue: string;
  }>({
    isOpen: false,
    type: 'suggestion',
    title: '',
    label: '',
    placeholder: '',
    formEnglish: '',
    formArabic: '',
    inputValue: '',
  });

  const openAddFormModal = () => {
    setModalState({
      isOpen: true,
      type: 'form',
      title: 'إضافة شكل / نوع دواء جديد (Drug Form)',
      label: 'اسم شكل الدواء بالإنجليزي',
      placeholder: 'مثال: Nasal Gel, Eye Ointment, Suppository...',
      formEnglish: '',
      formArabic: '',
      inputValue: '',
    });
  };

  const openAddSuggestionModal = (
    field: 'dose' | 'concentration' | 'frequency' | 'duration',
    titleAr: string,
    placeholder = ''
  ) => {
    setModalState({
      isOpen: true,
      type: 'suggestion',
      field,
      title: `إضافة اقتراح جديد - ${titleAr}`,
      label: `نص الاقتراح المراد إضافته لـ (${titleAr})`,
      placeholder: placeholder || `اكتب الاقتراح الجديد هنا...`,
      formEnglish: '',
      formArabic: '',
      inputValue: '',
    });
  };

  const handleSaveModal = () => {
    if (modalState.type === 'form') {
      const en = (modalState.formEnglish || '').trim();
      const ar = (modalState.formArabic || '').trim() || en;
      if (!en) {
        toast.error('يرجى إدخال اسم شكل الدواء بالإنجليزي');
        return;
      }
      const id = en.toLowerCase().replace(/\s+/g, '-');
      if (allDrugForms.some((f) => f.id === id || f.labelEn.toLowerCase() === en.toLowerCase())) {
        toast.info(`"${en}" موجود بالفعل في القائمة`);
        setModalState((prev) => ({ ...prev, isOpen: false }));
        return;
      }
      const newForm: DrugFormOption = {
        id,
        labelEn: en,
        labelAr: ar,
        isCustom: true,
      };

      setCustomForms((prev) => {
        const next = [...prev, newForm];
        try {
          localStorage.setItem('clinic_rx_custom_forms', JSON.stringify(next));
        } catch {}
        return next;
      });

      setDeletedFormIds((prev) => {
        const next = prev.filter((x) => x !== id);
        try {
          localStorage.setItem('clinic_rx_deleted_forms', JSON.stringify(next));
        } catch {}
        return next;
      });

      toast.success(`تمت إضافة "${en}" بنجاح إلى أشكال الأدوية`);
      setModalState((prev) => ({ ...prev, isOpen: false }));
    } else if (modalState.field) {
      const field = modalState.field;
      const clean = (modalState.inputValue || '').trim();
      if (!clean) {
        toast.error('يرجى كتابة نص الاقتراح');
        return;
      }

      setDeletedSuggestions((prev) => {
        const next = { ...prev, [field]: prev[field].filter((x) => x !== clean) };
        try {
          localStorage.setItem('clinic_rx_deleted_suggestions', JSON.stringify(next));
        } catch {}
        return next;
      });

      setCustomSuggestions((prev) => {
        if (prev[field].includes(clean)) {
          toast.info(`"${clean}" موجود بالفعل في الاقتراحات`);
          return prev;
        }
        const next = { ...prev, [field]: [...prev[field], clean] };
        try {
          localStorage.setItem('clinic_rx_custom_suggestions', JSON.stringify(next));
        } catch {}
        return next;
      });

      toast.success(`تمت إضافة "${clean}" إلى الاقتراحات بنجاح`);
      setModalState((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // إغلاق أي قائمة منسدلة تلقائياً عند الضغط في أي مكان خارجها أو Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest('[data-combobox-root]')) {
        setActiveFormRowId(null);
        setActiveDropdownRowId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveFormRowId(null);
        setActiveDropdownRowId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleDeleteForm = (id: string, label: string) => {
    if (!confirm(`هل تريد حذف "${label}" من قائمة أشكال الأدوية؟`)) return;
    setDeletedFormIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem('clinic_rx_deleted_forms', JSON.stringify(next));
      } catch {}
      return next;
    });
    setCustomForms((prev) => {
      const next = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem('clinic_rx_custom_forms', JSON.stringify(next));
      } catch {}
      return next;
    });
    toast.success(`تم حذف "${label}" من القائمة`);
  };

  const allDrugForms = useMemo(() => {
    const combined = [...DRUG_FORMS, ...customForms];
    return combined.filter((f) => !deletedFormIds.includes(f.id));
  }, [customForms, deletedFormIds]);

  const handleRemoveSuggestion = (
    field: 'dose' | 'concentration' | 'frequency' | 'duration',
    val: string
  ) => {
    // 1. الحذف من الاقتراحات المخصصة إن وجدت
    setCustomSuggestions((prev) => {
      const next = { ...prev, [field]: prev[field].filter((x) => x !== val) };
      try {
        localStorage.setItem('clinic_rx_custom_suggestions', JSON.stringify(next));
      } catch {}
      return next;
    });
    // 2. الإضافة إلى قائمة المحذوفات لتختفي حتى لو كانت افتراضية
    setDeletedSuggestions((prev) => {
      const next = { ...prev, [field]: Array.from(new Set([...prev[field], val])) };
      try {
        localStorage.setItem('clinic_rx_deleted_suggestions', JSON.stringify(next));
      } catch {}
      return next;
    });
    toast.success(`تم حذف "${val}" من الاقتراحات`);
  };

  const allConcentrationList = useMemo(
    () =>
      Array.from(new Set([...CONCENTRATION_SUGGESTIONS, ...customSuggestions.concentration])).filter(
        (x) => !deletedSuggestions.concentration.includes(x)
      ),
    [customSuggestions.concentration, deletedSuggestions.concentration]
  );

  const allFrequencyList = useMemo(
    () =>
      Array.from(new Set([...FREQUENCY_SUGGESTIONS, ...customSuggestions.frequency])).filter(
        (x) => !deletedSuggestions.frequency.includes(x)
      ),
    [customSuggestions.frequency, deletedSuggestions.frequency]
  );

  const allDurationList = useMemo(
    () =>
      Array.from(new Set([...DURATION_SUGGESTIONS, ...customSuggestions.duration])).filter(
        (x) => !deletedSuggestions.duration.includes(x)
      ),
    [customSuggestions.duration, deletedSuggestions.duration]
  );

  // حساب اقتراحات الجرعات المخصصة لكل سطر حسب شكل الدواء المختار (حقنة، قرص، بخة، نقط...)
  const getDoseListForRow = (form?: string) => {
    const contextual = getDoseSuggestionsForForm(form);
    const combined = Array.from(new Set([...contextual, ...customSuggestions.dose]));
    return combined.filter((x) => !deletedSuggestions.dose.includes(x));
  };

  // 1. جلب الأدوية المسجلة مسبقاً من الخادم
  useEffect(() => {
    let isMounted = true;
    fetch('/api/drugs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        const list = Array.isArray(data.payload)
          ? data.payload
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setSavedDrugs(
          list.map((d: any) => ({
            id: d.id || d._id,
            drugName: d.name || d.drugName,
            form: d.form || 'Tablet',
            concentration: d.concentration || '',
            dose: d.dose || '',
            frequency: d.frequency || '',
            duration: d.duration || '',
            instructions: d.instructions || '',
            usageCount: d.usageCount || 0,
          }))
        );
      })
      .catch((e) => console.warn('Failed to load saved drugs', e));
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. حذف دواء من الاقتراحات
  const handleDeleteDrug = async (drugId?: string, drugName?: string) => {
    if (!drugId) return;
    try {
      const res = await fetch(`/api/drugs/${encodeURIComponent(drugId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSavedDrugs((prev) => prev.filter((d) => d.id !== drugId));
        toast.success(`تم حذف "${drugName || 'الدواء'}" من الاقتراحات`);
      } else {
        toast.error('فشل حذف الدواء من الاقتراحات');
      }
    } catch {
      toast.error('حدث خطأ أثناء حذف الدواء');
    }
  };

  // 3. دمج الأدوية المسجلة من زيارات سابقة مع الأدوية الشائعة
  const combinedSuggestions: SavedDrugItem[] = useMemo(() => {
    const list: SavedDrugItem[] = [...savedDrugs];
    QUICK_ENT_DRUGS.forEach((quick) => {
      const exists = list.some(
        (s) => s.drugName.trim().toLowerCase() === quick.drugName.trim().toLowerCase()
      );
      if (!exists) {
        list.push({ ...quick });
      }
    });
    return list;
  }, [savedDrugs]);

  // 4. فلترة الأدوية في الشريط العلوي حسب البحث السريع
  const filteredChips = useMemo(() => {
    if (!drugSearchQuery.trim()) return combinedSuggestions;
    const q = drugSearchQuery.trim().toLowerCase();
    return combinedSuggestions.filter((d) =>
      d.drugName.toLowerCase().includes(q) ||
      (d.concentration && d.concentration.toLowerCase().includes(q)) ||
      (d.dose && d.dose.toLowerCase().includes(q))
    );
  }, [combinedSuggestions, drugSearchQuery]);

  // 5. اختيار دواء مقترح لتعبئة حقول السطر المحدد بضغطة واحدة
  const selectSuggestionForRow = (rowId: string, drug: SavedDrugItem) => {
    onChange((prev) => ({
      ...prev,
      prescriptionItems: (prev.prescriptionItems || []).map((it) =>
        it.id === rowId
          ? {
              ...it,
              drugName: drug.drugName,
              form: drug.form || it.form || 'Tablet',
              concentration: drug.concentration || it.concentration || '',
              dose: drug.dose || it.dose || '',
              frequency: drug.frequency || it.frequency || '',
              duration: drug.duration || it.duration || '',
              instructions: drug.instructions || it.instructions || '',
            }
          : it
      ),
    }));
    setActiveDropdownRowId(null);
  };

  // 6. اختيار شكل دواء جديد مع تحديث وحدة الجرعة تلقائياً وفوراً
  const handleSelectFormForRow = (itemId: string, newForm: string) => {
    const currentItem = items.find((it) => it.id === itemId);
    const prevDose = currentItem?.dose;
    let nextDose = '';

    if (prevDose && prevDose.trim()) {
      // إعادة ترجمة الجرعة لتلائم وحدة الشكل الجديد (مثال: "3 قرص" تتحول إلى "3 حقن" إذا تم اختيار Injection)
      nextDose = formatDose(prevDose, newForm);
    } else {
      nextDose = getDefaultDoseForForm(newForm);
    }

    onChange((prev) => ({
      ...prev,
      prescriptionItems: (prev.prescriptionItems || []).map((it) =>
        it.id === itemId
          ? {
              ...it,
              form: newForm,
              dose: nextDose || getDefaultDoseForForm(newForm) || it.dose,
            }
          : it
      ),
    }));
    setActiveFormRowId(null);
  };

  const addItem = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newItem: PrescriptionMedicine = {
      id: newId,
      drugName: '',
      form: 'Tablet',
      concentration: '',
      dose: '',
      frequency: '',
      duration: '',
      instructions: '',
    };
    onChange((prev) => ({
      ...prev,
      prescriptionItems: [...(prev.prescriptionItems || []), newItem],
    }));

    // التمرير السلس والتركيز المباشر على حقل اسم الدواء المضاف حديثاً
    setTimeout(() => {
      const el = document.getElementById(`drug-row-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector<HTMLInputElement>('input[data-drug-input="name"]');
        if (input) input.focus();
      }
    }, 100);
  };

  const handleAutoSaveUntrackedDrugs = async () => {
    for (const item of items) {
      const name = item.drugName?.trim();
      if (!name) continue;
      const alreadySaved = savedDrugs.some(
        (d) => d.drugName.trim().toLowerCase() === name.toLowerCase()
      );
      if (!alreadySaved) {
        try {
          const res = await fetch('/api/drugs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              form: item.form || 'Tablet',
              concentration: item.concentration || '',
              dose: item.dose || '',
              frequency: item.frequency || '',
              duration: item.duration || '',
              instructions: item.instructions || '',
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const saved = data?.payload || data;
            if (saved) {
              setSavedDrugs((prev) => [
                ...prev,
                {
                  id: saved.id || saved._id,
                  drugName: saved.name || name,
                  form: saved.form || item.form || 'Tablet',
                  concentration: saved.concentration || item.concentration || '',
                  dose: saved.dose || item.dose || '',
                  frequency: saved.frequency || item.frequency || '',
                  duration: saved.duration || item.duration || '',
                  instructions: saved.instructions || item.instructions || '',
                  usageCount: 1,
                },
              ]);
            }
          }
        } catch (e) {
          console.warn('Auto-save drug failed:', e);
        }
      }
    }
  };

  const updateItem = (id: string, field: keyof PrescriptionMedicine, value: string) => {
    onChange((prev) => ({
      ...prev,
      prescriptionItems: (prev.prescriptionItems || []).map((it) =>
        it.id === id ? { ...it, [field]: value } : it
      ),
    }));
  };

  const removeItem = (id: string) => {
    onChange((prev) => ({
      ...prev,
      prescriptionItems: (prev.prescriptionItems || []).filter((it) => it.id !== id),
    }));
  };

  const addQuickDrug = (drug: SavedDrugItem | Omit<PrescriptionMedicine, 'id'>) => {
    const newItem: PrescriptionMedicine = {
      id: Math.random().toString(36).substring(2, 9),
      drugName: drug.drugName || '',
      form: (drug.form as any) || 'Tablet',
      concentration: drug.concentration || '',
      dose: drug.dose || '',
      frequency: drug.frequency || '',
      duration: drug.duration || '',
      instructions: drug.instructions || '',
    };
    onChange((prev) => ({
      ...prev,
      prescriptionItems: [...(prev.prescriptionItems || []), newItem],
    }));
  };

  return (
    <div className="space-y-3.5 select-none" dir="rtl">
      {/* التشخيص الطبي للحالة (Diagnosis) - شريط سريع وأنيق في سطر واحد ومريح للعين */}
      <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#074C3A] shrink-0">
          <Stethoscope className="w-4 h-4 text-[#0B7B5E]" />
          <span>التشخيص (Diagnosis):</span>
        </div>
        <input
          type="text"
          value={examData.diagnosis || ''}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, diagnosis: e.target.value }))
          }
          placeholder="اكتب التشخيص الطبي للحالة هنا (مثال: Acute Tonsillitis / Allergic Rhinitis / Sinusitis)..."
          className="flex-1 bg-slate-50/80 hover:bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-[#074C3A] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#0B7B5E] focus:bg-white focus:ring-1 focus:ring-[#0B7B5E] transition-all"
        />
      </div>

      {/* 4. جدول إدخال الأدوية والجرعات والتكرار والمدة */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#0B7B5E]" />
            <div>
              <h4 className="font-black text-sm text-[#074C3A]">
                قائمة الأدوية الموصوفة
              </h4>
              <p className="text-[11px] text-slate-500">
                إجمالي الأصناف: <strong className="text-[#0B7B5E]">{items.length}</strong> دواء
              </p>
            </div>
          </div>

          {/* خيارات الطباعة والإضافة */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* زر طباعة روشتة كاملة */}
            <button
              type="button"
              onClick={() => onPrintRx('full')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="طباعة روشتة كاملة مع ترويسة العيادة واسم الطبيب"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>طباعة كاملة (مع الترويسة)</span>
            </button>

            {/* زر طباعة أدوية فقط للورق الجاهز */}
            <button
              type="button"
              onClick={() => onPrintRx('plain')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black transition-all shadow-2xs cursor-pointer"
              title="طباعة على ورق عيادة مطبوع مسبقاً (تطبع فقط الأدوية والجرعات والإرشادات بدون ترويسة أو توقيع)"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>طباعة أدوية فقط (ورق بدون ترويسة) 📄</span>
            </button>

            {/* زر دليل رموز الاختصارات السريعة */}
            <button
              type="button"
              onClick={() => setShowShortcutHelp(!showShortcutHelp)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                showShortcutHelp
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-black'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
              }`}
              title="عرض دليل رموز وتوقيت الجرعات السريعة"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>دليل رموز الاختصارات ⚡</span>
            </button>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف دواء</span>
            </button>
          </div>
        </div>

        {/* صندوق دليل رموز الاختصارات السريعة */}
        {showShortcutHelp && (
          <div className="p-4 bg-gradient-to-br from-amber-50/80 to-emerald-50/80 rounded-2xl border border-amber-200 text-xs space-y-2.5 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#074C3A] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>دليل الرموز السريعة لترجمة الجرعات وتوقيت الطعام:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowShortcutHelp(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">* أو r</strong>
                <span className="block text-slate-700">على الريق فور الاستيقاظ</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">~ أو s</strong>
                <span className="block text-slate-700">مساءً قبل النوم مباشرة</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">0 أو with</strong>
                <span className="block text-slate-700">مع الأكل / وسط الطعام</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">! أو sos</strong>
                <span className="block text-slate-700">عند اللزوم / عند الألم</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">-30</strong>
                <span className="block text-slate-700">قبل الأكل بنصف ساعة</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">+30</strong>
                <span className="block text-slate-700">بعد الأكل بنصف ساعة</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">-60</strong>
                <span className="block text-slate-700">قبل الأكل بساعة</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">+120 أو 120</strong>
                <span className="block text-slate-700">بعد الأكل بساعتين</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">-120</strong>
                <span className="block text-slate-700">قبل الأكل بساعتين</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">+180 أو 180</strong>
                <span className="block text-slate-700">بعد الأكل بثلاث ساعات</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">bw</strong>
                <span className="block text-slate-700">بين الوجبات</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <strong className="text-amber-800 font-mono font-black text-xs">h2o</strong>
                <span className="block text-slate-700">مع كوب ماء كامل</span>
              </div>
            </div>

            <div className="p-2 bg-white/80 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              💡 <strong>صيغة الاختصار:</strong> اكتب <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#074C3A]">1/3/5/-30</code> (قرص / 3 مرات / 5 أيام / قبل الأكل بنصف ساعة) أو <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#074C3A]">1/1/7/*</code> (على الريق) أو <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#074C3A]">1/1/10/~</code> (قبل النوم) واضغط <kbd className="bg-slate-200 px-1 rounded font-mono">Enter</kbd> للترجمة الفورية.
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Pill className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              لم تتم إضافة أي أدوية حتى الآن.
            </p>
            <p className="text-[11px] text-slate-500">
              اضغط على أحد الأدوية السريعة بالأعلى أو اضغط &quot;إضافة صنف دواء&quot; لبدء كتابة الروشتة.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                id={`drug-row-${item.id}`}
                className="p-3.5 bg-white hover:bg-[#E3F5EE]/20 rounded-2xl border border-slate-200 hover:border-[#0B7B5E]/50 transition-all shadow-2xs space-y-2.5"
              >
                {/* السطر الأول: رقم الصنف، اسم الدواء، الشكل، التركيز، اختصار الجرعة، وحذف */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                  {/* شارة الترقيم */}
                  <span className="w-7 h-7 rounded-lg bg-[#074C3A] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    #{index + 1}
                  </span>

                  {/* 1. اسم الدواء مع الإكمال التلقائي الذكي */}
                  <div className="relative flex-1 min-w-[190px]" data-combobox-root="drug">
                    <input
                      type="text"
                      data-drug-input="name"
                      value={item.drugName}
                      onFocus={() => setActiveDropdownRowId(item.id)}
                      onChange={(e) => {
                        updateItem(item.id, 'drugName', e.target.value);
                        setActiveDropdownRowId(item.id);
                      }}
                      placeholder="اسم الدواء (Augmentin, Otrivin...)*"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#0B7B5E] focus:ring-1 focus:ring-[#0B7B5E]"
                    />

                    {/* قائمة الاقتراحات المنسدلة لاسم الدواء */}
                    {activeDropdownRowId === item.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50">
                        {combinedSuggestions
                          .filter((sug) =>
                            !item.drugName.trim() ||
                            sug.drugName.toLowerCase().includes(item.drugName.trim().toLowerCase()) ||
                            (sug.dose && sug.dose.toLowerCase().includes(item.drugName.trim().toLowerCase()))
                          )
                          .slice(0, 8)
                          .map((sug, sIdx) => (
                            <div
                              key={sug.id || `${sug.drugName}-${sIdx}`}
                              className="px-3 py-2 hover:bg-[#E3F5EE] flex items-center justify-between gap-2 cursor-pointer transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                selectSuggestionForRow(item.id, sug);
                              }}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-xs text-[#074C3A]">
                                  {sug.drugName}
                                </span>
                                {sug.concentration && (
                                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                                    ({sug.concentration})
                                  </span>
                                )}
                                {sug.form && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                    {sug.form}
                                  </span>
                                )}
                                {sug.dose && (
                                  <span className="text-[11px] text-slate-500">
                                    · {sug.dose}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}

                        <div
                          className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-400 font-medium text-center cursor-pointer hover:bg-slate-100"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setActiveDropdownRowId(null);
                          }}
                        >
                          إغلاق الاقتراحات ✕
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. نوع / شكل الدواء (Form) */}
                  <div className="relative w-full sm:w-40 shrink-0" data-combobox-root="form">
                    <input
                      type="text"
                      value={item.form || ''}
                      onFocus={() => setActiveFormRowId(item.id)}
                      onChange={(e) => {
                        const newForm = e.target.value;
                        updateItem(item.id, 'form', newForm);
                        if (newForm.trim()) {
                          if (item.dose) {
                            const reFormatted = formatDose(item.dose, newForm);
                            if (reFormatted && reFormatted !== item.dose) {
                              updateItem(item.id, 'dose', reFormatted);
                            }
                          } else {
                            const def = getDefaultDoseForForm(newForm);
                            if (def) updateItem(item.id, 'dose', def);
                          }
                        }
                        setActiveFormRowId(item.id);
                      }}
                      placeholder="الشكل (Tablet...)"
                      className="w-full h-9 px-3 pr-7 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B7B5E]"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveFormRowId(activeFormRowId === item.id ? null : item.id)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* قائمة خيارات شكل الدواء */}
                    {activeFormRowId === item.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50">
                        {allDrugForms
                          .filter((f) => {
                            const q = (item.form || '').toLowerCase().trim();
                            if (!q) return true;
                            return (
                              f.labelEn.toLowerCase().includes(q) ||
                              f.labelAr.toLowerCase().includes(q) ||
                              f.id.toLowerCase().includes(q)
                            );
                          })
                          .map((f) => (
                            <div
                              key={f.id}
                              className="px-3 py-1.5 hover:bg-[#E3F5EE] flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectFormForRow(item.id, f.labelEn);
                              }}
                            >
                              <span className="font-bold text-[#074C3A]">{f.labelEn}</span>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {f.labelAr}
                              </span>
                            </div>
                          ))}
                        <div
                          className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-400 font-medium text-center cursor-pointer hover:bg-slate-100"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setActiveFormRowId(null);
                          }}
                        >
                          إغلاق ✕
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. التركيز (Concentration) */}
                  <div className="w-full sm:w-28 shrink-0">
                    <input
                      type="text"
                      value={item.concentration || ''}
                      onChange={(e) => updateItem(item.id, 'concentration', e.target.value)}
                      placeholder="التركيز (500mg)"
                      className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:border-[#0B7B5E]"
                    />
                  </div>

                  {/* 4. حقل اختصار الجرعة السريع (⚡ 1/3/5/-30 أو 1/1/7/* ثم Enter) */}
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="⚡ اختصار: 1/3/5/-30 أو 1/1/7/* ثم Enter"
                      title="اكتب اختصار الجرعة مثل 1/3/5/-30 أو 1/1/7/* (على الريق) أو 1/1/10/~ (قبل النوم) واضغط Enter"
                      className="w-full h-9 pr-3 pl-2 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 focus:bg-white font-mono text-xs font-bold text-[#074C3A] placeholder:text-emerald-700/60 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#0B7B5E] transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const parsed = parseDoseShortcut(e.currentTarget.value, item.form);
                          if (parsed) {
                            updateItem(item.id, 'dose', parsed.dose);
                            updateItem(item.id, 'frequency', parsed.frequency);
                            if (parsed.duration) updateItem(item.id, 'duration', parsed.duration);
                            if (parsed.instructions) updateItem(item.id, 'instructions', parsed.instructions);
                            toast.success(`✓ تمت ترجمة الاختصار: ${parsed.summary}`);
                          } else {
                            toast.info('اكتب الاختصار بالشكل: 1/3/5/-30 أو 1/1/7/* (جرعة / تكرار / مدة / رمز التوقيت)');
                          }
                        }
                      }}
                    />
                  </div>

                  {/* زر حذف الصنف */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="حذف هذا الدواء"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* السطر الثاني: الفقرة التلخيصية للجرعة وزر التعديل اليدوي */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-black text-[#074C3A] flex items-center gap-1 shrink-0">
                      💊 الجرعة المحددة:
                    </span>
                    {item.dose || item.frequency || item.duration || item.instructions ? (
                      <span className="font-bold text-slate-800">
                        {[
                          item.dose,
                          item.instructions,
                          item.frequency,
                          item.duration,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium italic">
                        لم يتم تحديد الجرعة بعد — اكتب اختصاراً في خانة (⚡ اختصار) واضغط Enter، أو اضغط &quot;تعديل التفاصيل&quot;.
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedManualEditRows((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }))
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-[#074C3A] font-bold text-[11px] border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Pencil className="w-3 h-3 text-[#0B7B5E]" />
                    <span>
                      {expandedManualEditRows[item.id] ? 'إخفاء التعديل ✕' : 'تعديل التفاصيل ✏️'}
                    </span>
                  </button>
                </div>

                {/* الدرج المنسدل للتعديل اليدوي إن رغب الطبيب في إدخال القيم يدوياً */}
                {expandedManualEditRows[item.id] && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 pb-1 border-t border-slate-100 animate-in fade-in-50 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        الجرعة (Dose):
                      </label>
                      <input
                        type="text"
                        value={item.dose}
                        onChange={(e) => updateItem(item.id, 'dose', e.target.value)}
                        placeholder="قرص واحد، 5 سم..."
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:border-[#0B7B5E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        التكرار (Frequency):
                      </label>
                      <input
                        type="text"
                        value={item.frequency}
                        onChange={(e) => updateItem(item.id, 'frequency', e.target.value)}
                        onBlur={(e) => {
                          const formatted = formatFrequency(e.target.value);
                          if (formatted !== e.target.value) {
                            updateItem(item.id, 'frequency', formatted);
                          }
                        }}
                        placeholder="3 مرات في اليوم..."
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:border-[#0B7B5E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        المدة (Duration):
                      </label>
                      <input
                        type="text"
                        value={item.duration}
                        onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                        onBlur={(e) => {
                          const formatted = formatDuration(e.target.value);
                          if (formatted !== e.target.value) {
                            updateItem(item.id, 'duration', formatted);
                          }
                        }}
                        placeholder="لمدة 5 أيام..."
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:border-[#0B7B5E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        التعليمات (Instructions):
                      </label>
                      <input
                        type="text"
                        value={item.instructions || ''}
                        onChange={(e) => updateItem(item.id, 'instructions', e.target.value)}
                        placeholder="قبل الأكل بنصف ساعة..."
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:border-[#0B7B5E]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ملاحظات وإرشادات الطبيب للمريض */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <label className="font-bold text-xs text-slate-700 block">
            ملاحظات وإرشادات عامة للمريض (Treatment Notes):
          </label>
          <textarea
            rows={3}
            value={examData.treatmentNotes || ''}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, treatmentNotes: e.target.value }))
            }
            placeholder="تعليمات إضافية مثل: الراحة التامة، شرب سوائل دافئة، تجنب المأكولات الحارة..."
            className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-bold leading-relaxed focus:outline-none focus:border-[#0B7B5E] focus:bg-white"
          />
        </div>
      </div>

      {/* 5. شريط الإجراءات السفلي */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={onBackToExam}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>العودة لتعديل استمارة الكشف الطبي</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={async () => {
              await handleAutoSaveUntrackedDrugs();
              onSave();
            }}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4 text-slate-600" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </button>

          {/* طباعة أدوية فقط للورق المطبوع مسبقاً */}
          <button
            type="button"
            onClick={() => onPrintRx('plain')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black transition-all cursor-pointer"
            title="طباعة أدوية فقط بدون ترويسة أو توقيع (للورق الجاهز)"
          >
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>طباعة أدوية فقط (ورق بدون ترويسة) 📄</span>
          </button>

          {/* طباعة روشتة كاملة */}
          <button
            type="button"
            onClick={() => onPrintRx('full')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D0E5DC] bg-[#E3F5EE]/60 hover:bg-[#E3F5EE] text-[#0B7B5E] text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كاملة</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await handleAutoSaveUntrackedDrugs();
              onFinish();
            }}
            disabled={isFinishing}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isFinishing ? 'جاري إنهاء الكشف...' : 'إنهاء الكشف وتسليم للاستقبال'}</span>
          </button>
        </div>
      </div>

      {/* نافذة إضافة شكل دواء أو اقتراح جديد داخل التطبيق (بديل موثوق لـ window.prompt في بيئة Electron) */}
      {modalState.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-[#074C3A]">
                {modalState.title}
              </h3>
              <button
                type="button"
                onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {modalState.type === 'form' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم شكل الدواء بالإنجليزي (English Name):
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={modalState.formEnglish || ''}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, formEnglish: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveModal();
                      }
                    }}
                    placeholder="مثال: Nasal Gel, Eye Ointment, Suppository..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0B7B5E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم بالعربي (اختياري):
                  </label>
                  <input
                    type="text"
                    value={modalState.formArabic || ''}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, formArabic: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveModal();
                      }
                    }}
                    placeholder="مثال: جل أنف، مرهم للعين، تحاميل..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0B7B5E]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {modalState.label}:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={modalState.inputValue || ''}
                  onChange={(e) =>
                    setModalState((prev) => ({ ...prev, inputValue: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveModal();
                    }
                  }}
                  placeholder={modalState.placeholder}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0B7B5E]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B7B5E] hover:bg-[#09634C] transition-colors cursor-pointer shadow-xs"
              >
                حفظ وإضافة للقائمة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * نموذج الروشتة الطبية الجاهز للطباعة المباشرة على ورقة A5 / A4
 * يدعم نمطين:
 * 1. 'full': روشتة كاملة مع ترويسة العيادة واسم الطبيب وتوقيعه
 * 2. 'plain': طباعة فقط أسماء الأدوية والجرعات والإرشادات (للورق المطبوع مسبقاً) بخلفية بيضاء نقية وتنسيق مرتب
 */
export function PrintablePrescriptionSlip({
  examData,
  patient,
  doctor,
  printMode = 'full',
}: {
  examData: EntExaminationData;
  patient: any;
  doctor?: any;
  printMode?: 'full' | 'plain';
}) {
  const items = examData.prescriptionItems || [];
  const isPlain = printMode === 'plain';

  return (
    <div
      dir="rtl"
      className={`bg-white text-black font-sans ${
        isPlain
          ? 'p-6 pt-16 max-w-2xl mx-auto space-y-6 print:p-2 print:pt-20 print:max-w-none'
          : 'p-8 max-w-2xl mx-auto space-y-6 border border-slate-300 print:border-none print:p-4 print:max-w-none'
      }`}
    >
      {/* ترويسة العيادة - تظهر فقط في الوضع الكامل (full) */}
      {!isPlain && (
        <div className="border-b-2 border-black pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-black">
              عيادة الأنف والأذن والحنجرة وجراحات الرأس والرقبة
            </h2>
            <p className="text-sm font-bold text-slate-700">
              {doctor?.name || 'د. إسلام عبدالله كريمة'}
            </p>
            <p className="text-xs text-slate-500">
              أخصائي الأنف والأذن والحنجرة - ماجستير جراحة الأنف والأذن والحنجرة
            </p>
          </div>

          <div className="text-left text-xs font-bold text-slate-700 space-y-0.5" dir="ltr">
            <p>ENT & Head & Neck Surgery Clinic</p>
            <p>Tel: {doctor?.phone || '01018566478'}</p>
          </div>
        </div>
      )}

      {/* بيانات المريض والزيارة - اسم المريض يظهر بالكامل في سطر واحد وواضح جداً */}
      <div
        className={`pb-3 ${
          isPlain ? 'border-b border-slate-400' : 'border-b-2 border-black'
        }`}
      >
        <div className="flex items-baseline justify-between gap-4 flex-nowrap overflow-x-hidden">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-slate-700 text-sm font-bold whitespace-nowrap">اسم المريض:</span>
            <span className="font-black text-lg sm:text-xl text-black whitespace-nowrap tracking-wide">
              {patient?.fullName}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm font-bold text-slate-800 whitespace-nowrap shrink-0">
            {patient?.age && (
              <span>السن: <strong>{patient.age} سنة</strong></span>
            )}
            <span>رقم الملف: <strong className="font-mono text-black">{examData.fileNo || (patient as any)?.fileNumber || '---'}</strong></span>
            <span dir="ltr">Date: <strong>{examData.date || new Date().toISOString().slice(0, 10)}</strong></span>
          </div>
        </div>

        {examData.diagnosis && (
          <div className="text-sm font-bold mt-2 pt-1 border-t border-slate-200 flex items-start gap-2 bg-purple-50/70 p-2 rounded-xl border border-purple-200">
            <span className="text-purple-800 shrink-0 font-black">التشخيص (Diagnosis): </span>
            <span className="font-black text-purple-950 text-sm whitespace-pre-line leading-relaxed">
              {examData.diagnosis}
            </span>
          </div>
        )}
      </div>

      {/* رمز الروشتة ℞ والأدوية - تبدأ من الشمال بالكامل LTR */}
      <div className="space-y-4 min-h-[350px]" dir="ltr">
        <div className="text-4xl font-black text-[#0B7B5E] select-none">
          ℞
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No medications prescribed.</p>
        ) : (
          <div className="space-y-4 pl-2 text-left">
            {items.map((item, idx) => {
              const formObj = DRUG_FORMS.find((f) => f.id === item.form);
              const formEnglish = formObj ? formObj.labelEn : (item.form || 'Tablet');

              // ترجمة الجرعة والتكرار والمدة للصياغة الطبية الدقيقة المطلوبة
              const displayDose = formatDose(item.dose, item.form);
              const displayFrequency = formatFrequency(item.frequency);
              const rawDuration = formatDuration(item.duration);
              const displayDuration = rawDuration
                ? (rawDuration.startsWith('لمدة') ? rawDuration : `لمدة ${rawDuration}`)
                : '';

              return (
                <div key={item.id || idx} className="space-y-1">
                  {/* السطر الأول: اسم الدواء (DrugName) التركيز الفورم (نوع الدواء) بالإنجليزي */}
                  <div className="flex items-baseline gap-2 flex-wrap font-black text-black">
                    <span className="text-lg font-black min-w-[22px] text-[#0B7B5E]">{idx + 1}.</span>
                    <span className="text-lg tracking-wide font-black text-slate-950">
                      {item.drugName}
                    </span>
                    {item.concentration && (
                      <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-300 text-xs px-1.5 py-0.5 rounded print:bg-transparent print:border print:border-black">
                        {item.concentration}
                      </span>
                    )}
                    {formEnglish && (
                      <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 text-xs px-2 py-0.5 rounded print:bg-transparent print:border print:border-black">
                        {formEnglish}
                      </span>
                    )}
                  </div>

                  {/* السطر الثاني: الجرعة والتكرار والمدة - مباشرة تحت اسم الدواء من اليسار بألوان مميزة */}
                  <div className="pl-6 space-y-0.5 text-left" dir="ltr">
                    <div className="text-sm font-bold flex items-center gap-2 flex-wrap">
                      {displayDose && (
                        <span className="text-[#9A3412] font-black">{displayDose}</span>
                      )}
                      {displayFrequency && (
                        <span className="text-[#3730A3] font-bold">
                          {displayDose ? '▪ ' : ''}{displayFrequency}
                        </span>
                      )}
                      {displayDuration && (
                        <span className="text-[#581C87] font-black">
                          {(displayDose || displayFrequency) ? '▪ ' : ''}
                          {displayDuration}
                        </span>
                      )}
                    </div>

                    {/* سطر الإرشادات والتعليمات إن وجد - مباشرة تحت اسم الدواء */}
                    {item.instructions && (
                      <div className="text-xs sm:text-sm font-semibold text-[#9F1239]">
                        <span>◄ {item.instructions}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ملاحظات العلاج */}
      {examData.treatmentNotes && (
        <div dir="rtl" className="border-t border-dotted border-black pt-3 text-xs text-right">
          <span className="font-bold text-black block mb-1">تعليمات إضافية:</span>
          <p className="text-slate-800 whitespace-pre-line leading-5">
            {examData.treatmentNotes}
          </p>
        </div>
      )}

      {/* موعد المتابعة وتوقيع الطبيب - يظهر فقط في النمط الكامل */}
      {!isPlain && (
        <div className="border-t-2 border-black pt-3 flex items-center justify-between text-xs font-bold">
          <div>
            {examData.followUpDate ? (
              <span className="text-slate-900">
                إعادة الكشف (Follow-up): <strong>{examData.followUpDate}</strong>
              </span>
            ) : (
              <span className="text-slate-500">الإعادة حسب إرشادات الطبيب</span>
            )}
          </div>

          <div className="text-left" dir="ltr">
            <span className="text-slate-700 block">Doctor&apos;s Signature</span>
            <span className="font-mono text-slate-400">......................</span>
          </div>
        </div>
      )}
    </div>
  );
}
