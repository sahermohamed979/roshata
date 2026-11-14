import { NextRequest, NextResponse } from 'next/server';
import { CentralMedicineService } from '@/lib/server/services/central-medicine.service';

export async function GET(request: NextRequest) {
  try {
    const since = parseInt(request.nextUrl.searchParams.get('since') || '0', 10);
    const changes = await CentralMedicineService.getChanges(since);
    return NextResponse.json(changes, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && (error as { digest?: string }).digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('Failed to get changes:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve changes' },
      { status: 500 }
    );
  }
}
