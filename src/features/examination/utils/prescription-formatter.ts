/**
 * مساعدات صياغة وترجمة جرعات وتكرار ومدد الروشتة الطبية
 * مصممة لتلبية متطلبات د. إسلام بدقة متناهية
 */

/**
 * ترجمة وصياغة الجرعة بناءً على الرقم وشكل الدواء (Form)
 * تراعي نوع الدواء تلقائياً: الحقن تُصاغ كـ "حقنة / حقنتين / 3 حقن"،
 * والأقراص "قرص / قرصين / 3 أقراص"، والنقط "نقطة / نقطتين / 3 نقط"، إلخ.
 */
export function formatDose(rawDose?: string, form?: string): string {
  if (!rawDose) return '';
  const trimmed = rawDose.trim();
  const normalizedForm = (form || '').toLowerCase();

  // 1. تحويل الأرقام المشرقية للعربية القياسية
  const cleanStr = trimmed.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

  // 2. هل النص يحتوي على رقم أو تعبير كمي معروف يمكن تحويله؟
  let num: number | null = null;
  let isHalf = false;
  let isOneAndHalf = false;

  if (/^(0\.5|1\/2|½)$/.test(cleanStr) || /^نصف\s*(قرص|كبسولة|ملعقة|كيس|أمبول|حقنة)?$/i.test(cleanStr)) {
    isHalf = true;
  } else if (/^(1\.5|1\s*1\/2|1½)$/.test(cleanStr) || /^قرص\s*ونصف$/i.test(cleanStr)) {
    isOneAndHalf = true;
  } else if (
    /^(1|حقنة واحدة|قرص واحد|كبسولة واحدة|بخة واحدة|نقطة واحدة|كيس واحد|لبوسة واحدة|أمبول واحد)$/i.test(
      cleanStr
    )
  ) {
    num = 1;
  } else if (
    /^(2|حقنتين|قرصين|كبسولتين|بختين|نقطتين|كيسين|لبوستين|أمبولين)$/i.test(cleanStr)
  ) {
    num = 2;
  } else {
    // محاولة استخراج رقم مجرد أو رقم متبوع بوحدة سابقة
    const match = cleanStr.match(
      /^([0-9.]+)\s*(قرص|أقراص|حقن|حقنة|نقط|نقطة|كبسول|كبسولة|كبسولات|بخة|بخات|كيس|أكياس|لبوس|لبوسة|أمبول|أمبولات|سم|ملعقة|ملاعق)?$/
    );
    if (match) {
      num = parseFloat(match[1]);
    }
  }

  // إذا لم نجد كمية رقمية وكان النص يحتوي على صياغة عربية أخرى خاصة ومعقدة، نتركه كما هو
  if (num === null && !isHalf && !isOneAndHalf) {
    if (/[\u0600-\u06FF]/.test(cleanStr)) {
      return trimmed;
    }
  }

  // أ. الحقن والأمبولات والفيال (Injection / Ampoule / Vial / حقن / أمبول)
  if (
    normalizedForm.includes('injection') ||
    normalizedForm.includes('ampoule') ||
    normalizedForm.includes('vial') ||
    normalizedForm.includes('حقن') ||
    normalizedForm.includes('أمبول') ||
    normalizedForm.includes('فيال')
  ) {
    if (isHalf) return 'نصف أمبول';
    if (num === 1) return 'حقنة واحدة';
    if (num === 2) return 'حقنتين';
    if (num !== null && num >= 3 && num <= 10) return `${num} حقن`;
    if (num !== null && num > 10) return `${num} حقنة`;
    if (num !== null) return `${num} حقن`;
  }

  // ب. بخاخات الأنف والفم والأذن والاستنشاق (Sprays / Inhalers)
  if (
    normalizedForm.includes('spray') ||
    normalizedForm.includes('inhaler') ||
    normalizedForm.includes('بخاخ') ||
    normalizedForm.includes('استنشاق')
  ) {
    const isNasal = normalizedForm.includes('nasal') || normalizedForm.includes('أنف');
    if (num === 1) return isNasal ? 'بخة بكل فتحة أنف' : 'بخة واحدة';
    if (num === 2) return isNasal ? 'بختين بكل فتحة أنف' : 'بختين';
    if (num !== null && num >= 3 && num <= 10) return `${num} بخات`;
    if (num !== null && num > 10) return `${num} بخة`;
    if (num !== null) return `${num} بخات`;
  }

  // ج. نقط الأذن والعين والأنف والفم (Drops)
  if (
    normalizedForm.includes('drops') ||
    normalizedForm.includes('drop') ||
    normalizedForm.includes('نقط')
  ) {
    if (num === 1) return 'نقطة واحدة';
    if (num === 2) return 'نقطتين';
    if (num !== null && num >= 3 && num <= 10) return `${num} نقط`;
    if (num !== null && num > 10) return `${num} نقطة`;
    if (num !== null) return `${num} نقط`;
  }

  // د. الشراب والمعلق والمحاليل (Syrup / Suspension / Solution)
  if (
    normalizedForm.includes('syrup') ||
    normalizedForm.includes('suspension') ||
    normalizedForm.includes('solution') ||
    normalizedForm.includes('شراب') ||
    normalizedForm.includes('معلق') ||
    normalizedForm.includes('محلول')
  ) {
    if (num === 1) return '1 ملعقة كبيرة (10 سم)';
    if (num === 2) return '2 ملعقة كبيرة';
    if (num === 2.5) return '2.5 سم';
    if (num === 5) return '5 سم (ملعقة صغيرة)';
    if (num === 10) return '10 سم (ملعقة كبيرة)';
    if (num === 15) return '15 سم';
    if (num !== null && num <= 4) return `${num} ملاعق كبيرة`;
    if (num !== null) return `${num} سم`;
  }

  // هـ. الأكياس والفوار والبودرة (Sachet / Powder / Granules)
  if (
    normalizedForm.includes('sachet') ||
    normalizedForm.includes('powder') ||
    normalizedForm.includes('granules') ||
    normalizedForm.includes('أكياس') ||
    normalizedForm.includes('فوار') ||
    normalizedForm.includes('مسحوق')
  ) {
    if (isHalf) return 'نصف كيس في ربع كوب ماء';
    if (num === 1) return 'كيس واحد في نصف كوب ماء';
    if (num === 2) return 'كيسين';
    if (num !== null && num >= 3 && num <= 10) return `${num} أكياس`;
    if (num !== null && num > 10) return `${num} كيس`;
    if (num !== null) return `${num} أكياس`;
  }

  // و. كبسولات (Capsule / كبسول)
  if (normalizedForm.includes('capsule') || normalizedForm.includes('كبسول')) {
    if (num === 1) return '1 كبسولة';
    if (num === 2) return 'كبسولتين';
    if (num !== null && num >= 3 && num <= 10) return `${num} كبسولات`;
    if (num !== null && num > 10) return `${num} كبسولة`;
    if (num !== null) return `${num} كبسولات`;
  }

  // ز. اللبوس (Suppository / لبوس)
  if (normalizedForm.includes('suppository') || normalizedForm.includes('لبوس')) {
    if (num === 1) return 'لبوسة واحدة';
    if (num === 2) return '2 لبوسة';
    if (num !== null && num >= 3 && num <= 10) return `${num} لبوسات`;
    if (num !== null && num > 10) return `${num} لبوسة`;
    if (num !== null) return `${num} لبوسات`;
  }

  // ح. استحلاب (Lozenges / استحلاب)
  if (normalizedForm.includes('lozenge') || normalizedForm.includes('استحلاب')) {
    if (num === 1) return 'قرص استحلاب واحد';
    if (num === 2) return '2 قرص استحلاب';
    if (num !== null && num >= 3 && num <= 10) return `${num} أقراص استحلاب`;
    if (num !== null) return `${num} أقراص استحلاب`;
  }

  // ط. الأقراص الافتراضية (Tablet / ODT / أقراص / الافتراضي)
  if (isHalf) return 'نصف قرص';
  if (isOneAndHalf) return 'قرص ونصف';
  if (num === 1) return 'قرص واحد';
  if (num === 2) return 'قرصين';
  if (num !== null && num >= 3 && num <= 10) return `${num} أقراص`;
  if (num !== null && num > 10) return `${num} قرص`;
  if (num !== null) return `${num} أقراص`;

  return trimmed;
}

/**
 * الحصول على اقتراحات الجرعات المناسبة حسب شكل الدواء (Form)
 */
export function getDoseSuggestionsForForm(form?: string): string[] {
  const norm = (form || '').toLowerCase();
  if (
    norm.includes('injection') ||
    norm.includes('ampoule') ||
    norm.includes('vial') ||
    norm.includes('حقن') ||
    norm.includes('أمبول')
  ) {
    return ['حقنة واحدة', 'حقنتين', '3 حقن', 'أمبول واحد', 'أمبولين', '1 حقنة عضل', '1 حقنة وريد'];
  }
  if (norm.includes('spray') || norm.includes('بخاخ') || norm.includes('inhaler')) {
    if (norm.includes('nasal') || norm.includes('أنف')) {
      return ['بخة بكل فتحة أنف', 'بختين بكل فتحة أنف', 'بخة واحدة', 'بختين', '3 بخات'];
    }
    return ['بخة واحدة', 'بختين', '3 بخات', '4 بخات'];
  }
  if (norm.includes('drops') || norm.includes('نقط')) {
    return ['نقطة واحدة', 'نقطتين', '3 نقط', '4 نقط', '5 نقط'];
  }
  if (
    norm.includes('syrup') ||
    norm.includes('suspension') ||
    norm.includes('شراب') ||
    norm.includes('معلق')
  ) {
    return ['2.5 سم', '5 سم (ملعقة صغيرة)', '10 سم (ملعقة كبيرة)', '15 سم', '1 ملعقة كبيرة', '2 ملعقة كبيرة'];
  }
  if (norm.includes('capsule') || norm.includes('كبسول')) {
    return ['1 كبسولة', 'كبسولتين', '3 كبسولات'];
  }
  if (norm.includes('sachet') || norm.includes('أكياس') || norm.includes('فوار')) {
    return ['كيس واحد في نصف كوب ماء', 'كيسين', '3 أكياس'];
  }
  if (norm.includes('suppository') || norm.includes('لبوس')) {
    return ['لبوسة واحدة', '2 لبوسة', '3 لبوسات'];
  }
  if (norm.includes('lozenge') || norm.includes('استحلاب')) {
    return ['قرص استحلاب واحد', '2 قرص استحلاب', '3 أقراص استحلاب'];
  }
  return ['نصف قرص', 'قرص واحد', 'قرصين', '3 أقراص', 'قرص ونصف', '4 أقراص'];
}

/**
 * الحصول على الجرعة الافتراضية المناسبة لشكل الدواء عند اختياره
 */
export function getDefaultDoseForForm(form?: string): string {
  const norm = (form || '').toLowerCase();
  if (
    norm.includes('injection') ||
    norm.includes('ampoule') ||
    norm.includes('vial') ||
    norm.includes('حقن') ||
    norm.includes('أمبول')
  ) {
    return 'حقنة واحدة';
  }
  if (norm.includes('spray') || norm.includes('بخاخ') || norm.includes('inhaler')) {
    if (norm.includes('nasal') || norm.includes('أنف')) return 'بخة بكل فتحة أنف';
    return 'بخة واحدة';
  }
  if (norm.includes('drops') || norm.includes('نقط')) return '3 نقط';
  if (
    norm.includes('syrup') ||
    norm.includes('suspension') ||
    norm.includes('شراب') ||
    norm.includes('معلق')
  ) {
    return '5 سم (ملعقة صغيرة)';
  }
  if (norm.includes('capsule') || norm.includes('كبسول')) return '1 كبسولة';
  if (norm.includes('sachet') || norm.includes('أكياس') || norm.includes('فوار')) return 'كيس واحد في نصف كوب ماء';
  if (norm.includes('suppository') || norm.includes('لبوس')) return 'لبوسة واحدة';
  if (norm.includes('lozenge') || norm.includes('استحلاب')) return 'قرص استحلاب واحد';
  return 'قرص واحد';
}

/**
 * ترجمة وصياغة التكرار (Frequency) من أرقام أو رموز طبية إلى صياغة عربية واضحة
 */
export function formatFrequency(rawFreq?: string): string {
  if (!rawFreq) return '';
  const trimmed = rawFreq.trim().toLowerCase();

  // إذا كان النص يحتوي بالفعل على كلمات عربية مكتملة نتركه
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    if (!/^[٠١٢٣٤٥٦٧٨٩0-9\s]+$/.test(trimmed)) {
      return rawFreq.trim();
    }
  }

  const englishNum = trimmed.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

  // التكرار بالأرقام والساعات والرموز
  if (englishNum === '1' || trimmed === 'once' || trimmed === 'od' || trimmed === 'qd') {
    return 'مرة واحدة في اليوم';
  }
  if (englishNum === '2' || trimmed === 'bid' || trimmed === 'q12h' || trimmed === '12') {
    return 'مرتين في اليوم';
  }
  if (englishNum === '3' || trimmed === 'tid' || trimmed === 'q8h' || trimmed === '8') {
    return '3 مرات في اليوم';
  }
  if (englishNum === '4' || trimmed === 'qid' || trimmed === 'q6h' || trimmed === '6') {
    return '4 مرات في اليوم';
  }
  if (englishNum === '120' || trimmed === 'q2h' || trimmed === '2h') {
    return 'كل ساعتين';
  }
  if (englishNum === '180' || trimmed === 'q3h' || trimmed === '3h') {
    return 'كل 3 ساعات';
  }
  if (englishNum === '6' || trimmed === 'q4h' || trimmed === '4' || englishNum === '240') {
    return 'كل 4 ساعات';
  }
  if (trimmed === 'q8h' || trimmed === '8h') {
    return 'كل 8 ساعات';
  }
  if (trimmed === 'q12h' || trimmed === '12h') {
    return 'كل 12 ساعة (مرتين يومياً)';
  }
  if (trimmed === 'prn' || trimmed === 'sos' || trimmed === 'needed' || trimmed === '!') {
    return 'عند اللزوم (عند الألم أو الأعراض)';
  }
  if (
    trimmed === 'sleep' ||
    trimmed === 'bedtime' ||
    trimmed === 'hs' ||
    trimmed === 'نوم' ||
    trimmed === '~' ||
    trimmed === 's' ||
    trimmed === 'b'
  ) {
    return 'مساءً قبل النوم';
  }
  if (
    trimmed === '*' ||
    trimmed === 'r' ||
    trimmed === 'f' ||
    trimmed === 'fasting' ||
    trimmed === 'ريق'
  ) {
    return 'صباحاً على الريق';
  }

  return rawFreq.trim();
}

/**
 * ترجمة وصياغة المدة (Duration) من أرقام إلى أيام وأسابيع واضحة
 */
export function formatDuration(rawDuration?: string): string {
  if (!rawDuration) return '';
  const trimmed = rawDuration.trim();

  // إذا كان مكتوباً بالعربي ويحتوي على أحرف نتركه
  if (/[\u0600-\u06FF]/.test(trimmed) && !/^[٠١٢٣٤٥٦٧٨٩0-9\s]+$/.test(trimmed)) {
    return trimmed;
  }

  const cleanNumStr = trimmed.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  const num = parseInt(cleanNumStr, 10);
  if (isNaN(num)) return trimmed;

  if (num === 1) return 'يوم واحد';
  if (num === 2) return 'يومين';
  if (num === 3) return 'لمدة 3 أيام';
  if (num === 4) return 'لمدة 4 أيام';
  if (num === 5) return 'لمدة 5 أيام';
  if (num === 6) return 'لمدة 6 أيام';
  if (num === 7) return 'لمدة أسبوع';
  if (num === 10) return 'لمدة 10 أيام';
  if (num === 14) return 'لمدة أسبوعين';
  if (num === 21) return 'لمدة 3 أسابيع';
  if (num === 30) return 'لمدة شهر';
  if (num <= 10) return `لمدة ${num} أيام`;
  return `لمدة ${num} يوماً`;
}

/**
 * ترجمة علاقة الجرعة بالطعام (Meal Timing)
 * - علامة (-) تعني قبل الأكل
 * ترجمة علاقة الجرعة بالطعام ومواعيدها (Meal Timing & Instructions)
 * - علامة (-) تعني قبل الأكل
 * - علامة (+) تعني بعد الأكل
 * - (*) أو (r) تعني على الريق أول ما تصحي من النوم (على معدة فارغة)
 * - (~) أو (s) تعني مساءً قبل النوم مباشرة
 * - (0) تعني مع الأكل / وسط الطعام
 * - (!) أو (sos) تعني عند اللزوم (عند الألم أو الأعراض)
 * - (-30) تعني قبل الأكل بنصف ساعة | (+30) تعني بعد الأكل بنصف ساعة
 * - (-15) تعني قبل الأكل بربع ساعة | (+15) تعني بعد الأكل بربع ساعة
 * - (-60) تعني قبل الأكل بساعة      | (+60) تعني بعد الأكل بساعة
 * - (-120) تعني قبل الأكل بساعتين   | (+120 أو 120) تعني بعد الأكل بساعتين
 * - (-180) تعني قبل الأكل بثلاث ساعات | (+180 أو 180) تعني بعد الأكل بثلاث ساعات
 * - (bw) تعني بين الوجبات
 * - (h2o) تعني مع كوب ماء كامل
 */
export function parseMealTiming(rawTiming?: string): string {
  if (!rawTiming) return '';
  const trimmed = rawTiming.trim().toLowerCase();

  // 1. على الريق أول ما تصحي من النوم
  if (
    trimmed === '*' ||
    trimmed === 'r' ||
    trimmed === 'f' ||
    trimmed === 'w' ||
    trimmed === 'wake' ||
    trimmed === 'fasting' ||
    trimmed === 'empty' ||
    trimmed === 'ريق' ||
    trimmed === 'على الريق' ||
    trimmed === 'عالريق' ||
    trimmed === 'ريقي' ||
    trimmed === 'استيقاظ' ||
    trimmed === 'الاستيقاظ'
  ) {
    return 'على الريق فور الاستيقاظ من النوم (على معدة فارغة)';
  }

  // 2. مساءً قبل النوم مباشرة
  if (
    trimmed === '~' ||
    trimmed === '^' ||
    trimmed === 's' ||
    trimmed === 'b' ||
    trimmed === 'bed' ||
    trimmed === 'sleep' ||
    trimmed === 'bedtime' ||
    trimmed === 'hs' ||
    trimmed === 'نوم' ||
    trimmed === 'قبل النوم' ||
    trimmed === 'بالليل'
  ) {
    return 'مساءً قبل النوم مباشرة';
  }

  // 3. عند اللزوم / عند الألم
  if (
    trimmed === '!' ||
    trimmed === 'sos' ||
    trimmed === 'prn' ||
    trimmed === 'needed' ||
    trimmed === 'pain' ||
    trimmed === 'الم' ||
    trimmed === 'ألم' ||
    trimmed === 'لزوم' ||
    trimmed === 'عند اللزوم'
  ) {
    return 'عند اللزوم (عند الشعور بالألم أو الأعراض)';
  }

  // 4. مع الأكل / وسط الطعام
  if (
    trimmed === '0' ||
    trimmed === 'مع' ||
    trimmed === 'وسط' ||
    trimmed === 'with' ||
    trimmed === 'during' ||
    trimmed === 'وسط الاكل' ||
    trimmed === 'وسط الأكل' ||
    trimmed === 'مع الاكل' ||
    trimmed === 'مع الأكل'
  ) {
    return 'وسط الأكل (مع الطعام)';
  }

  // 5. بين الوجبات
  if (trimmed === 'bw' || trimmed === 'between' || trimmed === 'بين' || trimmed === 'بين الوجبات') {
    return 'بين الوجبات (بعيداً عن مواعيد الطعام)';
  }

  // 6. مع كوب ماء كبير
  if (trimmed === 'h2o' || trimmed === 'ماء' || trimmed === 'water' || trimmed === 'كوب') {
    return 'مع كوب ماء كامل';
  }

  // 7. قبل الأكل عامة
  if (trimmed === '-' || trimmed === 'قبل' || trimmed === 'before') {
    return 'قبل الأكل';
  }

  // 8. بعد الأكل عامة
  if (trimmed === '+' || trimmed === 'بعد' || trimmed === 'after') {
    return 'بعد الأكل';
  }

  // 9. قبل الأكل مباشرة / بعد الأكل مباشرة
  if (trimmed === '-0' || trimmed === '--' || trimmed === 'قبل مباشرة') {
    return 'قبل الأكل مباشرة';
  }
  if (trimmed === '+0' || trimmed === '++' || trimmed === 'بعد مباشرة') {
    return 'بعد الأكل مباشرة';
  }

  // 10. أوقات قبل الأكل (-)
  if (trimmed === '-15' || trimmed === 'قبل 15' || trimmed === '-ربع') {
    return 'قبل الأكل بربع ساعة';
  }
  if (trimmed === '-30' || trimmed === 'قبل 30' || trimmed === '-نصف' || trimmed === '-0.5') {
    return 'قبل الأكل بنصف ساعة';
  }
  if (trimmed === '-45' || trimmed === 'قبل 45') {
    return 'قبل الأكل بـ 45 دقيقة';
  }
  if (trimmed === '-60' || trimmed === '-1h' || trimmed === '-1' || trimmed === 'قبل ساعة') {
    return 'قبل الأكل بساعة';
  }
  if (trimmed === '-120' || trimmed === '-2h' || trimmed === '-2' || trimmed === 'قبل ساعتين') {
    return 'قبل الأكل بساعتين';
  }
  if (trimmed === '-180' || trimmed === '-3h' || trimmed === '-3' || trimmed === 'قبل 3 ساعات') {
    return 'قبل الأكل بثلاث ساعات';
  }

  // 11. أوقات بعد الأكل (+)
  if (trimmed === '+15' || trimmed === 'بعد 15' || trimmed === '+ربع') {
    return 'بعد الأكل بربع ساعة';
  }
  if (trimmed === '+30' || trimmed === 'بعد 30' || trimmed === '+نصف' || trimmed === '+0.5') {
    return 'بعد الأكل بنصف ساعة';
  }
  if (trimmed === '+45' || trimmed === 'بعد 45') {
    return 'بعد الأكل بـ 45 دقيقة';
  }
  if (trimmed === '+60' || trimmed === '+1h' || trimmed === '+1' || trimmed === 'بعد ساعة') {
    return 'بعد الأكل بساعة';
  }
  if (trimmed === '+120' || trimmed === '120' || trimmed === '+2h' || trimmed === '+2' || trimmed === 'بعد ساعتين') {
    return 'بعد الأكل بساعتين';
  }
  if (trimmed === '+180' || trimmed === '180' || trimmed === '+3h' || trimmed === '+3' || trimmed === 'بعد 3 ساعات') {
    return 'بعد الأكل بثلاث ساعات';
  }

  // 12. وجبات محددة
  if (trimmed === '-b' || trimmed === 'قبل الفطار' || trimmed === 'قبل الافطار') {
    return 'قبل وجبة الإفطار';
  }
  if (trimmed === '+b' || trimmed === 'بعد الفطار' || trimmed === 'بعد الافطار') {
    return 'بعد وجبة الإفطار';
  }
  if (trimmed === '-l' || trimmed === 'قبل الغداء') {
    return 'قبل وجبة الغداء';
  }
  if (trimmed === '+l' || trimmed === 'بعد الغداء') {
    return 'بعد وجبة الغداء';
  }
  if (trimmed === '-d' || trimmed === 'قبل العشاء') {
    return 'قبل وجبة العشاء';
  }
  if (trimmed === '+d' || trimmed === 'بعد العشاء') {
    return 'بعد وجبة العشاء';
  }

  // إذا كانت باللغة العربية بالفعل
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return rawTiming.trim();
  }

  return rawTiming.trim();
}

export interface ParsedDoseShortcut {
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
  summary: string;
}

/**
 * تحليل وترجمة اختصارات الجرعات السريعة مثل 1/2/5 أو 1/3/5/-30 أو 1/3/5/+ أو 1/2/5/* أو 1/1/10/~
 * يدعم: الجرعة / التكرار / المدة / [توقيت الأكل والتعليمات]
 * مثال: 1/3/5/-30 => قرص واحد قبل الأكل بنصف ساعة • 3 مرات في اليوم • لمدة 5 أيام
 * مثال: 1/1/7/* => قرص واحد على الريق فور الاستيقاظ من النوم • مرة واحدة في اليوم • لمدة أسبوع
 * مثال: 1/1/10/~ => قرص واحد مساءً قبل النوم مباشرة • مرة واحدة في اليوم • لمدة 10 أيام
 * مثال: 1/2/5/120 => قرص واحد بعد الأكل بساعتين • مرتين في اليوم • لمدة 5 أيام
 */
export function parseDoseShortcut(rawShortcut?: string, form?: string): ParsedDoseShortcut | null {
  if (!rawShortcut) return null;

  // تحويل الأرقام المشرقية
  const clean = rawShortcut
    .trim()
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

  // تجزئة المدخل
  let rawD = '';
  let rawF = '';
  let rawDur = '';
  let rawTiming = '';

  if (clean.includes('/')) {
    const slashParts = clean.split('/').map((s) => s.trim()).filter(Boolean);
    if (slashParts.length >= 2) {
      rawD = slashParts[0];
      rawF = slashParts[1];
      if (slashParts.length === 3) {
        const p2 = slashParts[2];
        // هل الجزء الثالث رمز توقيت مباشر مثل * أو ~ أو ! أو -30 أو +120 أو 120 أو كلمة ريق؟
        const isDirectTiming =
          /^[-+*~^!_]/.test(p2) ||
          ['*', '~', '!', 'r', 's', 'b', '0', '120', '180', 'ريق', 'نوم'].includes(p2.toLowerCase());

        if (isDirectTiming) {
          rawDur = '';
          rawTiming = p2;
        } else {
          // هل هو مدة وتوقيت ملتصقان مثل 5-30 أو 5* أو 5~ أو 5+120؟
          const timingMatch = p2.match(/^(\d+)\s*([-+*~^!_a-zA-Z\u0600-\u06FF].*)$/);
          if (timingMatch) {
            rawDur = timingMatch[1];
            rawTiming = timingMatch[2];
          } else {
            rawDur = p2;
          }
        }
      } else if (slashParts.length >= 4) {
        rawDur = slashParts[2];
        rawTiming = slashParts.slice(3).join(' ');
      }
    }
  } else {
    // إذا لم تكن هناك شرطات مائلة / نبحث بالمسافات أو الفواصل
    const parts = clean.split(/[,–—\s]+/).filter(Boolean);
    if (parts.length >= 2) {
      rawD = parts[0];
      rawF = parts[1];
      if (parts.length === 3) {
        const p2 = parts[2];
        if (/^[-+*~^!_]/.test(p2) || ['*', '~', '!', 'r', 's', 'b', '0', '120', '180'].includes(p2.toLowerCase())) {
          rawDur = '';
          rawTiming = p2;
        } else {
          rawDur = p2;
        }
      } else if (parts.length >= 4) {
        rawDur = parts[2];
        rawTiming = parts.slice(3).join(' ');
      }
    }
  }

  if (!rawD || !rawF) return null;

  // 1. ترجمة الجرعة
  let dose = formatDose(rawD, form);
  if (!dose) {
    dose = rawD;
  }
  const normalizedForm = (form || '').toLowerCase();
  if (rawD === '1' && (normalizedForm.includes('tablet') || normalizedForm.includes('odt') || !form)) {
    dose = 'قرص واحد';
  } else if (rawD === '2' && (normalizedForm.includes('tablet') || normalizedForm.includes('odt') || !form)) {
    dose = 'قرصين';
  }

  // 2. ترجمة التكرار
  let frequency = '';
  const fNum = parseInt(rawF, 10);
  if (!isNaN(fNum)) {
    if (fNum === 1) frequency = 'مرة واحدة في اليوم';
    else if (fNum === 2) frequency = 'مرتين في اليوم';
    else if (fNum === 3) frequency = '3 مرات في اليوم';
    else if (fNum === 4) frequency = '4 مرات في اليوم';
    else if (fNum === 6) frequency = 'كل 4 ساعات';
    else if (fNum === 8) frequency = 'كل 8 ساعات';
    else if (fNum === 12) frequency = 'كل 12 ساعة (مرتين يومياً)';
    else if (fNum === 24) frequency = 'كل 24 ساعة';
    else frequency = `${fNum} مرات في اليوم`;
  } else {
    frequency = formatFrequency(rawF);
  }

  // 3. ترجمة المدة
  let duration = '';
  if (rawDur !== undefined && rawDur !== null && rawDur !== '') {
    const durNum = parseInt(rawDur, 10);
    if (!isNaN(durNum)) {
      if (durNum === 1) duration = 'يوم واحد';
      else if (durNum === 2) duration = 'يومين';
      else if (durNum === 3) duration = 'لمدة 3 أيام';
      else if (durNum === 5) duration = 'لمدة 5 أيام';
      else if (durNum === 7) duration = 'لمدة أسبوع';
      else if (durNum === 10) duration = 'لمدة 10 أيام';
      else if (durNum === 14) duration = 'لمدة أسبوعين';
      else if (durNum === 30) duration = 'لمدة شهر';
      else if (durNum <= 10) duration = `لمدة ${durNum} أيام`;
      else duration = `لمدة ${durNum} يوماً`;
    } else {
      duration = formatDuration(rawDur);
    }
  }

  // 4. ترجمة توقيت الأكل والتعليمات
  const instructions = parseMealTiming(rawTiming);

  // صياغة الملخص المتماسك
  let summary = '';
  if (instructions) {
    summary = `${dose} ${instructions} • ${frequency} • ${duration}`.replace(/\s*•\s*$/, '');
  } else {
    summary = [dose, frequency, duration].filter(Boolean).join(' • ');
  }

  return {
    dose,
    frequency,
    duration,
    instructions: instructions || undefined,
    summary,
  };
}
