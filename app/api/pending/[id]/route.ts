import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';

const submissionService = new SubmissionService();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pending = await submissionService.resolvePendingRecord(params.id);
    return NextResponse.json(pending);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to resolve pending record' }, 
      { status: 500 }
    );
  }
}