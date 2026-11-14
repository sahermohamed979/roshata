import { NextRequest, NextResponse } from 'next/server';
import { CentralMedicineService } from '@/lib/server/services/central-medicine.service';
import type { CentralMedicineInput } from '@/types/central-backend.types';

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search') || undefined;
    const category = request.nextUrl.searchParams.get('category') || undefined;
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const activeOnly = request.nextUrl.searchParams.get('activeOnly') !== 'false';

    const result = await CentralMedicineService.listMedicines({
      search,
      category,
      page,
      limit,
      activeOnly,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to list medicines:', error);
    return NextResponse.json({ error: 'Failed to retrieve medicines' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CentralMedicineInput = await request.json();

    if (!body.tradeNameAr || !body.tradeNameEn || !body.activeIngredient) {
      return NextResponse.json(
        { error: 'Trade name Ar, En, and Active Ingredient are required.' },
        { status: 400 }
      );
    }

    const created = await CentralMedicineService.createMedicine(body);
    return NextResponse.json({ medicine: created }, { status: 201 });
  } catch (error) {
    console.error('Failed to create central medicine:', error);
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}
