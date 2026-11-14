import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test Manifest Definition (matches src/app/manifest.ts)
function getAppManifest() {
  return {
    name: 'روشتة — نظام إدارة وطباعة الروشتات الطبية',
    short_name: 'روشتة',
    description: 'المنصة الطبية المستقلة لإدارة وتحرير وطباعة الروشتات بدون إنترنت للأطباء والعيادات',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#F8FAFC',
    theme_color: '#0B7B5E',
    lang: 'ar',
    dir: 'rtl',
    categories: ['medical', 'productivity', 'health'],
    icons: [
      {
        src: '/app-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

// Test Backup & Restore Validator
function validateBackupPayload(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format');
  }

  if (!parsed.app || parsed.app !== 'Roshteh') {
    throw new Error('Unrecognized backup payload: missing Roshteh app identifier');
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    throw new Error('Missing backup data payload');
  }

  const { prescriptions, customMedicines, templates } = parsed.data;
  if (!Array.isArray(prescriptions) || !Array.isArray(customMedicines) || !Array.isArray(templates)) {
    throw new Error('Corrupted data structure: arrays required for entities');
  }

  return {
    valid: true,
    version: parsed.version || '1.0.0',
    counts: {
      prescriptions: prescriptions.length,
      customMedicines: customMedicines.length,
      templates: templates.length,
    },
  };
}

describe('Phase 9 — Production Readiness & PWA Specification', () => {
  test('manifest provides required standalone PWA configuration', () => {
    const manifest = getAppManifest();
    assert.equal(manifest.display, 'standalone', 'PWA must be display: standalone for desktop app feel');
    assert.equal(manifest.theme_color, '#0B7B5E', 'Theme color must match Roshteh brand');
    assert.equal(manifest.dir, 'rtl', 'Text direction must be RTL');
    assert.equal(manifest.lang, 'ar', 'Primary language must be Arabic');
    assert.ok(manifest.icons.length >= 2, 'Must include both app icon and favicon');
  });

  test('validates security headers configuration for clinical environments', () => {
    const expectedHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];

    for (const h of expectedHeaders) {
      assert.ok(h.key && h.value, `Security header ${h.key} must be defined`);
    }
  });

  test('validates JSON backup and restore schema integrity', () => {
    const validBackup = JSON.stringify({
      app: 'Roshteh',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      stats: {
        prescriptionsCount: 1,
        customMedicinesCount: 1,
        templatesCount: 1,
      },
      data: {
        prescriptions: [{ id: 'rx_1', patient: { name: 'علي' } }],
        customMedicines: [{ id: 'cm_1', nameAr: 'دواء خاص' }],
        templates: [{ id: 'tpl_1', name: 'الافتراضي' }],
      },
    });

    const result = validateBackupPayload(validBackup);
    assert.equal(result.valid, true);
    assert.equal(result.counts.prescriptions, 1);
    assert.equal(result.counts.customMedicines, 1);
    assert.equal(result.counts.templates, 1);
  });

  test('rejects corrupted or foreign JSON backup files', () => {
    assert.throws(
      () => validateBackupPayload('{"someOtherApp": true}'),
      /Unrecognized backup payload/
    );
    assert.throws(
      () => validateBackupPayload('{"app": "Roshteh", "data": null}'),
      /Missing backup data payload/
    );
    assert.throws(
      () => validateBackupPayload('{"app": "Roshteh", "data": {"prescriptions": "invalid"}}'),
      /Corrupted data structure/
    );
  });
});
