import { NextRequest, NextResponse } from 'next/server';
import { CentralMedicineService } from '@/lib/server/services/central-medicine.service';
import type { SuggestionStatus } from '@/types/central-backend.types';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') as SuggestionStatus | undefined;
    const list = await CentralMedicineService.listSuggestions(status);
    return NextResponse.json({ suggestions: list }, { status: 200 });
  } catch (error) {
    console.error('Failed to list suggestions:', error);
    return NextResponse.json({ error: 'Failed to retrieve suggestions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.tradeNameAr || !body.tradeNameEn) {
      return NextResponse.json(
        { error: 'Trade names in Arabic and English are required' },
        { status: 400 }
      );
    }

    const created = await CentralMedicineService.submitDoctorSuggestion({
      doctorId: body.doctorId || 'doc_external',
      doctorName: body.doctorName,
      clinicName: body.clinicName,
      tradeNameAr: body.tradeNameAr,
      tradeNameEn: body.tradeNameEn,
      activeIngredient: body.activeIngredient,
      dosageForm: body.dosageForm,
      strength: body.strength,
      barcode: body.barcode,
      clinicalNotes: body.clinicalNotes,
    });

    return NextResponse.json({ suggestion: created }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit suggestion:', error);
    return NextResponse.json({ error: 'Failed to submit suggestion' }, { status: 500 });
  }
}
