export type PaperSize = 'A4' | 'A5' | 'CUSTOM';

export type HeaderLayout = 'split' | 'centered' | 'modern' | 'minimalist';
export type FooterLayout = 'standard' | 'compact' | 'boxed';

export type TemplateElementType =
  | 'header'
  | 'patient_box'
  | 'rx_watermark'
  | 'medications'
  | 'instructions'
  | 'doctor_signature'
  | 'clinic_stamp'
  | 'footer'
  | 'custom_text'
  | 'custom_image'
  | 'divider';

export interface TemplateBlockElement {
  id: string;
  type: TemplateElementType;
  title: string;
  visible: boolean;
  order: number;
  alignment: 'right' | 'center' | 'left' | 'justify';
  customText?: string;
  customImageUrl?: string;
  fontSize?: number; // in pt
  color?: string;
  borderTop?: boolean;
  borderBottom?: boolean;
}

export interface PrescriptionTemplate {
  id: string;
  doctorId: string;
  name: string;
  isDefault: boolean;
  paperSize: PaperSize;
  customWidthMm?: number;
  customHeightMm?: number;

  // Doctor & Clinic Header Information
  doctorNameAr: string;
  doctorNameEn: string;
  medicalTitleAr: string;
  medicalTitleEn: string;
  specialtyAr: string;
  specialtyEn: string;
  qualificationsAr?: string;
  qualificationsEn?: string;
  syndicateNumber?: string;

  clinicNameAr: string;
  clinicNameEn: string;
  clinicAddress: string;
  clinicPhones: string[];
  clinicEmail?: string;
  emergencyPhone?: string;
  returnNotice?: string;

  // Visual Assets & Accents
  logoUrl?: string;
  signatureUrl?: string;
  stampUrl?: string;
  showLogo: boolean;
  showSignature: boolean;
  showStamp: boolean;
  showWatermark: boolean;
  watermarkOpacity: number;
  showReturnPolicy: boolean;
  showPatientBox: boolean;
  showDiagnosis: boolean;

  primaryColor: string;
  secondaryColor?: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';

  // Layout styling
  headerLayout: HeaderLayout;
  footerLayout: FooterLayout;

  // Layout & Spacing (Margins in mm)
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;

  // Front & Back Page Flags
  hasBackPage: boolean;
  backPageNotes?: string;

  // Stage B: Advanced Customizable Canvas Elements
  elements: TemplateBlockElement[];

  createdAt: string;
  updatedAt: string;
}

/**
 * Generates initial default layout block elements for a template
 */
export function createDefaultTemplateElements(): TemplateBlockElement[] {
  return [
    {
      id: 'elem_header',
      type: 'header',
      title: 'ترويسة الطبيب والعيادة',
      visible: true,
      order: 1,
      alignment: 'right',
    },
    {
      id: 'elem_patient_box',
      type: 'patient_box',
      title: 'شريط بيانات المريض',
      visible: true,
      order: 2,
      alignment: 'right',
    },
    {
      id: 'elem_rx_watermark',
      type: 'rx_watermark',
      title: 'شعار وعلامة Rx المائية',
      visible: true,
      order: 3,
      alignment: 'center',
    },
    {
      id: 'elem_medications',
      type: 'medications',
      title: 'منطقة قائمة الأدوية والجرعات',
      visible: true,
      order: 4,
      alignment: 'right',
    },
    {
      id: 'elem_instructions',
      type: 'instructions',
      title: 'ملاحظات وإرشادات الاستشارة',
      visible: true,
      order: 5,
      alignment: 'right',
    },
    {
      id: 'elem_signature',
      type: 'doctor_signature',
      title: 'توقيع الطبيب وختم العيادة',
      visible: true,
      order: 6,
      alignment: 'left',
    },
    {
      id: 'elem_footer',
      type: 'footer',
      title: 'تذييل الصفحة وبيانات الاتصال',
      visible: true,
      order: 7,
      alignment: 'center',
    },
  ];
}
