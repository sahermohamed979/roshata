/**
 * Roshteh Arabic Search & Normalization Engine
 * Handles diacritics removal, letter variant normalization, and search tokenization.
 */

// Tashkeel / Harakat regex: Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shadda, Sukun
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670]/g;

// Tatweel / Kashida
const TATWEEL_REGEX = /\u0640/g;

/**
 * Normalizes Arabic text for fast, fuzzy, and accurate database searches.
 */
export function normalizeArabicText(text: string | null | undefined): string {
  if (!text) return '';

  let normalized = text.toLowerCase().trim();

  // 1. Remove Tashkeel and Tatweel
  normalized = normalized.replace(TASHKEEL_REGEX, '').replace(TATWEEL_REGEX, '');

  // 2. Normalize Alef forms (أ, إ, آ, ٱ -> ا)
  normalized = normalized.replace(/[أإآٱ]/g, 'ا');

  // 3. Normalize Taa Marbuta (ة -> ه)
  normalized = normalized.replace(/ة/g, 'ه');

  // 4. Normalize Alif Maqsura (ى -> ي)
  normalized = normalized.replace(/ى/g, 'ي');

  // 5. Normalize Hamza on Waw and Yaa (ؤ, ئ -> ء / generic)
  normalized = normalized.replace(/[ؤئ]/g, 'ء');

  // 6. Convert Eastern Arabic numerals (٠-٩) to standard (0-9)
  normalized = normalized.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

  // 7. Clean excess spaces and symbols
  normalized = normalized.replace(/[-_.,/\\()[\]{}|]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Normalizes English text for search.
 */
export function normalizeEnglishText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[-_.,/\\()[\]{}|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts searchable unique prefix tokens for multi-term indexing.
 */
export function extractSearchTokens(fields: (string | undefined | null)[]): string[] {
  const tokenSet = new Set<string>();

  for (const field of fields) {
    if (!field) continue;

    const normalizedAr = normalizeArabicText(field);
    const normalizedEn = normalizeEnglishText(field);

    const words = `${normalizedAr} ${normalizedEn}`.split(/\s+/).filter((w) => w.length > 1);

    for (const word of words) {
      tokenSet.add(word);
      // Also index 3+ character prefixes for fast prefix queries
      for (let i = 2; i <= Math.min(word.length, 6); i++) {
        tokenSet.add(word.substring(0, i));
      }
    }
  }

  return Array.from(tokenSet);
}
