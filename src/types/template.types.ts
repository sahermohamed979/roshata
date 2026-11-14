export interface PrescriptionTemplate {
  id: string;
  doctorId: string;
  name: string;
  isDefault: boolean;
  paperSize: 'A4' | 'A5' | 'CUSTOM';
  customWidthMm?: number;
  customHeightMm?: number;

  // Doctor & Clinic Header Information
  doctorNameAr: string;
  doctorNameEn: string;
  medicalTitleAr: string;
  medicalTitleEn: string;
  specialtyAr: string;
  specialtyEn: string;
  clinicNameAr: string;
  clinicNameEn: string;
  clinicAddress: string;
  clinicPhones: string[];
  clinicEmail?: string;
  returnNotice?: string;

  // Visual Assets & Accents
  logoUrl?: string;
  signatureUrl?: string;
  stampUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';

  // Layout & Spacing (Margins in mm)
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;

  // Front & Back Page Flags
  hasBackPage: boolean;
  backPageNotes?: string;

  createdAt: string;
  updatedAt: string;
}
