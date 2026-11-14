import { NextRequest, NextResponse } from 'next/server';
import { CentralMedicineService } from '@/lib/server/services/central-medicine.service';
import type { CentralMedicineInput } from '@/types/central-backend.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const medicine = await CentralMedicineService.getById(id);

    if (!medicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    return NextResponse.json({ medicine }, { status: 200 });
  } catch (error) {
    console.error('Failed to get medicine by ID:', error);
    return NextResponse.json({ error: 'Failed to retrieve medicine' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<CentralMedicineInput> = await request.json();

    const updated = await CentralMedicineService.updateMedicine(id, body);
    return NextResponse.json({ medicine: updated }, { status: 200 });
  } catch (error) {
    console.error('Failed to update medicine:', error);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'إلغاء تنشيط من قبل مسؤول النظام';

    const deactivated = await CentralMedicineService.deactivateMedicine(id, reason);
    return NextResponse.json({ medicine: deactivated, status: 'deactivated' }, { status: 200 });
  } catch (error) {
    console.error('Failed to deactivate medicine:', error);
    return NextResponse.json({ error: 'Failed to deactivate medicine' }, { status: 500 });
  }
}
