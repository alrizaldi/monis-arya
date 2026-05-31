import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';
import { getUserFromRequest } from '@/lib/authUtils';

const submissionService = new SubmissionService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; detailId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const pending = await submissionService.addPendingRecord(params.detailId, {
      pendingType: body.pendingType,
      pendingNote: body.pendingNote
    }, user.email);
    
    return NextResponse.json(pending, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add pending record' }, 
      { status: 500 }
    );
  }
}