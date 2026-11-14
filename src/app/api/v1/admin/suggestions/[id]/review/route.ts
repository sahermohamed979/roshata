import { NextRequest, NextResponse } from 'next/server';
import { CentralMedicineService } from '@/lib/server/services/central-medicine.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const decision = body.decision;
    const reviewerNotes = body.reviewerNotes || '';
    const reviewedBy = body.reviewedBy || 'admin';

    if (decision !== 'approved' && decision !== 'rejected') {
      return NextResponse.json(
        { error: 'Decision must be either "approved" or "rejected"' },
        { status: 400 }
      );
    }

    const result = await CentralMedicineService.reviewSuggestion(
      id,
      decision,
      reviewerNotes,
      reviewedBy
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to review suggestion:', error);
    return NextResponse.json({ error: 'Failed to process suggestion review' }, { status: 500 });
  }
}
