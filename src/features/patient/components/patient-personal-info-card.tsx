'use client';

import React from 'react';
import { PatientDetails } from '../types/patient';

interface PatientPersonalInfoCardProps {
  details: PatientDetails;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function PatientPersonalInfoCard({ details }: PatientPersonalInfoCardProps) {
  const patient = details.patient;

  const maritalStatusLabel =
    patient.maritalStatus === 'SINGLE'
      ? 'أعزب'
      : patient.maritalStatus === 'WIDOWED'
      ? 'أرمل / أرملة'
      : patient.maritalStatus === 'DIVORCED'
      ? 'مطلق / مطلقة'
      : 'متزوج';

  const rows = [
    { label: 'رقم الملف', value: patient.fileNumber ? `#${patient.fileNumber}` : `#${patient.id?.slice(-4)}` },
    { label: 'الاسم الكامل', value: patient.fullName },
    { label: 'تاريخ الميلاد', value: formatDate(patient.dateOfBirth) },
    { label: 'النوع', value: patient.gender === 'MALE' ? 'ذكر' : 'أنثى' },
    { label: 'الحالة الاجتماعية', value: maritalStatusLabel },
    { label: 'الهاتف', value: patient.phone, isLtr: true },
    { label: 'الوظيفة', value: patient.occupation || '—' },
    { label: 'العنوان', value: patient.address || '—' },
    { label: 'تاريخ التسجيل', value: formatDate(patient.createdAt) },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs text-start select-none">
      <h3 className="text-base font-black text-[#074C3A] mb-4 pb-3 border-b border-slate-100">
        البيانات الشخصية
      </h3>

      <div className="space-y-3.5">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-bold">{row.label}</span>
            <span
              className={`font-black text-[#074C3A] ${
                row.isLtr ? 'dir-ltr font-mono' : ''
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

