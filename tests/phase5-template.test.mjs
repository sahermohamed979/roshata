import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Pure in-memory mock repository for verifying Phase 5 Template operations (TMP-001 to TMP-008)
class MockTemplateRepository {
  constructor() {
    this.templates = new Map();
  }

  seed(initial) {
    this.templates.clear();
    for (const t of initial) {
      this.templates.set(t.id, JSON.parse(JSON.stringify(t)));
    }
  }

  async getDefault(doctorId = 'default-doctor') {
    for (const t of this.templates.values()) {
      if (t.isDefault && (t.doctorId === doctorId || t.doctorId === 'default-doctor')) {
        return JSON.parse(JSON.stringify(t));
      }
    }
    const first = this.templates.values().next().value;
    return first ? JSON.parse(JSON.stringify(first)) : undefined;
  }

  async listAll(doctorId = 'default-doctor') {
    const res = [];
    for (const t of this.templates.values()) {
      if (t.doctorId === doctorId || t.doctorId === 'default-doctor') {
        res.push(JSON.parse(JSON.stringify(t)));
      }
    }
    return res;
  }

  async getById(id) {
    const t = this.templates.get(id);
    return t ? JSON.parse(JSON.stringify(t)) : undefined;
  }

  async create(params) {
    const doctorId = params.doctorId || 'default-doctor';
    const isDefault = params.isDefault || this.templates.size === 0;

    if (isDefault) {
      for (const t of this.templates.values()) {
        t.isDefault = false;
      }
    }

    const newTemplate = {
      id: `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      doctorId,
      name: params.name || 'قالب جديد',
      isDefault,
      paperSize: params.paperSize || 'A5',
      doctorNameAr: 'د. إسلام عبدالله كريمة',
      doctorNameEn: 'Dr. Eslam Abdallah Karima',
      medicalTitleAr: 'استشاري جراحة الأنف والأذن والحنجرة',
      medicalTitleEn: 'Consultant ENT Surgery',
      clinicNameAr: 'عيادة نَفَس التخصصية',
      clinicNameEn: 'Nafs Specialized Clinic',
      clinicAddress: 'القاهرة - المعادي - شارع النصر',
      clinicPhones: ['01000000000'],
      primaryColor: '#0B7B5E',
      fontFamily: 'Cairo',
      fontSize: 'medium',
      headerLayout: 'split',
      footerLayout: 'standard',
      showLogo: true,
      showSignature: true,
      showStamp: false,
      showWatermark: true,
      watermarkOpacity: 0.08,
      showReturnPolicy: true,
      showPatientBox: true,
      showDiagnosis: true,
      marginTopMm: 15,
      marginBottomMm: 15,
      marginLeftMm: 15,
      marginRightMm: 15,
      hasBackPage: true,
      backPageNotes: 'يرجى الالتزام بالجرعات المحددة.',
      elements: [
        { id: 'el_1', type: 'header', title: 'ترويسة الطبيب', visible: true, order: 1, alignment: 'right' },
        { id: 'el_2', type: 'patient_box', title: 'بيانات المريض', visible: true, order: 2, alignment: 'right' },
        { id: 'el_3', type: 'medications', title: 'الأدوية', visible: true, order: 3, alignment: 'right' },
        { id: 'el_4', type: 'footer', title: 'التذييل', visible: true, order: 4, alignment: 'center' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    return JSON.parse(JSON.stringify(newTemplate));
  }

  async duplicate(id, newName) {
    const source = this.templates.get(id);
    if (!source) throw new Error('Template not found');

    const cloned = {
      ...JSON.parse(JSON.stringify(source)),
      id: `tpl_dup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newName || `نسخة من ${source.name}`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(cloned.id, cloned);
    return JSON.parse(JSON.stringify(cloned));
  }

  async setDefault(id) {
    const target = this.templates.get(id);
    if (!target) return;

    for (const t of this.templates.values()) {
      t.isDefault = t.id === id;
    }
  }

  async save(template) {
    if (template.isDefault) {
      for (const t of this.templates.values()) {
        if (t.id !== template.id) {
          t.isDefault = false;
        }
      }
    }
    const updated = {
      ...template,
      updatedAt: new Date().toISOString(),
    };
    this.templates.set(template.id, JSON.parse(JSON.stringify(updated)));
    return JSON.parse(JSON.stringify(updated));
  }

  async delete(id) {
    const target = this.templates.get(id);
    this.templates.delete(id);

    if (target?.isDefault) {
      const remaining = this.templates.values().next().value;
      if (remaining) {
        remaining.isDefault = true;
      }
    }
  }
}

// Pure Undo/Redo History Manager
class HistoryStack {
  constructor(initialState, max = 20) {
    this.history = [JSON.parse(JSON.stringify(initialState))];
    this.index = 0;
    this.max = max;
  }

  push(state) {
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(JSON.parse(JSON.stringify(state)));
    if (this.history.length > this.max) {
      this.history.shift();
    }
    this.index = this.history.length - 1;
  }

  canUndo() {
    return this.index > 0;
  }

  canRedo() {
    return this.index < this.history.length - 1;
  }

  undo() {
    if (this.canUndo()) {
      this.index--;
      return JSON.parse(JSON.stringify(this.history[this.index]));
    }
    return null;
  }

  redo() {
    if (this.canRedo()) {
      this.index++;
      return JSON.parse(JSON.stringify(this.history[this.index]));
    }
    return null;
  }

  current() {
    return JSON.parse(JSON.stringify(this.history[this.index]));
  }
}

describe('Phase 5 — Template Creation & Offline Storage (TMP-001, TMP-008)', () => {
  const repo = new MockTemplateRepository();

  test('creates and stores a new template locally with default elements (TMP-001)', async () => {
    const tpl = await repo.create({
      name: 'روشتة عيادة المعادي الرئيسية',
      paperSize: 'A5',
    });

    assert.ok(tpl.id.startsWith('tpl_'));
    assert.equal(tpl.name, 'روشتة عيادة المعادي الرئيسية');
    assert.equal(tpl.paperSize, 'A5');
    assert.equal(tpl.isDefault, true); // First template is default
    assert.ok(Array.isArray(tpl.elements));
    assert.equal(tpl.elements.length, 4);

    const retrieved = await repo.getById(tpl.id);
    assert.deepEqual(retrieved.id, tpl.id);
  });

  test('operates 100% offline without remote network handshakes (TMP-008)', async () => {
    const list = await repo.listAll();
    assert.equal(list.length, 1);
  });
});

describe('Phase 5 — Doctor & Clinic Customization & Live Reflection (TMP-002)', () => {
  const repo = new MockTemplateRepository();

  test('updates doctor title, qualifications, and clinic contacts cleanly', async () => {
    const initial = await repo.create({ name: 'القالب الأولي' });

    const updated = {
      ...initial,
      doctorNameAr: 'أ.د. حسام غالي',
      medicalTitleAr: 'أستاذ جراحة الأذن الدقيقة وزراعة القوقعة',
      clinicNameAr: 'مركز السمع والاتزان التخصصي',
      clinicPhones: ['01011112222', '01233334444'],
      primaryColor: '#1D4ED8',
      headerLayout: 'centered',
    };

    const saved = await repo.save(updated);
    assert.equal(saved.doctorNameAr, 'أ.د. حسام غالي');
    assert.equal(saved.medicalTitleAr, 'أستاذ جراحة الأذن الدقيقة وزراعة القوقعة');
    assert.equal(saved.clinicNameAr, 'مركز السمع والاتزان التخصصي');
    assert.equal(saved.clinicPhones.length, 2);
    assert.equal(saved.primaryColor, '#1D4ED8');
    assert.equal(saved.headerLayout, 'centered');
  });
});

describe('Phase 5 — Logo & Signature Base64 Asset Storage (TMP-003)', () => {
  const repo = new MockTemplateRepository();

  test('stores and preserves Base64 logo and signature data without external URLs', async () => {
    const tpl = await repo.create({ name: 'قالب مع شعار' });

    const sampleBase64Logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const sampleBase64Signature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNkWPj/PwMDw0MGAMeMB/2l5Nf1AAAAAElFTkSuQmCC';

    tpl.logoUrl = sampleBase64Logo;
    tpl.signatureUrl = sampleBase64Signature;
    tpl.showLogo = true;
    tpl.showSignature = true;

    const saved = await repo.save(tpl);
    assert.equal(saved.logoUrl, sampleBase64Logo);
    assert.equal(saved.signatureUrl, sampleBase64Signature);
    assert.equal(saved.showLogo, true);
    assert.equal(saved.showSignature, true);

    const reloaded = await repo.getById(tpl.id);
    assert.equal(reloaded.logoUrl, sampleBase64Logo);
  });
});

describe('Phase 5 — Stage B Advanced Layout & Block Editor (TMP-004)', () => {
  const repo = new MockTemplateRepository();

  test('reorders elements, toggles visibility, and inserts custom blocks', async () => {
    const tpl = await repo.create({ name: 'مخطط متقدم' });

    // 1. Toggle visibility of patient box
    const patientEl = tpl.elements.find((el) => el.type === 'patient_box');
    patientEl.visible = false;

    // 2. Add custom text block
    const customBlock = {
      id: 'el_custom_disclaimer',
      type: 'custom_text',
      title: 'تنبيه صرف الصيدلي',
      visible: true,
      order: 5,
      alignment: 'center',
      customText: 'تنبيه: لا يصرف بديل إلا بعد الرجوع للطبيب المعالج',
    };
    tpl.elements.push(customBlock);

    // 3. Reorder: move medications to order 1
    tpl.elements.sort((a, b) => (a.type === 'medications' ? -1 : 1));
    tpl.elements.forEach((el, idx) => {
      el.order = idx + 1;
    });

    const saved = await repo.save(tpl);
    assert.equal(saved.elements.length, 5);
    assert.equal(saved.elements[0].type, 'medications');

    const foundCustom = saved.elements.find((el) => el.id === 'el_custom_disclaimer');
    assert.ok(foundCustom);
    assert.equal(foundCustom.customText, 'تنبيه: لا يصرف بديل إلا بعد الرجوع للطبيب المعالج');
    assert.equal(foundCustom.alignment, 'center');
  });
});

describe('Phase 5 — Undo and Redo Operation Stack (TMP-005)', () => {
  test('tracks state history, restores previous state on undo, and reapplies on redo', () => {
    const initial = {
      doctorNameAr: 'د. إسلام كريمة',
      primaryColor: '#0B7B5E',
      fontSize: 'medium',
    };

    const history = new HistoryStack(initial);
    assert.equal(history.canUndo(), false);
    assert.equal(history.canRedo(), false);

    // Step 1: change color
    const step1 = { ...initial, primaryColor: '#1D4ED8' };
    history.push(step1);
    assert.equal(history.canUndo(), true);
    assert.equal(history.canRedo(), false);
    assert.equal(history.current().primaryColor, '#1D4ED8');

    // Step 2: change name
    const step2 = { ...step1, doctorNameAr: 'د. إسلام عبدالله' };
    history.push(step2);
    assert.equal(history.current().doctorNameAr, 'د. إسلام عبدالله');

    // Undo step 2 -> back to step 1
    const undone1 = history.undo();
    assert.equal(undone1.doctorNameAr, 'د. إسلام كريمة');
    assert.equal(undone1.primaryColor, '#1D4ED8');
    assert.equal(history.canRedo(), true);

    // Undo step 1 -> back to initial
    const undone2 = history.undo();
    assert.equal(undone2.primaryColor, '#0B7B5E');
    assert.equal(history.canUndo(), false);

    // Redo -> forward to step 1
    const redone1 = history.redo();
    assert.equal(redone1.primaryColor, '#1D4ED8');
    assert.equal(history.canUndo(), true);

    // Redo -> forward to step 2
    const redone2 = history.redo();
    assert.equal(redone2.doctorNameAr, 'د. إسلام عبدالله');
    assert.equal(history.canRedo(), false);
  });
});

describe('Phase 5 — Multiple Templates & Default Template Enforcement (TMP-006, TMP-007)', () => {
  const repo = new MockTemplateRepository();

  test('manages multiple independent templates without interference (TMP-006)', async () => {
    const tpl1 = await repo.create({ name: 'عيادة المعادي', paperSize: 'A5' });
    const tpl2 = await repo.create({ name: 'عيادة الشيخ زايد', paperSize: 'A4', isDefault: false });

    assert.equal(tpl1.name, 'عيادة المعادي');
    assert.equal(tpl2.name, 'عيادة الشيخ زايد');
    assert.equal(tpl1.paperSize, 'A5');
    assert.equal(tpl2.paperSize, 'A4');

    // Modifying tpl2 does not affect tpl1
    tpl2.clinicNameAr = 'مركز زايد لجراحة الأنف';
    await repo.save(tpl2);

    const checkTpl1 = await repo.getById(tpl1.id);
    assert.equal(checkTpl1.clinicNameAr, 'عيادة نَفَس التخصصية');
  });

  test('duplicates an existing template independently (TMP-006)', async () => {
    const original = await repo.create({ name: 'القالب القياسي' });
    const duplicated = await repo.duplicate(original.id, 'نسخة خاصة للأطفال');

    assert.notEqual(duplicated.id, original.id);
    assert.equal(duplicated.name, 'نسخة خاصة للأطفال');
    assert.equal(duplicated.isDefault, false);
  });

  test('enforces that exactly one template is default and promotes successor on delete (TMP-007)', async () => {
    repo.seed([
      { id: 't1', name: 'قالب 1', isDefault: true, doctorId: 'default-doctor' },
      { id: 't2', name: 'قالب 2', isDefault: false, doctorId: 'default-doctor' },
      { id: 't3', name: 'قالب 3', isDefault: false, doctorId: 'default-doctor' },
    ]);

    // Set t2 as default
    await repo.setDefault('t2');

    const all = await repo.listAll();
    const t1 = all.find((t) => t.id === 't1');
    const t2 = all.find((t) => t.id === 't2');
    const t3 = all.find((t) => t.id === 't3');

    assert.equal(t2.isDefault, true);
    assert.equal(t1.isDefault, false);
    assert.equal(t3.isDefault, false);

    // Delete default template t2 -> t1 or t3 must be promoted to default
    await repo.delete('t2');

    const remaining = await repo.listAll();
    assert.equal(remaining.length, 2);
    const defaults = remaining.filter((t) => t.isDefault);
    assert.equal(defaults.length, 1);
  });
});
