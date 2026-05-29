import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';
import { SubmissionTypeEnum } from '@/types/enums';

const submissionService = new SubmissionService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const detail = await submissionService.addSubmissionDetail(params.id, {
      submissionType: SubmissionTypeEnum[body.submissionType as keyof typeof SubmissionTypeEnum] || body.submissionType,
      submissionValue: body.submissionValue,
      note: body.note
    });
    
    return NextResponse.json(detail, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add submission detail' }, 
      { status: 500 }
    );
  }
}