# Egyptian Medicine Data Sources & Licensing Specification

**Project:** Roshteh (روشتة)  
**Document Version:** 1.0.0  
**Phase:** Phase 2 — Medicine Database  
**Jurisdiction:** Arab Republic of Egypt (EDA / Ministry of Health & Population)

---

## 1. Overview of Egyptian Pharmaceutical Data Sources

In Egypt, all pharmaceutical products, registered trade names, active pharmaceutical ingredients (APIs), packaging formats, pricing, and statuses (Active / Under-registration / Discontinued) are regulated by the **Egyptian Drug Authority (EDA - هيئة الدواء المصرية)**.

### Primary Regulatory & Authoritative Sources:
1. **Egyptian Drug Authority (EDA) Official Database:**
   - URL: `https://www.edaegypt.gov.eg/`
   - Data points: Trade name (Arabic & English), registration number, active ingredients, strengths, dosage form, legal category (OTC / Prescription), shelf-life, manufacturer, registration status.
2. **Egyptian National Formulary (ENF):**
   - Published periodically by the Ministry of Health & Population.
   - Authoritative prescribing guidelines, standard clinical dosages, contraindications, and therapeutic classifications.
3. **Open Access & Clinical Aggregators:**
   - **Dawaey / Egyptian Drug Index (EDI):** Community and open pharmaceutical repositories tracking commercial Egyptian brands, market pack sizes, and standard EAN-13 barcodes.
   - **WHO Essential Medicines List (EML) Egyptian Alignment:** Standard international nonproprietary names (INN) mapped to local Egyptian commercial brands.

---

## 2. Licensing, Fair Use & Legal Compliance

1. **Public Domain & Fair Use Classification:**
   - Scientific, generic drug information, international active ingredients (INN), approved pharmaceutical forms, standard clinical indications, and maximum retail prices regulated by Egyptian law are **factual public regulatory data** and are not subject to restrictive copyright.
   - Standard clinical prescription reference systems fall under healthcare fair use for registered medical practitioners.
2. **Trademarks & Commercial Brand Names:**
   - Commercial brand names (e.g., *Augmentin®*, *Curam®*, *Congestal®*, *Panadol®*) remain the proprietary trademarks of their respective pharmaceutical companies (e.g., GSK, Sandoz, Sigma, Amoun).
   - Roshteh references these trade names solely for medical identification by licensed physicians when generating clinical prescriptions.
3. **Data Integrity & Immutability:**
   - Per Roshteh Product Requirements (FR-01, FR-02), historical prescriptions must store **immutable snapshots** of the medicine name, form, and strength at the time of issuance so that any subsequent formulary price or formulation updates will never alter historical patient records.

---

## 3. Data Schema & Identification Standard

Each medicine in Roshteh's local database conforms to the following standard:

```typescript
interface Medicine {
  id: string;                     // Deterministic or UUID slug (e.g. "med-aug-1g")
  nameAr: string;                 // Arabic Trade Name (e.g. "أوجمنتين 1 جم أقراص")
  nameEn: string;                 // English Trade Name (e.g. "Augmentin 1g Tablets")
  brandName?: string;             // Root Commercial Brand (e.g. "Augmentin")
  activeIngredient?: string;      // INN Chemical Formula (e.g. "Amoxicillin + Clavulanic Acid")
  strength?: string;              // Concentration (e.g. "1g", "500mg/5ml", "0.05%")
  dosageForm?: string;            // Standard Form (e.g. "أقراص", "شراب", "بخاخ أنف")
  category?: string;              // Therapeutic Class (e.g. "Antibiotic", "Analgesic")
  barcode?: string;               // EAN-13 Barcode (e.g. "6221000123456")
  price?: number;                 // Fixed Official Price in EGP (e.g. 99.50)
  manufacturer?: string;          // Pharma Company (e.g. "GSK", "Amoun", "EVA Pharma")
  routeOfAdministration?: string; // Oral, Topical, Inhalation, IV/IM, Nasal, Otic
  status: 'active' | 'inactive' | 'discontinued';
  version: number;
}
```

---

## 4. Normalization & Search Optimization

To guarantee sub-10ms search queries offline inside IndexedDB:
1. **Diacritics & Variant Normalization (`arabic-normalizer.ts`):**
   - Tashkeel (Tashkīl: Fatha, Damma, Kasra, Sukun, Tanween, Shadda) is stripped.
   - Tatweel (Kashida `ـ`) is removed.
   - Alef variants (`أ`, `إ`, `آ`, `ٱ`) are normalized to bare Alef (`ا`).
   - Taa Marbuta (`ة`) is normalized to Ha (`ه`).
   - Alif Maqsura (`ى`) is normalized to Yaa (`ي`).
   - Eastern Arabic digits (`٠-٩`) are converted to standard ASCII digits (`0-9`).
2. **Multi-Field Tokenization:**
   - Words from Arabic name, English name, brand, active ingredients, and barcodes are extracted and pre-indexed as search tokens in Dexie (`*searchTokens`).
3. **Hardware Barcode Scanner Support:**
   - Direct barcode matching enables doctors using physical USB/Bluetooth handheld barcode scanners to scan a medicine box directly into the prescription in under 5 milliseconds.

---

## 5. Synchronization Strategy

- **Local-First Pre-seeding:** The application arrives pre-seeded with the essential Egyptian medicines catalog.
- **Doctor Custom Medicines:** Stored in a separate table (`customMedicines`) and strictly preserved across any global database syncs or seed re-initializations.
- **Central API Pipeline:** Future synchronization checks (Phase 7) compare version manifests (`GET /api/v1/medicines/manifest`) and apply delta changes transactionally.
