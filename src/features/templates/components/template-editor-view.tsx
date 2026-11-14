'use client';

import React, { useEffect } from 'react';
import { useTemplateStore } from '@/stores/template.store';
import { TemplateManagementBar } from './template-management-bar';
import { TemplateSimpleForm } from './template-simple-form';
import { TemplateAdvancedCanvas } from './template-advanced-canvas';
import { TemplateLivePreview } from './template-live-preview';
import { LayoutTemplate } from 'lucide-react';

export function TemplateEditorView() {
  const {
    isLoading,
    activeTemplate,
    mode,
    loadTemplates,
    undo,
    redo,
    saveActiveTemplate,
  } = useTemplateStore();

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Keyboard shortcuts listener for Undo (Ctrl+Z), Redo (Ctrl+Y/Ctrl+Shift+Z), Save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (modifier && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (modifier && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveActiveTemplate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveActiveTemplate]);

  if (isLoading || !activeTemplate) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E3F5EE] border border-[#0B7B5E]/30 flex items-center justify-center text-[#0B7B5E] animate-pulse">
          <LayoutTemplate className="w-5 h-5" />
        </div>
        <span className="font-bold text-sm">جاري تحميل قوالب الروشتات وإعدادات الهوية...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Master Template Management Bar (Selector, Defaults, Undo/Redo, Mode) */}
      <TemplateManagementBar />

      {/* 2. Main Two-Column Layout: Left = Editor Form/Canvas, Right = Live Preview Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form (Simple) or Canvas (Advanced) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          {mode === 'simple' ? <TemplateSimpleForm /> : <TemplateAdvancedCanvas />}
        </div>

        {/* Right Column: Live Simulated Print Paper */}
        <div className="lg:col-span-5 xl:col-span-5">
          <TemplateLivePreview />
        </div>
      </div>
    </div>
  );
}
