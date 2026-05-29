import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';

const submissionService = new SubmissionService();

export async function POST(
  request: NextRequest,
  { params }: { params: { submissionId: string; detailId: string } }
) {
  try {
    const body = await request.json();
    
    const pending = await submissionService.addPendingRecord(params.detailId, {
      pendingType: body.pendingType,
      pendingNote: body.pendingNote
    });
    
    return NextResponse.json(pending, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add pending record' }, 
      { status: 500 }
    );
  }
}