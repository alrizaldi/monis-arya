import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';

const submissionService = new SubmissionService();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; detailId: string; pendingId: string } }
) {
  try {
    const pending = await submissionService.resolvePendingRecord(params.pendingId);
    
    return NextResponse.json(pending, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to resolve pending record' }, 
      { status: 500 }
    );
  }
}