export interface DrawingSnapshot {
  id: string;
  date: string;
  drawing: string;
  label?: string;
  notes?: string;
}

export interface EntEarSide {
  swelling?: string;
  tenderness?: string;
  discharge?: string;
  rinne?: '+ve' | '-ve' | string;
  fistula?: string;
  deformity?: string;
  battleSign?: string;
  facialPalsy?: string;
  others?: string;
}

export interface EntEarExam {
  rt: EntEarSide;
  lt: EntEarSide;
  weber?: 'Centralized' | 'Lateralized Rt' | 'Lateralized Lt' | string;
  drawing?: string; // Base64 transparent drawing layer by the doctor
  drawingHistory?: DrawingSnapshot[]; // أرشيف تاريخ الرسومات السابقة للمريض
  vestibular: {
    rombergTest?: string;
    dexahallpike?: string;
    highSteppage?: string;
    headShaking?: string;
    headThrust?: string;
    caloricTest?: string;
    others?: string;
  };
}

export interface EntNoseSide {
  septum?: string;
  infTurbinate?: string;
  bleeders?: string;
  discharge?: string;
  polypsGrade?: 'Grade I' | 'Grade II' | 'Grade III' | 'Grade IV' | string;
  mass?: string;
  eye?: string;
  nasopharynx?: string;
  edema?: string;
}

export interface EntNoseExam {
  rt: EntNoseSide;
  lt: EntNoseSide;
  deformity?: string;
  drawing?: string; // Base64 transparent drawing layer by the doctor
  drawingHistory?: DrawingSnapshot[];
}

export interface EntOropharynxExam {
  mallampati?: 'Class I' | 'Class II' | 'Class III' | 'Class IV' | string;
  drawing?: string; // Base64 drawing layer
  drawingHistory?: DrawingSnapshot[];
  tonsils?: string;
  adenoid?: string;
  softPalate?: string;
  uvula?: string;
  tongue?: string;
  sublingualArea?: string;
  buccalMucosa?: string;
  signsOfReflux?: string;
}

export interface EntLarynxExam {
  lymphNode?: string;
  swelling?: string;
  mouresSign?: string;
  thyroid?: string;
  parotid?: string;
  submandibular?: string;
  indirectLaryngoscope?: string;
  others?: string;
  drawing?: string; // Base64 transparent drawing layer by the doctor
  drawingHistory?: DrawingSnapshot[];
}

export interface InvestigationItem {
  id: string;
  name: string;
  revealed?: string;
}

export interface EntInvestigations {
  present?: string;
  presentRevealed?: string;
  need?: string;
  needRevealed?: string;
  presentList?: InvestigationItem[];
  needList?: InvestigationItem[];
}

export interface AdditionalVisit {
  id: string;
  visitNumber: number;
  label?: string;
  date?: string;
  notes?: string;
}

export interface PrescriptionMedicine {
  id: string;
  drugName: string;
  form?: string;
  concentration?: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface EntExaminationData {
  // 1. Demographics & Header
  fileNo?: string;
  date?: string;
  residence?: string;
  maritalStatus?: string;
  work?: string;
  habits?: string;
  smokingIndex?: string;

  // 2. Complaint & Illness History
  complaint?: string;
  historyOfPresentIllness?: string;

  // 3. Past & Family History
  medicalProblems?: string;
  drugs?: string;
  previousOperationsNotRelated?: string;
  previousOperationsRelated?: string;
  familyHistory?: string;

  // 4. Ear Examination & Vestibular
  ear: EntEarExam;

  // 5. Nose Examination
  nose: EntNoseExam;

  // 6. Oropharynx Examination
  oropharynx: EntOropharynxExam;

  // 7. Larynx, Head & Neck Examination
  larynx: EntLarynxExam;

  // 8. Investigations
  investigations: EntInvestigations;

  // 9. Treatment & Prescription
  prescriptionItems: PrescriptionMedicine[];
  treatmentNotes?: string;

  // 10. Diagnosis & Surgical Plan & Follow up
  diagnosis?: string;
  followUpDate?: string;
  operationNeeded?: string;
  operativeData?: string;
  secondVisitNotes?: string;
  thirdVisitNotes?: string;
  additionalVisits?: AdditionalVisit[];
}

