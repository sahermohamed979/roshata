import { z } from 'zod';
import { quickPatientSchema } from '../schema/patient.schema';

export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED';

export interface PatientPayload {
  fullName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  maritalStatus?: MaritalStatus;
  fileNumber?: string;
  age: number;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  chronicConditions: string[];
}

export interface Patient {
  id: string;
  fileNumber?: string;
  fullName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  maritalStatus?: MaritalStatus;
  age: number;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  chronicConditions?: string[];
  visitCount?: number;
  lastVisitDate?: string | null;
  createdAt?: string;
  isArchived?: boolean;
}

export type PatientFilterType = 'all' | 'chronic' | 'male' | 'female' | 'month';

export interface PatientVisitItem {
  id: string;
  visitId?: string | null;
  hasExamination?: boolean;
  diagnosis?: string | null;
  clinicDate: string;
  type: string;
  status: string;
  startTime?: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
  doctorName?: string | null;
  createdAt?: string | null;
}

export interface PatientNoteItem {
  id: string;
  content: string;
  date: string;
  authorRole: string;
  authorName: string;
}

export interface PatientAttachmentItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface PatientFinancialSummary {
  totalCharged: number;
  totalPaid: number;
  outstandingBalance: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
  recentPayments?: any[];
}

export interface PatientDetails {
  patient: {
    id: string;
    fileNumber?: string;
    fullName: string;
    phone: string;
    gender: 'MALE' | 'FEMALE';
    maritalStatus?: MaritalStatus;
    age: number;
    dateOfBirth?: string | null;
    address?: string | null;
    occupation?: string | null;
    chronicConditions?: string[];
    createdAt?: string | null;
  };
  lastVisit?: {
    date?: string | null;
    appointmentType?: string | null;
    doctorName?: string | null;
    diagnosis?: string | null;
    notes?: string | null;
    status?: string | null;
  } | null;
  financialSummary: PatientFinancialSummary;
  previousAppointments: PatientVisitItem[];
  prescriptions?: Array<{
    id: string;
    visitId?: string;
    patientId: string;
    doctorId: string;
    doctorName?: string | null;
    notes?: string;
    items: Array<{
      id?: string;
      drugName: string;
      dose: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    createdAt?: string | null;
  }>;
  attachments?: PatientAttachmentItem[];
  notes?: PatientNoteItem[];
  visitCount: number;
}

export interface PatientsListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PatientsListResponse {
  status: boolean;
  code: number;
  message?: string;
  payload: Patient[];
  meta?: PatientsListMeta;
}

export type QuickPatientFormValues = z.infer<ReturnType<typeof quickPatientSchema>>;
