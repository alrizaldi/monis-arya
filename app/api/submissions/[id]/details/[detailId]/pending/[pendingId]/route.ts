import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';
import { getUserFromRequest } from '@/lib/authUtils';

const submissionService = new SubmissionService();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; detailId: string; pendingId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pending = await submissionService.resolvePendingRecord(params.pendingId, user.email);
    
    return NextResponse.json(pending, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to resolve pending record' }, 
      { status: 500 }
    );
  }
}