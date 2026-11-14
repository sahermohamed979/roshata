import { NextRequest, NextResponse } from 'next/server';
import { CentralMedicineService } from '@/lib/server/services/central-medicine.service';

export async function GET(request: NextRequest) {
  try {
    const clientVersion = parseInt(request.nextUrl.searchParams.get('clientVersion') || '0', 10);
    const manifest = await CentralMedicineService.getManifest(clientVersion);
    return NextResponse.json(manifest, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && (error as { digest?: string }).digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('Failed to get manifest:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve database manifest' },
      { status: 500 }
    );
  }
}
