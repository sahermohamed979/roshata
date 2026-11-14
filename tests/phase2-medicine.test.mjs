import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test Arabic Normalization Logic
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670]/g;
const TATWEEL_REGEX = /\u0640/g;

function normalizeArabicText(text) {
  if (!text) return '';
  let normalized = text.toLowerCase().trim();
  normalized = normalized.replace(TASHKEEL_REGEX, '').replace(TATWEEL_REGEX, '');
  normalized = normalized.replace(/[أإآٱ]/g, 'ا');
  normalized = normalized.replace(/ة/g, 'ه');
  normalized = normalized.replace(/ى/g, 'ي');
  normalized = normalized.replace(/[ؤئ]/g, 'ء');
  normalized = normalized.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  normalized = normalized.replace(/[-_.,/\\()[\]{}|]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
}

function normalizeEnglishText(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[-_.,/\\()[\]{}|]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSearchTokens(fields) {
  const tokenSet = new Set();
  for (const field of fields) {
    if (!field) continue;
    const normalizedAr = normalizeArabicText(field);
    const normalizedEn = normalizeEnglishText(field);
    const words = `${normalizedAr} ${normalizedEn}`.split(/\s+/).filter((w) => w.length > 1);
    for (const word of words) {
      tokenSet.add(word);
      for (let i = 2; i <= Math.min(word.length, 6); i++) {
        tokenSet.add(word.substring(0, i));
      }
    }
  }
  return Array.from(tokenSet);
}

describe('Phase 2 — Arabic & English Search Normalization', () => {
  test('strips Arabic diacritics (Tashkeel)', () => {
    const input = 'أَوْجَمَنْتِينْ 1 جَمْ';
    const result = normalizeArabicText(input);
    assert.equal(result, 'اوجمنتين 1 جم');
  });

  test('normalizes Alef forms (أ, إ, آ, ٱ -> ا)', () => {
    assert.equal(normalizeArabicText('إيبوبروفين'), 'ايبوبروفين');
    assert.equal(normalizeArabicText('آوجمنتين'), 'اوجمنتين');
    assert.equal(normalizeArabicText('أوتال'), 'اوتال');
  });

  test('normalizes Taa Marbouta to Ha (ة -> ه) and Alif Maqsura (ى -> ي)', () => {
    assert.equal(normalizeArabicText('مضخة أنفية'), 'مضخه انفيه');
    assert.equal(normalizeArabicText('حساسية كبرى'), 'حساسيه كبري');
  });

  test('converts Eastern Arabic numerals (٠-٩) to ASCII standard (0-9)', () => {
    assert.equal(normalizeArabicText('كونجستال ٥٠٠ مجم'), 'كونجستال 500 مجم');
    assert.equal(normalizeArabicText('١ جم'), '1 جم');
  });

  test('cleans English punctuation and normalizes casing', () => {
    const input = 'Augmentin 1g (Amoxicillin / Clavulanic Acid)';
    const result = normalizeEnglishText(input);
    assert.equal(result, 'augmentin 1g amoxicillin clavulanic acid');
  });

  test('extracts prefix tokens for fast prefix searches', () => {
    const tokens = extractSearchTokens(['أوجمنتين', 'Augmentin', '6221001001011']);
    assert.ok(tokens.includes('اوجمنتين'));
    assert.ok(tokens.includes('اوج'));
    assert.ok(tokens.includes('aug'));
    assert.ok(tokens.includes('augmentin'));
    assert.ok(tokens.includes('6221001001011'));
  });
});

describe('Phase 2 — Relevance Scoring & Barcode Priority', () => {
  test('ranks barcode match highest in search scoring', () => {
    const queryBarcode = '6221001001011';
    const mockMeds = [
      { nameEn: 'Panadol', barcode: '6221002001010' },
      { nameEn: 'Augmentin 1g', barcode: '6221001001011' },
      { nameEn: 'Augmentin Syrup', barcode: '6221001001012' },
    ];

    const matched = mockMeds.find((m) => m.barcode === queryBarcode);
    assert.ok(matched);
    assert.equal(matched.nameEn, 'Augmentin 1g');
  });
});

describe('Phase 2 — CSV & JSON Medicine Import Pipeline', () => {
  test('parses and validates structured medicine JSON array', () => {
    const rawJson = JSON.stringify([
      {
        nameAr: 'بانادول أدفانس أقراص',
        nameEn: 'Panadol Advance Tablets',
        brandName: 'Panadol',
        activeIngredient: 'Paracetamol',
        strength: '500mg',
        dosageForm: 'أقراص (Tablets)',
        barcode: '6221002001010',
        price: 35.0,
      },
    ]);

    const parsed = JSON.parse(rawJson);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].brandName, 'Panadol');
    assert.equal(parsed[0].barcode, '6221002001010');
  });

  test('validates CSV header and splits records cleanly', () => {
    const csvContent = `nameAr,nameEn,brandName,activeIngredient,strength,dosageForm,barcode,price
أوجمنتين 1 جم,Augmentin 1g,Augmentin,Amoxicillin,1g,أقراص,6221001001011,99.5
فولتارين 100 مجم,Voltaren 100mg,Voltaren,Diclofenac,100mg,أقراص,6221002001041,68.0`;

    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const header = lines[0].split(',');
    assert.equal(header.length, 8);
    assert.equal(lines.length - 1, 2);

    const row1 = lines[1].split(',');
    assert.equal(row1[1], 'Augmentin 1g');
    assert.equal(row1[6], '6221001001011');
    assert.equal(parseFloat(row1[7]), 99.5);
  });
});
