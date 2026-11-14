import { NextRequest, NextResponse } from 'next/server';
import { CentralMedicineService } from '@/lib/server/services/central-medicine.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const releaseNotes = body.releaseNotes || 'تحديث دوري لقاعدة الأدوية المركزية';
    const publishedBy = body.publishedBy || 'admin';

    const newVersion = await CentralMedicineService.publishVersion(releaseNotes, publishedBy);
    return NextResponse.json({ version: newVersion }, { status: 201 });
  } catch (error) {
    console.error('Failed to publish new version:', error);
    return NextResponse.json({ error: 'Failed to publish new database version' }, { status: 500 });
  }
}
