import { NextResponse } from 'next/server';
import { CentralMedicineService } from '@/lib/server/services/central-medicine.service';

export async function GET() {
  try {
    const snapshot = await CentralMedicineService.getSnapshot();
    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    console.error('Failed to get snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve database snapshot' },
      { status: 500 }
    );
  }
}
