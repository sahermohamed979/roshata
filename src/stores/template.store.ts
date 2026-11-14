import { create } from 'zustand';
import { TemplateRepository } from '@/features/templates/repositories/template.repository';
import type {
  PrescriptionTemplate,
  TemplateBlockElement,
  PaperSize,
  TemplateElementType,
} from '@/types/template.types';
import { toast } from 'sonner';

interface TemplateState {
  templates: PrescriptionTemplate[];
  activeTemplate: PrescriptionTemplate | null;
  activeTemplateId: string | null;
  mode: 'simple' | 'advanced';
  previewPage: 1 | 2;
  isLoading: boolean;
  isSaving: boolean;

  // History stack for Undo / Redo (TMP-005)
  history: PrescriptionTemplate[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  loadTemplates: () => Promise<void>;
  selectTemplate: (id: string) => void;
  createNewTemplate: (name: string, paperSize?: PaperSize) => Promise<PrescriptionTemplate>;
  duplicateCurrentTemplate: () => Promise<PrescriptionTemplate | null>;
  deleteCurrentTemplate: () => Promise<boolean>;
  setAsDefault: (id: string) => Promise<void>;
  setMode: (mode: 'simple' | 'advanced') => void;
  setPreviewPage: (page: 1 | 2) => void;

  // Direct editing actions (with undo/redo push)
  updateField: <K extends keyof PrescriptionTemplate>(
    field: K,
    value: PrescriptionTemplate[K]
  ) => void;
  updateElement: (elementId: string, updates: Partial<TemplateBlockElement>) => void;
  reorderElements: (fromIndex: number, toIndex: number) => void;
  toggleElementVisibility: (elementId: string) => void;
  addCustomElement: (
    type: TemplateElementType,
    title: string,
    customText?: string
  ) => void;
  removeElement: (elementId: string) => void;

  undo: () => void;
  redo: () => void;
  saveActiveTemplate: () => Promise<boolean>;
}

const MAX_HISTORY = 30;

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  activeTemplate: null,
  activeTemplateId: null,
  mode: 'simple',
  previewPage: 1,
  isLoading: true,
  isSaving: false,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  loadTemplates: async () => {
    set({ isLoading: true });
    try {
      const all = await TemplateRepository.listAll();
      let active = all.find((t) => t.isDefault) || all[0] || null;

      if (!active) {
        // Create initial default template if DB is empty
        active = await TemplateRepository.create({
          name: 'القالب القياسي للعيادة (A5)',
          paperSize: 'A5',
          isDefault: true,
        });
        all.push(active);
      }

      set({
        templates: all,
        activeTemplate: active,
        activeTemplateId: active ? active.id : null,
        history: active ? [JSON.parse(JSON.stringify(active))] : [],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load templates from local DB:', err);
      set({ isLoading: false });
    }
  },

  selectTemplate: (id: string) => {
    const { templates } = get();
    const found = templates.find((t) => t.id === id);
    if (!found) return;

    set({
      activeTemplate: JSON.parse(JSON.stringify(found)),
      activeTemplateId: id,
      history: [JSON.parse(JSON.stringify(found))],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    });
  },

  createNewTemplate: async (name: string, paperSize: PaperSize = 'A5') => {
    const created = await TemplateRepository.create({ name, paperSize });
    const all = await TemplateRepository.listAll();

    set({
      templates: all,
      activeTemplate: JSON.parse(JSON.stringify(created)),
      activeTemplateId: created.id,
      history: [JSON.parse(JSON.stringify(created))],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    });

    toast.success(`تم إنشاء قالب جديد: ${name}`);
    return created;
  },

  duplicateCurrentTemplate: async () => {
    const { activeTemplate } = get();
    if (!activeTemplate) return null;

    try {
      const duplicated = await TemplateRepository.duplicate(activeTemplate.id);
      const all = await TemplateRepository.listAll();

      set({
        templates: all,
        activeTemplate: JSON.parse(JSON.stringify(duplicated)),
        activeTemplateId: duplicated.id,
        history: [JSON.parse(JSON.stringify(duplicated))],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      });

      toast.success(`تم نسخ القالب بنجاح: ${duplicated.name}`);
      return duplicated;
    } catch (err) {
      console.error('Failed to duplicate template:', err);
      toast.error('فشل تكرار القالب');
      return null;
    }
  },

  deleteCurrentTemplate: async () => {
    const { activeTemplate, templates } = get();
    if (!activeTemplate) return false;

    if (templates.length <= 1) {
      toast.error('لا يمكن حذف القالب الوحيد المتبقي للعيادة');
      return false;
    }

    try {
      await TemplateRepository.delete(activeTemplate.id);
      const remaining = await TemplateRepository.listAll();
      const nextActive = remaining.find((t) => t.isDefault) || remaining[0];

      set({
        templates: remaining,
        activeTemplate: nextActive ? JSON.parse(JSON.stringify(nextActive)) : null,
        activeTemplateId: nextActive ? nextActive.id : null,
        history: nextActive ? [JSON.parse(JSON.stringify(nextActive))] : [],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      });

      toast.success('تم حذف القالب وتحديث القالب النشط');
      return true;
    } catch (err) {
      console.error('Failed to delete template:', err);
      toast.error('فشل حذف القالب');
      return false;
    }
  },

  setAsDefault: async (id: string) => {
    try {
      await TemplateRepository.setDefault(id);
      const all = await TemplateRepository.listAll();
      const current = get().activeTemplate;

      set({
        templates: all,
        activeTemplate: current && current.id === id ? { ...current, isDefault: true } : current,
      });

      toast.success('تم تعيين القالب كافتراضي للروشتات الجديدة');
    } catch (err) {
      console.error('Failed to set default template:', err);
      toast.error('تعذر تعيين القالب الافتراضي');
    }
  },

  setMode: (mode) => set({ mode }),
  setPreviewPage: (previewPage) => set({ previewPage }),

  updateField: (field, value) => {
    const { activeTemplate, history, historyIndex } = get();
    if (!activeTemplate) return;

    const updated: PrescriptionTemplate = {
      ...activeTemplate,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };

    // Trim history forward from historyIndex and push updated state
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updated)));
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      activeTemplate: updated,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });
  },

  updateElement: (elementId, updates) => {
    const { activeTemplate, history, historyIndex } = get();
    if (!activeTemplate) return;

    const elements = activeTemplate.elements.map((el) => {
      if (el.id === elementId) {
        return { ...el, ...updates };
      }
      return el;
    });

    const updated: PrescriptionTemplate = {
      ...activeTemplate,
      elements,
      updatedAt: new Date().toISOString(),
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updated)));
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      activeTemplate: updated,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });
  },

  reorderElements: (fromIndex, toIndex) => {
    const { activeTemplate, history, historyIndex } = get();
    if (!activeTemplate) return;

    const list = [...activeTemplate.elements];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    // Re-index order numbers
    const reordered = list.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    const updated: PrescriptionTemplate = {
      ...activeTemplate,
      elements: reordered,
      updatedAt: new Date().toISOString(),
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updated)));

    set({
      activeTemplate: updated,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });
  },

  toggleElementVisibility: (elementId) => {
    const { activeTemplate } = get();
    if (!activeTemplate) return;

    const target = activeTemplate.elements.find((el) => el.id === elementId);
    if (target) {
      get().updateElement(elementId, { visible: !target.visible });
    }
  },

  addCustomElement: (type, title, customText = '') => {
    const { activeTemplate, history, historyIndex } = get();
    if (!activeTemplate) return;

    const newElement: TemplateBlockElement = {
      id: `elem_custom_${Date.now()}`,
      type,
      title: title || 'نص مخصص إضافي',
      visible: true,
      order: activeTemplate.elements.length + 1,
      alignment: 'right',
      customText,
      fontSize: 10,
    };

    const updated: PrescriptionTemplate = {
      ...activeTemplate,
      elements: [...activeTemplate.elements, newElement],
      updatedAt: new Date().toISOString(),
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updated)));

    set({
      activeTemplate: updated,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });

    toast.success('تمت إضافة عنصر جديد لمخطط الروشتة');
  },

  removeElement: (elementId) => {
    const { activeTemplate, history, historyIndex } = get();
    if (!activeTemplate) return;

    const updatedElements = activeTemplate.elements
      .filter((el) => el.id !== elementId)
      .map((el, idx) => ({ ...el, order: idx + 1 }));

    const updated: PrescriptionTemplate = {
      ...activeTemplate,
      elements: updatedElements,
      updatedAt: new Date().toISOString(),
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updated)));

    set({
      activeTemplate: updated,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });

    toast.success('تم حذف العنصر من القالب');
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const targetState = JSON.parse(JSON.stringify(history[newIndex]));
      set({
        activeTemplate: targetState,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const targetState = JSON.parse(JSON.stringify(history[newIndex]));
      set({
        activeTemplate: targetState,
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < history.length - 1,
      });
    }
  },

  saveActiveTemplate: async () => {
    const { activeTemplate, templates } = get();
    if (!activeTemplate) return false;

    set({ isSaving: true });
    try {
      const saved = await TemplateRepository.save(activeTemplate);
      const updatedList = templates.map((t) => (t.id === saved.id ? saved : t));

      set({
        activeTemplate: JSON.parse(JSON.stringify(saved)),
        templates: updatedList,
        isSaving: false,
      });

      toast.success('تم حفظ إعدادات قالب الروشتة محلياً بنجاح');
      return true;
    } catch (err) {
      console.error('Failed to save active template:', err);
      toast.error('حدث خطأ أثناء حفظ القالب محلياً');
      set({ isSaving: false });
      return false;
    }
  },
}));
